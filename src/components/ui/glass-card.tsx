'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'gradient';
  blur?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  glow?: boolean;
}

export function GlassCard({
  className,
  variant = 'default',
  blur = 'md',
  hoverable = false,
  glow = false,
  children,
  ...props
}: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-xl',
  };

  const variantClasses = {
    default: 'bg-white/70 border-white/20',
    dark: 'bg-gray-900/70 border-white/10',
    gradient: 'bg-gradient-to-br from-white/80 to-white/40 border-white/30',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-lg',
        blurClasses[blur],
        variantClasses[variant],
        hoverable && 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        glow && 'glow-primary-hover',
        className
      )}
      style={{
        WebkitBackdropFilter: blur === 'sm' ? 'blur(4px)' : blur === 'lg' ? 'blur(24px)' : 'blur(12px)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Feature card with icon and gradient accent
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  color?: 'primary' | 'cyan' | 'pink' | 'green' | 'orange';
  onClick?: () => void;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  color = 'primary',
  onClick,
  className,
}: FeatureCardProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-[#F86037]/10',
      text: 'text-[#F86037]',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
    },
    orange: {
      bg: 'bg-[#F86037]/10',
      text: 'text-[#F86037]',
    },
  };

  const colors = colorClasses[color];

  const content = (
    <>
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg mb-3',
          colors.bg,
          colors.text
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </>
  );

  const cardClasses = cn(
    'group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm',
    'transition-shadow duration-200 hover:shadow-md',
    (href || onClick) && 'cursor-pointer',
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClasses}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={cardClasses}>
      {content}
    </div>
  );
}

// Bento grid card - for dashboard layouts
interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2;
  rowSpan?: 1 | 2;
}

export function BentoCard({
  span = 1,
  rowSpan = 1,
  className,
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-6 overflow-hidden',
        'transition-all duration-300 hover:shadow-md hover:border-gray-300',
        span === 2 && 'md:col-span-2',
        rowSpan === 2 && 'md:row-span-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Bento grid container
export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}
