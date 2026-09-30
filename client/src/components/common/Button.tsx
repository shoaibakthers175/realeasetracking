import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-brand-primary text-white font-medium shadow-sm hover:bg-brand-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-dark-card dark:text-slate-200 dark:border dark:border-dark-border dark:hover:bg-dark-hover active:scale-[0.98] transition-all',
    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-dark-border dark:text-slate-200 dark:hover:bg-dark-hover active:scale-[0.98] transition-all',
    danger:
      'bg-rose-600 text-white font-medium hover:bg-rose-700 active:scale-[0.98] transition-all',
    ghost:
      'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-hover transition-colors',
    pill:
      'bg-slate-100 text-slate-700 dark:bg-dark-surface dark:text-slate-300 dark:border dark:border-dark-border rounded-full hover:bg-slate-200 dark:hover:bg-dark-card transition-all',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
