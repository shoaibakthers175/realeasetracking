import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'feature'
    | 'enhancement'
    | 'bugfix'
    | 'hotfix'
    | 'passed'
    | 'failed'
    | 'partial'
    | 'in_progress'
    | 'live'
    | 'rolled_back'
    | 'production'
    | 'staging'
    | 'development'
    | 'standalone'
    | 'multitenant'
    | 'verified'
    | 'pending'
    | 'default';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] font-semibold',
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'feature':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'enhancement':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'bugfix':
        return 'bg-red-500/10 text-red-500 border border-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30';
      case 'hotfix':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30';
      case 'passed':
      case 'live':
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'failed':
      case 'rolled_back':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30';
      case 'pending':
      case 'partial':
        return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30';
      case 'in_progress':
        return 'bg-sky-500/10 text-sky-500 border border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30';
      case 'production':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25';
      case 'staging':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25';
      case 'development':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25';
      case 'standalone':
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20';
      case 'multitenant':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      default:
        return 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700';
    }
  };

  const hasDot = ['passed', 'live', 'production', 'staging', 'development', 'verified'].includes(variant);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full tracking-wide transition-colors',
        sizeClasses[size],
        getVariantStyles(),
        className
      )}
    >
      {hasDot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-emerald-500': ['passed', 'live', 'production', 'verified'].includes(variant),
            'bg-amber-500': variant === 'staging',
            'bg-blue-500': variant === 'development',
          })}
        />
      )}
      {children}
    </span>
  );
};
