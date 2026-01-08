import 'server-only';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';

export type PayslipLanguage = 'en' | 'pt' | 'tet';

export function isPayslipLanguage(value: string | null): value is PayslipLanguage {
  return value === 'en' || value === 'pt' || value === 'tet';
}

export interface PayslipEmployee {
  first_name: string;
  last_name: string;
  employee_number: string;
  position: string;
  department?: string | null;
  tin?: string | null;
  inss_number?: string | null;
}

export interface PayslipPayrollItem {
  base_salary: number;
  overtime_hours?: number | null;
  overtime_pay?: number | null;
  night_shift_hours?: number | null;
  night_shift_premium?: number | null;
  allowances?: number | null;
  bonuses?: number | null;
  gross_pay: number;
  tax_withheld?: number | null;
  inss_employee?: number | null;
  inss_employer?: number | null;
  other_deductions?: number | null;
  total_deductions?: number | null;
  net_pay: number;
}

export interface PayslipLeaveBalances {
  annualLeaveRemaining?: number | null;
  annualLeaveEntitled?: number | null;
  annualLeaveTaken?: number | null;
  sickLeaveEntitled?: number | null;
  sickLeaveTaken?: number | null;
  personalLeaveEntitled?: number | null;
  personalLeaveTaken?: number | null;
}

export interface PayslipYtdSummary {
  gross: number;
  tax: number;
  inssEmployee: number;
  inssEmployer: number;
  net: number;
}

export interface PayslipOrganization {
  name: string;
  address?: string | null;
  tin?: string | null;
}

export interface PayslipPayPeriod {
  start: string;
  end: string;
  payDate: string;
}

