'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PayslipPage() {
  const params = useParams();
  const payrollRunId = params.id as string;
  const employeeId = params.employeeId as string;

  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'pt' | 'tet'>('en');
  const [data, setData] = useState<{
    employee: any;
    payrollItem: any;
    payrollRun: any;
    organization: any;
  } | null>(null);
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    loadData();
    // Delay PDF loading to avoid SSR issues
    const timer = setTimeout(() => setPdfReady(true), 100);
    return () => clearTimeout(timer);
  }, [payrollRunId, employeeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch payroll run
      const { data: payrollRun, error: runError } = await supabase
        .from('payroll_runs')
        .select('*, organizations(*)')
        .eq('id', payrollRunId)
        .single();

      if (runError) throw runError;

      // Fetch payroll item with employee
      const { data: payrollItem, error: itemError } = await supabase
        .from('payroll_items')
        .select('*, employees(*)')
        .eq('payroll_run_id', payrollRunId)
        .eq('employee_id', employeeId)
        .single();

      if (itemError) throw itemError;

      setData({
        employee: payrollItem.employees,
        payrollItem,
        payrollRun,
        organization: payrollRun.organizations,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error: {error || 'Failed to load payslip data'}</div>
      </div>
    );
  }

  const { employee, payrollItem, payrollRun, organization } = data;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/payroll/${payrollRunId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Payslip: {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-500">
              {formatDate(payrollRun.period_start)} - {formatDate(payrollRun.period_end)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'pt' | 'tet')}
            options={[
              { value: 'en', label: 'English' },
              { value: 'pt', label: 'Português' },
              { value: 'tet', label: 'Tetum' },
            ]}
          />
          {pdfReady && (
            <PayslipDownloadButton
              employee={employee}
              payrollItem={payrollItem}
              organization={organization}
              payrollRun={payrollRun}
              language={language}
            />
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Gross Pay</div>
            <div className="text-xl font-bold">{formatCurrency(payrollItem.gross_pay)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Tax (WIT)</div>
            <div className="text-xl font-bold text-red-600">-{formatCurrency(payrollItem.tax_withheld || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">INSS (4%)</div>
            <div className="text-xl font-bold text-red-600">-{formatCurrency(payrollItem.inss_employee || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Net Pay</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(payrollItem.net_pay)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payslip Preview (HTML version) */}
      <Card>
        <CardContent className="p-8">
          <PayslipPreview
            employee={employee}
            payrollItem={payrollItem}
            organization={organization}
            payrollRun={payrollRun}
            language={language}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// HTML Payslip Preview Component
function PayslipPreview({
  employee,
  payrollItem,
  organization,
  payrollRun,
  language,
}: {
  employee: any;
  payrollItem: any;
  organization: any;
  payrollRun: any;
  language: 'en' | 'pt' | 'tet';
}) {
  const translations = {
    en: {
      payslip: 'PAYSLIP',
      period: 'Pay Period',
      payDate: 'Pay Date',
      employeeDetails: 'Employee Details',
      name: 'Name',
      employeeNo: 'Employee No',
      position: 'Position',
      department: 'Department',
      taxId: 'Tax ID (TIN)',
      inssNo: 'INSS Number',
      earnings: 'Earnings',
      baseSalary: 'Base Salary',
      overtime: 'Overtime Pay',
      allowances: 'Allowances',
      bonuses: 'Bonuses',
      grossPay: 'Gross Pay',
      deductions: 'Deductions',
      witTax: 'Wage Income Tax (WIT)',
      inss: 'INSS Contribution (4%)',
      totalDeductions: 'Total Deductions',
      netPay: 'NET PAY',
    },
    pt: {
      payslip: 'RECIBO DE VENCIMENTO',
      period: 'Período de Pagamento',
      payDate: 'Data de Pagamento',
      employeeDetails: 'Dados do Funcionário',
      name: 'Nome',
      employeeNo: 'Nº Funcionário',
      position: 'Cargo',
      department: 'Departamento',
      taxId: 'NIF (TIN)',
      inssNo: 'Número INSS',
      earnings: 'Rendimentos',
      baseSalary: 'Salário Base',
      overtime: 'Horas Suplementares',
      allowances: 'Subsídios',
      bonuses: 'Bónus',
      grossPay: 'Salário Bruto',
      deductions: 'Deduções',
      witTax: 'Imposto sobre Salários (WIT)',
      inss: 'Contribuição INSS (4%)',
      totalDeductions: 'Total Deduções',
      netPay: 'SALÁRIO LÍQUIDO',
    },
    tet: {
      payslip: 'RESIBU SALÁRIU',
      period: 'Períodu Pagamentu',
      payDate: 'Data Pagamentu',
      employeeDetails: 'Dadus Funsionáriu',
      name: 'Naran',
      employeeNo: 'Nº Funsionáriu',
      position: 'Kargo',
      department: 'Departamentu',
      taxId: 'NIF (TIN)',
      inssNo: 'Númeru INSS',
      earnings: 'Rendimentu',
      baseSalary: 'Saláriu Báziku',
      overtime: 'Oras Suplementár',
      allowances: 'Subsídiu sira',
      bonuses: 'Bónus',
      grossPay: 'Saláriu Brutu',
      deductions: 'Dedusaun',
      witTax: 'Impostu ba Saláriu (WIT)',
      inss: 'Kontribuisaun INSS (4%)',
      totalDeductions: 'Total Dedusaun',
      netPay: 'SALÁRIU LÍKIDU',
    },
  };

  const t = translations[language];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-blue-800">{organization?.name || 'Company'}</h2>
          {organization?.address && <p className="text-gray-500 text-sm">{organization.address}</p>}
          {organization?.tin && <p className="text-gray-500 text-sm">TIN: {organization.tin}</p>}
        </div>
        <div className="text-right">
          <h3 className="text-lg font-bold">{t.payslip}</h3>
          <p className="text-sm text-gray-500">
            {t.period}: {formatDate(payrollRun.period_start)} - {formatDate(payrollRun.period_end)}
          </p>
          <p className="text-sm text-gray-500">{t.payDate}: {formatDate(payrollRun.pay_date)}</p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="mb-6">
        <h4 className="font-semibold bg-gray-100 p-2 mb-3">{t.employeeDetails}</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t.name}:</span>
            <span className="ml-2 font-medium">{employee.first_name} {employee.last_name}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.position}:</span>
            <span className="ml-2 font-medium">{employee.position}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.employeeNo}:</span>
            <span className="ml-2 font-medium">{employee.employee_number}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.department}:</span>
            <span className="ml-2 font-medium">{employee.department || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.taxId}:</span>
            <span className="ml-2 font-medium font-mono">{employee.tin || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">{t.inssNo}:</span>
            <span className="ml-2 font-medium font-mono">{employee.inss_number || '-'}</span>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="mb-6">
        <h4 className="font-semibold bg-gray-100 p-2 mb-3">{t.earnings}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.baseSalary}</span>
            <span className="font-medium">{formatCurrency(payrollItem.base_salary)}</span>
          </div>
          {(payrollItem.overtime_pay || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.overtime}</span>
              <span className="font-medium">{formatCurrency(payrollItem.overtime_pay)}</span>
            </div>
          )}
          {(payrollItem.allowances || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.allowances}</span>
              <span className="font-medium">{formatCurrency(payrollItem.allowances)}</span>
            </div>
          )}
          {(payrollItem.bonuses || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.bonuses}</span>
              <span className="font-medium">{formatCurrency(payrollItem.bonuses)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>{t.grossPay}</span>
            <span>{formatCurrency(payrollItem.gross_pay)}</span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div className="mb-6">
        <h4 className="font-semibold bg-gray-100 p-2 mb-3">{t.deductions}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.witTax}</span>
            <span className="font-medium text-red-600">-{formatCurrency(payrollItem.tax_withheld || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.inss}</span>
            <span className="font-medium text-red-600">-{formatCurrency(payrollItem.inss_employee || 0)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>{t.totalDeductions}</span>
            <span className="text-red-600">-{formatCurrency(payrollItem.total_deductions || 0)}</span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-green-600 text-white p-4 rounded-lg">
        <div className="text-sm opacity-90">{t.netPay}</div>
        <div className="text-3xl font-bold">{formatCurrency(payrollItem.net_pay)}</div>
      </div>
    </div>
  );
}

// Lazy-loaded PDF download button
function PayslipDownloadButton({
  employee,
  payrollItem,
  organization,
  payrollRun,
  language,
}: {
  employee: any;
  payrollItem: any;
  organization: any;
  payrollRun: any;
  language: 'en' | 'pt' | 'tet';
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const { PayslipPDF } = await import('@/components/payroll/payslip-pdf');

      const blob = await pdf(
        <PayslipPDF
          employee={{
            first_name: employee.first_name,
            last_name: employee.last_name,
            employee_number: employee.employee_number,
            position: employee.position,
            department: employee.department,
            tin: employee.tin,
            inss_number: employee.inss_number,
          }}
          payrollItem={{
            base_salary: payrollItem.base_salary,
            overtime_hours: payrollItem.overtime_hours,
            overtime_pay: payrollItem.overtime_pay,
            night_shift_premium: payrollItem.night_shift_premium,
            allowances: payrollItem.allowances,
            bonuses: payrollItem.bonuses,
            gross_pay: payrollItem.gross_pay,
            tax_withheld: payrollItem.tax_withheld,
            inss_employee: payrollItem.inss_employee,
            total_deductions: payrollItem.total_deductions,
            net_pay: payrollItem.net_pay,
          }}
          organization={{
            name: organization?.name || 'Company',
            address: organization?.address,
            tin: organization?.tin,
          }}
          payPeriod={{
            start: payrollRun.period_start,
            end: payrollRun.period_end,
            payDate: payrollRun.pay_date,
          }}
          language={language}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${employee.employee_number}-${payrollRun.period_start}-${language}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={downloading}>
      {downloading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      Download PDF
    </Button>
  );
}
