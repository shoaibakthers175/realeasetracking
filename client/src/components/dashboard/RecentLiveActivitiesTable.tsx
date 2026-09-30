import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Release } from '../../types';
import { Badge } from '../common/Badge';
import { Search, Filter, MoreVertical, Building2, ExternalLink } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface RecentLiveActivitiesTableProps {
  activities: Release[];
  isLoading?: boolean;
}

export const RecentLiveActivitiesTable: React.FC<RecentLiveActivitiesTableProps> = ({
  activities,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filtered = activities.filter((act) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      act.title.toLowerCase().includes(query) ||
      (act.university?.code || '').toLowerCase().includes(query) ||
      (act.feature?.name || '').toLowerCase().includes(query) ||
      (act.bugTickets && act.bugTickets.some((b: any) => (b.ticketId || '').toLowerCase().includes(query)))
    );
  });

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Live Activities</h3>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <button className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-border text-slate-500 hover:text-slate-900 dark:text-dark-muted dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition-colors">
            <Filter className="w-3.5 h-3.5 text-brand-primary" />
          </button>

          <Link
            to="/releases"
            className="text-xs font-semibold text-brand-primary hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-1 ml-1"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-dark-border/60 text-[11px] font-bold text-slate-400 dark:text-dark-muted uppercase tracking-wider">
              <th className="py-3 px-2">Date & Time</th>
              <th className="py-3 px-2">University</th>
              <th className="py-3 px-2">Environment</th>
              <th className="py-3 px-2">Feature / Change</th>
              <th className="py-3 px-2">Type</th>
              <th className="py-3 px-2">Bug Ticket</th>
              <th className="py-3 px-2">Sanity</th>
              <th className="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="py-3 px-2">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No recent activities matching filter.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 5).map((rel) => {
                const releaseDateStr = new Date(rel.releaseDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
                const bugTicket = rel.bugTickets && rel.bugTickets.length > 0 ? (rel.bugTickets[0] as any).ticketId : '—';
                const sanityReport = rel.sanityReports && rel.sanityReports.length > 0 ? rel.sanityReports[0] : null;
                const sanityStatus = sanityReport ? (sanityReport as any).sanityStatus : 'NOT_TESTED';

                return (
                  <tr
                    key={rel._id}
                    className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors group"
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{releaseDateStr}</div>
                      <div className="text-[10px] text-slate-400 dark:text-dark-muted">{rel.releaseTime}</div>
                    </td>

                    {/* University */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{rel.university?.code || 'University'}</span>
                      </div>
                    </td>

                    {/* Environment */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <Badge variant={rel.environment.toLowerCase() as any} size="xs">
                        {rel.environment === 'PRODUCTION' ? 'Production' : rel.environment === 'STAGING' ? 'Staging' : 'Development'}
                      </Badge>
                    </td>

                    {/* Feature / Change */}
                    <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                      {rel.title}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <Badge
                        variant={
                          rel.releaseType === 'FEATURE'
                            ? 'feature'
                            : rel.releaseType === 'BUG_FIX'
                            ? 'bugfix'
                            : rel.releaseType === 'ENHANCEMENT'
                            ? 'enhancement'
                            : 'hotfix'
                        }
                        size="xs"
                      >
                        {rel.releaseType === 'BUG_FIX'
                          ? 'Bug Fix'
                          : rel.releaseType === 'ENHANCEMENT'
                          ? 'Enhancement'
                          : rel.releaseType === 'HOTFIX'
                          ? 'Hotfix'
                          : 'Feature'}
                      </Badge>
                    </td>

                    {/* Bug Ticket */}
                    <td className="py-3 px-2 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {bugTicket !== '—' ? (
                        <span className="text-brand-primary font-semibold hover:underline cursor-pointer">
                          {bugTicket}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Sanity Status */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <Badge variant={sanityStatus === 'PASSED' ? 'passed' : sanityStatus === 'FAILED' ? 'failed' : 'pending'} size="xs">
                        {sanityStatus === 'PASSED' ? 'Passed' : sanityStatus === 'FAILED' ? 'Failed' : 'Partial'}
                      </Badge>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/releases/${rel._id}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-brand-primary hover:text-white bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/30 rounded-lg transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/releases/${rel._id}`)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
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
  );
};
