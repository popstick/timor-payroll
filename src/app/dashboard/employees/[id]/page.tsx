import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, DollarSign, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { calculatePayroll } from '@/lib/payroll/calculations';

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-gray-500">{employee.position}</p>
        </div>
        <Link href={`/dashboard/employees/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Full Name</dt>
                  <dd className="font-medium">{employee.first_name} {employee.last_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Employee Number</dt>
                  <dd className="font-medium">{employee.employee_number}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="font-medium">{employee.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="font-medium">{employee.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Date of Birth</dt>
                  <dd className="font-medium">
                    {employee.date_of_birth ? formatDate(employee.date_of_birth) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Nationality</dt>
                  <dd className="font-medium">{employee.nationality || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Employment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Position</dt>
                  <dd className="font-medium">{employee.position}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Department</dt>
                  <dd className="font-medium">{employee.department || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Employment Type</dt>
                  <dd className="font-medium capitalize">{employee.employment_type?.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
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
                      {employee.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Start Date</dt>
                  <dd className="font-medium">{formatDate(employee.start_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Tax Resident</dt>
                  <dd className="font-medium">{employee.is_resident ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Government IDs */}
          <Card>
            <CardHeader>
              <CardTitle>Government IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-500">Tax ID (TIN)</dt>
                  <dd className="font-medium font-mono">{employee.tin || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">INSS Number</dt>
                  <dd className="font-medium font-mono">{employee.inss_number || '-'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compensation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-4">
                {formatCurrency(employee.base_salary)}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Pay</span>
                  <span className="font-medium">{formatCurrency(payrollSample.grossPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">WIT Tax ({employee.is_resident ? 'resident' : 'non-resident'})</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payrollSample.taxWithheld)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">INSS (4%)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(payrollSample.inssEmployee)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between font-medium">
                  <span>Net Pay</span>
                  <span className="text-green-600">{formatCurrency(payrollSample.netPay)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Employer Cost</div>
                <div className="font-medium">
                  {formatCurrency(payrollSample.totalEmployerCost)}
                  <span className="text-xs text-gray-500 ml-1">
                    (incl. 6% INSS)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Payslip
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Leave Balance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
