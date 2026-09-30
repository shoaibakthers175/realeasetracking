import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { universitiesApi } from '../api/endpoints';
import { University, Release, BugTicket, SanityReport, Lead } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import {
  Building2,
  Globe,
  ArrowLeft,
  Layers,
  Rocket,
  Bug,
  FileCheck2,
  Users2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
} from 'lucide-react';

export const UniversityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{
    university: University;
    overview: any;
    features: any[];
    releases: Release[];
    bugTickets: BugTicket[];
    sanityReports: SanityReport[];
    leads: Lead[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'releases' | 'bugs' | 'sanity' | 'leads'>('overview');

  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await universitiesApi.getById(id);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        showToast({ type: 'error', title: 'Error', message: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data || !data.university) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>University not found</p>
        <Button onClick={() => navigate('/universities')} variant="primary" size="sm" className="mt-4">
          Back to Universities
        </Button>
      </div>
    );
  }

  const { university, overview, features, releases, bugTickets, sanityReports, leads } = data;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: null },
    { id: 'features', label: 'Features', icon: Layers, count: overview?.liveFeatures },
    { id: 'releases', label: 'Releases', icon: Rocket, count: releases.length },
    { id: 'bugs', label: 'Bug Tickets', icon: Bug, count: bugTickets.length },
    { id: 'sanity', label: 'Sanity Reports', icon: FileCheck2, count: sanityReports.length },
    { id: 'leads', label: 'Lead IDs', icon: Users2, count: leads.length },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/universities')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Universities</span>
      </button>

      {/* University Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-brand-glow flex-shrink-0">
            {university.code.substring(0, 4)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {university.code}
              </h1>
              <Badge variant={university.type === 'STANDALONE' ? 'standalone' : 'multitenant'} size="xs">
                {university.type === 'STANDALONE' ? 'Standalone' : 'Multi-Tenant'}
              </Badge>
              <Badge variant={university.primaryEnvironment.toLowerCase() as any} size="xs">
                {university.primaryEnvironment}
              </Badge>
              <Badge variant="live" size="xs">
                Live
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-dark-muted mt-0.5">
              {university.name}
            </p>
            {university.productionUrl && (
              <a
                href={university.productionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline mt-1 font-mono"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{university.productionUrl}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/releases?university=${university.code}`)}
            variant="primary"
            size="sm"
            leftIcon={<Rocket className="w-4 h-4" />}
          >
            Create Release
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-dark-border text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Current Env</span>
              <div className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                {overview.currentEnvironment}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Live Features</span>
              <div className="text-lg font-extrabold text-emerald-500 mt-1">
                {overview.liveFeatures} / {overview.totalFeatures}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Releases</span>
              <div className="text-lg font-extrabold text-brand-primary mt-1">
                {overview.totalReleases}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Open Bugs</span>
              <div className="text-lg font-extrabold text-amber-500 mt-1">
                {overview.openBugs}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Sanity Reports</span>
              <div className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                {sanityReports.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Test Leads</span>
              <div className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                {overview.totalLeads}
              </div>
            </div>
          </div>

          {/* Latest Release Card */}
          {overview.latestRelease && (
            <div className="p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latest Live Release</span>
                <Badge variant={overview.latestRelease.releaseType.toLowerCase() as any} size="xs">
                  {overview.latestRelease.releaseType}
                </Badge>
              </div>
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {overview.latestRelease.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                      {new Date(overview.latestRelease.releaseDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-primary" />
                      {overview.latestRelease.releaseTime}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/releases/${overview.latestRelease._id}`)}
                  variant="outline"
                  size="sm"
                >
                  View Release
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Features */}
      {activeTab === 'features' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-800 dark:text-white mb-4">
            Feature Availability Matrix for {university.code}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {features.map((feat) => (
              <div
                key={feat._id}
                className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-dark-card/40 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>{feat.name}</span>
                    <span className="text-xs font-mono text-slate-400">[{feat.code}]</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                    Category: {feat.category}
                  </div>
                </div>
                <div>
                  {feat.isLive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> LIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5" /> NOT LIVE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Releases */}
      {activeTab === 'releases' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-2 px-2">Date & Time</th>
                  <th className="py-2 px-2">Feature / Title</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Environment</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {releases.map((rel) => (
                  <tr key={rel._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/40">
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(rel.releaseDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">{rel.releaseTime}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900 dark:text-white">{rel.title}</div>
                      <div className="text-[11px] text-slate-400">{(rel.feature as any)?.name}</div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={rel.releaseType.toLowerCase() as any} size="xs">
                        {rel.releaseType}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={rel.environment.toLowerCase() as any} size="xs">
                        {rel.environment}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant={rel.status === 'LIVE' ? 'live' : 'failed'} size="xs">
                        {rel.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        onClick={() => navigate(`/releases/${rel._id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Bug Tickets */}
      {activeTab === 'bugs' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-2 px-2">Ticket ID</th>
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2 px-2">Priority</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Jira Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {bugTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">No bug tickets linked.</td>
                  </tr>
                ) : (
                  bugTickets.map((bug) => (
                    <tr key={bug._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/40">
                      <td className="py-3 px-2 font-mono font-bold text-brand-primary">{bug.ticketId}</td>
                      <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{bug.title}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {bug.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={bug.status === 'RESOLVED' ? 'passed' : 'failed'} size="xs">
                          {bug.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {bug.jiraUrl && (
                          <a
                            href={bug.jiraUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>Jira</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Sanity Reports */}
      {activeTab === 'sanity' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-dark-border space-y-4">
            {sanityReports.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No sanity reports found.</div>
            ) : (
              sanityReports.map((san) => (
                <div key={san._id} className="pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{san.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                        Tested by {san.testedBy} on {new Date(san.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={san.sanityStatus === 'PASSED' ? 'passed' : 'failed'} size="xs">
                      {san.sanityStatus}
                    </Badge>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3 text-xs">
                    <span className="font-semibold text-emerald-500">Passed: {san.passed}</span>
                    <span className="font-semibold text-rose-500">Failed: {san.failed}</span>
                    <span className="text-slate-400">Total: {san.totalTestCases}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Lead IDs */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
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
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/40">
                    <td className="py-3 px-2 font-mono font-bold text-brand-primary">{lead.leadId}</td>
                    <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200">{lead.program}</td>
                    <td className="py-3 px-2 text-slate-500">{lead.source}</td>
                    <td className="py-3 px-2 font-mono text-[11px]">{lead.lsqStatus}</td>
                    <td className="py-3 px-2 font-mono text-[11px]">{lead.opportunityStatus}</td>
                    <td className="py-3 px-2 font-mono text-[11px]">{lead.erpStatus}</td>
                    <td className="py-3 px-2 text-right">
                      <Badge variant={lead.verificationStatus === 'SUCCESS' ? 'verified' : 'failed'} size="xs">
                        {lead.verificationStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
