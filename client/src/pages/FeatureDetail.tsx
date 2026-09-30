import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { featuresApi } from '../api/endpoints';
import { Feature, Release } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import {
  Layers,
  ArrowLeft,
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const FeatureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    feature: Feature;
    releases: Release[];
    universityStatus: Array<{
      _id: string;
      code: string;
      name: string;
      type: string;
      isLive: boolean;
      latestRelease?: Release | null;
    }>;
    totalLiveUniversities: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchFeature = async () => {
      setIsLoading(true);
      try {
        const res = await featuresApi.getById(id);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        showToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeature();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.feature) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>Feature not found</p>
        <Button onClick={() => navigate('/features')} variant="primary" size="sm" className="mt-4">
          Back to Features
        </Button>
      </div>
    );
  }

  const { feature, releases, universityStatus, totalLiveUniversities } = data;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/features')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Features</span>
      </button>

      {/* Feature Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-primary flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {feature.name}
              </h1>
              <Badge variant="feature" size="xs">
                {feature.category}
              </Badge>
              <span className="font-mono text-xs text-slate-400">[{feature.code}]</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-dark-muted mt-1 leading-relaxed">
              {feature.description || 'Master feature capability across universities.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Currently Live On</span>
            <div className="text-lg font-extrabold text-emerald-500">
              {totalLiveUniversities} / {universityStatus.length} Universities
            </div>
          </div>
        </div>
      </div>

      {/* University Live Status Grid */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          University Deployment Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {universityStatus.map((u) => (
            <div
              key={u._id}
              onClick={() => navigate(`/universities/${u._id}`)}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-primary/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-brand-primary flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                    {u.code}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-dark-muted truncate max-w-[140px]">
                    {u.name}
                  </div>
                </div>
              </div>

              <div>
                {u.isLive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <XCircle className="w-3 h-3" /> Not Live
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Release History for this Feature */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Release History for {feature.name}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">University</th>
                <th className="py-2.5 px-3">Release Title</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Environment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {releases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No releases recorded for this feature yet.
                  </td>
                </tr>
              ) : (
                releases.map((rel) => (
                  <tr key={rel._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/40">
                    <td className="py-3 px-3 whitespace-nowrap">
                      {new Date(rel.releaseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-brand-primary">
                      {(rel.university as any)?.code || 'University'}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      {rel.title}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={rel.releaseType.toLowerCase() as any} size="xs">
                        {rel.releaseType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={rel.environment.toLowerCase() as any} size="xs">
                        {rel.environment}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={rel.status === 'LIVE' ? 'live' : 'failed'} size="xs">
                        {rel.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        onClick={() => navigate(`/releases/${rel._id}`)}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
