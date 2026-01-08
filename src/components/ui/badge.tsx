import { ReactNode } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MinusCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'secondary';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-purple-100 text-purple-800 border-purple-200',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const iconSizes: Record<BadgeSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon && <span className={iconSizes[size]}>{icon}</span>}
      {children}
    </span>
  );
}

// Pre-built status badges with icons
type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'draft'
  | 'paid';

interface StatusBadgeProps {
  status: StatusType;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { variant: BadgeVariant; label: string; icon: typeof CheckCircle }
> = {
  active: { variant: 'success', label: 'Active', icon: CheckCircle },
  inactive: { variant: 'default', label: 'Inactive', icon: MinusCircle },
  pending: { variant: 'warning', label: 'Pending', icon: Clock },
  approved: { variant: 'success', label: 'Approved', icon: CheckCircle },
  rejected: { variant: 'error', label: 'Rejected', icon: XCircle },
  processing: { variant: 'info', label: 'Processing', icon: Loader2 },
  completed: { variant: 'success', label: 'Completed', icon: CheckCircle },
  cancelled: { variant: 'error', label: 'Cancelled', icon: XCircle },
  draft: { variant: 'default', label: 'Draft', icon: AlertCircle },
  paid: { variant: 'success', label: 'Paid', icon: CheckCircle },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isProcessing = status === 'processing';

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={
        <Icon
          className={cn(iconSizes[size], isProcessing && 'animate-spin')}
        />
      }
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Employee status badge
type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'on_leave';

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus;
  size?: BadgeSize;
  className?: string;
}

const employeeStatusConfig: Record<
  EmployeeStatus,
  { variant: BadgeVariant; label: string; icon: typeof CheckCircle }
> = {
  active: { variant: 'success', label: 'Active', icon: CheckCircle },
  inactive: { variant: 'default', label: 'Inactive', icon: MinusCircle },
  terminated: { variant: 'error', label: 'Terminated', icon: XCircle },
  on_leave: { variant: 'warning', label: 'On Leave', icon: Clock },
};

export function EmployeeStatusBadge({
  status,
  size = 'md',
  className,
}: EmployeeStatusBadgeProps) {
  const config = employeeStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={<Icon className={iconSizes[size]} />}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Payroll status badge
type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'cancelled';

interface PayrollStatusBadgeProps {
  status: PayrollStatus;
  size?: BadgeSize;
  className?: string;
}

const payrollStatusConfig: Record<
  PayrollStatus,
  { variant: BadgeVariant; label: string; icon: typeof CheckCircle }
> = {
  draft: { variant: 'default', label: 'Draft', icon: AlertCircle },
  processing: { variant: 'info', label: 'Processing', icon: Loader2 },
  approved: { variant: 'info', label: 'Approved', icon: CheckCircle },
  paid: { variant: 'success', label: 'Paid', icon: CheckCircle },
  cancelled: { variant: 'error', label: 'Cancelled', icon: XCircle },
};

export function PayrollStatusBadge({
  status,
  size = 'md',
  className,
}: PayrollStatusBadgeProps) {
  const config = payrollStatusConfig[status];
  const Icon = config.icon;
  const isProcessing = status === 'processing';

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={
        <Icon
          className={cn(iconSizes[size], isProcessing && 'animate-spin')}
        />
      }
      className={className}
    >
      {config.label}
    </Badge>
  );
}

// Leave status badge
type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  size?: BadgeSize;
  className?: string;
}

const leaveStatusConfig: Record<
  LeaveStatus,
  { variant: BadgeVariant; label: string; icon: typeof CheckCircle }
> = {
  pending: { variant: 'warning', label: 'Pending', icon: Clock },
  approved: { variant: 'success', label: 'Approved', icon: CheckCircle },
  rejected: { variant: 'error', label: 'Rejected', icon: XCircle },
  cancelled: { variant: 'default', label: 'Cancelled', icon: MinusCircle },
};

export function LeaveStatusBadge({
  status,
  size = 'md',
  className,
}: LeaveStatusBadgeProps) {
  const config = leaveStatusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={<Icon className={iconSizes[size]} />}
      className={className}
    >
      {config.label}
    </Badge>
  );
}
