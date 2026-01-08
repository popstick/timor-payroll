'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export function Breadcrumbs({
  items,
  showHome = true,
  homeHref = '/dashboard',
  className,
}: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: homeHref }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0 && showHome;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="h-4 w-4 mx-1 text-gray-400 shrink-0"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className="font-medium text-gray-900 truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'text-gray-500 hover:text-gray-700 transition-colors',
                    'flex items-center gap-1'
                  )}
                >
                  {isFirst && <Home className="h-4 w-4" aria-hidden="true" />}
                  <span className={isFirst ? 'sr-only sm:not-sr-only' : ''}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span className="text-gray-500 flex items-center gap-1">
                  {isFirst && <Home className="h-4 w-4" aria-hidden="true" />}
                  <span className={isFirst ? 'sr-only sm:not-sr-only' : ''}>
                    {item.label}
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
