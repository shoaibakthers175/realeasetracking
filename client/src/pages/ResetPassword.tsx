import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Rocket, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      showToast({ type: 'error', title: 'Error', message: 'Token and new password required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Error', message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Password Updated',
          message: 'Your password has been changed. You may now sign in.',
        });
        navigate('/login');
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Reset Failed', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-dark-text ambient-waves-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-glow mb-3">
            <Rocket className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create New Password</h1>
          <p className="text-xs text-dark-muted mt-1">
            Choose a strong password to protect your account.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-dark-surface border border-dark-border shadow-2xl space-y-4">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token here..."
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl text-white font-mono focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Update Password & Sign In
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-dark-muted hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
