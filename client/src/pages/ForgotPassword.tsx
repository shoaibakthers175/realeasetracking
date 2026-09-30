import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/common/Button';
import { Rocket, Mail, ArrowLeft, ArrowRight, ShieldAlert, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'IDLE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('IDLE');
  const [requestId, setRequestId] = useState('');
  const [approvedToken, setApprovedToken] = useState('');
  const [approvedByName, setApprovedByName] = useState('');

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email, reason);
      if (res.success) {
        setRequestStatus('PENDING');
        if (res.data?.requestId) {
          setRequestId(res.data.requestId);
        }
        showToast({
          type: 'success',
          title: 'Request Submitted to Admin',
          message: 'An administrator must approve your request before you can reset your password.',
        });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Request Failed', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!email && !requestId) return;
    setIsCheckingStatus(true);
    try {
      const res = await authApi.checkResetStatus({ email, requestId });
      if (res.success && res.data) {
        if (res.data.status === 'APPROVED' && res.data.token) {
          setRequestStatus('APPROVED');
          setApprovedToken(res.data.token);
          setApprovedByName(res.data.approvedByName || 'Administrator');
          showToast({
            type: 'success',
            title: 'Request Approved!',
            message: 'Your administrator has approved your password reset request.',
          });
        } else if (res.data.status === 'REJECTED') {
          setRequestStatus('REJECTED');
          showToast({
            type: 'error',
            title: 'Request Rejected',
            message: res.data.rejectionReason || 'Declined by administrator',
          });
        } else if (res.data.status === 'PENDING') {
          showToast({
            type: 'info',
            title: 'Status: Pending Approval',
            message: 'Your request is still awaiting administrator review.',
          });
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Check Failed', message: err.message });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-dark-text ambient-waves-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary text-white shadow-xl shadow-brand-glow mb-3">
            <Rocket className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-dark-muted mt-1">
            Enterprise password reset requires security administrator approval.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-dark-surface border border-dark-border shadow-2xl space-y-4">
          {requestStatus === 'APPROVED' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Password Reset Approved</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Approved by <strong className="text-white">{approvedByName}</strong> for account <strong className="text-white">{email}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-dark-card border border-emerald-500/30 text-left">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">Authorized Reset Token</span>
                <div className="text-xs font-mono text-white break-all">{approvedToken}</div>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate(`/reset-password?token=${approvedToken}&email=${encodeURIComponent(email)}`)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Set New Password Now
              </Button>
            </div>
          ) : requestStatus === 'PENDING' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">Awaiting Administrator Approval</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                A password reset request for <strong className="text-white">{email}</strong> has been logged. An administrator must review and approve it.
              </p>

              <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-left text-xs space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Request Status:</span>
                  <span className="font-bold text-amber-400">Pending Review</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Email:</span>
                  <span className="font-mono">{email}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  isLoading={isCheckingStatus}
                  onClick={handleCheckStatus}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Check Approval Status
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-dark-muted hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          ) : requestStatus === 'REJECTED' ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Request Declined</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Your password reset request was declined by the administrator. Please contact your QA Lead or DevOps admin.
              </p>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setRequestStatus('IDLE')}
              >
                Submit New Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Account Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@releasetrack.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Reason for Reset (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Forgot login password on new device"
                  className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[11px] text-slate-300 leading-relaxed">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-primary inline mr-1" />
                Security Policy: Submitting this form sends an alert to System Administrators to approve your password reset token.
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Request Admin Approval
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
          )}
        </div>
      </div>
    </div>
  );
};
