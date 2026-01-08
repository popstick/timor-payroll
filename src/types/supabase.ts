export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          address: string | null
          base_salary: number
          created_at: string
          currency: string
          date_of_birth: string | null
          department: string | null
          email: string | null
          employee_number: string
          employment_type: string | null
          end_date: string | null
          first_name: string
          gender: string | null
          id: string
          inss_number: string | null
          is_resident: boolean | null
          last_name: string
          nationality: string | null
          organization_id: string
          phone: string | null
          position: string
          start_date: string
          status: string | null
          tin: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          base_salary: number
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_number: string
          employment_type?: string | null
          end_date?: string | null
          first_name: string
          gender?: string | null
          id?: string
          inss_number?: string | null
          is_resident?: boolean | null
          last_name: string
          nationality?: string | null
          organization_id: string
          phone?: string | null
          position: string
          start_date: string
          status?: string | null
          tin?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          base_salary?: number
          created_at?: string
          currency?: string
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employee_number?: string
          employment_type?: string | null
          end_date?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          inss_number?: string | null
          is_resident?: boolean | null
          last_name?: string
          nationality?: string | null
          organization_id?: string
          phone?: string | null
          position?: string
          start_date?: string
          status?: string | null
          tin?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inss_filings: {
        Row: {
          filed_at: string | null
          filing_deadline: string
          id: string
          organization_id: string
          payment_date: string | null
          period_month: number
          period_year: number
          status: string | null
          total_contributory_wages: number | null
          total_employee_contribution: number | null
          total_employer_contribution: number | null
        }
        Insert: {
          filed_at?: string | null
          filing_deadline: string
          id?: string
          organization_id: string
          payment_date?: string | null
          period_month: number
          period_year: number
          status?: string | null
          total_contributory_wages?: number | null
          total_employee_contribution?: number | null
          total_employer_contribution?: number | null
        }
        Update: {
          filed_at?: string | null
          filing_deadline?: string
          id?: string
          organization_id?: string
          payment_date?: string | null
          period_month?: number
          period_year?: number
          status?: string | null
          total_contributory_wages?: number | null
          total_employee_contribution?: number | null
          total_employer_contribution?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inss_filings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          annual_leave_entitled: number | null
          annual_leave_remaining: number | null
          annual_leave_taken: number | null
          employee_id: string
          id: string
          maternity_leave_taken: number | null
          paternity_leave_taken: number | null
          personal_leave_entitled: number | null
          personal_leave_taken: number | null
          sick_leave_entitled: number | null
          sick_leave_taken: number | null
          year: number
        }
        Insert: {
          annual_leave_entitled?: number | null
          annual_leave_remaining?: number | null
          annual_leave_taken?: number | null
          employee_id: string
          id?: string
          maternity_leave_taken?: number | null
          paternity_leave_taken?: number | null
          personal_leave_entitled?: number | null
          personal_leave_taken?: number | null
          sick_leave_entitled?: number | null
          sick_leave_taken?: number | null
          year: number
        }
        Update: {
          annual_leave_entitled?: number | null
          annual_leave_remaining?: number | null
          annual_leave_taken?: number | null
          employee_id?: string
          id?: string
          maternity_leave_taken?: number | null
          paternity_leave_taken?: number | null
          personal_leave_entitled?: number | null
          personal_leave_taken?: number | null
          sick_leave_entitled?: number | null
          sick_leave_taken?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          default_currency: string
          employee_count: number | null
          fiscal_year_start: number
          id: string
          name: string
          qualifies_for_inss_reduction: boolean | null
          timorese_employee_percentage: number | null
          tin: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          default_currency?: string
          employee_count?: number | null
          fiscal_year_start?: number
          id?: string
          name: string
          qualifies_for_inss_reduction?: boolean | null
          timorese_employee_percentage?: number | null
          tin?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          default_currency?: string
          employee_count?: number | null
          fiscal_year_start?: number
          id?: string
          name?: string
          qualifies_for_inss_reduction?: boolean | null
          timorese_employee_percentage?: number | null
          tin?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          allowances: number | null
          annual_leave_days: number | null
          base_salary: number
          bonuses: number | null
          created_at: string
          employee_id: string
          gross_pay: number
          id: string
          inss_employee: number | null
          inss_employer: number | null
          net_pay: number
          night_shift_hours: number | null
          night_shift_premium: number | null
          other_deductions: number | null
          other_leave_days: number | null
          overtime_hours: number | null
          overtime_pay: number | null
          overtime_rate: number | null
          payroll_run_id: string
          sick_leave_days: number | null
          tax_withheld: number | null
          total_deductions: number | null
        }
        Insert: {
          allowances?: number | null
          annual_leave_days?: number | null
          base_salary: number
          bonuses?: number | null
          created_at?: string
          employee_id: string
          gross_pay: number
          id?: string
          inss_employee?: number | null
          inss_employer?: number | null
          net_pay: number
          night_shift_hours?: number | null
          night_shift_premium?: number | null
          other_deductions?: number | null
          other_leave_days?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          payroll_run_id: string
          sick_leave_days?: number | null
          tax_withheld?: number | null
          total_deductions?: number | null
        }
        Update: {
          allowances?: number | null
          annual_leave_days?: number | null
          base_salary?: number
          bonuses?: number | null
          created_at?: string
          employee_id?: string
          gross_pay?: number
          id?: string
          inss_employee?: number | null
          inss_employer?: number | null
          net_pay?: number
          night_shift_hours?: number | null
          night_shift_premium?: number | null
          other_deductions?: number | null
          other_leave_days?: number | null
          overtime_hours?: number | null
          overtime_pay?: number | null
          overtime_rate?: number | null
          payroll_run_id?: string
          sick_leave_days?: number | null
          tax_withheld?: number | null
          total_deductions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_count: number | null
          id: string
          organization_id: string
          pay_date: string
          period_end: string
          period_start: string
          status: string | null
          total_gross: number | null
          total_inss_employee: number | null
          total_inss_employer: number | null
          total_net: number | null
          total_tax: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_count?: number | null
          id?: string
          organization_id: string
          pay_date: string
          period_end: string
          period_start: string
          status?: string | null
          total_gross?: number | null
          total_inss_employee?: number | null
          total_inss_employer?: number | null
          total_net?: number | null
          total_tax?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_count?: number | null
          id?: string
          organization_id?: string
          pay_date?: string
          period_end?: string
          period_start?: string
          status?: string | null
          total_gross?: number | null
          total_inss_employee?: number | null
          total_inss_employer?: number | null
          total_net?: number | null
          total_tax?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          date: string
          id: string
          is_recurring: boolean | null
          name_en: string
          name_pt: string
          name_tet: string
          year: number | null
        }
        Insert: {
          date: string
          id?: string
          is_recurring?: boolean | null
          name_en: string
          name_pt: string
          name_tet: string
          year?: number | null
        }
        Update: {
          date?: string
          id?: string
          is_recurring?: boolean | null
          name_en?: string
          name_pt?: string
          name_tet?: string
          year?: number | null
        }
        Relationships: []
      }
      tax_filings: {
        Row: {
          filed_at: string | null
          filing_deadline: string
          id: string
          organization_id: string
          payment_date: string | null
          period_month: number
          period_year: number
          status: string | null
          total_tax_withheld: number | null
          total_wages: number | null
        }
        Insert: {
          filed_at?: string | null
          filing_deadline: string
          id?: string
          organization_id: string
          payment_date?: string | null
          period_month: number
          period_year: number
          status?: string | null
          total_tax_withheld?: number | null
          total_wages?: number | null
        }
        Update: {
          filed_at?: string | null
          filing_deadline?: string
          id?: string
          organization_id?: string
          payment_date?: string | null
          period_month?: number
          period_year?: number
          status?: string | null
          total_tax_withheld?: number | null
          total_wages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_filings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Employee = Tables<'employees'>
export type Organization = Tables<'organizations'>
export type PayrollRun = Tables<'payroll_runs'>
export type PayrollItem = Tables<'payroll_items'>
export type LeaveBalance = Tables<'leave_balances'>
export type PublicHoliday = Tables<'public_holidays'>
export type TaxFiling = Tables<'tax_filings'>
export type INSSFiling = Tables<'inss_filings'>
