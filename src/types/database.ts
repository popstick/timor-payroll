// Database types for Timor Payroll System

export interface Employee {
  id: string;
  created_at: string;
  updated_at: string;

  // Personal Info
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  nationality: string;

  // Contact
  email: string | null;
  phone: string | null;
  address: string | null;

  // Employment
  employee_number: string;
  department: string | null;
  position: string;
  employment_type: 'full_time' | 'part_time' | 'contract';
  start_date: string;
  end_date: string | null;
  status: 'active' | 'inactive' | 'terminated';

  // Compensation
  base_salary: number; // USD monthly
  currency: 'USD';

  // Government IDs
  tin: string | null; // Tax Identification Number
  inss_number: string | null; // Social Security Number

  // Residency (affects tax calculation)
  is_resident: boolean; // >= 183 days/year in TL

  // Organization
  organization_id: string;
}

export interface PayrollRun {
  id: string;
  created_at: string;
  organization_id: string;

  // Period
  period_start: string;
  period_end: string;
  pay_date: string;

  // Status
  status: 'draft' | 'processing' | 'approved' | 'paid';

  // Totals
  total_gross: number;
  total_tax: number;
  total_inss_employee: number;
  total_inss_employer: number;
  total_net: number;

  employee_count: number;

  approved_by: string | null;
  approved_at: string | null;
}

export interface PayrollItem {
  id: string;
  created_at: string;
  payroll_run_id: string;
  employee_id: string;

  // Earnings
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number; // 1.5 for regular, 2.0 for holiday/rest day
  overtime_pay: number;
  night_shift_hours: number;
  night_shift_premium: number; // 25% extra
  allowances: number;
  bonuses: number;
  gross_pay: number;

  // Deductions
  tax_withheld: number; // WIT
  inss_employee: number; // 4%
  other_deductions: number;
  total_deductions: number;

  // Employer costs (not deducted from employee)
  inss_employer: number; // 6%

  // Final
  net_pay: number;

  // Leave taken this period
  annual_leave_days: number;
  sick_leave_days: number;
  other_leave_days: number;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  year: number;

  // Annual Leave
  annual_leave_entitled: number; // Usually 12
  annual_leave_taken: number;
  annual_leave_remaining: number;

  // Sick Leave
  sick_leave_entitled: number; // 12 (6 full + 6 half)
  sick_leave_taken: number;

  // Personal Leave
  personal_leave_entitled: number; // 3
  personal_leave_taken: number;

  // Maternity/Paternity (if applicable)
  maternity_leave_taken: number;
  paternity_leave_taken: number;
}

export interface PublicHoliday {
  id: string;
  date: string;
  name_en: string;
  name_pt: string;
  name_tet: string;
  is_recurring: boolean; // Same date each year
  year: number | null; // Null if recurring
}

export interface Organization {
  id: string;
  created_at: string;
  name: string;
  tin: string | null;
  address: string | null;

  // For small employer INSS concession
  employee_count: number;
  timorese_employee_percentage: number;
  qualifies_for_inss_reduction: boolean;

  // Settings
  default_currency: 'USD';
  fiscal_year_start: number; // Month (1-12), usually 1
}

export interface TaxFiling {
  id: string;
  organization_id: string;

  period_month: number;
  period_year: number;

  total_wages: number;
  total_tax_withheld: number;

  filing_deadline: string;
  filed_at: string | null;
  payment_date: string | null;

  status: 'pending' | 'filed' | 'paid' | 'overdue';
}

export interface INSSFiling {
  id: string;
  organization_id: string;

  period_month: number;
  period_year: number;

  total_contributory_wages: number;
  total_employee_contribution: number;
  total_employer_contribution: number;

  filing_deadline: string;
  filed_at: string | null;
  payment_date: string | null;

  status: 'pending' | 'filed' | 'paid' | 'overdue';
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Employee, 'id' | 'created_at'>>;
      };
      payroll_runs: {
        Row: PayrollRun;
        Insert: Omit<PayrollRun, 'id' | 'created_at'>;
        Update: Partial<Omit<PayrollRun, 'id' | 'created_at'>>;
      };
      payroll_items: {
        Row: PayrollItem;
        Insert: Omit<PayrollItem, 'id' | 'created_at'>;
        Update: Partial<Omit<PayrollItem, 'id' | 'created_at'>>;
      };
      leave_balances: {
        Row: LeaveBalance;
        Insert: Omit<LeaveBalance, 'id'>;
        Update: Partial<Omit<LeaveBalance, 'id'>>;
      };
      public_holidays: {
        Row: PublicHoliday;
        Insert: Omit<PublicHoliday, 'id'>;
        Update: Partial<Omit<PublicHoliday, 'id'>>;
      };
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      tax_filings: {
        Row: TaxFiling;
        Insert: Omit<TaxFiling, 'id'>;
        Update: Partial<Omit<TaxFiling, 'id'>>;
      };
      inss_filings: {
        Row: INSSFiling;
        Insert: Omit<INSSFiling, 'id'>;
        Update: Partial<Omit<INSSFiling, 'id'>>;
      };
    };
  };
}
