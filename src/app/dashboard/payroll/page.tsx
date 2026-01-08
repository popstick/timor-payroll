import Link from 'next/link';
import { Plus, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function PayrollPage() {
  const supabase = await createClient();

  const { data: payrollRuns, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .order('created_at', { ascending: false });

  const statusIcons = {
    draft: <Clock className="h-4 w-4 text-gray-400" />,
    processing: <Clock className="h-4 w-4 text-yellow-500" />,
    approved: <CheckCircle className="h-4 w-4 text-blue-500" />,
    paid: <CheckCircle className="h-4 w-4 text-green-500" />,
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500">Manage monthly payroll runs</p>
        </div>
        <Link href="/dashboard/payroll/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Run Payroll
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              This Month
            </CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Paid (YTD)
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                payrollRuns
                  ?.filter((r) => r.status === 'paid')
                  .reduce((sum, r) => sum + (r.total_net || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Runs
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payrollRuns?.filter((r) => r.status === 'draft' || r.status === 'processing').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 p-4">
              Error loading payroll runs: {error.message}
            </div>
          )}

          {payrollRuns && payrollRuns.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <DollarSign className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payroll runs yet</h3>
              <p className="text-gray-500 mb-4">Process your first payroll to get started.</p>
              <Link href="/dashboard/payroll/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Run Payroll
                </Button>
              </Link>
            </div>
          )}

          {payrollRuns && payrollRuns.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>INSS</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatDate(run.period_start)} - {formatDate(run.period_end)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(run.pay_date)}</TableCell>
                    <TableCell>{run.employee_count}</TableCell>
                    <TableCell>{formatCurrency(run.total_gross || 0)}</TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(run.total_tax || 0)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency((run.total_inss_employee || 0) + (run.total_inss_employer || 0))}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(run.total_net || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[run.status as keyof typeof statusColors] || statusColors.draft
                        }`}
                      >
                        {statusIcons[run.status as keyof typeof statusIcons]}
                        {run.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/payroll/${run.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
