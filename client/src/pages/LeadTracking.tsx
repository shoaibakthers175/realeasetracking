import React, { useState, useEffect } from 'react';
import { leadsApi, universitiesApi } from '../api/endpoints';
import { Lead, University, IntegrationStatus, VerificationStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Users2,
  Plus,
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const LeadTracking: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Lead Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    university: '',
    program: 'B.Tech',
    form: 'Lead Enquiry Form',
    source: 'Website',
    lsqStatus: 'CREATED' as IntegrationStatus,
    opportunityStatus: 'CREATED' as IntegrationStatus,
    erpStatus: 'CREATED' as IntegrationStatus,
    verificationStatus: 'SUCCESS' as VerificationStatus,
    leadEmail: '',
    leadPhone: '',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await leadsApi.getAll({
        search,
        university: uniFilter,
        status: statusFilter,
        source: sourceFilter,
      });
      if (res.success && res.data) {
        setLeads(res.data);
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
        if (res.success && res.data) {
          setUniversities(res.data);
          if (res.data.length > 0 && !formData.university) {
            setFormData((prev) => ({ ...prev, university: res.data[0]._id }));
          }
        }
      } catch {}
    };
    loadUnis();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, uniFilter, statusFilter, sourceFilter]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId || !formData.university) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Lead ID and University are required' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await leadsApi.create(formData);
      if (res.success) {
        showToast({ type: 'success', title: 'Test Lead Verified', message: `${formData.leadId} registered and verified.` });
        setIsModalOpen(false);
        setFormData({
          leadId: '',
          university: universities[0]?._id || '',
          program: 'B.Tech',
          form: 'Lead Enquiry Form',
          source: 'Website',
          lsqStatus: 'CREATED',
          opportunityStatus: 'CREATED',
          erpStatus: 'CREATED',
          verificationStatus: 'SUCCESS',
          leadEmail: '',
          leadPhone: '',
        });
        fetchLeads();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to create', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-brand-primary" /> Test Lead Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Track test leads generated during QA releases, LeadSquared CRM integration, Opportunity creation, and ERP sync.
          </p>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Test Lead
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
            placeholder="Search by Lead ID, program, email..."
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
            <option key={u._id} value={u._id}>
              {u.code} - {u.name}
            </option>
          ))}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Campaign">Campaign</option>
          <option value="Portal">Portal</option>
          <option value="Social">Social</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Verification Statuses</option>
          <option value="SUCCESS">Verified (Success)</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">University</th>
                <th className="py-3 px-3">Lead ID</th>
                <th className="py-3 px-3">Program</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">LSQ Status</th>
                <th className="py-3 px-3">Opportunity</th>
                <th className="py-3 px-3">ERP Sync</th>
                <th className="py-3 px-3 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-3.5 px-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No test leads found matching filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {new Date(lead.generatedAt).toLocaleDateString()}
                    </td>

                    {/* University */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{(lead.university as any)?.code || 'Uni'}</span>
                      </div>
                    </td>

                    {/* Lead ID */}
                    <td className="py-3 px-3 font-mono font-bold text-brand-primary whitespace-nowrap">
                      {lead.leadId}
                    </td>

                    {/* Program */}
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {lead.program}
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 text-slate-500">
                      {lead.source}
                    </td>

                    {/* LSQ Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lead.lsqStatus === 'CREATED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {lead.lsqStatus}
                      </span>
                    </td>

                    {/* Opportunity */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lead.opportunityStatus === 'CREATED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {lead.opportunityStatus}
                      </span>
                    </td>

                    {/* ERP */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${lead.erpStatus === 'CREATED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {lead.erpStatus}
                      </span>
                    </td>

                    {/* Verification */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Badge
                        variant={lead.verificationStatus === 'SUCCESS' ? 'verified' : lead.verificationStatus === 'PENDING' ? 'pending' : 'failed'}
                        size="xs"
                      >
                        {lead.verificationStatus === 'SUCCESS' ? 'Verified' : lead.verificationStatus === 'PENDING' ? 'Pending' : 'Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Test Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Test Lead"
        description="Register a test lead ID to verify CRM, Opportunity, and ERP data flow."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lead ID *
              </label>
              <input
                type="text"
                required
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value.toUpperCase() })}
                placeholder="e.g. LID-90876"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl font-mono uppercase text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University *
              </label>
              <select
                required
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Program
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g. B.Tech / MBA"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Website">Website</option>
                <option value="Campaign">Campaign</option>
                <option value="Portal">Portal</option>
                <option value="Social">Social</option>
                <option value="Direct">Direct</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                LSQ Status
              </label>
              <select
                value={formData.lsqStatus}
                onChange={(e) => setFormData({ ...formData, lsqStatus: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl"
              >
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="NOT_CREATED">Not Created</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                Opportunity
              </label>
              <select
                value={formData.opportunityStatus}
                onChange={(e) => setFormData({ ...formData, opportunityStatus: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl"
              >
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="NOT_CREATED">Not Created</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                ERP Status
              </label>
              <select
                value={formData.erpStatus}
                onChange={(e) => setFormData({ ...formData, erpStatus: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl"
              >
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="NOT_CREATED">Not Created</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Verify Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
