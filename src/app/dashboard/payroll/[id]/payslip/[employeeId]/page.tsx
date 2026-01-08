'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Employee, Organization, PayrollItem, PayrollRun } from '@/types/supabase';

const payslipTranslations = {
  en: {
    languageName: 'English',
    error: 'Error',
    failedToLoad: 'Failed to load payslip data',
    title: 'Payslip',
    taxWit: 'Tax (WIT)',
    inssEmployee: 'INSS (4%)',
    downloadPdf: 'Download PDF',
    companyFallback: 'Company',
    tinLabel: 'TIN',
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
    nightShift: 'Night Shift Premium',
    allowances: 'Allowances',
    bonuses: 'Bonuses',
    grossPay: 'Gross Pay',
    deductions: 'Deductions',
    witTax: 'Wage Income Tax (WIT)',
    inss: 'INSS Contribution (4%)',
    otherDeductions: 'Other Deductions',
    totalDeductions: 'Total Deductions',
    netPay: 'NET PAY',
  },
  pt: {
    languageName: 'Português',
    error: 'Erro',
    failedToLoad: 'Falha ao carregar dados do recibo',
    title: 'Recibo',
    taxWit: 'Imposto (WIT)',
    inssEmployee: 'INSS (4%)',
    downloadPdf: 'Baixar PDF',
    companyFallback: 'Empresa',
    tinLabel: 'NIF',
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
    nightShift: 'Subsídio Noturno',
    allowances: 'Subsídios',
    bonuses: 'Bónus',
    grossPay: 'Salário Bruto',
    deductions: 'Deduções',
    witTax: 'Imposto sobre Salários (WIT)',
    inss: 'Contribuição INSS (4%)',
    otherDeductions: 'Outras Deduções',
    totalDeductions: 'Total Deduções',
    netPay: 'SALÁRIO LÍQUIDO',
  },
  tet: {
    languageName: 'Tetun',
    error: 'Erru',
    failedToLoad: 'La konsege karrega dadus resibu',
    title: 'Resibu',
    taxWit: 'Taxa (WIT)',
    inssEmployee: 'INSS (4%)',
    downloadPdf: 'Baixa PDF',
    companyFallback: 'Kompania',
    tinLabel: 'TIN',
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
    nightShift: 'Subsídiu Kalan',
    allowances: 'Subsídiu sira',
    bonuses: 'Bónus',
    grossPay: 'Saláriu Brutu',
    deductions: 'Dedusaun',
    witTax: 'Impostu ba Saláriu (WIT)',
    inss: 'Kontribuisaun INSS (4%)',
    otherDeductions: 'Dedusaun Seluk',
    totalDeductions: 'Total Dedusaun',
    netPay: 'SALÁRIU LÍKIDU',
  },
} as const;

