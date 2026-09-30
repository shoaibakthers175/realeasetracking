import React from 'react';
import clsx from 'clsx';

export type DateRangeOption = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

interface DateFilterProps {
  value: DateRangeOption;
  onChange: (option: DateRangeOption) => void;
  onCustomClick?: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ value, onChange, onCustomClick }) => {
  const options: { id: DateRangeOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'this_year', label: 'This Year' },
  ];

  return (
    <div className="flex items-center p-1 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl gap-1">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
              isActive
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
