import React, { useState, useEffect } from 'react';
import { calendarApi, universitiesApi } from '../api/endpoints';
import { University, Release } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Building2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';

export const CalendarPage: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)
  const [calendarDays, setCalendarDays] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dayActivities, setDayActivities] = useState<Release[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEnv, setSelectedEnv] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await calendarApi.getEvents({
          year: currentYear,
          month: currentMonth + 1,
          environment: selectedEnv,
        });
        if (res.success && res.data) {
          setCalendarDays(res.data.days || {});
        }
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      }
    };
    fetchCalendar();
  }, [currentYear, currentMonth, selectedEnv]);

  const handleDateClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
    setIsLoadingDay(true);
    try {
      const res = await calendarApi.getDayActivities(dateStr);
      if (res.success && res.data) {
        setDayActivities(res.data.releases || []);
      }
    } catch (err) {
      console.error('Failed to load day activities:', err);
    } finally {
      setIsLoadingDay(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysGrid.push({ day, isCurrentMonth: false, dateStr });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ day: d, isCurrentMonth: true, dateStr });
  }

  const remaining = 35 - daysGrid.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 0); d++) {
    const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ day: d, isCurrentMonth: false, dateStr });
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-primary" /> Release Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Visual month, week, and day-by-day deployment timeline across all universities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Environment Filter */}
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="">All Environments</option>
            <option value="PRODUCTION">Production</option>
            <option value="STAGING">Staging</option>
            <option value="DEVELOPMENT">Development</option>
          </select>

          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(8);
              handleDateClick('2026-09-25');
            }}
          >
            Today (25 Sep 2026)
          </Button>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 dark:text-dark-muted pb-2 border-b border-slate-100 dark:border-dark-border">
          <span>Monday</span>
          <span>Tuesday</span>
          <span>Wednesday</span>
          <span>Thursday</span>
          <span>Friday</span>
          <span>Saturday</span>
          <span>Sunday</span>
        </div>

        {/* Large Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysGrid.map((item, idx) => {
            const dayInfo = calendarDays[item.dateStr];
            const hasActivity = dayInfo && dayInfo.totalCount > 0;
            const isSelected = selectedDate === item.dateStr;

            return (
              <div
                key={idx}
                onClick={() => handleDateClick(item.dateStr)}
                className={clsx(
                  'min-h-[100px] p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group',
                  isSelected
                    ? 'bg-brand-primary/10 border-brand-primary ring-2 ring-brand-primary/30'
                    : item.isCurrentMonth
                    ? 'bg-slate-50/50 dark:bg-dark-card/40 border-slate-200/60 dark:border-dark-border hover:border-brand-primary/50'
                    : 'bg-transparent border-transparent opacity-40 hover:opacity-75'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      'text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center',
                      isSelected
                        ? 'bg-brand-primary text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    )}
                  >
                    {item.day}
                  </span>
                  {hasActivity && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-primary/10 text-brand-primary">
                      {dayInfo.totalCount} live
                    </span>
                  )}
                </div>

                {/* Release Category Dots & Preview */}
                {hasActivity && (
                  <div className="space-y-1 mt-2">
                    {dayInfo.releases.slice(0, 2).map((r: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded bg-white dark:bg-dark-surface border border-slate-200/60 dark:border-dark-border text-slate-700 dark:text-slate-300 flex items-center gap-1"
                      >
                        <span
                          className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', {
                            'bg-red-500': r.releaseType === 'FEATURE',
                            'bg-emerald-500': r.releaseType === 'ENHANCEMENT',
                            'bg-amber-400': r.releaseType === 'BUG_FIX',
                            'bg-purple-500': r.releaseType === 'HOTFIX',
                          })}
                        />
                        <span className="font-bold text-brand-primary">{(r.university as any)?.code || 'Uni'}</span>
                        <span className="truncate">{r.title}</span>
                      </div>
                    ))}
                    {dayInfo.releases.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-semibold px-1">
                        +{dayInfo.releases.length - 2} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Feature
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Enhancement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Bug Fix
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Hotfix
            </span>
          </div>

          <div>Click any date box to view all releases made live on that date.</div>
        </div>
      </div>

      {/* Date Inspection Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Activities on ${new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
        subtitle="What did we make live on this date?"
        width="lg"
      >
        {isLoadingDay ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-100 dark:bg-dark-card animate-pulse h-20" />
            ))}
          </div>
        ) : dayActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No releases found for this date.
          </div>
        ) : (
          <div className="space-y-3">
            {dayActivities.map((act) => {
              const bug = act.bugTickets && act.bugTickets.length > 0 ? (act.bugTickets[0] as any).ticketId : null;
              const sanity = act.sanityReports && act.sanityReports.length > 0 ? (act.sanityReports[0] as any).sanityStatus : 'NOT_TESTED';

              return (
                <div
                  key={act._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-brand-primary/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {act.releaseTime}
                      </span>
                      <span className="text-slate-400">•</span>
                      <div className="flex items-center gap-1 font-bold text-brand-primary text-xs">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{(act.university as any)?.code || 'Uni'}</span>
                      </div>
                    </div>
                    <Badge variant={act.releaseType.toLowerCase() as any} size="xs">
                      {act.releaseType}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-primary transition-colors">
                    {act.title}
                  </h4>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant={act.environment.toLowerCase() as any} size="xs">
                      {act.environment}
                    </Badge>
                    {bug && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-dark-border text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {bug}
                      </span>
                    )}
                    <Badge variant={sanity === 'PASSED' ? 'passed' : 'failed'} size="xs">
                      Sanity {sanity === 'PASSED' ? 'Passed' : 'Failed'}
                    </Badge>
                    {act.leads && act.leads.length > 0 && (
                      <span className="text-[11px] text-slate-500">
                        {act.leads.length} Leads
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-dark-border flex items-center justify-end">
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        navigate(`/releases/${act._id}`);
                      }}
                      className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Full Release</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
};
