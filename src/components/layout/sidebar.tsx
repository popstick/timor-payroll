'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/dashboard/employees', icon: Users },
  { name: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
  { name: 'Leave', href: '/dashboard/leave', icon: Calendar },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-500" />
            <span className="font-bold text-lg">Timor Payroll</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <DollarSign className="h-8 w-8 text-blue-500" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <>
            <ChevronLeft className="h-5 w-5 mr-2" />
            <span className="text-sm">Collapse</span>
          </>
        )}
      </button>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 text-sm text-gray-300 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
