import React from 'react';
import { useNotification, ToastMessage } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border transition-all duration-200 animate-in slide-in-from-bottom-3',
            {
              'border-l-4 border-l-emerald-500': toast.type === 'success',
              'border-l-4 border-l-rose-500': toast.type === 'error',
              'border-l-4 border-l-amber-500': toast.type === 'warning',
              'border-l-4 border-l-sky-500': toast.type === 'info',
            }
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</h5>
            {toast.message && (
              <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
