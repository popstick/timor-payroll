/**
 * Deadline management utilities for Timor-Leste payroll compliance
 */

import { MONTHLY_FILING_DEADLINE_DAY } from './payroll/constants';

export interface Deadline {
  id: string;
  type: 'wit' | 'inss' | 'annual_tax' | 'employee_declarations';
  name: string;
  description: string;
  dueDate: Date;
  daysUntilDue: number;
  urgency: 'overdue' | 'urgent' | 'warning' | 'normal';
  period?: string;
}

/**
 * Calculate the next filing deadline for a given type
 */
export function getNextFilingDeadline(type: 'wit' | 'inss', referenceDate: Date = new Date()): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();

  // Filing deadline is the 15th of the following month
  let deadlineMonth = month;
  let deadlineYear = year;

  // If we're past the 15th, the next deadline is next month's 15th (for the current month's filing)
  // If we're before or on the 15th, the deadline is this month's 15th (for last month's filing)
  if (day > MONTHLY_FILING_DEADLINE_DAY) {
    deadlineMonth = month + 1;
    if (deadlineMonth > 11) {
      deadlineMonth = 0;
      deadlineYear++;
    }
  }

  return new Date(deadlineYear, deadlineMonth, MONTHLY_FILING_DEADLINE_DAY);
}

/**
 * Get the period that a deadline refers to (the previous month)
 */
export function getFilingPeriod(deadline: Date): string {
  const periodDate = new Date(deadline);
  periodDate.setMonth(periodDate.getMonth() - 1);
  return periodDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Calculate days until a deadline
 */
export function getDaysUntilDeadline(deadline: Date, referenceDate: Date = new Date()): number {
  const diffTime = deadline.getTime() - referenceDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine urgency level based on days until deadline
 */
export function getUrgencyLevel(daysUntil: number): 'overdue' | 'urgent' | 'warning' | 'normal' {
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 3) return 'urgent';
  if (daysUntil <= 7) return 'warning';
  return 'normal';
}

/**
 * Get all upcoming deadlines
 */
export function getUpcomingDeadlines(referenceDate: Date = new Date()): Deadline[] {
  const deadlines: Deadline[] = [];

  // WIT Filing Deadline
  const witDeadline = getNextFilingDeadline('wit', referenceDate);
  const witDays = getDaysUntilDeadline(witDeadline, referenceDate);
  deadlines.push({
    id: 'wit-monthly',
    type: 'wit',
    name: 'WIT Monthly Filing',
    description: 'Withholding Income Tax return',
    dueDate: witDeadline,
    daysUntilDue: witDays,
    urgency: getUrgencyLevel(witDays),
    period: getFilingPeriod(witDeadline),
  });

  // INSS Filing Deadline (same as WIT - 15th of following month)
  const inssDeadline = getNextFilingDeadline('inss', referenceDate);
  const inssDays = getDaysUntilDeadline(inssDeadline, referenceDate);
  deadlines.push({
    id: 'inss-monthly',
    type: 'inss',
    name: 'INSS Monthly Filing',
    description: 'Social security contributions',
    dueDate: inssDeadline,
    daysUntilDue: inssDays,
    urgency: getUrgencyLevel(inssDays),
    period: getFilingPeriod(inssDeadline),
  });

  // Annual Tax Return (March 31)
  const currentYear = referenceDate.getFullYear();
  let annualTaxDate = new Date(currentYear, 2, 31); // March 31
  if (annualTaxDate < referenceDate) {
    annualTaxDate = new Date(currentYear + 1, 2, 31);
  }
  const annualDays = getDaysUntilDeadline(annualTaxDate, referenceDate);
  if (annualDays <= 90) {
    deadlines.push({
      id: 'annual-tax',
      type: 'annual_tax',
      name: 'Annual Tax Return',
      description: 'Company income tax filing',
      dueDate: annualTaxDate,
      daysUntilDue: annualDays,
      urgency: getUrgencyLevel(annualDays),
    });
  }

  // Employee Declarations (January 31)
  let empDecDate = new Date(currentYear, 0, 31); // January 31
  if (empDecDate < referenceDate) {
    empDecDate = new Date(currentYear + 1, 0, 31);
  }
  const empDecDays = getDaysUntilDeadline(empDecDate, referenceDate);
  if (empDecDays <= 90) {
    deadlines.push({
      id: 'employee-declarations',
      type: 'employee_declarations',
      name: 'Employee Declarations',
      description: 'Annual salary statements',
      dueDate: empDecDate,
      daysUntilDue: empDecDays,
      urgency: getUrgencyLevel(empDecDays),
    });
  }

  // Sort by days until due
  return deadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Format days until deadline as human-readable text
 */
export function formatDaysUntil(days: number): string {
  if (days < 0) {
    const overdueDays = Math.abs(days);
    return overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`;
  }
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days`;
}
