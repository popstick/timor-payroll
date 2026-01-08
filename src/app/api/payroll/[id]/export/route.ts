import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Employee, PayrollItem, PayrollRun } from '@/types/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PayrollItemWithEmployee = PayrollItem & { employees: Employee | null };

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsvRow(values: unknown[]): string {
  return values.map(csvEscape).join(',');
}

function safeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: payrollRun, error: runError } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', id)
    .single<PayrollRun>();

  if (runError || !payrollRun) {
    return Response.json({ error: 'Payroll run not found' }, { status: 404 });
  }

  const { data: payrollItems, error: itemsError } = await supabase
    .from('payroll_items')
    .select('*, employees(*)')
    .eq('payroll_run_id', id)
    .returns<PayrollItemWithEmployee[]>();

  if (itemsError) {
    return Response.json({ error: itemsError.message }, { status: 500 });
  }

  const header = toCsvRow([
    'Employee Number',
    'Employee Name',
    'Position',
    'Base Salary',
    'Overtime Pay',
    'Allowances',
    'Bonuses',
    'Gross Pay',
    'Tax Withheld',
    'INSS Employee',
    'INSS Employer',
    'Net Pay',
  ]);

  const rows = (payrollItems || [])
    .slice()
    .sort((a, b) =>
      String(a.employees?.employee_number || '').localeCompare(String(b.employees?.employee_number || ''))
    )
    .map((item) =>
      toCsvRow([
        item.employees?.employee_number || '',
        item.employees ? `${item.employees.first_name} ${item.employees.last_name}` : '',
        item.employees?.position || '',
        item.base_salary,
        item.overtime_pay || 0,
        item.allowances || 0,
        item.bonuses || 0,
        item.gross_pay,
        item.tax_withheld || 0,
        item.inss_employee || 0,
        item.inss_employer || 0,
        item.net_pay,
      ])
    );

  const csv = [header, ...rows].join('\n');
  const filename = safeFilename(`payroll-${payrollRun.period_start}-${payrollRun.period_end}.csv`);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
