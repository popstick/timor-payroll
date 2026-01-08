/**
 * Timor-Leste Payroll Constants
 * Based on Labour Code Law No. 4/2012 and Tax/INSS regulations
 */

// ==================== MINIMUM WAGE ====================
export const MINIMUM_WAGE_MONTHLY = 115; // USD, unchanged since 2012

// ==================== WORKING HOURS ====================
export const STANDARD_HOURS_PER_DAY = 8;
export const STANDARD_HOURS_PER_WEEK = 44;
export const MAX_OVERTIME_PER_DAY = 4;
export const MAX_OVERTIME_PER_WEEK = 16;

// ==================== PAY RATES ====================
export const OVERTIME_RATE_REGULAR = 1.5; // +50% for regular overtime
export const OVERTIME_RATE_HOLIDAY = 2.0; // +100% for holiday/rest day work
export const NIGHT_SHIFT_RATE = 1.25; // +25% for night work (9pm-6am)

// ==================== TAX (WIT) ====================
export const TAX_EXEMPTION_MONTHLY = 500; // USD - first $500 tax-free for residents
export const TAX_RATE = 0.10; // 10% flat rate on taxable portion

// ==================== SOCIAL SECURITY (INSS) ====================
export const INSS_EMPLOYEE_RATE = 0.04; // 4% employee contribution
export const INSS_EMPLOYER_RATE = 0.06; // 6% employer contribution
export const INSS_TOTAL_RATE = 0.10; // 10% total

// Small employer concession (<=10 employees, 60%+ Timorese)
export const INSS_SMALL_EMPLOYER_REDUCTION_2025 = 0.10; // 10% reduction in 2025
export const INSS_EMPLOYER_RATE_SMALL_2025 = INSS_EMPLOYER_RATE * (1 - INSS_SMALL_EMPLOYER_REDUCTION_2025); // 5.4%

// ==================== LEAVE ENTITLEMENTS ====================
export const ANNUAL_LEAVE_DAYS = 12;
export const SICK_LEAVE_FULL_PAY_DAYS = 6;
export const SICK_LEAVE_HALF_PAY_DAYS = 6;
export const SICK_LEAVE_TOTAL_DAYS = SICK_LEAVE_FULL_PAY_DAYS + SICK_LEAVE_HALF_PAY_DAYS;
export const MATERNITY_LEAVE_WEEKS = 12;
export const PATERNITY_LEAVE_DAYS = 5;
export const PERSONAL_LEAVE_DAYS = 3;

// ==================== SEVERANCE ====================
export const SEVERANCE_SCHEDULE = [
  { minMonths: 3, maxMonths: 12, days: 30 },
  { minMonths: 12, maxMonths: 24, days: 60 },
  { minMonths: 24, maxMonths: 36, days: 90 },
  { minMonths: 36, maxMonths: Infinity, days: 120 },
] as const;

// ==================== NOTICE PERIODS ====================
export const NOTICE_PERIOD_UNDER_2_YEARS = 15; // days
export const NOTICE_PERIOD_OVER_2_YEARS = 30; // days

// ==================== FILING DEADLINES ====================
export const MONTHLY_FILING_DEADLINE_DAY = 15; // 15th of following month
export const ANNUAL_FILING_DEADLINE_MONTH = 3; // March
export const ANNUAL_FILING_DEADLINE_DAY = 31; // March 31

// ==================== PROBATION PERIODS ====================
export const PROBATION_STANDARD_MONTHS = 1;
export const PROBATION_SKILLED_MONTHS = 3;

// ==================== PUBLIC HOLIDAYS 2025 ====================
// Note: Islamic holidays vary by lunar calendar
export const PUBLIC_HOLIDAYS_2025 = [
  { date: '2025-01-01', name_en: "New Year's Day", name_pt: 'Ano Novo', name_tet: 'Tinan Foun' },
  { date: '2025-03-31', name_en: 'Eid al-Fitr', name_pt: 'Eid al-Fitr', name_tet: 'Eid al-Fitr' }, // Approximate
  { date: '2025-04-18', name_en: 'Good Friday', name_pt: 'Sexta-feira Santa', name_tet: 'Sesta-feira Santa' },
  { date: '2025-05-01', name_en: 'Labour Day', name_pt: 'Dia do Trabalhador', name_tet: 'Loron Trabalhador' },
  { date: '2025-05-20', name_en: 'Independence Day', name_pt: 'Dia da Independência', name_tet: 'Loron Independénsia' },
  { date: '2025-05-29', name_en: 'Corpus Christi', name_pt: 'Corpo de Deus', name_tet: 'Korpu Kristu' },
  { date: '2025-06-07', name_en: 'Eid al-Adha', name_pt: 'Eid al-Adha', name_tet: 'Eid al-Adha' }, // Approximate
  { date: '2025-08-30', name_en: 'Popular Consultation Day', name_pt: 'Dia da Consulta Popular', name_tet: 'Loron Konsulta Popular' },
  { date: '2025-09-20', name_en: 'Liberation Day', name_pt: 'Dia da Libertação', name_tet: 'Loron Libertasaun' },
  { date: '2025-11-01', name_en: "All Saints' Day", name_pt: 'Dia de Todos os Santos', name_tet: 'Loron Santu Sira' },
  { date: '2025-11-02', name_en: "All Souls' Day", name_pt: 'Dia dos Fiéis Defuntos', name_tet: 'Loron Mate Sira' },
  { date: '2025-11-12', name_en: 'Santa Cruz Day', name_pt: 'Dia de Santa Cruz', name_tet: 'Loron Santa Cruz' },
  { date: '2025-11-28', name_en: 'Independence Proclamation Day', name_pt: 'Dia da Proclamação', name_tet: 'Loron Proklamasaun' },
  { date: '2025-12-07', name_en: 'National Heroes Day', name_pt: 'Dia dos Heróis Nacionais', name_tet: 'Loron Eroi Nasionál' },
  { date: '2025-12-08', name_en: 'Immaculate Conception', name_pt: 'Imaculada Conceição', name_tet: 'Imakulada Konseisaun' },
  { date: '2025-12-25', name_en: 'Christmas Day', name_pt: 'Natal', name_tet: 'Natál' },
] as const;
