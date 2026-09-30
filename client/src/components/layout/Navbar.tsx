import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useEnvironment, EnvironmentFilter } from '../../context/EnvironmentContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Shield,
  User as UserIcon,
  Check,
  Menu,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onToggleSidebar }) => {
  const { user, logout, switchRoleDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { environment, setEnvironment } = useEnvironment();
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  const [isEnvOpen, setIsEnvOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const envRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (envRef.current && !envRef.current.contains(e.target as Node)) setIsEnvOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const envOptions: { id: EnvironmentFilter; label: string; color: string }[] = [
    { id: 'PRODUCTION', label: 'Production', color: 'bg-emerald-500' },
    { id: 'STAGING', label: 'Staging', color: 'bg-amber-500' },
    { id: 'DEVELOPMENT', label: 'Development', color: 'bg-blue-500' },
    { id: 'ALL', label: 'All Environments', color: 'bg-slate-400' },
  ];

  const rolesList: { id: UserRole; label: string }[] = [
    { id: 'ADMIN', label: 'Admin (Full Access)' },
    { id: 'QA_LEAD', label: 'QA Lead (Review & Approve)' },
    { id: 'QA_ENGINEER', label: 'QA Engineer (Releases & Testing)' },
    { id: 'VIEWER', label: 'Viewer (Read-Only)' },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/95 dark:bg-dark-bg/90 backdrop-blur-md border-b border-slate-200 dark:border-dark-border transition-colors">
      {/* Left: Mobile Menu Toggle & Global Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-dark-muted dark:hover:text-white lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Omnibar Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center justify-between w-full max-w-md px-3.5 py-2 text-xs text-slate-400 dark:text-dark-muted bg-slate-100/80 dark:bg-dark-card/90 hover:bg-slate-200/70 dark:hover:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl transition-all group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" />
            <span className="truncate">Search universities, releases, features, bug tickets...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] bg-slate-200/80 dark:bg-dark-border px-1.5 py-0.5 rounded border border-slate-300/50 dark:border-dark-border text-slate-500 dark:text-slate-400">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Date, Environment, Notifications, User Profile & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date Display (Desktop) */}
        <div className="hidden xl:block text-xs font-medium text-slate-500 dark:text-dark-muted">
          {currentDateFormatted}
        </div>

        {/* Environment Selector Dropdown */}
        <div className="relative" ref={envRef}>
          <button
            onClick={() => setIsEnvOpen(!isEnvOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl hover:bg-slate-200/70 dark:hover:bg-dark-hover transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                environment === 'PRODUCTION'
                  ? 'bg-emerald-500'
                  : environment === 'STAGING'
                  ? 'bg-amber-500'
                  : environment === 'DEVELOPMENT'
                  ? 'bg-blue-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="capitalize">{environment.toLowerCase()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isEnvOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Filter Environment
              </div>
              {envOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setEnvironment(opt.id);
                    setIsEnvOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-left hover:bg-slate-100 dark:hover:bg-dark-card text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  {environment === opt.id && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              if (!isNotifOpen && unreadCount > 0) {
                markAllAsRead();
              }
            }}
            className="relative p-2 rounded-xl text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card border border-slate-200/80 dark:border-dark-border transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-primary rounded-full ring-2 ring-white dark:ring-dark-bg">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl py-2 z-40">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-dark-border">
                <span className="text-xs font-bold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-[11px] text-slate-400">All updates</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className="p-3 hover:bg-slate-50 dark:hover:bg-dark-card/60 transition-colors">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card border border-slate-200/80 dark:border-dark-border transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card border border-transparent hover:border-slate-200 dark:hover:border-dark-border transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'SA'}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {user?.name || 'Shoaib Ahmed'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-dark-muted">
                {user?.role ? user.role.replace('_', ' ') : 'QA Engineer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-border">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-dark-muted truncate">{user?.email}</div>
              </div>

              {/* Role Switcher Demo */}
              <div className="px-3 py-2 border-b border-slate-100 dark:border-dark-border">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-brand-primary" /> Active Role (Live RBAC)
                </div>
                <div className="space-y-0.5">
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRoleDemo(r.id);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-2 py-1 text-xs text-left rounded-md hover:bg-slate-100 dark:hover:bg-dark-card text-slate-700 dark:text-slate-300"
                    >
                      <span>{r.label}</span>
                      {user?.role === r.id && <Check className="w-3 h-3 text-brand-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
