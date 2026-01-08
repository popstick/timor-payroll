'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calculator, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { calculatePayroll } from '@/lib/payroll/calculations';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types/supabase';

interface PayrollPreview {
  employee: Employee;
  calculation: ReturnType<typeof calculatePayroll>;
  overtimeHoursRegular: number;
  overtimeHoursHoliday: number;
  allowances: number;
  bonuses: number;
}

export default function NewPayrollPage() {
  const router = useRouter();
  const supabase = createClient();
  const tPayroll = useTranslations('payroll');
  const tPayrollCalc = useTranslations('payroll.calculation');
  const tPayrollSummary = useTranslations('payroll.summary');
  const tPayrollActions = useTranslations('payroll.actions');
  const tCommon = useTranslations('common');
  const tEmployees = useTranslations('employees');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [previews, setPreviews] = useState<PayrollPreview[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  // Default to current month
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [periodStart, setPeriodStart] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(lastOfMonth.toISOString().split('T')[0]);
  const [payDate, setPayDate] = useState(lastOfMonth.toISOString().split('T')[0]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Get organization
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

      if (orgs && orgs.length > 0) {
        setOrganizationId(orgs[0].id);

        // Get active employees
        const { data: emps, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', orgs[0].id)
          .eq('status', 'active');

        if (empError) throw empError;

        setEmployees(emps || []);

        // Initialize previews
        const initialPreviews = (emps || []).map((emp) => ({
          employee: emp,
          calculation: calculatePayroll({
            baseSalary: emp.base_salary,
            isResident: emp.is_resident ?? true,
          }),
          overtimeHoursRegular: 0,
          overtimeHoursHoliday: 0,
          allowances: 0,
          bonuses: 0,
        }));

        setPreviews(initialPreviews);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = (index: number, field: string, value: number) => {
    setPreviews((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'overtimeHoursRegular') item.overtimeHoursRegular = value;
      if (field === 'overtimeHoursHoliday') item.overtimeHoursHoliday = value;
      if (field === 'allowances') item.allowances = value;
      if (field === 'bonuses') item.bonuses = value;

      // Recalculate
      item.calculation = calculatePayroll({
        baseSalary: item.employee.base_salary,
        isResident: item.employee.is_resident ?? true,
        overtimeHoursRegular: item.overtimeHoursRegular,
        overtimeHoursHoliday: item.overtimeHoursHoliday,
        allowances: item.allowances,
        bonuses: item.bonuses,
      });

      updated[index] = item;
      return updated;
    });
  };

  const totals = previews.reduce(
    (acc, p) => ({
      gross: acc.gross + p.calculation.grossPay,
      tax: acc.tax + p.calculation.taxWithheld,
      inssEmployee: acc.inssEmployee + p.calculation.inssEmployee,
      inssEmployer: acc.inssEmployer + p.calculation.inssEmployer,
      net: acc.net + p.calculation.netPay,
    }),
    { gross: 0, tax: 0, inssEmployee: 0, inssEmployer: 0, net: 0 }
  );

  const handleSubmit = async () => {
    if (!organizationId || previews.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      // Create payroll run
      const { data: payrollRun, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
          organization_id: organizationId,
          period_start: periodStart,
          period_end: periodEnd,
          pay_date: payDate,
          status: 'draft',
          total_gross: totals.gross,
          total_tax: totals.tax,
          total_inss_employee: totals.inssEmployee,
          total_inss_employer: totals.inssEmployer,
          total_net: totals.net,
          employee_count: previews.length,
        })
        .select()
        .single();

      if (runError) throw runError;

      // Create payroll items
      const items = previews.map((p) => ({
        payroll_run_id: payrollRun.id,
        employee_id: p.employee.id,
        base_salary: p.employee.base_salary,
        overtime_hours: p.overtimeHoursRegular + p.overtimeHoursHoliday,
        overtime_rate: p.overtimeHoursHoliday > 0 ? 2.0 : 1.5,
        overtime_pay: p.calculation.overtimePayRegular + p.calculation.overtimePayHoliday,
        night_shift_hours: 0,
        night_shift_premium: 0,
        allowances: p.allowances,
        bonuses: p.bonuses,
        gross_pay: p.calculation.grossPay,
        tax_withheld: p.calculation.taxWithheld,
        inss_employee: p.calculation.inssEmployee,
        inss_employer: p.calculation.inssEmployer,
        other_deductions: 0,
        total_deductions: p.calculation.totalDeductions,
        net_pay: p.calculation.netPay,
      }));

      const { error: itemsError } = await supabase
        .from('payroll_items')
        .insert(items);

      if (itemsError) throw itemsError;

      router.push(`/dashboard/payroll/${payrollRun.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/payroll">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tPayroll('runPayroll')}</h1>
          <p className="text-gray-500">{tPayroll('subtitle')}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Period Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{tPayroll('period')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label={tPayroll('periodStart')}
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
            <Input
              label={tPayroll('periodEnd')}
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
            <Input
              label={tPayroll('payDate')}
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Calculations */}
      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">{tPayroll('noActiveEmployees')}</h3>
            <p className="text-gray-500 mb-4">{tPayroll('addEmployeesFirst')}</p>
            <Link href="/dashboard/employees/new">
              <Button>{tEmployees('addEmployee')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {tPayrollCalc('title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tEmployees('title')}</TableHead>
                      <TableHead>{tPayrollCalc('baseSalary')}</TableHead>
                      <TableHead>{tPayrollCalc('overtimeRegular')}</TableHead>
                      <TableHead>{tPayrollCalc('overtimeHoliday')}</TableHead>
                      <TableHead>{tPayrollCalc('allowances')}</TableHead>
                      <TableHead>{tPayrollCalc('bonuses')}</TableHead>
                      <TableHead>{tPayrollCalc('grossPay')}</TableHead>
                      <TableHead>{tPayrollCalc('taxWithheld')}</TableHead>
                      <TableHead>{tPayrollCalc('inssEmployee')}</TableHead>
                      <TableHead>{tPayrollCalc('netPay')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previews.map((preview, index) => (
                      <TableRow key={preview.employee.id}>
                        <TableCell>
                          <div className="font-medium">
                            {preview.employee.first_name} {preview.employee.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {preview.employee.is_resident ? tCommon('resident') : tCommon('nonResident')}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(preview.employee.base_salary)}</TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            className="w-16 px-2 py-1 border rounded text-sm bg-white text-gray-900"
                            value={preview.overtimeHoursRegular}
                            onChange={(e) =>
                              updatePreview(index, 'overtimeHoursRegular', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            className="w-16 px-2 py-1 border rounded text-sm bg-white text-gray-900"
                            value={preview.overtimeHoursHoliday}
                            onChange={(e) =>
                              updatePreview(index, 'overtimeHoursHoliday', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-20 px-2 py-1 border rounded text-sm bg-white text-gray-900"
                            value={preview.allowances}
                            onChange={(e) =>
                              updatePreview(index, 'allowances', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="w-20 px-2 py-1 border rounded text-sm bg-white text-gray-900"
                            value={preview.bonuses}
                            onChange={(e) =>
                              updatePreview(index, 'bonuses', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(preview.calculation.grossPay)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{formatCurrency(preview.calculation.taxWithheld)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -{formatCurrency(preview.calculation.inssEmployee)}
                        </TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(preview.calculation.netPay)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{tPayrollSummary('title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">{tPayrollSummary('totalGross')}</div>
                  <div className="text-xl font-bold">{formatCurrency(totals.gross)}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-500">{tPayrollSummary('totalTax')}</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totals.tax)}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-500">{tPayrollSummary('totalInssEmployee')}</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(totals.inssEmployee)}</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-500">{tPayrollSummary('totalInssEmployer')}</div>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(totals.inssEmployer)}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-500">{tPayrollSummary('totalNet')}</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(totals.net)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/payroll">
              <Button variant="outline">{tCommon('cancel')}</Button>
            </Link>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? (
                tPayroll('status.processing')
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {tPayrollActions('createRun')}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
