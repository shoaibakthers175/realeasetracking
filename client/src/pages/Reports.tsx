import React, { useState, useEffect } from 'react';
import { reportsApi, universitiesApi } from '../api/endpoints';
import { University } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useNotification } from '../context/NotificationContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899'];

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUni, setSelectedUni] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useNotification();

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await reportsApi.getReports({
        university: selectedUni,
        startDate,
        endDate,
      });
      if (res.success && res.data) {
        setReportData(res.data);
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
  }, [selectedUni, startDate, endDate]);

  const handleExportExcel = () => {
    const url = `/api/reports/export/excel?startDate=${startDate}&endDate=${endDate}`;
    window.open(url, '_blank');
    showToast({ type: 'success', title: 'Exporting Excel', message: 'Download initiated.' });
  };

  const handleExportCSV = () => {
    if (!reportData?.releases) return;
    const headers = ['Release Date,Time,University,Feature,Title,Type,Environment,Status,Bug Tickets\n'];
    const rows = reportData.releases.map((r: any) =>
      `"${new Date(r.releaseDate).toISOString().split('T')[0]}","${r.releaseTime}","${(r.university as any)?.code || ''}","${(r.feature as any)?.name || ''}","${r.title}","${r.releaseType}","${r.environment}","${r.status}","${(r.bugTickets || []).map((b: any) => b.ticketId).join('; ')}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ReleaseTrack_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast({ type: 'success', title: 'Exporting CSV', message: 'CSV file downloaded.' });
  };

  const pieData = reportData?.releaseTypeStats?.map((s: any) => ({
    name: s._id,
    value: s.count,
  })) || [];

  const barData = reportData?.releasesByUni?.slice(0, 8).map((u: any) => ({
    code: u.code,
    releases: u.count,
  })) || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-primary" /> Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Real-time deployment reports, university release velocity, bug metrics, and compliance exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="primary"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Period:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <select
          value={selectedUni}
          onChange={(e) => setSelectedUni(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="">All Universities</option>
          {universities.map((u) => (
            <option key={u._id} value={u._id}>
              {u.code} — {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Total Releases</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {reportData?.summary?.totalReleases ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Features</span>
          <div className="text-2xl font-extrabold text-brand-primary mt-1">
            {reportData?.summary?.features ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Enhancements</span>
          <div className="text-2xl font-extrabold text-emerald-500 mt-1">
            {reportData?.summary?.enhancements ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Bug Fixes</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">
            {reportData?.summary?.bugFixes ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Hotfixes</span>
          <div className="text-2xl font-extrabold text-purple-500 mt-1">
            {reportData?.summary?.hotfixes ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-bold">Unis Touched</span>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
            {reportData?.summary?.universitiesTouched ?? 0}
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bar Chart: Releases by University */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Release Volume by University
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161c28',
                    border: '1px solid #1f2737',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="releases" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Release Types Distribution */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Release Category Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161c28',
                    border: '1px solid #1f2737',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