export interface PayslipPDFInput {
  employee: PayslipEmployee;
  payrollItem: PayslipPayrollItem;
  organization: PayslipOrganization;
  payPeriod: PayslipPayPeriod;
  leaveBalances?: PayslipLeaveBalances;
  ytd?: PayslipYtdSummary;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2px solid #2563eb',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  companyDetails: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  payslipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  payslipPeriod: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  rowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f9fafb',
  },
  label: {
    color: '#374151',
  },
  value: {
    fontWeight: 'bold',
  },
  valueDeduction: {
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 10,
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  footer: {
    marginTop: 26,
    paddingTop: 16,
    borderTop: '1px solid #e5e7eb',
    fontSize: 8,
    color: '#6b7280',
  },
  footerText: {
    marginBottom: 4,
  },
  netPayBox: {
    backgroundColor: '#059669',
    padding: 14,
    marginTop: 18,
    borderRadius: 4,
  },
  netPayLabel: {
    color: '#ffffff',
    fontSize: 10,
  },
  netPayValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

const translations: Record<PayslipLanguage, Record<string, string>> = {
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
    nightShift: 'Night Shift Premium',
    allowances: 'Allowances',
    bonuses: 'Bonuses',
    grossPay: 'Gross Pay',
    deductions: 'Deductions',
    witTax: 'Wage Income Tax (WIT)',
    inss: 'INSS Contribution (4%)',
    employerContributions: 'Employer Contributions',
    inssEmployer: 'INSS Contribution (6%)',
    otherDeductions: 'Other Deductions',
    totalDeductions: 'Total Deductions',
    leave: 'Leave',
    leaveBalance: 'Leave Balance',
    annualLeave: 'Annual Leave',
    sickLeave: 'Sick Leave',
    personalLeave: 'Personal Leave',
    ytd: 'Year-to-Date (YTD)',
    ytdGross: 'YTD Gross Pay',
    ytdTax: 'YTD WIT',
    ytdInssEmployee: 'YTD INSS (Employee)',
    ytdInssEmployer: 'YTD INSS (Employer)',
    ytdNet: 'YTD Net Pay',
    netPay: 'NET PAY',
    footer1: 'This is a computer-generated document.',
    footer2: 'Tax calculated as per Timor-Leste regulations (10% above $500 for residents).',
    footer3: 'INSS contributions as per Law No. 12/2016.',
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
    nightShift: 'Subsídio Noturno',
    allowances: 'Subsídios',
    bonuses: 'Bónus',
    grossPay: 'Salário Bruto',
    deductions: 'Deduções',
    witTax: 'Imposto sobre Salários (WIT)',
    inss: 'Contribuição INSS (4%)',
    employerContributions: 'Contribuições do Empregador',
    inssEmployer: 'Contribuição INSS (6%)',
    otherDeductions: 'Outras Deduções',
    totalDeductions: 'Total Deduções',
    leave: 'Férias',
    leaveBalance: 'Saldo de Férias',
    annualLeave: 'Férias Anuais',
    sickLeave: 'Baixa Médica',
    personalLeave: 'Licença Pessoal',
    ytd: 'Acumulado no Ano (YTD)',
    ytdGross: 'Bruto Acumulado',
    ytdTax: 'WIT Acumulado',
    ytdInssEmployee: 'INSS Acumulado (Funcionário)',
    ytdInssEmployer: 'INSS Acumulado (Empregador)',
    ytdNet: 'Líquido Acumulado',
    netPay: 'SALÁRIO LÍQUIDO',
    footer1: 'Este é um documento gerado por computador.',
    footer2: 'Imposto calculado conforme regulamentos de Timor-Leste (10% acima de $500 para residentes).',
    footer3: 'Contribuições INSS conforme Lei Nº 12/2016.',
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
    nightShift: 'Subsídiu Kalan',
    allowances: 'Subsídiu sira',
    bonuses: 'Bónus',
    grossPay: 'Saláriu Brutu',
    deductions: 'Dedusaun',
    witTax: 'Impostu ba Saláriu (WIT)',
    inss: 'Kontribuisaun INSS (4%)',
    employerContributions: 'Kontribuisaun Empregadór',
    inssEmployer: 'Kontribuisaun INSS (6%)',
    otherDeductions: 'Dedusaun Seluk',
    totalDeductions: 'Total Dedusaun',
    leave: 'Lisensa',
    leaveBalance: 'Saldo Lisensa',
    annualLeave: 'Férias Anuál',
    sickLeave: 'Lisensa Moras',
    personalLeave: 'Lisensa Pessoál',
    ytd: 'Akumuladu Tinan Ida (YTD)',
    ytdGross: 'Brutu Akumuladu',
    ytdTax: 'WIT Akumuladu',
    ytdInssEmployee: 'INSS Akumuladu (Funsionáriu)',
    ytdInssEmployer: 'INSS Akumuladu (Empregadór)',
    ytdNet: 'Líkidu Akumuladu',
    netPay: 'SALÁRIU LÍKIDU',
    footer1: "Ida ne'e dokumentu ne'ebé komputador kria.",
    footer2: 'Impostu kalkula tuir regulamentu Timor-Leste (10% liu $500 ba residente).',
    footer3: 'Kontribuisaun INSS tuir Lei Nº 12/2016.',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB');
}

function PayslipPageContent({
  employee,
  payrollItem,
  organization,
  payPeriod,
  leaveBalances,
  ytd,
  language,
}: PayslipPDFInput & { language: PayslipLanguage }) {
  const t = translations[language];
  const otherDeductions = payrollItem.other_deductions ?? 0;
  const employerInss = payrollItem.inss_employer ?? 0;

  const annualLeaveRemaining =
    leaveBalances?.annualLeaveRemaining ??
    (leaveBalances?.annualLeaveEntitled != null && leaveBalances?.annualLeaveTaken != null
      ? leaveBalances.annualLeaveEntitled - leaveBalances.annualLeaveTaken
      : null);
  const sickLeaveRemaining =
    leaveBalances?.sickLeaveEntitled != null && leaveBalances?.sickLeaveTaken != null
      ? leaveBalances.sickLeaveEntitled - leaveBalances.sickLeaveTaken
      : null;
  const personalLeaveRemaining =
    leaveBalances?.personalLeaveEntitled != null && leaveBalances?.personalLeaveTaken != null
      ? leaveBalances.personalLeaveEntitled - leaveBalances.personalLeaveTaken
      : null;
  const hasLeaveRows =
    annualLeaveRemaining != null || sickLeaveRemaining != null || personalLeaveRemaining != null;

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{organization.name}</Text>
          {organization.address ? (
            <Text style={styles.companyDetails}>{organization.address}</Text>
          ) : null}
          {organization.tin ? (
            <Text style={styles.companyDetails}>TIN: {organization.tin}</Text>
          ) : null}
        </View>
        <View>
          <Text style={styles.payslipTitle}>{t.payslip}</Text>
          <Text style={styles.payslipPeriod}>
            {t.period}: {formatDate(payPeriod.start)} - {formatDate(payPeriod.end)}
          </Text>
          <Text style={styles.payslipPeriod}>
            {t.payDate}: {formatDate(payPeriod.payDate)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.employeeDetails}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{t.name}</Text>
            <Text style={styles.infoValue}>
              {employee.first_name} {employee.last_name}
            </Text>
            <Text style={styles.infoLabel}>{t.employeeNo}</Text>
            <Text style={styles.infoValue}>{employee.employee_number}</Text>
            <Text style={styles.infoLabel}>{t.taxId}</Text>
            <Text style={styles.infoValue}>{employee.tin || '-'}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>{t.position}</Text>
            <Text style={styles.infoValue}>{employee.position}</Text>
            <Text style={styles.infoLabel}>{t.department}</Text>
            <Text style={styles.infoValue}>{employee.department || '-'}</Text>
            <Text style={styles.infoLabel}>{t.inssNo}</Text>
            <Text style={styles.infoValue}>{employee.inss_number || '-'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.earnings}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t.baseSalary}</Text>
          <Text style={styles.value}>{formatCurrency(payrollItem.base_salary)}</Text>
        </View>
        {(payrollItem.overtime_pay ?? 0) > 0 ? (
          <View style={styles.rowAlt}>
            <Text style={styles.label}>{t.overtime}</Text>
            <Text style={styles.value}>{formatCurrency(payrollItem.overtime_pay ?? 0)}</Text>
          </View>
        ) : null}
        {(payrollItem.night_shift_premium ?? 0) > 0 ? (
          <View style={styles.row}>
            <Text style={styles.label}>{t.nightShift}</Text>
            <Text style={styles.value}>
              {formatCurrency(payrollItem.night_shift_premium ?? 0)}
            </Text>
          </View>
        ) : null}
        {(payrollItem.allowances ?? 0) > 0 ? (
          <View style={styles.rowAlt}>
            <Text style={styles.label}>{t.allowances}</Text>
            <Text style={styles.value}>{formatCurrency(payrollItem.allowances ?? 0)}</Text>
          </View>
        ) : null}
        {(payrollItem.bonuses ?? 0) > 0 ? (
          <View style={styles.row}>
            <Text style={styles.label}>{t.bonuses}</Text>
            <Text style={styles.value}>{formatCurrency(payrollItem.bonuses ?? 0)}</Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t.grossPay}</Text>
          <Text style={styles.value}>{formatCurrency(payrollItem.gross_pay)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.deductions}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>{t.witTax}</Text>
          <Text style={styles.valueDeduction}>
            -{formatCurrency(payrollItem.tax_withheld ?? 0)}
          </Text>
        </View>
        <View style={styles.rowAlt}>
          <Text style={styles.label}>{t.inss}</Text>
          <Text style={styles.valueDeduction}>
            -{formatCurrency(payrollItem.inss_employee ?? 0)}
          </Text>
        </View>
        {otherDeductions > 0 ? (
          <View style={styles.row}>
            <Text style={styles.label}>{t.otherDeductions}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(otherDeductions)}</Text>
          </View>
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t.totalDeductions}</Text>
          <Text style={styles.valueDeduction}>
            -{formatCurrency(payrollItem.total_deductions ?? 0)}
          </Text>
        </View>
      </View>

      {employerInss > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.employerContributions}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t.inssEmployer}</Text>
            <Text style={styles.value}>{formatCurrency(employerInss)}</Text>
          </View>
        </View>
      ) : null}

      {leaveBalances && hasLeaveRows ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.leaveBalance}</Text>
          {annualLeaveRemaining != null ? (
            <View style={styles.row}>
              <Text style={styles.label}>{t.annualLeave}</Text>
              <Text style={styles.value}>{String(annualLeaveRemaining)}</Text>
            </View>
          ) : null}
          {sickLeaveRemaining != null ? (
            <View style={styles.rowAlt}>
              <Text style={styles.label}>{t.sickLeave}</Text>
              <Text style={styles.value}>{String(sickLeaveRemaining)}</Text>
            </View>
          ) : null}
          {personalLeaveRemaining != null ? (
            <View style={styles.row}>
              <Text style={styles.label}>{t.personalLeave}</Text>
              <Text style={styles.value}>{String(personalLeaveRemaining)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {ytd ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.ytd}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t.ytdGross}</Text>
            <Text style={styles.value}>{formatCurrency(ytd.gross)}</Text>
          </View>
          <View style={styles.rowAlt}>
            <Text style={styles.label}>{t.ytdTax}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(ytd.tax)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{t.ytdInssEmployee}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(ytd.inssEmployee)}</Text>
          </View>
          <View style={styles.rowAlt}>
            <Text style={styles.label}>{t.ytdInssEmployer}</Text>
            <Text style={styles.value}>{formatCurrency(ytd.inssEmployer)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.ytdNet}</Text>
            <Text style={styles.value}>{formatCurrency(ytd.net)}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.netPayBox}>
        <Text style={styles.netPayLabel}>{t.netPay}</Text>
        <Text style={styles.netPayValue}>{formatCurrency(payrollItem.net_pay)}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t.footer1}</Text>
        <Text style={styles.footerText}>{t.footer2}</Text>
        <Text style={styles.footerText}>{t.footer3}</Text>
      </View>
    </>
  );
}

export function PayslipsDocument({
  items,
  language,
}: {
  items: PayslipPDFInput[];
  language: PayslipLanguage;
}) {
  return (
    <Document>
      {items.map((item, index) => (
        <Page key={`${item.employee.employee_number}-${index}`} size="A4" style={styles.page}>
          <PayslipPageContent {...item} language={language} />
        </Page>
      ))}
    </Document>
  );
}

export async function renderPayslipsPDFBuffer({
  items,
  language,
}: {
  items: PayslipPDFInput[];
  language: PayslipLanguage;
}): Promise<Buffer> {
  return renderToBuffer(<PayslipsDocument items={items} language={language} />);
}
