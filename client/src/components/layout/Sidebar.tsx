import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Rocket,
  Layers,
  Bug,
  FileCheck2,
  Users2,
  CalendarDays,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  History,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Universities', path: '/universities', icon: Building2 },
    { label: 'Live Releases', path: '/releases', icon: Rocket },
    { label: 'Features', path: '/features', icon: Layers },
    { label: 'Bug Tickets', path: '/bug-tickets', icon: Bug },
    { label: 'Sanity Reports', path: '/sanity-reports', icon: FileCheck2 },
    { label: 'Lead Tracking', path: '/leads', icon: Users2 },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/audit-logs', icon: History },
  ];

  const adminItems = [
    { label: 'Users', path: '/users', icon: UserCog, requireAdmin: true },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:z-30',
          isCollapsed ? 'w-20' : 'w-64',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Header / Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-dark-border flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-glow flex-shrink-0">
            <Rocket className="w-5 h-5 -rotate-45" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Release<span className="text-brand-primary">Track</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-dark-muted -mt-0.5 truncate">
                Live. Test. Monitor.
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                    isActive
                      ? 'bg-brand-primary text-white shadow-sm shadow-brand-glow'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-slate-900 dark:hover:text-white'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Administration section */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-dark-border">
            {!isCollapsed && (
              <div className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Administration
              </div>
            )}
            {adminItems
              .filter((item) => !item.requireAdmin || isAdmin)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-slate-900 dark:hover:text-white'
                      )
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
          </div>
        </nav>

        {/* Bottom Section: Operational card & Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-dark-border space-y-2 flex-shrink-0">
          {!isCollapsed && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/80 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Production</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">
                All systems operational
              </div>
            </div>
          )}

          {/* Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center gap-2 w-full p-2 text-xs font-medium text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card rounded-xl transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
