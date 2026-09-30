import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Building2, ExternalLink, Rocket } from 'lucide-react';
import { calendarApi } from '../../api/endpoints';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Release } from '../../types';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface CalendarDayData {
  date: string;
  totalCount: number;
  types: {
    FEATURE: number;
    ENHANCEMENT: number;
    BUG_FIX: number;
    HOTFIX: number;
    OTHER: number;
  };
  releases: any[];
}

export const ReleaseCalendarWidget: React.FC = () => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 = September (0-indexed)
  const [calendarDays, setCalendarDays] = useState<Record<string, CalendarDayData>>({});
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-25');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [dayActivities, setDayActivities] = useState<Release[]>([]);
  const [isLoadingDay, setIsLoadingDay] = useState<boolean>(false);
  const navigate = useNavigate();

  // Load calendar events
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await calendarApi.getEvents({
          year: currentYear,
          month: currentMonth + 1,
        });
        if (res.success && res.data) {
          setCalendarDays(res.data.days || {});
        }
      } catch (err) {
        console.error('Failed to load calendar events:', err);
      }
    };
    fetchCalendar();
  }, [currentYear, currentMonth]);

  // Handle clicking a date
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

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September 2026
    handleDateClick('2026-09-25');
  };

  // Generate calendar grid
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 0 = Mon
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const daysGrid: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month trailing days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    daysGrid.push({ day, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = 35 - daysGrid.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 0); d++) {
    const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysGrid.push({ day: d, isCurrentMonth: false, dateStr });
  }

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{monthName}</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-dark-muted dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-dark-muted dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-dark-card hover:bg-slate-200 dark:hover:bg-dark-hover rounded-lg transition-colors ml-1"
          >
            Today
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 dark:text-dark-muted my-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {daysGrid.map((item, idx) => {
          const dayInfo = calendarDays[item.dateStr];
          const hasActivity = dayInfo && dayInfo.totalCount > 0;
          const isSelected = selectedDate === item.dateStr;

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(item.dateStr)}
              className={clsx(
                'min-h-[42px] p-1 rounded-xl cursor-pointer flex flex-col items-center justify-start transition-all relative',
                isSelected
                  ? 'bg-brand-primary text-white font-bold shadow-md shadow-brand-glow ring-2 ring-brand-primary/40'
                  : item.isCurrentMonth
                  ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-dark-card/30'
              )}
            >
              <span className="text-xs">{item.day}</span>

              {/* Indicator Dots */}
              {hasActivity && (
                <div className="flex items-center gap-0.5 mt-1">
                  {dayInfo.types.FEATURE > 0 && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white' : 'bg-red-500')} />
                  )}
                  {dayInfo.types.ENHANCEMENT > 0 && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-emerald-500')} />
                  )}
                  {dayInfo.types.BUG_FIX > 0 && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-amber-400')} />
                  )}
                  {dayInfo.types.HOTFIX > 0 && (
                    <span className={clsx('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/80' : 'bg-purple-500')} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-dark-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Feature</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Enhancement</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Bug Fix</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Hotfix</span>
        </div>
      </div>

      {/* Activities on Clicked Date Drawer */}
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
            No live releases recorded on this date.
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
                        <span>{act.university?.code || 'Uni'}</span>
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
                      <span className="text-[11px] text-slate-500 dark:text-dark-muted">
                        {act.leads.length} Leads Generated
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
