import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/endpoints';
import { AuditLog } from '../types';
import { Skeleton } from '../components/common/Skeleton';
import { History, Search, Filter, Shield } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await auditApi.getLogs({ search, event: eventFilter, limit: 50 });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, eventFilter]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-brand-primary" /> Audit Logs & Change History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
          Complete, tamper-evident audit history of all release deployments, rollbacks, bug attachments, and user sessions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by user, action..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Audit Events</option>
          <option value="CREATE_RELEASE">Create Release</option>
          <option value="MARK_RELEASE_LIVE">Mark Release Live</option>
          <option value="ROLLBACK_RELEASE">Rollback Release</option>
          <option value="CREATE_BUG">Create Bug</option>
          <option value="CREATE_LEAD">Create Lead</option>
          <option value="UPLOAD_REPORT">Upload Report</option>
          <option value="LOGIN">User Login</option>
          <option value="LOGOUT">User Logout</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-border text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Event Action</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-3">Details / Audit Message</th>
                <th className="py-3 px-3 text-right">IP Address</th>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-dark-card/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Event Action */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-brand-primary">
                        {log.event}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {log.userName}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300">
                        {log.userRole}
                      </span>
                    </td>

                    {/* Entity Type */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {log.entityType}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-[320px]">
                      {log.details}
                    </td>

                    {/* IP */}
                    <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
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
