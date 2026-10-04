import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'black';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black border-2 border-black dark:border-white rounded-base transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
    md: 'text-sm md:text-base px-5 py-2.5 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
    lg: 'text-base md:text-lg px-8 py-3.5 shadow-neo md:shadow-neo-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
  };

  const variantStyles = {
    primary: 'bg-main text-black dark:text-white hover:bg-main-hover',
    secondary: 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-neutral-50',
    success: 'bg-success-mint text-black dark:text-white hover:bg-[#a2e66c]',
    danger: 'bg-alert-red text-white dark:text-black hover:bg-red-600',
    black: 'bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
