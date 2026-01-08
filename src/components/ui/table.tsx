import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  stickyHeader?: boolean;
}

export function Table({ className, stickyHeader = false, ...props }: TableProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-auto -mx-4 sm:mx-0 px-4 sm:px-0',
        stickyHeader && 'max-h-[600px]'
      )}
    >
      <table
        className={cn('w-full caption-bottom text-xs sm:text-sm', className)}
        {...props}
      />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  sticky?: boolean;
}

export function TableHeader({ className, sticky = false, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        '[&_tr]:border-b',
        sticky && 'sticky top-0 bg-white z-10 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-colors hover:bg-gray-50',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-9 sm:h-10 px-2 sm:px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 whitespace-nowrap',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-2 sm:p-4 align-middle text-gray-700 [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}
