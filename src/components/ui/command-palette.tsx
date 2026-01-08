'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  Plus,
  FileSpreadsheet,
  UserPlus,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  action: () => void;
  keywords?: string[];
  category: 'navigation' | 'actions' | 'settings';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
      keywords: ['home', 'overview'],
      category: 'navigation',
    },
    {
      id: 'nav-employees',
      label: 'Go to Employees',
      icon: Users,
      action: () => router.push('/dashboard/employees'),
      keywords: ['staff', 'workers', 'team'],
      category: 'navigation',
    },
    {
      id: 'nav-payroll',
      label: 'Go to Payroll',
      icon: DollarSign,
      action: () => router.push('/dashboard/payroll'),
      keywords: ['salary', 'wages', 'pay'],
      category: 'navigation',
    },
    {
      id: 'nav-leave',
      label: 'Go to Leave Management',
      icon: Calendar,
      action: () => router.push('/dashboard/leave'),
      keywords: ['vacation', 'holiday', 'time off'],
      category: 'navigation',
    },
    {
      id: 'nav-reports',
      label: 'Go to Reports',
      icon: FileText,
      action: () => router.push('/dashboard/reports'),
      keywords: ['analytics', 'documents'],
      category: 'navigation',
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      icon: Settings,
      action: () => router.push('/dashboard/settings'),
      keywords: ['preferences', 'config'],
      category: 'navigation',
    },
    // Actions
    {
      id: 'action-add-employee',
      label: 'Add New Employee',
      description: 'Create a new employee record',
      icon: UserPlus,
      action: () => router.push('/dashboard/employees/new'),
      keywords: ['create', 'hire', 'new staff'],
      category: 'actions',
    },
    {
      id: 'action-run-payroll',
      label: 'Run Payroll',
      description: 'Start a new payroll run',
      icon: Calculator,
      action: () => router.push('/dashboard/payroll/new'),
      keywords: ['process', 'calculate', 'pay'],
      category: 'actions',
    },
    {
      id: 'action-export-report',
      label: 'Export Report',
      description: 'Generate and download reports',
      icon: FileSpreadsheet,
      action: () => router.push('/dashboard/reports'),
      keywords: ['download', 'csv', 'excel'],
      category: 'actions',
    },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) => {
        const searchStr = `${cmd.label} ${cmd.description || ''} ${cmd.keywords?.join(' ') || ''}`.toLowerCase();
        return searchStr.includes(query.toLowerCase());
      })
    : commands;

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    actions: filteredCommands.filter((c) => c.category === 'actions'),
    settings: filteredCommands.filter((c) => c.category === 'settings'),
  };

  const flatCommands = [
    ...groupedCommands.navigation,
    ...groupedCommands.actions,
    ...groupedCommands.settings,
  ];

  const executeCommand = useCallback(
    (command: CommandItem) => {
      command.action();
      onClose();
      setQuery('');
      setSelectedIndex(0);
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            executeCommand(flatCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          setQuery('');
          setSelectedIndex(0);
          break;
      }
    },
    [isOpen, flatCommands, selectedIndex, executeCommand, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Command palette */}
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {flatCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found for "{query}"
            </div>
          ) : (
            <>
              {groupedCommands.navigation.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Navigation
                  </div>
                  {groupedCommands.navigation.map((cmd, index) => (
                    <CommandItemRow
                      key={cmd.id}
                      command={cmd}
                      isSelected={flatCommands.indexOf(cmd) === selectedIndex}
                      onSelect={() => executeCommand(cmd)}
                    />
                  ))}
                </div>
              )}

              {groupedCommands.actions.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </div>
                  {groupedCommands.actions.map((cmd) => (
                    <CommandItemRow
                      key={cmd.id}
                      command={cmd}
                      isSelected={flatCommands.indexOf(cmd) === selectedIndex}
                      onSelect={() => executeCommand(cmd)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded">Enter</kbd>
            <span>Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandItemRow({
  command,
  isSelected,
  onSelect,
}: {
  command: CommandItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = command.icon;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
        isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-700 hover:bg-gray-50'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-lg',
          isSelected ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        <Icon className={cn('h-4 w-4', isSelected ? 'text-blue-600' : 'text-gray-500')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{command.label}</div>
        {command.description && (
          <div className="text-xs text-gray-500 truncate">{command.description}</div>
        )}
      </div>
    </button>
  );
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
