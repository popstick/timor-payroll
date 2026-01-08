import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Employee, Organization, PayrollItem, PayrollRun } from '@/types/supabase';
import {
  isPayslipLanguage,
  renderPayslipsPDFBuffer,
  type PayslipLanguage,
  type PayslipPDFInput,
} from '@/lib/payslip/pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PayrollRunWithOrg = PayrollRun & { organizations: Organization | null };
type PayrollItemWithEmployee = PayrollItem & { employees: Employee | null };

function safeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const language: PayslipLanguage = isPayslipLanguage(url.searchParams.get('lang'))
    ? (url.searchParams.get('lang') as PayslipLanguage)
    : 'en';

  const supabase = await createClient();

  const { data: payrollRun, error: runError } = await supabase
    .from('payroll_runs')
    .select('*, organizations(*)')
    .eq('id', id)
    .single<PayrollRunWithOrg>();

  if (runError || !payrollRun) {
    return Response.json({ error: 'Payroll run not found' }, { status: 404 });
  }

  const { data: payrollItems, error: itemsError } = await supabase
    .from('payroll_items')
    .select('*, employees(*)')
    .eq('payroll_run_id', id);

  if (itemsError) {
    return Response.json({ error: itemsError.message }, { status: 500 });
  }

  const organization = payrollRun.organizations;
  if (!organization) {
    return Response.json({ error: 'Organization not found for payroll run' }, { status: 500 });
  }

  const items: PayslipPDFInput[] = ((payrollItems || []) as PayrollItemWithEmployee[])
    .filter((item) => item.employees)
    .sort((a, b) =>
      String(a.employees?.employee_number || '').localeCompare(String(b.employees?.employee_number || ''))
    )
    .map((item) => ({
      employee: {
        first_name: item.employees!.first_name,
        last_name: item.employees!.last_name,
        employee_number: item.employees!.employee_number,
        position: item.employees!.position,
        department: item.employees!.department,
        tin: item.employees!.tin,
        inss_number: item.employees!.inss_number,
      },
      payrollItem: {
        base_salary: item.base_salary,
        overtime_hours: item.overtime_hours,
        overtime_pay: item.overtime_pay,
        night_shift_hours: item.night_shift_hours,
        night_shift_premium: item.night_shift_premium,
        allowances: item.allowances,
        bonuses: item.bonuses,
        gross_pay: item.gross_pay,
        tax_withheld: item.tax_withheld,
        inss_employee: item.inss_employee,
        other_deductions: item.other_deductions,
        total_deductions: item.total_deductions,
        net_pay: item.net_pay,
      },
      organization: {
        name: organization.name,
        address: organization.address,
        tin: organization.tin,
      },
      payPeriod: {
        start: payrollRun.period_start,
        end: payrollRun.period_end,
        payDate: payrollRun.pay_date,
      },
    }));

  if (items.length === 0) {
    return Response.json({ error: 'No payroll items found for payroll run' }, { status: 404 });
  }

  const buffer = await renderPayslipsPDFBuffer({ items, language });
  const filename = safeFilename(`payslips-${payrollRun.period_start}-${language}.pdf`);

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
