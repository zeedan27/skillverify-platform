import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'yellow' | 'green' | 'red' | 'amber' | 'blue' | 'purple' | 'black' | 'white';
  slanted?: '-rotate-2' | '-rotate-1' | 'rotate-1' | 'rotate-2' | 'none';
  pulsingDot?: boolean;
  dotColor?: string;
  size?: 'sm' | 'md';
}

export const NeoBadge: React.FC<NeoBadgeProps> = ({
  children,
  variant = 'yellow',
  slanted = 'none',
  pulsingDot = false,
  dotColor = 'bg-red-500',
  size = 'md',
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-2 border-2 border-black dark:border-white font-black uppercase tracking-wide select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-sm shadow-neo-sm',
    md: 'text-xs sm:text-sm px-3.5 py-1 rounded-base shadow-neo-sm',
  };

  const variantStyles = {
    yellow: 'bg-main text-black dark:text-white',
    green: 'bg-success-mint text-black dark:text-white',
    red: 'bg-alert-red text-white dark:text-black',
    amber: 'bg-amber-300 text-black dark:text-white',
    blue: 'bg-blue-300 text-black dark:text-white',
    purple: 'bg-purple-300 text-black dark:text-white',
    black: 'bg-black dark:bg-white text-white dark:text-black shadow-[3px_3px_0px_0px_#FFDC58]',
    white: 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-neo-sm',
  };

  const slantStyles = slanted !== 'none' ? `transform ${slanted}` : '';

  return (
    <span
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          slantStyles,
          className
        )
      )}
      {...props}
    >
      {pulsingDot && (
        <span className={clsx('w-2 h-2 rounded-full animate-pulse shrink-0', dotColor)} />
      )}
      {children}
    </span>
  );
};
