/**
 * Timor-Leste Payroll Calculation Engine
 *
 * Handles all payroll calculations according to TL law:
 * - Tax (WIT) with $500 exemption for residents
 * - INSS contributions (4% employee, 6% employer)
 * - Overtime pay (50% regular, 100% holiday)
 * - Night shift premium (25%)
 * - Severance calculations
 */

import {
  MINIMUM_WAGE_MONTHLY,
  TAX_EXEMPTION_MONTHLY,
  TAX_RATE,
  INSS_EMPLOYEE_RATE,
  INSS_EMPLOYER_RATE,
  INSS_EMPLOYER_RATE_SMALL_2025,
  OVERTIME_RATE_REGULAR,
  OVERTIME_RATE_HOLIDAY,
  NIGHT_SHIFT_RATE,
  SEVERANCE_SCHEDULE,
  NOTICE_PERIOD_UNDER_2_YEARS,
  NOTICE_PERIOD_OVER_2_YEARS,
  STANDARD_HOURS_PER_WEEK,
} from './constants';

export interface PayrollInput {
  baseSalary: number;
  isResident: boolean;

  // Overtime
  overtimeHoursRegular?: number;
  overtimeHoursHoliday?: number;

  // Night shift
  nightShiftHours?: number;

  // Additional earnings
  allowances?: number;
  bonuses?: number;

  // Additional deductions
  otherDeductions?: number;

  // Organization settings
  isSmallEmployer?: boolean; // Qualifies for INSS reduction
}

export interface PayrollResult {
  // Earnings breakdown
  baseSalary: number;
  overtimePayRegular: number;
  overtimePayHoliday: number;
  nightShiftPremium: number;
  allowances: number;
  bonuses: number;
  grossPay: number;

  // Tax calculation
  taxableIncome: number;
  taxWithheld: number;

  // INSS
  inssEmployee: number;
  inssEmployer: number;

  // Totals
  totalDeductions: number;
  netPay: number;

  // Employer total cost
  totalEmployerCost: number;

  // Validation
  belowMinimumWage: boolean;
}

/**
 * Calculate hourly rate from monthly salary
 * Based on 44 hours/week, ~4.33 weeks/month
 */
export function calculateHourlyRate(monthlySalary: number): number {
  const weeksPerMonth = 52 / 12;
  const hoursPerMonth = STANDARD_HOURS_PER_WEEK * weeksPerMonth;
  return monthlySalary / hoursPerMonth;
}

/**
 * Calculate Wage Income Tax (WIT)
 * Residents: 10% on amount above $500/month
 * Non-residents: 10% on total
 */
export function calculateTax(grossPay: number, isResident: boolean): number {
  if (isResident) {
    const taxableAmount = Math.max(0, grossPay - TAX_EXEMPTION_MONTHLY);
    return Math.round(taxableAmount * TAX_RATE * 100) / 100;
  } else {
    return Math.round(grossPay * TAX_RATE * 100) / 100;
  }
}

/**
 * Calculate INSS employee contribution (4%)
 * Note: Overtime is excluded from contributory base
 */
export function calculateINSSEmployee(contributoryBase: number): number {
  return Math.round(contributoryBase * INSS_EMPLOYEE_RATE * 100) / 100;
}

/**
 * Calculate INSS employer contribution (6% or 5.4% for small employers in 2025)
 */
export function calculateINSSEmployer(
  contributoryBase: number,
  isSmallEmployer: boolean = false
): number {
  const rate = isSmallEmployer ? INSS_EMPLOYER_RATE_SMALL_2025 : INSS_EMPLOYER_RATE;
  return Math.round(contributoryBase * rate * 100) / 100;
}

/**
 * Calculate overtime pay
 */
export function calculateOvertimePay(
  hourlyRate: number,
  regularHours: number = 0,
  holidayHours: number = 0
): { regular: number; holiday: number } {
  return {
    regular: Math.round(hourlyRate * OVERTIME_RATE_REGULAR * regularHours * 100) / 100,
    holiday: Math.round(hourlyRate * OVERTIME_RATE_HOLIDAY * holidayHours * 100) / 100,
  };
}

/**
 * Calculate night shift premium (25% extra)
 */
export function calculateNightShiftPremium(
  hourlyRate: number,
  nightHours: number
): number {
  const premiumRate = NIGHT_SHIFT_RATE - 1; // Just the 25% extra
  return Math.round(hourlyRate * premiumRate * nightHours * 100) / 100;
}