export default function PayslipPage() {
  const params = useParams();
  const payrollRunId = params.id as string;
  const employeeId = params.employeeId as string;

  const supabase = useMemo(() => createClient(), []);
  const locale = useLocale();
  const initialLanguage: 'en' | 'pt' | 'tet' =
    locale === 'tet' ? 'tet' : locale === 'pt' ? 'pt' : 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'pt' | 'tet'>(initialLanguage);
  const [data, setData] = useState<{
    employee: Employee;
    payrollItem: PayrollItem;
    payrollRun: PayrollRun;
    organization: Organization;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        type PayrollRunWithOrg = PayrollRun & { organizations: Organization | null };
        type PayrollItemWithEmployee = PayrollItem & { employees: Employee | null };

        const { data: payrollRun, error: runError } = await supabase
          .from('payroll_runs')
          .select('*, organizations(*)')
          .eq('id', payrollRunId)
          .single<PayrollRunWithOrg>();

        if (runError) throw runError;
        if (!payrollRun?.organizations) throw new Error('Organization not found');

        const { data: payrollItem, error: itemError } = await supabase
          .from('payroll_items')
          .select('*, employees(*)')
          .eq('payroll_run_id', payrollRunId)
          .eq('employee_id', employeeId)
          .single<PayrollItemWithEmployee>();

        if (itemError) throw itemError;
        if (!payrollItem?.employees) throw new Error('Employee not found');

        const { organizations: organization, ...payrollRunRow } = payrollRun;
        const { employees: employee, ...payrollItemRow } = payrollItem;

        setData({
          employee,
          payrollItem: payrollItemRow,
          payrollRun: payrollRunRow,
          organization,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId, payrollRunId, supabase]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    const t = payslipTranslations[language];
    return (
      <div className="p-8">
        <div className="text-red-500">
          {t.error}: {error || t.failedToLoad}
        </div>
      </div>
    );
  }

  const { employee, payrollItem, payrollRun, organization } = data;
  const t = payslipTranslations[language];

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
              {t.title}: {employee.first_name} {employee.last_name}
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
              { value: 'en', label: payslipTranslations.en.languageName },
              { value: 'pt', label: payslipTranslations.pt.languageName },
              { value: 'tet', label: payslipTranslations.tet.languageName },
            ]}
          />
          <PayslipDownloadButton
            payrollRunId={payrollRunId}
            employeeId={employeeId}
            employee={employee}
            payrollItem={payrollItem}
            organization={organization}
            payrollRun={payrollRun}
            language={language}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">{t.grossPay}</div>
            <div className="text-xl font-bold">{formatCurrency(payrollItem.gross_pay || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">{t.taxWit}</div>
            <div className="text-xl font-bold text-red-600">-{formatCurrency(payrollItem.tax_withheld || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">{t.inssEmployee}</div>
            <div className="text-xl font-bold text-red-600">-{formatCurrency(payrollItem.inss_employee || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">{t.netPay}</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(payrollItem.net_pay || 0)}</div>
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
  employee: Employee;
  payrollItem: PayrollItem;
  organization: Organization;
  payrollRun: PayrollRun;
  language: 'en' | 'pt' | 'tet';
}) {
  const t = payslipTranslations[language];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-blue-800">{organization?.name || t.companyFallback}</h2>
          {organization?.address && <p className="text-gray-500 text-sm">{organization.address}</p>}
          {organization?.tin && <p className="text-gray-500 text-sm">{t.tinLabel}: {organization.tin}</p>}
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
            <span className="font-medium">{formatCurrency(payrollItem.base_salary || 0)}</span>
          </div>
          {(payrollItem.overtime_pay || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.overtime}</span>
              <span className="font-medium">{formatCurrency(payrollItem.overtime_pay || 0)}</span>
            </div>
          )}
          {(payrollItem.night_shift_premium || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.nightShift}</span>
              <span className="font-medium">
                {formatCurrency(payrollItem.night_shift_premium || 0)}
              </span>
            </div>
          )}
          {(payrollItem.allowances || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.allowances}</span>
              <span className="font-medium">{formatCurrency(payrollItem.allowances || 0)}</span>
            </div>
          )}
          {(payrollItem.bonuses || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.bonuses}</span>
              <span className="font-medium">{formatCurrency(payrollItem.bonuses || 0)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>{t.grossPay}</span>
            <span>{formatCurrency(payrollItem.gross_pay || 0)}</span>
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
          {(payrollItem.other_deductions || 0) > 0 && (
            <div className="flex justify-between">
              <span>{t.otherDeductions}</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(payrollItem.other_deductions || 0)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>{t.totalDeductions}</span>
            <span className="text-red-600">-{formatCurrency(payrollItem.total_deductions || 0)}</span>
          </div>
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-green-600 text-white p-4 rounded-lg">
        <div className="text-sm opacity-90">{t.netPay}</div>
        <div className="text-3xl font-bold">{formatCurrency(payrollItem.net_pay || 0)}</div>
      </div>
    </div>
  );
}

// Lazy-loaded PDF download button
function PayslipDownloadButton({
  payrollRunId,
  employeeId,
  employee,
  payrollItem,
  organization,
  payrollRun,
  language,
}: {
  payrollRunId: string;
  employeeId: string;
  employee: Employee;
  payrollItem: PayrollItem;
  organization: Organization;
  payrollRun: PayrollRun;
  language: 'en' | 'pt' | 'tet';
}) {
  const [downloading, setDownloading] = useState(false);
  const t = payslipTranslations[language];

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilenameFromContentDisposition = (value: string | null) => {
    if (!value) return null;
    const match = /filename="([^"]+)"/.exec(value);
    return match?.[1] || null;
  };

  const fallbackClientSidePDF = async () => {
    const [{ pdf }, { PayslipPDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/payroll/payslip-pdf'),
    ]);

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
          other_deductions: payrollItem.other_deductions,
          total_deductions: payrollItem.total_deductions,
          net_pay: payrollItem.net_pay,
        }}
        organization={{
          name: organization?.name || t.companyFallback,
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

    const fallbackFilename = `payslip-${employee.employee_number}-${payrollRun.period_start}-${language}.pdf`;
    downloadBlob(blob, fallbackFilename);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/payroll/${payrollRunId}/payslip/${employeeId}?lang=${language}`
      );
      if (!response.ok) {
        let errorDetail: string | null = null;
        try {
          const contentType = response.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            const json = (await response.json()) as { error?: string };
            errorDetail = json?.error || null;
          } else {
            errorDetail = await response.text();
          }
        } catch {
          // ignore
        }

        console.warn(
          'Payslip PDF API failed; falling back to client-side PDF generation',
          {
            status: response.status,
            statusText: response.statusText,
            error: errorDetail,
          }
        );
        await fallbackClientSidePDF();
        return;
      }

      const blob = await response.blob();
      const headerFilename = getFilenameFromContentDisposition(
        response.headers.get('Content-Disposition')
      );
      const fallbackFilename = `payslip-${employee.employee_number}-${payrollRun.period_start}-${language}.pdf`;
      downloadBlob(blob, headerFilename || fallbackFilename);
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
      {t.downloadPdf}
    </Button>
  );
}
