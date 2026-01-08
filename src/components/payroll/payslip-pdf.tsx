'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Register fonts (using default for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
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
    marginBottom: 20,
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
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 20,
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
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #e5e7eb',
    fontSize: 8,
    color: '#6b7280',
  },
  footerText: {
    marginBottom: 4,
  },
  netPayBox: {
    backgroundColor: '#059669',
    padding: 15,
    marginTop: 20,
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

interface PayslipPDFProps {
  employee: {
    first_name: string;
    last_name: string;
    employee_number: string;
    position: string;
    department?: string | null;
    tin?: string | null;
    inss_number?: string | null;
  };
  payrollItem: {
    base_salary: number;
    overtime_hours?: number | null;
    overtime_pay?: number | null;
    night_shift_premium?: number | null;
    allowances?: number | null;
    bonuses?: number | null;
    gross_pay: number;
    tax_withheld?: number | null;
    inss_employee?: number | null;
    other_deductions?: number | null;
    total_deductions?: number | null;
    net_pay: number;
  };
  organization: {
    name: string;
    address?: string | null;
    tin?: string | null;
  };
  payPeriod: {
    start: string;
    end: string;
    payDate: string;
  };
  language?: 'en' | 'pt' | 'tet';
}

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
    otherDeductions: 'Outras Deduções',
    totalDeductions: 'Total Deduções',
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
    otherDeductions: 'Dedusaun Seluk',
    totalDeductions: 'Total Dedusaun',
    netPay: 'SALÁRIU LÍKIDU',
    footer1: 'Ida ne\'e dokumentu ne\'ebé komputador kria.',
    footer2: 'Impostu kalkula tuir regulamentu Timor-Leste (10% liu $500 ba residente).',
    footer3: 'Kontribuisaun INSS tuir Lei Nº 12/2016.',
  },
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB');
}

export function PayslipPDF({
  employee,
  payrollItem,
  organization,
  payPeriod,
  language = 'en',
}: PayslipPDFProps) {
  const t = translations[language];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{organization.name}</Text>
            {organization.address && (
              <Text style={styles.companyDetails}>{organization.address}</Text>
            )}
            {organization.tin && (
              <Text style={styles.companyDetails}>TIN: {organization.tin}</Text>
            )}
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

        {/* Employee Details */}
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

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.earnings}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t.baseSalary}</Text>
            <Text style={styles.value}>{formatCurrency(payrollItem.base_salary)}</Text>
          </View>
          {(payrollItem.overtime_pay || 0) > 0 && (
            <View style={styles.rowAlt}>
              <Text style={styles.label}>{t.overtime}</Text>
              <Text style={styles.value}>{formatCurrency(payrollItem.overtime_pay || 0)}</Text>
            </View>
          )}
          {(payrollItem.night_shift_premium || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>{t.nightShift}</Text>
              <Text style={styles.value}>{formatCurrency(payrollItem.night_shift_premium || 0)}</Text>
            </View>
          )}
          {(payrollItem.allowances || 0) > 0 && (
            <View style={styles.rowAlt}>
              <Text style={styles.label}>{t.allowances}</Text>
              <Text style={styles.value}>{formatCurrency(payrollItem.allowances || 0)}</Text>
            </View>
          )}
          {(payrollItem.bonuses || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>{t.bonuses}</Text>
              <Text style={styles.value}>{formatCurrency(payrollItem.bonuses || 0)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.grossPay}</Text>
            <Text style={styles.value}>{formatCurrency(payrollItem.gross_pay)}</Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.deductions}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t.witTax}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(payrollItem.tax_withheld || 0)}</Text>
          </View>
          <View style={styles.rowAlt}>
            <Text style={styles.label}>{t.inss}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(payrollItem.inss_employee || 0)}</Text>
          </View>
          {(payrollItem.other_deductions || 0) > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>{t.otherDeductions}</Text>
              <Text style={styles.valueDeduction}>
                -{formatCurrency(payrollItem.other_deductions || 0)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.totalDeductions}</Text>
            <Text style={styles.valueDeduction}>-{formatCurrency(payrollItem.total_deductions || 0)}</Text>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPayBox}>
          <Text style={styles.netPayLabel}>{t.netPay}</Text>
          <Text style={styles.netPayValue}>{formatCurrency(payrollItem.net_pay)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.footer1}</Text>
          <Text style={styles.footerText}>{t.footer2}</Text>
          <Text style={styles.footerText}>{t.footer3}</Text>
        </View>
      </Page>
    </Document>
  );
}
