import React, { useState, useEffect } from 'react';
import { sanityApi, universitiesApi, attachmentApi } from '../api/endpoints';
import { SanityReport, University, SanityStatus, Environment } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  FileCheck2,
  Plus,
  Search,
  ExternalLink,
  Building2,
  Upload,
  FileText,
} from 'lucide-react';

export const SanityReports: React.FC = () => {
  const [reports, setReports] = useState<SanityReport[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [uniFilter, setUniFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    university: '',
    sanityStatus: 'PASSED' as SanityStatus,
    environment: 'PRODUCTION' as Environment,
    testedBy: 'Shoaib Ahmed',
    totalTestCases: 15,
    passed: 15,
    failed: 0,
    blocked: 0,
    notes: 'All test assertions passed on production environment.',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await sanityApi.getAll({
        search,
        status: statusFilter,
        university: uniFilter,
      });
      if (res.success && res.data) {
        setReports(res.data);
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
    fetchReports();
  }, [search, statusFilter, uniFilter]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Report title is required' });
      return;
    }

    setIsSaving(true);
    try {
      const attachments = [];
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('entityType', 'SanityReport');
        const uploadRes = await attachmentApi.upload(uploadData);
        if (uploadRes.success && uploadRes.data) {
          attachments.push({
            name: uploadRes.data.originalName,
            url: uploadRes.data.url,
            size: uploadRes.data.size,
            mimeType: uploadRes.data.mimeType,
          });
        }
      }

      const payload: any = {
        title: formData.title,
        sanityStatus: formData.sanityStatus,
        environment: formData.environment,
        testedBy: formData.testedBy || user?.name || 'QA Lead',
        totalTestCases: Number(formData.totalTestCases) || 0,
        passed: Number(formData.passed) || 0,
        failed: Number(formData.failed) || 0,
        blocked: Number(formData.blocked) || 0,
        notes: formData.notes,
        attachments,
      };

      if (formData.university && formData.university.trim() !== '') {
        payload.university = formData.university;
      }

      const res = await sanityApi.create(payload);

      if (res.success) {
        showToast({ type: 'success', title: 'Sanity Report Filed', message: `${formData.title} uploaded successfully` });
        setIsModalOpen(false);
        setSelectedFile(null);
        setFormData({
          title: '',
          university: '',
          sanityStatus: 'PASSED',
          environment: 'PRODUCTION',
          testedBy: 'Shoaib Ahmed',
          totalTestCases: 15,
          passed: 15,
          failed: 0,
          blocked: 0,
          notes: '',
        });
        fetchReports();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to upload', message: err.message });
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
            <FileCheck2 className="w-6 h-6 text-brand-primary" /> Sanity Testing & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Store and verify QA sanity test sign-offs, test execution metrics, PDF/evidence uploads.
          </p>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Sanity Report
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
            placeholder="Search sanity reports, tester, notes..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
          <option value="PARTIAL">Partial</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      {/* Reports Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Report Title</th>
                <th className="py-3 px-3">University</th>
                <th className="py-3 px-3">Tested By</th>
                <th className="py-3 px-3">Environment</th>
                <th className="py-3 px-3">Test Metrics</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Test Date</th>
                <th className="py-3 px-3 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="py-3.5 px-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sanity reports found matching filters.
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                    {/* Report Title */}
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-[220px]">
                      {rep.title}
                    </td>

                    {/* University */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{(rep.university as any)?.code || 'Global'}</span>
                      </div>
                    </td>

                    {/* Tested By */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {rep.testedBy}
                    </td>

                    {/* Environment */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant={rep.environment.toLowerCase() as any} size="xs">
                        {rep.environment}
                      </Badge>
                    </td>

                    {/* Test Metrics */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-emerald-500">{rep.passed} passed</span> /{' '}
                      <span className="text-slate-400">{rep.totalTestCases} total</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <Badge variant={rep.sanityStatus === 'PASSED' ? 'passed' : 'failed'} size="xs">
                        {rep.sanityStatus}
                      </Badge>
                    </td>

                    {/* Test Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-dark-muted">
                      {new Date(rep.testDate).toLocaleDateString()}
                    </td>

                    {/* Attachment Evidence */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {rep.attachments && rep.attachments.length > 0 ? (
                        <a
                          href={rep.attachments[0].url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
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

      {/* Upload Sanity Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Sanity Report"
        description="Upload test evidence and sign-off metrics for a release."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sanity Report Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. IITKGP Lead Form Sanity Verification"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University
              </label>
              <select
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="">Global / Select University</option>
                {universities.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sanity Status *
              </label>
              <select
                value={formData.sanityStatus}
                onChange={(e) => setFormData({ ...formData, sanityStatus: e.target.value as SanityStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="PARTIAL">Partial</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                Total Tests
              </label>
              <input
                type="number"
                value={formData.totalTestCases}
                onChange={(e) => setFormData({ ...formData, totalTestCases: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                Passed Tests
              </label>
              <input
                type="number"
                value={formData.passed}
                onChange={(e) => setFormData({ ...formData, passed: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-dark-muted mb-1">
                Failed Tests
              </label>
              <input
                type="number"
                value={formData.failed}
                onChange={(e) => setFormData({ ...formData, failed: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Evidence Document (PDF / Excel / Image)
            </label>
            <input
              type="file"
              accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Observations
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Edge cases tested, response latency, device breakdown..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Upload Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
