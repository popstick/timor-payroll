import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  if (name) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-medium text-white',
          sizeClasses[size],
          getBackgroundColor(name),
          className
        )}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gray-200 text-gray-500',
        sizeClasses[size],
        className
      )}
      aria-label="User avatar"
    >
      <User className={iconSizes[size]} />
    </div>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ children, max = 4, size = 'md', className }: AvatarGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlapClasses = {
    xs: '-ml-2',
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className={cn(
            'ring-2 ring-white rounded-full',
            index > 0 && overlapClasses[size]
          )}
        >
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium ring-2 ring-white',
            sizeClasses[size],
            overlapClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
