import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, CheckCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Employee, PayrollItem } from '@/types/supabase';

export default async function PayrollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/payroll">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {tPayroll('title')}: {formatDate(payrollRun.period_start)} - {formatDate(payrollRun.period_end)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[status] || statusColors.draft
                }`}
              >
                {statusIcons[status]}
                {tPayroll(statusLabelKey)}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{tPayroll('payDate')}: {formatDate(payrollRun.pay_date)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/payroll/${id}/payslips?lang=${locale}&signed=1`} prefetch={false}>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {tPayrollActions('downloadAllPayslips')}
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {tCommon('export')}
          </Button>
          {payrollRun.status === 'draft' && (
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              {tPayrollActions('approve')}
            </Button>
          )}
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
          <CardTitle>Employee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsError && (
            <div className="text-red-500 p-4">Error loading payroll items</div>
          )}

          {payrollItems && payrollItems.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tNav('employees')}</TableHead>
                  <TableHead>{tPayrollCalc('baseSalary')}</TableHead>
                  <TableHead>{tPayrollCalc('overtime')}</TableHead>
                  <TableHead>{tPayrollCalc('allowances')}</TableHead>
                  <TableHead>{tPayrollCalc('grossPay')}</TableHead>
                  <TableHead>{tPayrollCalc('taxWithheld')}</TableHead>
                  <TableHead>{tPayrollCalc('inssEmployee')}</TableHead>
                  <TableHead>{tPayrollCalc('netPay')}</TableHead>
                  <TableHead>{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.employees?.first_name} {item.employees?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.employees?.employee_number}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.base_salary)}</TableCell>
                    <TableCell>
                      {(item.overtime_pay || 0) > 0 ? formatCurrency(item.overtime_pay || 0) : '-'}
                    </TableCell>
                    <TableCell>
                      {(item.allowances || 0) + (item.bonuses || 0) > 0
                        ? formatCurrency((item.allowances || 0) + (item.bonuses || 0))
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.gross_pay)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(item.tax_withheld || 0)}</TableCell>
                    <TableCell className="text-red-600">-{formatCurrency(item.inss_employee || 0)}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(item.net_pay)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/payroll/${id}/payslip/${item.employee_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          {tPayrollActions('viewPayslip')}
                        </Link>
                        <Link
                          href={`/api/payroll/${id}/payslip/${item.employee_id}?lang=${locale}&signed=1`}
                          prefetch={false}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium inline-flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          {tPayrollActions('downloadPayslip')}
                        </Link>
                      </div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
