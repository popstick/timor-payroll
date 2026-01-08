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
  { params }: { params: { id: string; employeeId: string } }
) {
  const { id, employeeId } = params;
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

  const { data: payrollItem, error: itemError } = await supabase
    .from('payroll_items')
    .select('*, employees(*)')
    .eq('payroll_run_id', id)
    .eq('employee_id', employeeId)
    .single<PayrollItemWithEmployee>();

  if (itemError || !payrollItem) {
    return Response.json({ error: 'Payroll item not found for employee' }, { status: 404 });
  }

  const organization = payrollRun.organizations;
  const employee = payrollItem.employees;
  if (!organization || !employee) {
    return Response.json({ error: 'Missing organization or employee data' }, { status: 500 });
  }

  const item: PayslipPDFInput = {
    employee: {
      first_name: employee.first_name,
      last_name: employee.last_name,
      employee_number: employee.employee_number,
      position: employee.position,
      department: employee.department,
      tin: employee.tin,
      inss_number: employee.inss_number,
    },
    payrollItem: {
      base_salary: payrollItem.base_salary,
      overtime_hours: payrollItem.overtime_hours,
      overtime_pay: payrollItem.overtime_pay,
      night_shift_hours: payrollItem.night_shift_hours,
      night_shift_premium: payrollItem.night_shift_premium,
      allowances: payrollItem.allowances,
      bonuses: payrollItem.bonuses,
      gross_pay: payrollItem.gross_pay,
      tax_withheld: payrollItem.tax_withheld,
      inss_employee: payrollItem.inss_employee,
      other_deductions: payrollItem.other_deductions,
      total_deductions: payrollItem.total_deductions,
      net_pay: payrollItem.net_pay,
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
  };

  const buffer = await renderPayslipsPDFBuffer({ items: [item], language });
  const filename = safeFilename(
    `payslip-${employee.employee_number}-${payrollRun.period_start}-${language}.pdf`
  );

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
