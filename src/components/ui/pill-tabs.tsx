'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface PillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'underline';
  className?: string;
}

export function PillTabs({
  tabs,
  activeTab,
  onChange,
  size = 'md',
  variant = 'default',
  className,
}: PillTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update indicator position
  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabsRef.current[activeIndex];

    if (activeTabElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();

      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, tabs]);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const containerClasses = {
    default: 'bg-gray-100 p-1 rounded-full',
    ghost: 'gap-1',
    underline: 'border-b border-gray-200 gap-0',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex items-center',
        containerClasses[variant],
        className
      )}
      role="tablist"
    >
      {/* Animated background indicator */}
      {variant === 'default' && (
        <div
          className="absolute bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: '4px',
            bottom: '4px',
          }}
        />
      )}

      {variant === 'underline' && (
        <div
          className="absolute bottom-0 h-0.5 bg-[var(--primary)] transition-all duration-300 ease-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      )}

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => { tabsRef.current[index] = el; }}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative z-10 font-medium transition-colors duration-200',
            sizeClasses[size],
            variant === 'default' && 'rounded-full',
            variant === 'underline' && 'pb-3',
            activeTab === tab.id
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          )}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
        >
          <span className="flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

// Segmented control variant (like iOS)
interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIndex = options.findIndex((opt) => opt.value === value);
    const activeElement = optionsRef.current[activeIndex];

    if (activeElement && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const optRect = activeElement.getBoundingClientRect();

      setIndicatorStyle({
        left: optRect.left - containerRect.left,
        width: optRect.width,
      });
    }
  }, [value, options]);

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-flex rounded-lg bg-gray-100 p-1',
        sizeClasses[size],
        className
      )}
    >
      {/* Sliding indicator */}
      <div
        className="absolute bg-white rounded-md shadow-sm transition-all duration-200 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          top: '4px',
          bottom: '4px',
        }}
      />

      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => { optionsRef.current[index] = el; }}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative z-10 px-4 font-medium rounded-md transition-colors',
            value === option.value ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
