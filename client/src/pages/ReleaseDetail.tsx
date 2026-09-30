import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { releasesApi } from '../api/endpoints';
import { Release, AuditLog } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import {
  Rocket,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  User,
  Bug,
  FileCheck2,
  Users2,
  History,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ReleaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [timeline, setTimeline] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchRelease = async () => {
      setIsLoading(true);
      try {
        const res = await releasesApi.getById(id);
        if (res.success && res.data) {
          setRelease(res.data.release);
          setTimeline(res.data.timeline || []);
        }
      } catch (err: any) {
        showToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelease();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!release) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>Release not found</p>
        <Button onClick={() => navigate('/releases')} variant="primary" size="sm" className="mt-4">
          Back to Live Releases
        </Button>
      </div>
    );
  }

  const sanity = release.sanityReports && release.sanityReports.length > 0 ? release.sanityReports[0] : null;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/releases')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Releases</span>
      </button>

      {/* Release Banner Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-md shadow-brand-glow flex-shrink-0">
            <Rocket className="w-6 h-6 -rotate-45" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {release.title}
              </h1>
              <Badge variant={release.releaseType.toLowerCase() as any} size="xs">
                {release.releaseType}
              </Badge>
              <Badge variant={release.environment.toLowerCase() as any} size="xs">
                {release.environment}
              </Badge>
              <Badge
                variant={release.status === 'LIVE' ? 'live' : release.status === 'ROLLED_BACK' ? 'rolled_back' : 'pending'}
                size="xs"
              >
                {release.status}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-dark-muted">
              <Link
                to={`/universities/${(release.university as any)?._id}`}
                className="flex items-center gap-1 font-bold text-slate-900 dark:text-white hover:text-brand-primary"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                <span>{(release.university as any)?.code}</span>
                <span>—</span>
                <span>{(release.university as any)?.name}</span>
              </Link>

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                {new Date(release.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-primary" />
                {release.releaseTime}
              </span>

              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-primary" />
                Deployed by: {release.deployedBy || 'QA Team'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Details (Left 8 cols) & Audit Timeline (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          {/* Description & Feature overview */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Release Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-dark-muted leading-relaxed">
              {release.description || 'No additional description provided.'}
            </p>
            <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Feature Code:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                {(release.feature as any)?.code || 'FEATURE'}
              </span>
            </div>
          </div>

          {/* Associated Bug Tickets */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-brand-primary" /> Associated Jira Bug Tickets
            </h3>
            {release.bugTickets && release.bugTickets.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-dark-border">
                {release.bugTickets.map((b: any) => (
                  <div key={b._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-brand-primary">
                        <span>{b.ticketId}</span>
                        <span className="text-slate-400 font-sans">•</span>
                        <span className="font-sans text-slate-800 dark:text-slate-200">{b.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Priority: {b.priority}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === 'RESOLVED' ? 'passed' : 'failed'} size="xs">
                        {b.status}
                      </Badge>
                      {b.jiraUrl && (
                        <a
                          href={b.jiraUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-brand-primary hover:underline flex items-center gap-1"
                        >
                          <span>Jira</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No Jira bug tickets linked to this release.</p>
            )}
          </div>

          {/* Sanity Testing Report */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-500" /> Sanity Testing & Evidence
              </h3>
              {sanity && (
                <Badge variant={sanity.sanityStatus === 'PASSED' ? 'passed' : 'failed'} size="xs">
                  {sanity.sanityStatus}
                </Badge>
              )}
            </div>

            {sanity ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-card">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Cases</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{sanity.totalTestCases}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <span className="text-[10px] uppercase font-bold block">Passed</span>
                    <span className="text-lg font-bold">{sanity.passed}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
                    <span className="text-[10px] uppercase font-bold block">Failed</span>
                    <span className="text-lg font-bold">{sanity.failed}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-dark-muted leading-relaxed">
                  {sanity.notes || 'Sanity test cases executed and passed.'}
                </p>

                {sanity.attachments && sanity.attachments.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-400 block mb-1.5">Attached Test Evidence:</span>
                    <div className="flex flex-wrap gap-2">
                      {sanity.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1.5"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{att.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No sanity report filed.</p>
            )}
          </div>

          {/* Test Lead Verification */}
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users2 className="w-4 h-4 text-brand-primary" /> Test Leads Generated
            </h3>
            {release.leads && release.leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2">Lead ID</th>
                      <th className="py-2 px-2">Program</th>
                      <th className="py-2 px-2">Source</th>
                      <th className="py-2 px-2">LSQ</th>
                      <th className="py-2 px-2">Opportunity</th>
                      <th className="py-2 px-2">ERP</th>
                      <th className="py-2 px-2 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                    {release.leads.map((lead: any) => (
                      <tr key={lead._id}>
                        <td className="py-2.5 px-2 font-mono font-bold text-brand-primary">{lead.leadId}</td>
                        <td className="py-2.5 px-2 text-slate-800 dark:text-slate-200">{lead.program}</td>
                        <td className="py-2.5 px-2 text-slate-500">{lead.source}</td>
                        <td className="py-2.5 px-2 font-mono text-[10px]">{lead.lsqStatus}</td>
                        <td className="py-2.5 px-2 font-mono text-[10px]">{lead.opportunityStatus}</td>
                        <td className="py-2.5 px-2 font-mono text-[10px]">{lead.erpStatus}</td>
                        <td className="py-2.5 px-2 text-right">
                          <Badge variant={lead.verificationStatus === 'SUCCESS' ? 'verified' : 'failed'} size="xs">
                            {lead.verificationStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No test leads recorded.</p>
            )}
          </div>
        </div>

        {/* Right 4 cols: Audit Timeline */}
        <div className="lg:col-span-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-brand-primary" /> Audit Timeline
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-dark-border">
              {timeline.length === 0 ? (
                <div className="text-xs text-slate-400">Release logged in audit history.</div>
              ) : (
                timeline.map((log) => (
                  <div key={log._id} className="relative group">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-primary ring-4 ring-white dark:ring-dark-surface" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {log.event.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">
                        {log.details}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>By {log.userName}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
