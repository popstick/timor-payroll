import { ReactNode } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Calendar,
  DollarSign,
  Search,
  FolderOpen,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type IllustrationType =
  | 'employees'
  | 'documents'
  | 'calendar'
  | 'payroll'
  | 'search'
  | 'folder'
  | 'inbox'
  | 'error'
  | 'custom';

interface EmptyStateProps {
  illustration?: IllustrationType;
  customIcon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  children?: ReactNode;
}

const illustrations: Record<Exclude<IllustrationType, 'custom'>, typeof Users> = {
  employees: Users,
  documents: FileText,
  calendar: Calendar,
  payroll: DollarSign,
  search: Search,
  folder: FolderOpen,
  inbox: Inbox,
  error: AlertCircle,
};

const illustrationColors: Record<Exclude<IllustrationType, 'custom'>, string> = {
  employees: 'bg-blue-100 text-blue-600',
  documents: 'bg-purple-100 text-purple-600',
  calendar: 'bg-green-100 text-green-600',
  payroll: 'bg-yellow-100 text-yellow-600',
  search: 'bg-gray-100 text-gray-600',
  folder: 'bg-orange-100 text-orange-600',
  inbox: 'bg-indigo-100 text-indigo-600',
  error: 'bg-red-100 text-red-600',
};

export function EmptyState({
  illustration = 'inbox',
  customIcon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const Icon = illustration !== 'custom' ? illustrations[illustration] : null;
  const colorClass = illustration !== 'custom' ? illustrationColors[illustration] : '';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in',
        className
      )}
    >
      {/* Illustration */}
      <div
        className={cn(
          'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
          colorClass
        )}
      >
        {customIcon || (Icon && <Icon className="h-8 w-8" />)}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button variant={action.variant || 'default'}>{action.label}</Button>
              </Link>
            ) : (
              <Button variant={action.variant || 'default'} onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="ghost">{secondaryAction.label}</Button>
              </Link>
            ) : (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
}

interface SearchEmptyStateProps {
  query: string;
  onClear?: () => void;
  suggestions?: string[];
  className?: string;
}

export function SearchEmptyState({
  query,
  onClear,
  suggestions,
  className,
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      illustration="search"
      title={`No results for "${query}"`}
      description="Try adjusting your search or filters to find what you're looking for."
      action={onClear ? { label: 'Clear search', onClick: onClear, variant: 'outline' } : undefined}
      className={className}
    >
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion) => (
              <span
                key={suggestion}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}
    </EmptyState>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      illustration="error"
      title={title}
      description={description}
      action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
      className={className}
    />
  );
}
