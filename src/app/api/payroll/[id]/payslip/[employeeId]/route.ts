import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Employee, LeaveBalance, Organization, PayrollItem, PayrollRun } from '@/types/supabase';
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

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; employeeId: string }> }
) {
  const { id, employeeId } = await params;
  const url = new URL(request.url);
  const language: PayslipLanguage = isPayslipLanguage(url.searchParams.get('lang'))
    ? (url.searchParams.get('lang') as PayslipLanguage)
    : 'en';
  const wantSigned = url.searchParams.get('signed') === '1';
  const refresh = url.searchParams.get('refresh') === '1';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  const filename = safeFilename(
    `payslip-${employee.employee_number}-${payrollRun.period_start}-${language}.pdf`
  );
  const storagePath = `${payrollRun.organization_id}/${payrollRun.id}/${employeeId}/payslip-${language}.pdf`;
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasServiceRole && !refresh) {
    const admin = createAdminClient();
    if (wantSigned) {
      const { data, error } = await admin.storage
        .from('payslips')
        .createSignedUrl(storagePath, 60, { download: filename });
      if (!error && data?.signedUrl) {
        return Response.redirect(data.signedUrl, 302);
      }
    } else {
      const { data, error } = await admin.storage.from('payslips').download(storagePath);
      if (!error && data) {
        return new Response(await blobToArrayBuffer(data), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    }
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
      inss_employer: payrollItem.inss_employer,
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

  const periodEnd = new Date(payrollRun.period_end);
  const year = periodEnd.getFullYear();
  const yearStart = `${year}-01-01`;

  const { data: leaveBalance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('year', year)
    .maybeSingle<LeaveBalance>();

  if (leaveBalance) {
    item.leaveBalances = {
      annualLeaveRemaining: leaveBalance.annual_leave_remaining,
      annualLeaveEntitled: leaveBalance.annual_leave_entitled,
      annualLeaveTaken: leaveBalance.annual_leave_taken,
      sickLeaveEntitled: leaveBalance.sick_leave_entitled,
      sickLeaveTaken: leaveBalance.sick_leave_taken,
      personalLeaveEntitled: leaveBalance.personal_leave_entitled,
      personalLeaveTaken: leaveBalance.personal_leave_taken,
    };
  }

  type YtdRow = Pick<
    PayrollItem,
    'gross_pay' | 'tax_withheld' | 'inss_employee' | 'inss_employer' | 'net_pay'
  >;
  const { data: ytdRows } = await supabase
    .from('payroll_items')
    .select(
      'gross_pay, tax_withheld, inss_employee, inss_employer, net_pay, payroll_runs!inner(period_start, period_end)'
    )
    .eq('employee_id', employeeId)
    .gte('payroll_runs.period_start', yearStart)
    .lte('payroll_runs.period_end', payrollRun.period_end);

  const ytd = (ytdRows as unknown as YtdRow[] | null)?.reduce(
    (acc, row) => ({
      gross: acc.gross + row.gross_pay,
      tax: acc.tax + (row.tax_withheld ?? 0),
      inssEmployee: acc.inssEmployee + (row.inss_employee ?? 0),
      inssEmployer: acc.inssEmployer + (row.inss_employer ?? 0),
      net: acc.net + row.net_pay,
    }),
    { gross: 0, tax: 0, inssEmployee: 0, inssEmployer: 0, net: 0 }
  );

  if (ytd) item.ytd = ytd;

  const buffer = await renderPayslipsPDFBuffer({ items: [item], language });
  if (hasServiceRole) {
    const admin = createAdminClient();
    await admin.storage.from('payslips').upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
      cacheControl: '3600',
    });
    if (wantSigned) {
      const { data } = await admin.storage
        .from('payslips')
        .createSignedUrl(storagePath, 60, { download: filename });
      if (data?.signedUrl) return Response.redirect(data.signedUrl, 302);
    }
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
