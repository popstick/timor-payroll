import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, DollarSign, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { calculatePayroll } from '@/lib/payroll/calculations';
import { getTranslations } from 'next-intl/server';

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tEmployees = await getTranslations('employees');
  const tCommon = await getTranslations('common');
  const tPayrollCalc = await getTranslations('payroll.calculation');
  const tPayrollActions = await getTranslations('payroll.actions');
  const tDashboard = await getTranslations('dashboard');
  const tLeave = await getTranslations('leave');

  const { id } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !employee) {
    notFound();
  }

  // Calculate sample payroll for this employee
  const payrollSample = calculatePayroll({
    baseSalary: employee.base_salary,
    isResident: employee.is_resident ?? true,
  });

  const employmentTypeLabel =
    employee.employment_type === 'full_time'
      ? tEmployees('employment.fullTime')
      : employee.employment_type === 'part_time'
        ? tEmployees('employment.partTime')
        : employee.employment_type === 'contract'
          ? tEmployees('employment.contract')
          : employee.employment_type?.replace('_', ' ') ?? '-';

  const statusLabel =
    employee.status === 'active'
      ? tEmployees('employment.active')
      : employee.status === 'inactive'
        ? tEmployees('employment.inactive')
        : employee.status === 'terminated'
          ? tEmployees('employment.terminated')
          : employee.status ?? '-';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/dashboard/employees">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-sm sm:text-base text-gray-500">{employee.position}</p>
          </div>
        </div>
        <Link href={`/dashboard/employees/${id}/edit`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            {tCommon('edit')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>{tEmployees('personal.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('personal.fullName')}</dt>
                  <dd className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.employeeNumber')}</dt>
                  <dd className="font-medium text-gray-900">{employee.employee_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('personal.email')}</dt>
                  <dd className="font-medium text-gray-900">{employee.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('personal.phone')}</dt>
                  <dd className="font-medium text-gray-900">{employee.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('personal.dateOfBirth')}</dt>
                  <dd className="font-medium text-gray-900">
                    {employee.date_of_birth ? formatDate(employee.date_of_birth) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('personal.nationality')}</dt>
                  <dd className="font-medium text-gray-900">{employee.nationality || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Employment Info */}
          <Card>
            <CardHeader>
              <CardTitle>{tEmployees('employment.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.position')}</dt>
                  <dd className="font-medium text-gray-900">{employee.position}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.department')}</dt>
                  <dd className="font-medium text-gray-900">{employee.department || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.employmentType')}</dt>
                  <dd className="font-medium text-gray-900">{employmentTypeLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.status')}</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : employee.status === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('employment.startDate')}</dt>
                  <dd className="font-medium text-gray-900">{formatDate(employee.start_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('tax.isResident')}</dt>
                  <dd className="font-medium text-gray-900">{employee.is_resident ? tCommon('yes') : tCommon('no')}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Government IDs */}
          <Card>
            <CardHeader>
              <CardTitle>{tEmployees('govIds.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('tax.tin')}</dt>
                  <dd className="font-medium font-mono text-gray-900">{employee.tin || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">{tEmployees('tax.inssNumber')}</dt>
                  <dd className="font-medium font-mono text-gray-900">{employee.inss_number || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Compensation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                {tEmployees('compensation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-4">
                {formatCurrency(employee.base_salary)}
                <span className="text-sm font-normal text-gray-500">{tCommon('perMonth')}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{tPayrollCalc('grossPay')}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(payrollSample.grossPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {tPayrollCalc('taxWithheld')} ({employee.is_resident ? tCommon('resident') : tCommon('nonResident')})
                  </span>
                  <span className="font-medium text-red-600">-{formatCurrency(payrollSample.taxWithheld)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{tPayrollCalc('inssEmployee')}</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payrollSample.inssEmployee)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">{tPayrollCalc('netPay')}</span>
                  <span className="text-green-600">{formatCurrency(payrollSample.netPay)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{tEmployees('compensation.employerCost')}</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(payrollSample.totalEmployerCost)}
                  <span className="text-xs text-gray-500 ml-1">
                    ({tEmployees('compensation.includingEmployerInss')})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{tDashboard('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                {tPayrollActions('viewPayslip')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                {tLeave('balance')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
