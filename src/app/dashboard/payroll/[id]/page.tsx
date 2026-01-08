import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, CheckCircle, Clock, FileText, MoreHorizontal } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatDaysUntil, getDaysUntilDeadline } from '@/lib/deadlines';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Employee, PayrollItem } from '@/types/supabase';
import { SendNotificationsButton } from '@/components/payroll/send-notifications-button';
import { approvePayrollRun, markPayrollRunPaid } from './actions';

export default async function PayrollDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ q?: string }>;
}) {
  const locale = await getLocale();
  const tPayroll = await getTranslations('payroll');
  const tPayrollCalc = await getTranslations('payroll.calculation');
  const tPayrollSummary = await getTranslations('payroll.summary');
  const tPayrollActions = await getTranslations('payroll.actions');
  const tReports = await getTranslations('reports');
  const tCommon = await getTranslations('common');
  const tNav = await getTranslations('nav');
  const tDashboard = await getTranslations('dashboard');

  const { id } = await params;
  const { q } = (await searchParams) || {};
  const supabase = await createClient();

  // Fetch payroll run with items and employee details
  const { data: payrollRun, error: runError } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', id)
    .single();

  if (runError || !payrollRun) {
    notFound();
  }

  const { data: payrollItems, error: itemsError } = await supabase
    .from('payroll_items')
    .select(`
      *,
      employees (
        id,
        first_name,
        last_name,
        employee_number,
        position,
        tin,
        inss_number
      )
    `)
    .eq('payroll_run_id', id)
    .returns<
      (PayrollItem & {
        employees: Pick<
          Employee,
          'id' | 'first_name' | 'last_name' | 'employee_number' | 'position' | 'tin' | 'inss_number'
        > | null;
      })[]
    >();

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };

  const statusIcons = {
    draft: <Clock className="h-4 w-4" />,
    processing: <Clock className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />,
  };

  type PayrollStatus = keyof typeof statusColors;
  const status: PayrollStatus = (payrollRun.status as PayrollStatus) || 'draft';
  const statusLabelKey = `status.${status}` as `status.${PayrollStatus}`;

  const periodEnd = new Date(payrollRun.period_end);
  const filingDeadline = new Date(periodEnd.getFullYear(), periodEnd.getMonth() + 1, 15);
  const daysUntilFiling = getDaysUntilDeadline(filingDeadline);

  const approveAction = approvePayrollRun.bind(null, id);
  const markPaidAction = markPayrollRunPaid.bind(null, id);

  const payrollItemsSorted = (payrollItems || [])
    .slice()
    .sort((a, b) =>
      String(a.employees?.employee_number || '').localeCompare(String(b.employees?.employee_number || ''))
    );

  const normalizedQuery = (q || '').trim().toLowerCase();
  const payrollItemsFiltered = normalizedQuery
    ? payrollItemsSorted.filter((item) => {
        const employee = item.employees;
        const searchable = [
          employee?.employee_number,
          employee?.first_name,
          employee?.last_name,
          employee?.position,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchable.includes(normalizedQuery);
      })
    : payrollItemsSorted;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumbs
        items={[
          { label: tNav('payroll'), href: '/dashboard/payroll' },
          { label: `${formatDate(payrollRun.period_start)} - ${formatDate(payrollRun.period_end)}` },
        ]}
        className="mb-4"
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/payroll" className="mt-0.5">
            <Button variant="ghost" size="icon" aria-label="Back to payroll runs">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {tPayroll('title')}: {formatDate(payrollRun.period_start)} - {formatDate(payrollRun.period_end)}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[status] || statusColors.draft
                }`}
              >
                {statusIcons[status]}
                {tPayroll(statusLabelKey)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-sm">
                {tPayroll('payDate')}: {formatDate(payrollRun.pay_date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/api/payroll/${id}/payslips?lang=${locale}&signed=1`} prefetch={false}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {tPayrollActions('downloadAllPayslips')}
            </Button>
          </Link>

          <Link href={`/api/payroll/${id}/export`} prefetch={false}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {tCommon('export')}
            </Button>
          </Link>

          {payrollRun.status === 'draft' && (
            <form action={approveAction}>
              <Button type="submit">
                <CheckCircle className="h-4 w-4 mr-2" />
                {tPayrollActions('approve')}
              </Button>
            </form>
          )}

          {payrollRun.status === 'approved' && (
            <form action={markPaidAction}>
              <Button type="submit" variant="secondary">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as paid
              </Button>
            </form>
          )}

          {payrollRun.status === 'paid' && <SendNotificationsButton payrollRunId={id} />}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-5 mb-8">
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-gray-500">{tNav('employees')}</div>
            <div className="text-2xl font-bold">{payrollRun.employee_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-gray-500">{tPayrollSummary('totalGross')}</div>
            <div className="text-2xl font-bold">{formatCurrency(payrollRun.total_gross || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-gray-500">{tPayrollSummary('totalTax')}</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(payrollRun.total_tax || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-gray-500">{tCommon('inss')}</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency((payrollRun.total_inss_employee || 0) + (payrollRun.total_inss_employer || 0))}
            </div>
            <div className="text-xs text-gray-400">
              {formatCurrency(payrollRun.total_inss_employee || 0)} + {formatCurrency(payrollRun.total_inss_employer || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-sm text-gray-500">{tPayrollSummary('totalNet')}</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(payrollRun.total_net || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Items Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>Employee Breakdown</CardTitle>
            <form className="relative w-full sm:w-auto" action="">
              <input
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Search employees…"
                className="w-full sm:w-64 pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {itemsError && (
            <div className="text-red-500 p-4">{tCommon('error')}: {itemsError.message}</div>
          )}

          {!itemsError && payrollItemsFiltered.length === 0 && (
            <EmptyState
              illustration="search"
              title={normalizedQuery ? 'No matching employees' : 'No payroll items'}
              description={
                normalizedQuery
                  ? 'Try a different search.'
                  : 'This payroll run has no employee items yet.'
              }
              action={
                normalizedQuery
                  ? { label: 'Clear search', href: `/dashboard/payroll/${id}` }
                  : { label: 'Back to Payroll', href: '/dashboard/payroll' }
              }
              className="py-10"
            />
          )}

          {!itemsError && payrollItemsFiltered.length > 0 && (
            <Table stickyHeader>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>{tNav('employees')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('baseSalary')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('overtime')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('allowances')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('grossPay')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('taxWithheld')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('inssEmployee')}</TableHead>
                  <TableHead className="text-right">{tPayrollCalc('netPay')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollItemsFiltered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.employees ? (
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {item.employees.first_name} {item.employees.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.employees.employee_number} • {item.employees.position}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Unknown employee</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.base_salary)}</TableCell>
                    <TableCell className="text-right">
                      {(item.overtime_pay || 0) > 0 ? formatCurrency(item.overtime_pay || 0) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.allowances || 0) + (item.bonuses || 0) > 0
                        ? formatCurrency((item.allowances || 0) + (item.bonuses || 0))
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.gross_pay)}</TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(item.tax_withheld || 0)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(item.inss_employee || 0)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(item.net_pay)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={tCommon('actions')}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownItem
                          icon={<FileText className="h-4 w-4" />}
                          href={`/dashboard/payroll/${id}/payslip/${item.employee_id}`}
                        >
                          {tPayrollActions('viewPayslip')}
                        </DropdownItem>
                        <DropdownItem
                          icon={<Download className="h-4 w-4" />}
                          href={`/api/payroll/${id}/payslip/${item.employee_id}?lang=${locale}&signed=1`}
                        >
                          {tPayrollActions('downloadPayslip')}
                        </DropdownItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('witFiling')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">{tReports('wit.totalWages')}</span>
                <span className="font-medium">{formatCurrency(payrollRun.total_gross || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tPayrollCalc('taxWithheld')}</span>
                <span className="font-medium">{formatCurrency(payrollRun.total_tax || 0)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tReports('wit.filingDeadline')}</span>
                <span className="font-medium text-orange-600">{formatDate(filingDeadline)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due in</span>
                <span className="font-medium">{formatDaysUntil(daysUntilFiling)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tDashboard('inssFiling')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">{tReports('inss.employeeRate')}</span>
                <span className="font-medium">{formatCurrency(payrollRun.total_inss_employee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{tReports('inss.employerRate')}</span>
                <span className="font-medium">{formatCurrency(payrollRun.total_inss_employer || 0)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>{tReports('inss.totalDue')}</span>
                <span>{formatCurrency((payrollRun.total_inss_employee || 0) + (payrollRun.total_inss_employer || 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{tReports('wit.filingDeadline')}</span>
                <span className="font-medium text-orange-600">{formatDate(filingDeadline)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due in</span>
                <span className="font-medium">{formatDaysUntil(daysUntilFiling)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
