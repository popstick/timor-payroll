'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { LanguageSwitcherCompact } from '@/components/language-switcher';

const navigationItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'employees', href: '/dashboard/employees', icon: Users },
  { key: 'payroll', href: '/dashboard/payroll', icon: DollarSign },
  { key: 'leave', href: '/dashboard/leave', icon: Calendar },
  { key: 'reports', href: '/dashboard/reports', icon: FileText },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

const SIDEBAR_COLLAPSED_KEY = 'timor-payroll-sidebar-collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F86037] rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Timor Payroll</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="p-1.5 bg-[#F86037] rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </Link>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 text-gray-500 hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#F86037]/10 text-[#F86037]'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{t(item.key)}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Language switcher */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-gray-200">
          <LanguageSwitcherCompact />
        </div>
      )}

      {/* Collapse toggle - hidden on mobile */}
      <button
        onClick={toggleCollapsed}
        className="hidden lg:flex items-center justify-center h-10 border-t border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span className="text-xs">Collapse</span>
          </>
        )}
      </button>

      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 w-full"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>{t('logout')}</span>}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F86037] rounded-lg">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Timor Payroll</span>
        </Link>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
