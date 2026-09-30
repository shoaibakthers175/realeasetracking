import React from 'react';
import { LucideIcon, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from '../common/Sparkline';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export interface KpiCardProps {
  title: string;
  value: number | string;
  trend: string;
  subtext: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  linkTo?: string;
  sparklineData?: number[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  subtext,
  isPositive = true,
  icon: Icon,
  iconColor = 'text-brand-primary',
  iconBg = 'bg-brand-500/10',
  linkTo,
  sparklineData,
}) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => linkTo && navigate(linkTo)}
      className={clsx(
        'group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm hover:shadow-md dark:hover:border-slate-700/60 transition-all duration-200 flex flex-col justify-between',
        linkTo && 'cursor-pointer'
      )}
    >
      {/* Top Header: Icon, Value, Title & Chevron */}
      <div>
        <div className="flex items-start justify-between">
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={clsx('w-5 h-5', iconColor)} />
          </div>
          {linkTo && (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          )}
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-dark-muted mt-0.5">
            {title}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Trend + Subtext and Sparkline */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs font-bold">
            {isPositive ? (
              <span className="text-emerald-500 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {trend}
              </span>
            ) : (
              <span className="text-red-500 flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-dark-muted mt-0.5">
            {subtext}
          </div>
        </div>

        {/* Sparkline curve */}
        <div className="flex-shrink-0">
          <Sparkline
            data={sparklineData || (isPositive ? [12, 14, 18, 15, 22, 28, 25, 34] : [30, 28, 24, 26, 20, 18, 16, 14])}
            color="#ef4444"
            width={72}
            height={24}
          />
        </div>
      </div>
    </div>
  );
};