/**
 * Full payroll calculation
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const {
    baseSalary,
    isResident,
    overtimeHoursRegular = 0,
    overtimeHoursHoliday = 0,
    nightShiftHours = 0,
    allowances = 0,
    bonuses = 0,
    otherDeductions = 0,
    isSmallEmployer = false,
  } = input;

  // Hourly rate for overtime/night calculations
  const hourlyRate = calculateHourlyRate(baseSalary);

  // Calculate overtime
  const overtimePay = calculateOvertimePay(
    hourlyRate,
    overtimeHoursRegular,
    overtimeHoursHoliday
  );

  // Calculate night shift premium
  const nightShiftPremium = calculateNightShiftPremium(hourlyRate, nightShiftHours);

  // Gross pay
  const grossPay =
    baseSalary +
    overtimePay.regular +
    overtimePay.holiday +
    nightShiftPremium +
    allowances +
    bonuses;

  // INSS contributory base (excludes overtime)
  const inssContributoryBase = baseSalary + allowances + bonuses + nightShiftPremium;

  // Calculate deductions
  const taxWithheld = calculateTax(grossPay, isResident);
  const inssEmployee = calculateINSSEmployee(inssContributoryBase);
  const inssEmployer = calculateINSSEmployer(inssContributoryBase, isSmallEmployer);

  const totalDeductions = taxWithheld + inssEmployee + otherDeductions;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  // Total employer cost
  const totalEmployerCost = Math.round((grossPay + inssEmployer) * 100) / 100;

  return {
    baseSalary,
    overtimePayRegular: overtimePay.regular,
    overtimePayHoliday: overtimePay.holiday,
    nightShiftPremium,
    allowances,
    bonuses,
    grossPay: Math.round(grossPay * 100) / 100,

    taxableIncome: isResident
      ? Math.max(0, grossPay - TAX_EXEMPTION_MONTHLY)
      : grossPay,
    taxWithheld,

    inssEmployee,
    inssEmployer,

    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay,

    totalEmployerCost,

    belowMinimumWage: baseSalary < MINIMUM_WAGE_MONTHLY,
  };
}

/**
 * Calculate severance pay based on tenure
 */
export function calculateSeverance(
  monthlySalary: number,
  monthsOfService: number
): { days: number; amount: number } {
  if (monthsOfService < 3) {
    return { days: 0, amount: 0 };
  }

  const schedule = SEVERANCE_SCHEDULE.find(
    (s) => monthsOfService >= s.minMonths && monthsOfService < s.maxMonths
  );

  const days = schedule?.days ?? 0;
  const dailyRate = monthlySalary / 30;
  const amount = Math.round(dailyRate * days * 100) / 100;

  return { days, amount };
}

/**
 * Calculate notice period required
 */
export function calculateNoticePeriod(monthsOfService: number): number {
  const twoYearsInMonths = 24;
  return monthsOfService >= twoYearsInMonths
    ? NOTICE_PERIOD_OVER_2_YEARS
    : NOTICE_PERIOD_UNDER_2_YEARS;
}

/**
 * Calculate final pay on termination
 */
export function calculateFinalPay(input: {
  monthlySalary: number;
  monthsOfService: number;
  unusedAnnualLeaveDays: number;
  isForCause: boolean; // No severance if for cause
  noticePeriodWorked: boolean;
}): {
  proRatedSalary: number;
  unusedLeavePayment: number;
  severancePay: number;
  noticePayment: number;
  total: number;
} {
  const {
    monthlySalary,
    monthsOfService,
    unusedAnnualLeaveDays,
    isForCause,
    noticePeriodWorked
  } = input;

  const dailyRate = monthlySalary / 30;

  // Unused leave payment
  const unusedLeavePayment = Math.round(dailyRate * unusedAnnualLeaveDays * 100) / 100;

  // Severance (only if not for cause)
  const severance = isForCause
    ? { days: 0, amount: 0 }
    : calculateSeverance(monthlySalary, monthsOfService);

  // Notice period payment (if not worked)
  const noticeDays = calculateNoticePeriod(monthsOfService);
  const noticePayment = noticePeriodWorked
    ? 0
    : Math.round(dailyRate * noticeDays * 100) / 100;

  const total = unusedLeavePayment + severance.amount + noticePayment;

  return {
    proRatedSalary: 0, // Would need to calculate based on days worked in final month
    unusedLeavePayment,
    severancePay: severance.amount,
    noticePayment,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Validate salary against minimum wage
 */
export function validateMinimumWage(monthlySalary: number): {
  isValid: boolean;
  minimumWage: number;
  shortfall: number;
} {
  const isValid = monthlySalary >= MINIMUM_WAGE_MONTHLY;
  return {
    isValid,
    minimumWage: MINIMUM_WAGE_MONTHLY,
    shortfall: isValid ? 0 : MINIMUM_WAGE_MONTHLY - monthlySalary,
  };
}
