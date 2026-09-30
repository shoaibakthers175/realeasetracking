import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { universitiesApi } from '../api/endpoints';
import { University, UniversityType, Environment } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export const Universities: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Add University Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'STANDALONE' as UniversityType,
    primaryEnvironment: 'PRODUCTION' as Environment,
    productionUrl: '',
    stagingUrl: '',
    developmentUrl: '',
    location: '',
    notes: '',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const res = await universitiesApi.getAll({
        search,
        type: typeFilter,
      });
      if (res.success && res.data) {
        setUniversities(res.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [search, typeFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Name and Code are required' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await universitiesApi.create(formData);
      if (res.success) {
        showToast({ type: 'success', title: 'University Created', message: `${formData.code} created successfully` });
        setIsModalOpen(false);
        setFormData({
          name: '',
          code: '',
          type: 'STANDALONE',
          primaryEnvironment: 'PRODUCTION',
          productionUrl: '',
          stagingUrl: '',
          developmentUrl: '',
          location: '',
          notes: '',
        });
        fetchUniversities();
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
            <Building2 className="w-6 h-6 text-brand-primary" /> Universities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Manage partner universities, multi-tenant setups, environments, and feature availability.
          </p>
        </div>

        {user?.role !== 'VIEWER' && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add University
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === '' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-dark-muted'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('STANDALONE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'STANDALONE' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-dark-muted'
              }`}
            >
              Standalone
            </button>
            <button
              onClick={() => setTypeFilter('MULTI_TENANT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'MULTI_TENANT' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-dark-muted'
              }`}
            >
              Multi-Tenant
            </button>
          </div>
        </div>
      </div>

      {/* Universities Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border animate-pulse h-48" />
          ))
        ) : universities.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No universities found.
          </div>
        ) : (
          universities.map((uni) => (
            <div
              key={uni._id}
              onClick={() => navigate(`/universities/${uni._id}`)}
              className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border hover:border-brand-primary/50 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                      {uni.code.substring(0, 4)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                        {uni.code}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted line-clamp-1">{uni.name}</p>
                    </div>
                  </div>
                  <Badge variant={uni.type === 'STANDALONE' ? 'standalone' : 'multitenant'} size="xs">
                    {uni.type === 'STANDALONE' ? 'Standalone' : 'Multi-Tenant'}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Environment</span>
                    <Badge variant={uni.primaryEnvironment.toLowerCase() as any} size="xs" className="mt-1">
                      {uni.primaryEnvironment}
                    </Badge>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Features Live</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {uni.featuresLiveCount ?? 0}
                    </span>
                  </div>
                </div>

                {uni.productionUrl && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 dark:text-dark-muted truncate">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{uni.productionUrl}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {uni.latestRelease ? `Latest: ${uni.latestRelease.featureName}` : 'No releases yet'}
                </span>
                <span className="font-semibold text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add University Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New University"
        description="Register a new institution to track deployments and features."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Indian Institute of Technology Kharagpur"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. IITKGP"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white uppercase font-mono focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as UniversityType })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="STANDALONE">Standalone</option>
                <option value="MULTI_TENANT">Multi-Tenant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Environment *
              </label>
              <select
                value={formData.primaryEnvironment}
                onChange={(e) => setFormData({ ...formData, primaryEnvironment: e.target.value as Environment })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Production URL
            </label>
            <input
              type="url"
              value={formData.productionUrl}
              onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
              placeholder="https://erp.university.ac.in"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Staging URL
            </label>
            <input
              type="url"
              value={formData.stagingUrl}
              onChange={(e) => setFormData({ ...formData, stagingUrl: e.target.value })}
              placeholder="https://staging.university.ac.in"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tenant details or special configurations..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              Create University
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
