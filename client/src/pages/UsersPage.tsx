import React, { useState, useEffect } from 'react';
import { usersApi, authApi } from '../api/endpoints';
import { User, UserRole, PasswordResetRequest } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  UserCog,
  Plus,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Check,
  X,
  Copy,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'resets'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResets, setIsLoadingResets] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Add User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'QA_ENGINEER' as UserRole,
    department: 'Quality Assurance',
  });

  const { showToast } = useNotification();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getAll({ search, role: roleFilter });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResetRequests = async () => {
    if (currentUser?.role !== 'ADMIN') return;
    setIsLoadingResets(true);
    try {
      const res = await authApi.getPasswordResetRequests();
      if (res.success && res.data) {
        setResetRequests(res.data);
      }
    } catch (err: any) {
      // ignore if non-admin
    } finally {
      setIsLoadingResets(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchResetRequests();
  }, [search, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Name, email, and password required' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await usersApi.create(formData);
      if (res.success) {
        showToast({ type: 'success', title: 'User Created', message: `${formData.name} added.` });
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: 'Password123!',
          role: 'QA_ENGINEER',
          department: 'Quality Assurance',
        });
        fetchUsers();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to create user', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      const res = await usersApi.update(targetUser._id, { isActive: !targetUser.isActive });
      if (res.success) {
        showToast({ type: 'success', title: 'User Updated', message: `Status updated for ${targetUser.email}` });
        fetchUsers();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update failed', message: err.message });
    }
  };

  const handleApproveReset = async (reqId: string) => {
    setActionLoadingId(reqId);
    try {
      const res = await authApi.approvePasswordResetRequest(reqId);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Password Reset Approved',
          message: 'Reset token generated and authorized for the user.',
        });
        fetchResetRequests();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Approval Failed', message: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectReset = async (reqId: string) => {
    const reason = window.prompt('Enter rejection reason (optional):', 'Security policy rejection');
    if (reason === null) return;

    setActionLoadingId(reqId);
    try {
      const res = await authApi.rejectPasswordResetRequest(reqId, reason);
      if (res.success) {
        showToast({
          type: 'info',
          title: 'Request Rejected',
          message: 'Password reset request was declined.',
        });
        fetchResetRequests();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyResetLink = (token: string, email: string) => {
    const link = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    navigator.clipboard.writeText(link);
    showToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Password reset link copied to clipboard.',
    });
  };

  const pendingCount = resetRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-brand-primary" /> User Management & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Manage team accounts, RBAC permissions, and review password reset security approvals.
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add User
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Team Members ({users.length})
        </button>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => {
              setActiveTab('resets');
              fetchResetRequests();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'resets'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password Reset Approvals</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>

      {activeTab === 'users' ? (
        <>
          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="QA_LEAD">QA Lead</option>
              <option value="QA_ENGINEER">QA Engineer</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="py-3.5 px-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No users found matching filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {u.name}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap font-mono">
                          {u.email}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-primary border border-brand-500/20">
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {u.department || 'QA'}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs">
                              <XCircle className="w-3.5 h-3.5" /> Deactivated
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {currentUser?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleToggleActive(u)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-primary border border-slate-200 dark:border-dark-border rounded-lg transition-colors"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Password Reset Requests Admin Approval View */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Security Governance: When a user forgets their password, they must be approved by an Admin before a one-time token is granted.
            </span>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Email Address</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Requested Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {isLoadingResets ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="py-3.5 px-3">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : resetRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No password reset requests found. All team members are authenticated.
                      </td>
                    </tr>
                  ) : (
                    resetRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {req.userName}
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {req.email}
                        </td>

                        <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">
                          {req.reason || 'User requested password reset'}
                        </td>

                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(req.requestedAt).toLocaleString()}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {req.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Clock className="w-3 h-3" /> Pending Approval
                            </span>
                          ) : req.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : req.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <CheckCircle2 className="w-3 h-3" /> Password Changed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApproveReset(req._id)}
                                disabled={actionLoadingId === req._id}
                                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectReset(req._id)}
                                disabled={actionLoadingId === req._id}
                                className="px-2.5 py-1 text-[11px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : req.status === 'APPROVED' && req.resetToken ? (
                            <button
                              onClick={() => copyResetLink(req.resetToken!, req.email)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white rounded-lg transition-all inline-flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> Copy Reset Link
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        description="Invite a team member with role-based access permissions."
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@releasetrack.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="QA_ENGINEER">QA Engineer</option>
                <option value="QA_LEAD">QA Lead</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="QA Automation"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
