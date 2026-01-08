'use client';

import { forwardRef } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrintablePayslipProps {
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
  className?: string;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB');
}

export const PrintablePayslip = forwardRef<HTMLDivElement, PrintablePayslipProps>(
  ({ employee, payrollItem, organization, payPeriod, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'payslip-container bg-white p-8 max-w-2xl mx-auto',
          'print:shadow-none print:max-w-none',
          className
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-800">{organization.name}</h1>
            {organization.address && (
              <p className="text-sm text-gray-500 mt-1">{organization.address}</p>
            )}
            {organization.tin && (
              <p className="text-sm text-gray-500">TIN: {organization.tin}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold">PAYSLIP</h2>
            <p className="text-sm text-gray-500 mt-1">
              Pay Period: {formatDate(payPeriod.start)} - {formatDate(payPeriod.end)}
            </p>
            <p className="text-sm text-gray-500">
              Pay Date: {formatDate(payPeriod.payDate)}
            </p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="mb-6">
          <h3 className="text-sm font-bold bg-gray-100 px-3 py-2 mb-3">
            Employee Details
          </h3>
          <div className="grid grid-cols-2 gap-4 px-3">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold">
                {employee.first_name} {employee.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Position</p>
              <p className="font-semibold">{employee.position}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employee No</p>
              <p className="font-semibold">{employee.employee_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="font-semibold">{employee.department || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Tax ID (TIN)</p>
              <p className="font-semibold">{employee.tin || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">INSS Number</p>
              <p className="font-semibold">{employee.inss_number || '-'}</p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="mb-6">
          <h3 className="text-sm font-bold bg-gray-100 px-3 py-2 mb-3">Earnings</h3>
          <div className="space-y-1">
            <div className="flex justify-between px-3 py-1">
              <span className="text-gray-600">Base Salary</span>
              <span className="font-medium">{formatCurrency(payrollItem.base_salary)}</span>
            </div>
            {(payrollItem.overtime_pay || 0) > 0 && (
              <div className="flex justify-between px-3 py-1 bg-gray-50">
                <span className="text-gray-600">Overtime Pay</span>
                <span className="font-medium">
                  {formatCurrency(payrollItem.overtime_pay || 0)}
                </span>
              </div>
            )}
            {(payrollItem.night_shift_premium || 0) > 0 && (
              <div className="flex justify-between px-3 py-1">
                <span className="text-gray-600">Night Shift Premium</span>
                <span className="font-medium">
                  {formatCurrency(payrollItem.night_shift_premium || 0)}
                </span>
              </div>
            )}
            {(payrollItem.allowances || 0) > 0 && (
              <div className="flex justify-between px-3 py-1 bg-gray-50">
                <span className="text-gray-600">Allowances</span>
                <span className="font-medium">
                  {formatCurrency(payrollItem.allowances || 0)}
                </span>
              </div>
            )}
            {(payrollItem.bonuses || 0) > 0 && (
              <div className="flex justify-between px-3 py-1">
                <span className="text-gray-600">Bonuses</span>
                <span className="font-medium">
                  {formatCurrency(payrollItem.bonuses || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between px-3 py-2 bg-gray-100 border-t border-gray-200 mt-2 font-bold">
              <span>Gross Pay</span>
              <span>{formatCurrency(payrollItem.gross_pay)}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="mb-6">
          <h3 className="text-sm font-bold bg-gray-100 px-3 py-2 mb-3">Deductions</h3>
          <div className="space-y-1">
            <div className="flex justify-between px-3 py-1">
              <span className="text-gray-600">Wage Income Tax (WIT)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(payrollItem.tax_withheld || 0)}
              </span>
            </div>
            <div className="flex justify-between px-3 py-1 bg-gray-50">
              <span className="text-gray-600">INSS Contribution (4%)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(payrollItem.inss_employee || 0)}
              </span>
            </div>
            <div className="flex justify-between px-3 py-2 bg-gray-100 border-t border-gray-200 mt-2 font-bold">
              <span>Total Deductions</span>
              <span className="text-red-600">
                -{formatCurrency(payrollItem.total_deductions || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-sm opacity-90">NET PAY</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(payrollItem.net_pay)}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>This is a computer-generated document.</p>
          <p>Tax calculated as per Timor-Leste regulations (10% above $500 for residents).</p>
          <p>INSS contributions as per Law No. 12/2016.</p>
        </div>
      </div>
    );
  }
);

PrintablePayslip.displayName = 'PrintablePayslip';

interface PrintPayslipButtonProps {
  onClick: () => void;
  className?: string;
}

export function PrintPayslipButton({ onClick, className }: PrintPayslipButtonProps) {
  const handlePrint = () => {
    onClick();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Button
      variant="outline"
      onClick={handlePrint}
      className={cn('no-print', className)}
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Payslip
    </Button>
  );
}
