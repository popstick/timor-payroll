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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const filename = safeFilename(`payslips-${payrollRun.period_start}-${language}.pdf`);
  const storagePath = `${payrollRun.organization_id}/${payrollRun.id}/all/payslips-${language}.pdf`;
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasServiceRole && !refresh) {
    const admin = createAdminClient();
    if (wantSigned) {
      const { data, error } = await admin.storage
        .from('payslips')
        .createSignedUrl(storagePath, 60, { download: filename });
      if (!error && data?.signedUrl) return Response.redirect(data.signedUrl, 302);
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

  const periodEnd = new Date(payrollRun.period_end);
  const year = periodEnd.getFullYear();
  const yearStart = `${year}-01-01`;

  const payrollItemsWithEmployee = (payrollItems || []) as PayrollItemWithEmployee[];
  const employeeIds = payrollItemsWithEmployee.map((item) => item.employee_id).filter(Boolean);

  const { data: leaveBalances } =
    employeeIds.length > 0
      ? await supabase
          .from('leave_balances')
          .select('*')
          .in('employee_id', employeeIds)
          .eq('year', year)
      : { data: null };

  const leaveBalanceByEmployeeId = new Map<string, LeaveBalance>();
  (leaveBalances || []).forEach((lb) => leaveBalanceByEmployeeId.set(lb.employee_id, lb));

  type YtdRow = Pick<
    PayrollItem,
    'employee_id' | 'gross_pay' | 'tax_withheld' | 'inss_employee' | 'inss_employer' | 'net_pay'
  >;
  const { data: ytdRows } = await supabase
    .from('payroll_items')
    .select(
      'employee_id, gross_pay, tax_withheld, inss_employee, inss_employer, net_pay, payroll_runs!inner(period_start, period_end, organization_id)'
    )
    .eq('payroll_runs.organization_id', payrollRun.organization_id)
    .gte('payroll_runs.period_start', yearStart)
    .lte('payroll_runs.period_end', payrollRun.period_end);

  const ytdByEmployeeId = new Map<
    string,
    { gross: number; tax: number; inssEmployee: number; inssEmployer: number; net: number }
  >();
  ((ytdRows as unknown as YtdRow[] | null) || []).forEach((row) => {
    const existing = ytdByEmployeeId.get(row.employee_id) || {
      gross: 0,
      tax: 0,
      inssEmployee: 0,
      inssEmployer: 0,
      net: 0,
    };
    ytdByEmployeeId.set(row.employee_id, {
      gross: existing.gross + row.gross_pay,
      tax: existing.tax + (row.tax_withheld ?? 0),
      inssEmployee: existing.inssEmployee + (row.inss_employee ?? 0),
      inssEmployer: existing.inssEmployer + (row.inss_employer ?? 0),
      net: existing.net + row.net_pay,
    });
  });

  const items: PayslipPDFInput[] = payrollItemsWithEmployee
    .filter((item) => item.employees)
    .sort((a, b) =>
      String(a.employees?.employee_number || '').localeCompare(String(b.employees?.employee_number || ''))
    )
    .map((item) => {
      const leaveBalance = leaveBalanceByEmployeeId.get(item.employee_id);
      const ytd = ytdByEmployeeId.get(item.employee_id);

      return ({
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
        inss_employer: item.inss_employer,
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
      ...(leaveBalance
        ? {
            leaveBalances: {
              annualLeaveRemaining: leaveBalance.annual_leave_remaining,
              annualLeaveEntitled: leaveBalance.annual_leave_entitled,
              annualLeaveTaken: leaveBalance.annual_leave_taken,
              sickLeaveEntitled: leaveBalance.sick_leave_entitled,
              sickLeaveTaken: leaveBalance.sick_leave_taken,
              personalLeaveEntitled: leaveBalance.personal_leave_entitled,
              personalLeaveTaken: leaveBalance.personal_leave_taken,
            },
          }
        : {}),
      ...(ytd ? { ytd } : {}),
      });
    });

  if (items.length === 0) {
    return Response.json({ error: 'No payroll items found for payroll run' }, { status: 404 });
  }

  const buffer = await renderPayslipsPDFBuffer({ items, language });
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
