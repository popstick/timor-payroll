'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  FileDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { generateWITForm, generateINSSForm } from '@/lib/pdf';

type ReportType = 'payroll' | 'wit' | 'inss' | 'employees';

export default function ReportsPage() {
  const supabase = createClient();
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const tEmployees = useTranslations('employees');
  const [selectedReport, setSelectedReport] = useState<ReportType>('payroll');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<{ name: string; tin: string | null } | null>(null);

  // Fetch organization data
  useEffect(() => {
    async function fetchOrganization() {
      const { data } = await supabase
        .from('organizations')
        .select('name, tin')
        .limit(1)
        .single();
      if (data) setOrganization(data);
    }
    fetchOrganization();
  }, []);

  useEffect(() => {
    generateReport();
  }, [selectedReport, selectedMonth]);

  async function generateReport() {
    setLoading(true);
    const [year, month] = selectedMonth.split('-').map(Number);

    switch (selectedReport) {
      case 'payroll':
        await generatePayrollReport(year, month);
        break;
      case 'wit':
        await generateWITReport(year, month);
        break;
      case 'inss':
        await generateINSSReport(year, month);
        break;
      case 'employees':
        await generateEmployeeReport();
        break;
    }
    setLoading(false);
  }

  async function generatePayrollReport(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: payrollRuns } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        payroll_items (
          *,
          employees (first_name, last_name, employee_number)
        )
      `)
      .gte('period_start', startDate)
      .lte('period_end', endDate);

    setReportData({
      type: 'payroll',
      period: format(new Date(year, month - 1), 'MMMM yyyy'),
      runs: payrollRuns || [],
      summary: {
        totalRuns: payrollRuns?.length || 0,
        totalGross: payrollRuns?.reduce((sum, r) => sum + (r.total_gross || 0), 0) || 0,
        totalNet: payrollRuns?.reduce((sum, r) => sum + (r.total_net || 0), 0) || 0,
        totalTax: payrollRuns?.reduce((sum, r) => sum + (r.total_tax || 0), 0) || 0,
        totalINSS: payrollRuns?.reduce((sum, r) => sum + (r.total_inss_employee || 0) + (r.total_inss_employer || 0), 0) || 0,
      },
    });
  }

  async function generateWITReport(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: payrollItems } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employees (first_name, last_name, employee_number, tin, is_resident),
        payroll_runs!inner (period_start, period_end)
      `)
      .gte('payroll_runs.period_start', startDate)
      .lte('payroll_runs.period_end', endDate);

    const totalWages = payrollItems?.reduce((sum, item) => sum + item.gross_pay, 0) || 0;
    const totalTax = payrollItems?.reduce((sum, item) => sum + (item.tax_withheld || 0), 0) || 0;

    setReportData({
      type: 'wit',
      period: format(new Date(year, month - 1), 'MMMM yyyy'),
      items: payrollItems || [],
      summary: {
        totalEmployees: payrollItems?.length || 0,
        totalWages,
        totalTax,
        filingDeadline: `${year}-${String(month + 1).padStart(2, '0')}-15`,
      },
    });
  }

  async function generateINSSReport(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data: payrollItems } = await supabase
      .from('payroll_items')
      .select(`
        *,
        employees (first_name, last_name, employee_number, inss_number),
        payroll_runs!inner (period_start, period_end)
      `)
      .gte('payroll_runs.period_start', startDate)
      .lte('payroll_runs.period_end', endDate);

    const totalWages = payrollItems?.reduce((sum, item) => sum + item.gross_pay, 0) || 0;
    const totalEmployeeContrib = payrollItems?.reduce((sum, item) => sum + (item.inss_employee || 0), 0) || 0;
    const totalEmployerContrib = payrollItems?.reduce((sum, item) => sum + (item.inss_employer || 0), 0) || 0;

    setReportData({
      type: 'inss',
      period: format(new Date(year, month - 1), 'MMMM yyyy'),
      items: payrollItems || [],
      summary: {
        totalEmployees: payrollItems?.length || 0,
        totalWages,
        employeeContribution: totalEmployeeContrib,
        employerContribution: totalEmployerContrib,
        totalContribution: totalEmployeeContrib + totalEmployerContrib,
        filingDeadline: `${year}-${String(month + 1).padStart(2, '0')}-15`,
      },
    });
  }

  async function generateEmployeeReport() {
    const { data: employees } = await supabase
      .from('employees')
      .select('*')
      .order('first_name');

    const activeCount = employees?.filter(e => e.status === 'active').length || 0;
    const totalSalary = employees?.reduce((sum, e) => sum + e.base_salary, 0) || 0;

    setReportData({
      type: 'employees',
      employees: employees || [],
      summary: {
        total: employees?.length || 0,
        active: activeCount,
        inactive: (employees?.length || 0) - activeCount,
        totalMonthlyPayroll: totalSalary,
        averageSalary: employees?.length ? totalSalary / employees.length : 0,
      },
    });
  }

  function exportToCSV() {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    switch (reportData.type) {
      case 'payroll':
        filename = `payroll-report-${selectedMonth}.csv`;
        csvContent = `${t('csvHeaders.payroll')}\n`;
        reportData.runs.forEach((run: any) => {
          run.payroll_items?.forEach((item: any) => {
            csvContent += `"${item.employees?.first_name} ${item.employees?.last_name}",${item.gross_pay},${item.tax_withheld || 0},${item.inss_employee || 0},${item.inss_employer || 0},${item.net_pay}\n`;
          });
        });
        break;
      case 'wit':
        filename = `wit-report-${selectedMonth}.csv`;
        csvContent = `${t('csvHeaders.wit')}\n`;
        reportData.items.forEach((item: any) => {
          csvContent += `"${item.employees?.first_name} ${item.employees?.last_name}",${item.employees?.tin || 'N/A'},${item.employees?.is_resident ? tCommon('yes') : tCommon('no')},${item.gross_pay},${item.tax_withheld || 0}\n`;
        });
        break;
      case 'inss':
        filename = `inss-report-${selectedMonth}.csv`;
        csvContent = `${t('csvHeaders.inss')}\n`;
        reportData.items.forEach((item: any) => {
          csvContent += `"${item.employees?.first_name} ${item.employees?.last_name}",${item.employees?.inss_number || 'N/A'},${item.gross_pay},${item.inss_employee || 0},${item.inss_employer || 0}\n`;
        });
        break;
      case 'employees':
        filename = 'employee-report.csv';
        csvContent = `${t('csvHeaders.employees')}\n`;
        reportData.employees.forEach((emp: any) => {
          csvContent += `${emp.employee_number},"${emp.first_name} ${emp.last_name}",${emp.position},${emp.department || 'N/A'},${emp.base_salary},${emp.status},${emp.start_date}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function exportWITToPDF() {
    if (!reportData || reportData.type !== 'wit') return;

    generateWITForm({
      organizationName: organization?.name || 'Organization',
      organizationTIN: organization?.tin || '',
      period: reportData.period,
      filingDeadline: reportData.summary.filingDeadline,
      items: reportData.items.map((item: any) => ({
        employeeName: `${item.employees?.first_name} ${item.employees?.last_name}`,
        tin: item.employees?.tin || '',
        isResident: item.employees?.is_resident || false,
        grossWages: item.gross_pay,
        taxWithheld: item.tax_withheld || 0,
      })),
      totalWages: reportData.summary.totalWages,
      totalTax: reportData.summary.totalTax,
    });
  }

  function exportINSSToPDF() {
    if (!reportData || reportData.type !== 'inss') return;

    generateINSSForm({
      organizationName: organization?.name || 'Organization',
      organizationTIN: organization?.tin || '',
      period: reportData.period,
      filingDeadline: reportData.summary.filingDeadline,
      items: reportData.items.map((item: any) => ({
        employeeName: `${item.employees?.first_name} ${item.employees?.last_name}`,
        inssNumber: item.employees?.inss_number || '',
        grossWages: item.gross_pay,
        employeeContribution: item.inss_employee || 0,
        employerContribution: item.inss_employer || 0,
      })),
      totalWages: reportData.summary.totalWages,
      totalEmployeeContribution: reportData.summary.employeeContribution,
      totalEmployerContribution: reportData.summary.employerContribution,
    });
  }

  const reportTypes = [
    { id: 'payroll', label: t('types.payroll'), icon: DollarSign, description: t('types.payrollDesc') },
    { id: 'wit', label: t('types.wit'), icon: FileText, description: t('types.witDesc') },
    { id: 'inss', label: t('types.inss'), icon: Building2, description: t('types.inssDesc') },
    { id: 'employees', label: t('types.employees'), icon: Users, description: t('types.employeesDesc') },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-500">{t('subtitle')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {(selectedReport === 'wit' || selectedReport === 'inss') && reportData && (
            <Button
              onClick={selectedReport === 'wit' ? exportWITToPDF : exportINSSToPDF}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {t('exportPdf')}
            </Button>
          )}
          <Button onClick={exportToCSV} disabled={!reportData} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            {t('exportCsv')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
        {/* Report Type Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('selectType')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedReport(type.id as ReportType)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedReport === type.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <type.icon className={`h-5 w-5 ${selectedReport === type.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <div className={`font-medium ${selectedReport === type.id ? 'text-blue-900' : 'text-gray-900'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {selectedReport !== 'employees' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('selectPeriod')}</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {tCommon('loading')}
              </CardContent>
            </Card>
          ) : reportData ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
                {reportData.type === 'payroll' && (
                  <>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('payroll.totalGross')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${reportData.summary.totalGross.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('payroll.totalDeductions')}</div>
                        <div className="text-2xl font-bold text-red-600">
                          ${(reportData.summary.totalTax + reportData.summary.totalINSS).toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('payroll.totalNet')}</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${reportData.summary.totalNet.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {reportData.type === 'wit' && (
                  <>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('wit.totalWages')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${reportData.summary.totalWages.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('wit.totalTax')}</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${reportData.summary.totalTax.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('wit.filingDeadline')}</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {format(new Date(reportData.summary.filingDeadline), 'MMM d, yyyy')}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {reportData.type === 'inss' && (
                  <>
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-gray-500">Employee</span>
                          <span className="text-xs text-gray-400">4%</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${reportData.summary.employeeContribution.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-gray-500">Employer</span>
                          <span className="text-xs text-gray-400">6%</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${reportData.summary.employerContribution.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">Total Due</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${reportData.summary.totalContribution.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {reportData.type === 'employees' && (
                  <>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('employeeList.totalEmployees')}</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {reportData.summary.total}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('employeeList.activeInactive')}</div>
                        <div className="text-2xl font-bold">
                          <span className="text-green-600">{reportData.summary.active}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-red-600">{reportData.summary.inactive}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="py-4">
                        <div className="text-sm text-gray-500">{t('employeeList.avgSalary')}</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${reportData.summary.averageSalary.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Detail Table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {reportData.type === 'payroll' && `${t('payroll.title')} - ${reportData.period}`}
                    {reportData.type === 'wit' && `${t('wit.title')} - ${reportData.period}`}
                    {reportData.type === 'inss' && `${t('inss.title')} - ${reportData.period}`}
                    {reportData.type === 'employees' && t('employeeList.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {reportData.type === 'payroll' && (
                            <>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{t('table.employee')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.gross')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.tax')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{tCommon('inss')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.net')}</th>
                            </>
                          )}
                          {reportData.type === 'wit' && (
                            <>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{t('table.employee')}</th>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">TIN</th>
                              <th className="text-center py-3 px-2 font-medium text-gray-500">{t('wit.resident')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.wages')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">WIT</th>
                            </>
                          )}
                          {reportData.type === 'inss' && (
                            <>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{t('table.employee')}</th>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{tEmployees('tax.inssNumber')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.wages')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('inss.employeeRate')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('inss.employerRate')}</th>
                            </>
                          )}
                          {reportData.type === 'employees' && (
                            <>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{tEmployees('employment.employeeNumber')}</th>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{tEmployees('personal.fullName')}</th>
                              <th className="text-left py-3 px-2 font-medium text-gray-500">{tEmployees('employment.position')}</th>
                              <th className="text-right py-3 px-2 font-medium text-gray-500">{t('table.salary')}</th>
                              <th className="text-center py-3 px-2 font-medium text-gray-500">{tCommon('status')}</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.type === 'payroll' && reportData.runs.map((run: any) =>
                          run.payroll_items?.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 text-gray-900">
                                {item.employees?.first_name} {item.employees?.last_name}
                              </td>
                              <td className="py-3 px-2 text-right text-gray-900">${item.gross_pay.toFixed(2)}</td>
                              <td className="py-3 px-2 text-right text-red-600">${(item.tax_withheld || 0).toFixed(2)}</td>
                              <td className="py-3 px-2 text-right text-red-600">${((item.inss_employee || 0) + (item.inss_employer || 0)).toFixed(2)}</td>
                              <td className="py-3 px-2 text-right font-medium text-green-600">${item.net_pay.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                        {reportData.type === 'wit' && reportData.items.map((item: any) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 text-gray-900">
                              {item.employees?.first_name} {item.employees?.last_name}
                            </td>
                            <td className="py-3 px-2 text-gray-700">{item.employees?.tin || '-'}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${item.employees?.is_resident ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                {item.employees?.is_resident ? tCommon('yes') : tCommon('no')}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-gray-900">${item.gross_pay.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right font-medium text-gray-900">${(item.tax_withheld || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        {reportData.type === 'inss' && reportData.items.map((item: any) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 text-gray-900">
                              {item.employees?.first_name} {item.employees?.last_name}
                            </td>
                            <td className="py-3 px-2 text-gray-700">{item.employees?.inss_number || '-'}</td>
                            <td className="py-3 px-2 text-right text-gray-900">${item.gross_pay.toFixed(2)}</td>
                            <td className="py-3 px-2 text-right text-gray-900">${(item.inss_employee || 0).toFixed(2)}</td>
                            <td className="py-3 px-2 text-right text-gray-900">${(item.inss_employer || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                        {reportData.type === 'employees' && reportData.employees.map((emp: any) => (
                          <tr key={emp.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-mono text-gray-500">{emp.employee_number}</td>
                            <td className="py-3 px-2 text-gray-900">{emp.first_name} {emp.last_name}</td>
                            <td className="py-3 px-2 text-gray-700">{emp.position}</td>
                            <td className="py-3 px-2 text-right text-gray-900">${emp.base_salary.toFixed(2)}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {emp.status === 'active' ? tCommon('active') : emp.status === 'inactive' ? tCommon('inactive') : emp.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {((reportData.type === 'payroll' && reportData.runs.length === 0) ||
                          (reportData.type === 'wit' && reportData.items.length === 0) ||
                          (reportData.type === 'inss' && reportData.items.length === 0) ||
                          (reportData.type === 'employees' && reportData.employees.length === 0)) && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              {t('noDataForPeriod')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {t('selectToGenerate')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
