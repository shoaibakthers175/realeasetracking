import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { authApi } from '../api/endpoints';
import { Button } from '../components/common/Button';
import { Settings, User, Lock, Moon, Sun, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotification();

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      showToast({ type: 'error', title: 'Error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast({ type: 'success', title: 'Password Updated', message: 'Your password has been changed.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-primary" /> Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
          Manage your ReleaseTrack account profile, visual appearance, and security credentials.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-primary" /> Profile Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              disabled
              value={user?.name || ''}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-300 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Active Role</label>
            <input
              type="text"
              disabled
              value={user?.role || ''}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-300 cursor-not-allowed font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
            <input
              type="text"
              disabled
              value={user?.department || 'Quality Assurance'}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-700 dark:text-slate-300 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Visual Theme Appearance */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Moon className="w-4 h-4 text-brand-primary" /> Visual Appearance & Themes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Option */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'dark'
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-dark-bg text-amber-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Theme (High-Fidelity)</div>
                <div className="text-[10px] text-slate-400">Deep navy/black surface with glowing crimson accents</div>
              </div>
            </div>
          </div>

          {/* Light Mode Option */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              theme === 'light'
                ? 'border-brand-primary bg-brand-primary/5'
                : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-amber-500 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Light Theme (Clean Enterprise)</div>
                <div className="text-[10px] text-slate-400">Crisp white canvas with bold red highlights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security: Change Password */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-primary" /> Security & Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingPassword}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};
