import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Rocket, Lock, Mail, Moon, Sun, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast({ type: 'error', title: 'Error', message: 'Email and password are required' });
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      showToast({ type: 'success', title: 'Welcome Back!', message: 'Signed in successfully.' });
      navigate('/');
    } catch (err: any) {
      showToast({ type: 'error', title: 'Login Failed', message: err.message || 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${theme === 'dark' ? 'dark bg-dark-bg text-dark-text ambient-waves-dark' : 'bg-light-bg text-light-text ambient-waves-light'}`}>
      {/* Top right Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-muted shadow-sm hover:scale-105 transition-all"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
      </button>

      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-glow mb-3">
            <Rocket className="w-7 h-7 -rotate-45" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Release<span className="text-brand-primary">Track</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted mt-1 uppercase tracking-widest">
            Live. Test. Monitor.
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-2xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Sign In to Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-dark-muted mb-6">
            Enter your credentials to access the release tracking platform.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@releasetrack.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-3"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
