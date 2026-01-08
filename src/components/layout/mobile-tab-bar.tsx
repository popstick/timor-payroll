'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'employees', href: '/dashboard/employees', icon: Users },
  { key: 'payroll', href: '/dashboard/payroll', icon: DollarSign },
  { key: 'leave', href: '/dashboard/leave', icon: Calendar },
];

interface MobileTabBarProps {
  className?: string;
}

export function MobileTabBar({ className }: MobileTabBarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Check if we're on a more page (reports, settings)
  const isOnMorePage =
    pathname.startsWith('/dashboard/reports') ||
    pathname.startsWith('/dashboard/settings');

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom',
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive ? 'text-[#F86037]' : 'text-gray-500 hover:text-gray-700'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'scale-110 transition-transform')}
              />
              <span className="text-[10px] font-medium">{t(item.key)}</span>
            </Link>
          );
        })}

        {/* More menu for Reports & Settings */}
        <Link
          href="/dashboard/reports"
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
            isOnMorePage ? 'text-[#F86037]' : 'text-gray-500 hover:text-gray-700'
          )}
          aria-current={isOnMorePage ? 'page' : undefined}
        >
          <MoreHorizontal
            className={cn('h-5 w-5', isOnMorePage && 'scale-110 transition-transform')}
          />
          <span className="text-[10px] font-medium">{t('more')}</span>
        </Link>
      </div>
    </nav>
  );
}
