import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { releasesApi, universitiesApi, featuresApi, attachmentApi } from '../api/endpoints';
import { Release, University, Feature, ReleaseType, Environment, ReleaseStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Rocket,
  Plus,
  Search,
  Building2,
  Filter,
  MoreVertical,
  RotateCcw,
  Upload,
  CheckCircle2,
  Bug,
  FileCheck2,
  Users2,
  Calendar,
  Clock,
  Trash2,
} from 'lucide-react';

export const LiveReleases: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUni, setSelectedUni] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedEnv, setSelectedEnv] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Add Release Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState<number>(1);

  // Rollback Modal state
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [selectedReleaseForRollback, setSelectedReleaseForRollback] = useState<Release | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');

  // Add Release Form Data
  const [formData, setFormData] = useState({
    university: '',
    feature: '',
    title: '',
    description: '',
    releaseType: 'FEATURE' as ReleaseType,
    environment: 'PRODUCTION' as Environment,
    releaseDate: '2026-09-25',
    releaseTime: '03:45 PM',
    status: 'LIVE' as ReleaseStatus,
    deployedBy: 'Shoaib Ahmed',
    version: 'v2.4.0',
    // Bug Ticket
    bugTicketId: 'UPG-2345',
    bugTitle: 'Lead form responsive layout fix',
    bugPriority: 'HIGH',
    // Sanity
    sanityStatus: 'PASSED',
    totalTestCases: 18,
    passedCases: 18,
    failedCases: 0,
    sanityNotes: 'All test assertions passed on production environment.',
    // Lead
    leadId: 'LID-90876',
    leadProgram: 'B.Tech',
    leadSource: 'Website',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDropdowns = async () => {
    try {
      const [uRes, fRes] = await Promise.all([
        universitiesApi.getAll(),
        featuresApi.getAll(),
      ]);
      if (uRes.success && uRes.data) {
        setUniversities(uRes.data);
        if (uRes.data.length > 0 && !formData.university) {
          setFormData((prev) => ({ ...prev, university: uRes.data[0]._id }));
        }
      }
      if (fRes.success && fRes.data) {
        setFeatures(fRes.data);
        if (fRes.data.length > 0 && !formData.feature) {
          setFormData((prev) => ({ ...prev, feature: fRes.data[0]._id }));
        }
      }
    } catch {
      // ignore
    }
  };

  const fetchReleases = async () => {
    setIsLoading(true);
    try {
      const res = await releasesApi.getAll({
        search,
        university: selectedUni,
        releaseType: selectedType,
        environment: selectedEnv,
        status: selectedStatus,
        limit: 50,
      });
      if (res.success && res.data) {
        setReleases(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [search, selectedUni, selectedType, selectedEnv, selectedStatus]);

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.university || !formData.feature || !formData.title) {
      showToast({ type: 'error', title: 'Validation Error', message: 'University, Feature, and Title are required' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        university: formData.university,
        feature: formData.feature,
        title: formData.title,
        description: formData.description,
        releaseType: formData.releaseType,
        environment: formData.environment,
        releaseDate: formData.releaseDate,
        releaseTime: formData.releaseTime,
        status: formData.status,
        deployedBy: formData.deployedBy,
        version: formData.version,
        bugTickets: formData.bugTicketId
          ? [
              {
                ticketId: formData.bugTicketId,
                title: formData.bugTitle || `Bug ${formData.bugTicketId}`,
                priority: formData.bugPriority,
                status: 'RESOLVED',
              },
            ]
          : [],
        sanityReport: {
          title: `${formData.title} Sanity Report`,
          sanityStatus: formData.sanityStatus,
          totalTestCases: Number(formData.totalTestCases),
          passed: Number(formData.passedCases),
          failed: Number(formData.failedCases),
          notes: formData.sanityNotes,
        },
        leads: formData.leadId
          ? [
              {
                leadId: formData.leadId,
                program: formData.leadProgram,
                source: formData.leadSource,
                lsqStatus: 'CREATED',
                opportunityStatus: 'CREATED',
                erpStatus: 'CREATED',
                verificationStatus: 'SUCCESS',
              },
            ]
          : [],
      };

      const res = await releasesApi.create(payload);
      if (res.success) {
        // Trigger live confetti celebration for live production release!
        if (formData.status === 'LIVE') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#10b981', '#3b82f6'],
          });
        }

        showToast({
          type: 'success',
          title: 'Release Published Live!',
          message: `${formData.title} was published successfully.`,
        });

        setIsModalOpen(false);
        setStep(1);
        fetchReleases();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Release Failed', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollbackConfirm = async () => {
    if (!selectedReleaseForRollback) return;
    try {
      const res = await releasesApi.update(selectedReleaseForRollback._id, {
        status: 'ROLLED_BACK',
        rollbackReason: rollbackReason || 'Rolled back due to QA test defect',
      });
      if (res.success) {
        showToast({
          type: 'warning',
          title: 'Release Rolled Back',
          message: `${selectedReleaseForRollback.title} is no longer live.`,
        });
        setRollbackModalOpen(false);
        fetchReleases();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Rollback Failed', message: err.message });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete release "${title}"?`)) return;
    try {
      const res = await releasesApi.delete(id);
      if (res.success) {
        showToast({ type: 'success', title: 'Deleted', message: 'Release removed.' });
        fetchReleases();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Rocket className="w-6 h-6 text-brand-primary" /> Live Releases
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Publish, monitor, audit, and roll back multi-tenant and standalone university releases.
          </p>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Live Release
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search releases, titles, versions..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        {/* University dropdown */}
        <select
          value={selectedUni}
          onChange={(e) => setSelectedUni(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Universities</option>
          {universities.map((u) => (
            <option key={u._id} value={u.code}>
              {u.code} - {u.name}
            </option>
          ))}
        </select>

        {/* Release Type */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="FEATURE">Feature</option>
          <option value="BUG_FIX">Bug Fix</option>
          <option value="ENHANCEMENT">Enhancement</option>
          <option value="HOTFIX">Hotfix</option>
        </select>

        {/* Environment */}
        <select
          value={selectedEnv}
          onChange={(e) => setSelectedEnv(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Environments</option>
          <option value="PRODUCTION">Production</option>
          <option value="STAGING">Staging</option>
          <option value="DEVELOPMENT">Development</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="LIVE">Live</option>
          <option value="ROLLED_BACK">Rolled Back</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* Releases Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border/60 text-[11px] font-bold text-slate-400 dark:text-dark-muted uppercase tracking-wider">
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">University</th>
                <th className="py-3 px-3">Feature & Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Environment</th>
                <th className="py-3 px-3">Bug Ticket</th>
                <th className="py-3 px-3">Sanity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-3.5 px-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : releases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No releases found matching current filters.
                  </td>
                </tr>
              ) : (
                releases.map((rel) => {
                  const releaseDateStr = new Date(rel.releaseDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const bugTicket = rel.bugTickets && rel.bugTickets.length > 0 ? (rel.bugTickets[0] as any).ticketId : null;
                  const sanity = rel.sanityReports && rel.sanityReports.length > 0 ? (rel.sanityReports[0] as any).sanityStatus : 'NOT_TESTED';

                  return (
                    <tr
                      key={rel._id}
                      className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {releaseDateStr}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-dark-muted">
                          {rel.releaseTime}
                        </div>
                      </td>

                      {/* University */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                          <span>{rel.university?.code || 'University'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {rel.university?.name}
                        </div>
                      </td>

                      {/* Feature & Title */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors max-w-[220px] truncate">
                          {rel.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-dark-muted truncate max-w-[200px]">
                          {(rel.feature as any)?.name} • {rel.version || 'v1.0'}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={rel.releaseType.toLowerCase() as any} size="xs">
                          {rel.releaseType}
                        </Badge>
                      </td>

                      {/* Environment */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={rel.environment.toLowerCase() as any} size="xs">
                          {rel.environment}
                        </Badge>
                      </td>

                      {/* Bug Ticket */}
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        {bugTicket ? (
                          <span className="text-brand-primary font-semibold hover:underline">
                            {bugTicket}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Sanity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant={sanity === 'PASSED' ? 'passed' : sanity === 'FAILED' ? 'failed' : 'pending'} size="xs">
                          {sanity === 'PASSED' ? 'Passed' : sanity === 'FAILED' ? 'Failed' : 'Partial'}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge
                          variant={rel.status === 'LIVE' ? 'live' : rel.status === 'ROLLED_BACK' ? 'rolled_back' : 'pending'}
                          size="xs"
                        >
                          {rel.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/releases/${rel._id}`)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/30 rounded-lg transition-all"
                          >
                            Details
                          </button>

                          {rel.status === 'LIVE' && user?.role !== 'VIEWER' && (
                            <button
                              onClick={() => {
                                setSelectedReleaseForRollback(rel);
                                setRollbackModalOpen(true);
                              }}
                              title="Rollback Release"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(rel._id, rel.title)}
                              title="Delete Release"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      <Modal
        isOpen={rollbackModalOpen}
        onClose={() => setRollbackModalOpen(false)}
        title="Rollback Release"
        description="Reverting this release will remove its LIVE status and update the Feature Matrix dynamically."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-dark-muted">
            Are you sure you want to roll back release{' '}
            <strong className="text-slate-900 dark:text-white">
              {selectedReleaseForRollback?.title}
            </strong>
            ?
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Rollback Reason *
            </label>
            <textarea
              rows={3}
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Describe why this release is being rolled back..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" onClick={() => setRollbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleRollbackConfirm}>
              Confirm Rollback
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Live Release Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStep(1);
        }}
        title="Create Live Release"
        description="Publish a feature, bug fix, or enhancement live to partner universities."
        maxWidth="2xl"
      >
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-dark-border text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 ${step === 1 ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-dark-card'}`}>
              1
            </span>
            <span>Core Details</span>
          </button>
          <span className="text-slate-300 dark:text-dark-border">―</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 ${step === 2 ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-dark-card'}`}>
              2
            </span>
            <span>Bug & Sanity</span>
          </button>
          <span className="text-slate-300 dark:text-dark-border">―</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 ${step === 3 ? 'text-brand-primary' : 'text-slate-400'}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-dark-card'}`}>
              3
            </span>
            <span>Test Leads</span>
          </button>
        </div>

        <form onSubmit={handleCreateRelease} className="space-y-4">
          {/* Step 1: Core Release Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target University *
                  </label>
                  <select
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  >
                    {universities.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.code} — {u.name} ({u.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Associated Feature *
                  </label>
                  <select
                    required
                    value={formData.feature}
                    onChange={(e) => setFormData({ ...formData, feature: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  >
                    {features.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} [{f.category}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Release Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. New Lead Form GA Release"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Release Type *
                  </label>
                  <select
                    value={formData.releaseType}
                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value as ReleaseType })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  >
                    <option value="FEATURE">Feature</option>
                    <option value="BUG_FIX">Bug Fix</option>
                    <option value="ENHANCEMENT">Enhancement</option>
                    <option value="HOTFIX">Hotfix</option>
                    <option value="CONFIGURATION_CHANGE">Config Change</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Environment *
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as Environment })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  >
                    <option value="PRODUCTION">Production</option>
                    <option value="STAGING">Staging</option>
                    <option value="DEVELOPMENT">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReleaseStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  >
                    <option value="LIVE">Live</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Release Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Release Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.releaseTime}
                    onChange={(e) => setFormData({ ...formData, releaseTime: e.target.value })}
                    placeholder="03:45 PM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="button" variant="primary" size="sm" onClick={() => setStep(2)}>
                  Next: Bug & Sanity →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Bug & Sanity Reports */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-brand-primary" /> Associated Jira Bug Ticket
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Jira Ticket ID
                    </label>
                    <input
                      type="text"
                      value={formData.bugTicketId}
                      onChange={(e) => setFormData({ ...formData, bugTicketId: e.target.value.toUpperCase() })}
                      placeholder="UPG-2345"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg uppercase font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Bug Description / Title
                    </label>
                    <input
                      type="text"
                      value={formData.bugTitle}
                      onChange={(e) => setFormData({ ...formData, bugTitle: e.target.value })}
                      placeholder="Brief bug summary..."
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" /> Sanity Test Report Evidence
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Sanity Status
                    </label>
                    <select
                      value={formData.sanityStatus}
                      onChange={(e) => setFormData({ ...formData, sanityStatus: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    >
                      <option value="PASSED">Passed (All checks OK)</option>
                      <option value="FAILED">Failed</option>
                      <option value="PARTIAL">Partial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Total Test Cases
                    </label>
                    <input
                      type="number"
                      value={formData.totalTestCases}
                      onChange={(e) => setFormData({ ...formData, totalTestCases: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Passed Test Cases
                    </label>
                    <input
                      type="number"
                      value={formData.passedCases}
                      onChange={(e) => setFormData({ ...formData, passedCases: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={() => setStep(3)}>
                  Next: Test Leads →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Test Leads & Final Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users2 className="w-4 h-4 text-brand-primary" /> Test Lead Verification
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Generated Lead ID
                    </label>
                    <input
                      type="text"
                      value={formData.leadId}
                      onChange={(e) => setFormData({ ...formData, leadId: e.target.value.toUpperCase() })}
                      placeholder="LID-90876"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Program
                    </label>
                    <input
                      type="text"
                      value={formData.leadProgram}
                      onChange={(e) => setFormData({ ...formData, leadProgram: e.target.value })}
                      placeholder="B.Tech"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                      Source
                    </label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg"
                    >
                      <option value="Website">Website</option>
                      <option value="Campaign">Campaign</option>
                      <option value="Portal">Portal</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Ready to publish live! All dashboard metrics and feature matrix will automatically update.</span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-dark-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  🚀 Publish Release Live
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
