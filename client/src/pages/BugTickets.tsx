import React, { useState, useEffect } from 'react';
import { bugsApi, universitiesApi } from '../api/endpoints';
import { BugTicket, University, BugPriority, BugStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Bug,
  Plus,
  Search,
  ExternalLink,
  Building2,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const BugTickets: React.FC = () => {
  const [bugs, setBugs] = useState<BugTicket[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Bug Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ticketId: '',
    title: '',
    description: '',
    jiraUrl: '',
    priority: 'HIGH' as BugPriority,
    status: 'OPEN' as BugStatus,
    university: '',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();

  const fetchBugs = async () => {
    setIsLoading(true);
    try {
      const res = await bugsApi.getAll({
        search,
        priority: priorityFilter,
        status: statusFilter,
        university: uniFilter,
      });
      if (res.success && res.data) {
        setBugs(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUnis = async () => {
      try {
        const res = await universitiesApi.getAll();
        if (res.success && res.data) setUniversities(res.data);
      } catch {}
    };
    loadUnis();
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [search, priorityFilter, statusFilter, uniFilter]);

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ticketId || !formData.title) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Ticket ID and Title are required' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        ticketId: formData.ticketId.trim().toUpperCase(),
        title: formData.title.trim(),
        description: formData.description,
        jiraUrl: formData.jiraUrl,
        priority: formData.priority,
        status: formData.status,
      };
      if (formData.university && formData.university.trim() !== '') {
        payload.university = formData.university;
      }

      const res = await bugsApi.create(payload);
      if (res.success) {
        showToast({ type: 'success', title: 'Bug Ticket Registered', message: `${formData.ticketId} saved.` });
        setIsModalOpen(false);
        setFormData({
          ticketId: '',
          title: '',
          description: '',
          jiraUrl: '',
          priority: 'HIGH',
          status: 'OPEN',
          university: '',
        });
        fetchBugs();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (bug: BugTicket) => {
    const newStatus = bug.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    try {
      const res = await bugsApi.update(bug._id, { status: newStatus as any });
      if (res.success) {
        showToast({ type: 'success', title: 'Status Updated', message: `${bug.ticketId} marked as ${newStatus}` });
        fetchBugs();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bug className="w-6 h-6 text-brand-primary" /> Jira Bug Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Track defect tickets, Jira associations, priority resolution, and release impact.
          </p>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Bug Ticket
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bug tickets by ID, title..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <select
          value={uniFilter}
          onChange={(e) => setUniFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Universities</option>
          {universities.map((u) => (
            <option key={u._id} value={u.code}>
              {u.code} - {u.name}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Bugs Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Ticket ID</th>
                <th className="py-3 px-3">University</th>
                <th className="py-3 px-3">Bug Title</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Reported Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3.5 px-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No bug tickets matching filters.
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => (
                  <tr key={bug._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                    {/* Ticket ID */}
                    <td className="py-3 px-3 font-mono font-bold text-brand-primary whitespace-nowrap">
                      {bug.ticketId}
                    </td>

                    {/* University */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{(bug.university as any)?.code || 'Global'}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-[280px]">
                      {bug.title}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          bug.priority === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                            : bug.priority === 'HIGH'
                            ? 'bg-red-500/10 text-red-500 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        {bug.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant={bug.status === 'RESOLVED' ? 'passed' : 'failed'} size="xs">
                        {bug.status}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-dark-muted">
                      {new Date(bug.createdDate).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {user?.role !== 'VIEWER' && (
                          <button
                            onClick={() => handleStatusToggle(bug)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-primary border border-slate-200 dark:border-dark-border rounded-lg transition-colors"
                          >
                            {bug.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
                          </button>
                        )}
                        {bug.jiraUrl && (
                          <a
                            href={bug.jiraUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-[11px] font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>Jira</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bug Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Bug Ticket"
        description="Register a Jira issue and link it to university releases."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateBug} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jira Ticket ID *
              </label>
              <input
                type="text"
                required
                value={formData.ticketId}
                onChange={(e) => setFormData({ ...formData, ticketId: e.target.value.toUpperCase() })}
                placeholder="e.g. UPG-2345"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl font-mono uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="">Global / Multi-University</option>
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bug Title / Summary *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. LSQ Opportunity not created for MBA program"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as BugPriority })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BugStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jira URL (optional)
            </label>
            <input
              type="url"
              value={formData.jiraUrl}
              onChange={(e) => setFormData({ ...formData, jiraUrl: e.target.value })}
              placeholder="https://jira.company.internal/browse/UPG-2345"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Bug Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
