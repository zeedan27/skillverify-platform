import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stacked-green' | 'stacked-yellow' | 'stacked-red' | 'stacked-blue' | 'stacked-purple';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderWidth?: '2' | '4';
  shadowSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NeoCard: React.FC<NeoCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderWidth = '2',
  shadowSize = 'md',
  className,
  ...props
}) => {
  const isStacked = variant.startsWith('stacked-');

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6 md:p-8',
    lg: 'p-6 sm:p-8 md:p-10',
  };

  const borderStyles = borderWidth === '4' ? 'border-4 border-black dark:border-white' : 'border-2 border-black dark:border-white';

  const shadowStyles = {
    sm: 'shadow-neo-sm',
    md: 'shadow-neo',
    lg: 'shadow-neo-lg',
    xl: 'shadow-neo-xl',
  };

  const stackedBgMap: Record<string, string> = {
    'stacked-green': 'bg-green-200',
    'stacked-yellow': 'bg-yellow-200',
    'stacked-red': 'bg-red-200',
    'stacked-blue': 'bg-blue-200',
    'stacked-purple': 'bg-purple-200',
  };

  if (isStacked) {
    const bgClass = stackedBgMap[variant] || 'bg-yellow-200';
    return (
      <div className={twMerge('relative group', className)}>
        {/* Physical Offset Colored Backing Card */}
        <div
          className={clsx(
            'absolute inset-0 rounded-base border-2 border-black dark:border-white translate-x-2 translate-y-2 -z-10',
            bgClass
          )}
        />
        {/* Main Foreground Card */}
        <div
          className={clsx(
            'relative bg-white dark:bg-zinc-900 rounded-base text-black dark:text-white',
            borderStyles,
            paddingStyles[padding]
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx(
          'bg-white dark:bg-zinc-900 rounded-base text-black dark:text-white transition-all',
          borderStyles,
          shadowStyles[shadowSize],
          paddingStyles[padding],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
