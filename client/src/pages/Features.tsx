import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuresApi, universitiesApi } from '../api/endpoints';
import { Feature, FeatureMatrixData, FeatureCategory } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DeleteFeatureModal } from '../components/common/DeleteFeatureModal';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Plus,
  Search,
  Check,
  X,
  Grid,
  List,
  ChevronRight,
  Filter,
  Trash2,
} from 'lucide-react';

export const Features: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [matrixData, setMatrixData] = useState<FeatureMatrixData | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [matrixEnv, setMatrixEnv] = useState<'PRODUCTION' | 'STAGING' | 'DEVELOPMENT'>('PRODUCTION');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFeatureForDelete, setSelectedFeatureForDelete] = useState<Feature | null>(null);

  // Add Feature Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'CORE' as FeatureCategory,
    description: '',
  });

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [featRes, matRes] = await Promise.all([
        featuresApi.getAll({ search, category: selectedCategory }),
        featuresApi.getMatrix({ environment: matrixEnv }),
      ]);
      if (featRes.success && featRes.data) {
        setFeatures(featRes.data);
      }
      if (matRes.success && matRes.data) {
        setMatrixData(matRes.data);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, matrixEnv]);

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Name and Code are required' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await featuresApi.create(formData);
      if (res.success) {
        showToast({ type: 'success', title: 'Feature Created', message: `${formData.name} added to catalog` });
        setIsModalOpen(false);
        setFormData({ name: '', code: '', category: 'CORE', description: '' });
        fetchData();
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Creation Failed', message: err.message });
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
            <Layers className="w-6 h-6 text-brand-primary" /> Master Features & Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Track feature catalog and dynamically calculated live availability matrix across all universities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'matrix' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 dark:text-dark-muted'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Live Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 dark:text-dark-muted'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Catalog List</span>
            </button>
          </div>

          {user?.role !== 'VIEWER' && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Feature
            </Button>
          )}
        </div>
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-dark-border">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Feature × University Live Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted">
                Calculated in real-time from active production releases in MongoDB.
              </p>
            </div>

            {/* Matrix Environment Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border p-1 rounded-xl text-xs">
              <button
                onClick={() => setMatrixEnv('PRODUCTION')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  matrixEnv === 'PRODUCTION' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-dark-muted'
                }`}
              >
                ● Production
              </button>
              <button
                onClick={() => setMatrixEnv('STAGING')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  matrixEnv === 'STAGING' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-dark-muted'
                }`}
              >
                ● Staging
              </button>
              <button
                onClick={() => setMatrixEnv('DEVELOPMENT')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  matrixEnv === 'DEVELOPMENT' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-dark-muted'
                }`}
              >
                ● Dev
              </button>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3 min-w-[200px]">Feature Name</th>
                  <th className="py-3 px-2">Category</th>
                  {matrixData?.universities.map((u) => (
                    <th key={u.code} className="py-3 px-2 text-center whitespace-nowrap">
                      {u.code}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-right whitespace-nowrap">Live Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={15} className="py-3 px-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : matrixData?.features.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="py-12 text-center text-slate-400">
                      No feature matrix records available.
                    </td>
                  </tr>
                ) : (
                  matrixData?.features.map((f) => (
                    <tr
                      key={f.featureId}
                      onClick={() => navigate(`/features/${f.featureId}`)}
                      className="hover:bg-slate-50 dark:hover:bg-dark-card/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors whitespace-nowrap">
                        {f.featureName}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <Badge variant="feature" size="xs">
                          {f.category}
                        </Badge>
                      </td>
                      {matrixData.universities.map((u) => {
                        const isLive = f.universities[u.code];
                        return (
                          <td key={u.code} className="py-3 px-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {isLive ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                                  <X className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-card text-xs">
                          {f.totalLiveCount} / {matrixData.universities.length}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATALOG LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search master features..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="CORE">Core</option>
              <option value="ADMISSION">Admission</option>
              <option value="PAYMENTS">Payments</option>
              <option value="LEAD_MANAGEMENT">Lead Management</option>
              <option value="INTEGRATION">Integration</option>
              <option value="ANALYTICS">Analytics</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => (
              <div
                key={feat._id}
                onClick={() => navigate(`/features/${feat._id}`)}
                className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border hover:border-brand-primary/50 shadow-sm cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                      {feat.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="feature" size="xs">
                        {feat.category}
                      </Badge>
                      {!feat.isActive && (
                        <Badge variant="failed" size="xs">
                          Inactive
                        </Badge>
                      )}
                      {user?.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFeatureForDelete(feat);
                            setIsDeleteModalOpen(true);
                          }}
                          title={`Delete or Deactivate ${feat.name}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    [{feat.code}]
                  </span>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-2 leading-relaxed line-clamp-2">
                    {feat.description || 'Master feature module deployed across partner university portals.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Live on: <strong className="text-emerald-500 font-bold">{feat.liveUniversitiesCount ?? 0} universities</strong>
                  </span>
                  <span className="font-semibold text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Feature Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Master Feature"
        description="Register a new feature into the catalog to track releases."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFeature} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Feature Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Multi-Step Application Form"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Feature Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                placeholder="e.g. MULTI_STEP_APP_FORM"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FeatureCategory })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
              >
                <option value="CORE">Core</option>
                <option value="ADMISSION">Admission</option>
                <option value="PAYMENTS">Payments</option>
                <option value="LEAD_MANAGEMENT">Lead Management</option>
                <option value="INTEGRATION">Integration</option>
                <option value="ANALYTICS">Analytics</option>
                <option value="COMMUNICATION">Communication</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the feature..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-primary/40 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Create Feature
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Feature Confirmation Modal */}
      <DeleteFeatureModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedFeatureForDelete(null);
        }}
        feature={selectedFeatureForDelete}
        onDeleted={fetchData}
      />
    </div>
  );
};
