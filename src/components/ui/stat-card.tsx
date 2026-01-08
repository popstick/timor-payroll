'use client';

import { useEffect, useState, useRef, useId } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  sparklineData?: number[];
  animated?: boolean;
  href?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel,
  trend,
  icon,
  sparklineData,
  animated = true,
  href,
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number>(() => {
    if (typeof value !== 'number') return 0;
    return animated ? 0 : value;
  });
  const displayValueRef = useRef(displayValue);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  // Intersection observer for triggering animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter
  useEffect(() => {
    if (!animated || !isVisible || typeof value !== 'number') return;

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const start = displayValueRef.current;
    const increment = (value - start) / steps;
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        displayValueRef.current = value;
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        const nextValue = Math.floor(current);
        displayValueRef.current = nextValue;
        setDisplayValue(nextValue);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animated, isVisible]);

  const trendIcon = {
    up: <TrendingUp className="h-3 w-3" />,
    down: <TrendingDown className="h-3 w-3" />,
    neutral: <Minus className="h-3 w-3" />,
  };

  const trendColor = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div ref={cardRef}>
      {href ? (
        <Link
          href={href}
          aria-label={title}
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div
            className={cn(
              'rounded-lg border border-gray-200 bg-white p-5 shadow-sm',
              'transition-shadow duration-200 hover:shadow-md',
              className
            )}
          >
            <StatCardContent
              title={title}
              displayValue={typeof value === 'number' && animated ? displayValue : value}
              prefix={prefix}
              suffix={suffix}
              change={change}
              changeLabel={changeLabel}
              trend={trend}
              icon={icon}
              sparklineData={sparklineData}
              trendColor={trendColor}
              trendIcon={trendIcon}
            />
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            'rounded-lg border border-gray-200 bg-white p-5 shadow-sm',
            'transition-shadow duration-200 hover:shadow-md',
            className
          )}
        >
          <StatCardContent
            title={title}
            displayValue={typeof value === 'number' && animated ? displayValue : value}
            prefix={prefix}
            suffix={suffix}
            change={change}
            changeLabel={changeLabel}
            trend={trend}
            icon={icon}
            sparklineData={sparklineData}
            trendColor={trendColor}
            trendIcon={trendIcon}
          />
        </div>
      )}
    </div>
  );
}

function StatCardContent({
  title,
  displayValue,
  prefix,
  suffix,
  change,
  changeLabel,
  trend,
  icon,
  sparklineData,
  trendColor,
  trendIcon,
}: {
  title: string;
  displayValue: number | string;
  prefix: string;
  suffix: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  sparklineData?: number[];
  trendColor: Record<'up' | 'down' | 'neutral', string>;
  trendIcon: Record<'up' | 'down' | 'neutral', React.ReactNode>;
}) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        {prefix && <span className="text-lg text-gray-500">{prefix}</span>}
        <span className="text-3xl font-bold text-gray-900 tabular-nums">
          {typeof displayValue === 'number'
            ? displayValue.toLocaleString()
            : displayValue}
        </span>
        {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
      </div>

      {/* Trend indicator */}
      {(change !== undefined || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                trendColor[trend]
              )}
            >
              {trendIcon[trend]}
              {change !== undefined && (
                <span>{change > 0 ? '+' : ''}{change}%</span>
              )}
            </span>
          )}
          {changeLabel && (
            <span className="text-xs text-gray-500">{changeLabel}</span>
          )}
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4">
          <Sparkline data={sparklineData} trend={trend} />
        </div>
      )}
    </div>
  );
}

interface SparklineProps {
  data: number[];
  trend?: 'up' | 'down' | 'neutral';
  height?: number;
}

function Sparkline({ data, trend = 'neutral', height = 40 }: SparklineProps) {
  const id = useId();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const gradientId = `sparkline-gradient-${id}`;

  const colors = {
    up: { stroke: '#10b981', fill: '#10b981' },
    down: { stroke: '#ef4444', fill: '#ef4444' },
    neutral: { stroke: '#F86037', fill: '#F86037' },
  };

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[trend].fill} stopOpacity="0.2" />
          <stop offset="100%" stopColor={colors[trend].fill} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={colors[trend].stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* End dot */}
      <circle
        cx="100"
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={colors[trend].stroke}
      />
    </svg>
  );
}

// Mini stat for compact displays
interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MiniStat({ label, value, trend, className }: MiniStatProps) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn('text-lg font-semibold', trend && trendColors[trend])}>
          {value}
        </p>
      </div>
      {trend && (
        <div className={trendColors[trend]}>
          {trend === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4" />}
          {trend === 'neutral' && <Minus className="h-4 w-4" />}
        </div>
      )}
    </div>
  );
}
