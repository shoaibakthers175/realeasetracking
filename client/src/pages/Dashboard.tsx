import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEnvironment } from '../context/EnvironmentContext';
import { dashboardApi } from '../api/endpoints';
import { DashboardData } from '../types';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RecentLiveActivitiesTable } from '../components/dashboard/RecentLiveActivitiesTable';
import { ReleaseCalendarWidget } from '../components/dashboard/ReleaseCalendarWidget';
import { UniversitiesSummaryCard } from '../components/dashboard/UniversitiesSummaryCard';
import { FeaturesMatrixCard } from '../components/dashboard/FeaturesMatrixCard';
import { LeadTrackingSummaryCard } from '../components/dashboard/LeadTrackingSummaryCard';
import { DateFilter, DateRangeOption } from '../components/common/DateFilter';
import { Building2, Rocket, Layers, Bug, FileCheck2, Users2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { environment } = useEnvironment();
  const [dateRange, setDateRange] = useState<DateRangeOption>('this_month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboard = async (range: DateRangeOption) => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.getDashboardData({
        range,
        environment,
      });
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(dateRange);
  }, [dateRange, environment]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Shoaib';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome Banner & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-dark-muted flex items-center gap-1.5">
            <span>Welcome back, {firstName}</span>
            <span>👋</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Here's what's <span className="text-brand-primary">live</span> across universities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-1">
            Track releases, features, bug fixes, QA activities and lead performance.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex-shrink-0">
          <DateFilter
            value={dateRange}
            onChange={(val) => setDateRange(val)}
          />
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <KpiCard
          title="Total Universities"
          value={dashboardData?.kpi.totalUniversities.value ?? 18}
          trend={dashboardData?.kpi.totalUniversities.trend ?? '+12%'}
          subtext={dashboardData?.kpi.totalUniversities.subtext ?? '+2 this month'}
          isPositive={true}
          icon={Building2}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/universities"
        />

        <KpiCard
          title="Live Releases"
          value={dashboardData?.kpi.liveReleases.value ?? 124}
          trend={dashboardData?.kpi.liveReleases.trend ?? '+17%'}
          subtext={dashboardData?.kpi.liveReleases.subtext ?? '+18 this month'}
          isPositive={dashboardData?.kpi.liveReleases.isPositive ?? true}
          icon={Rocket}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/releases"
        />

        <KpiCard
          title="Features Live"
          value={dashboardData?.kpi.featuresLive.value ?? 86}
          trend={dashboardData?.kpi.featuresLive.trend ?? '+14%'}
          subtext={dashboardData?.kpi.featuresLive.subtext ?? '+12 this month'}
          isPositive={true}
          icon={Layers}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/features"
        />

        <KpiCard
          title="Bug Fixes"
          value={dashboardData?.kpi.bugFixes.value ?? 31}
          trend={dashboardData?.kpi.bugFixes.trend ?? '-8%'}
          subtext={dashboardData?.kpi.bugFixes.subtext ?? '+4 this month'}
          isPositive={dashboardData?.kpi.bugFixes.isPositive ?? false}
          icon={Bug}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/bug-tickets"
        />

        <KpiCard
          title="Sanity Tests"
          value={dashboardData?.kpi.sanityTests.value ?? 118}
          trend={dashboardData?.kpi.sanityTests.trend ?? '+20%'}
          subtext={dashboardData?.kpi.sanityTests.subtext ?? '+20 this month'}
          isPositive={true}
          icon={FileCheck2}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/sanity-reports"
        />

        <KpiCard
          title="Test Leads"
          value={dashboardData?.kpi.testLeads.value ?? 642}
          trend={dashboardData?.kpi.testLeads.trend ?? '+35%'}
          subtext={dashboardData?.kpi.testLeads.subtext ?? '+86 this month'}
          isPositive={true}
          icon={Users2}
          iconColor="text-brand-primary"
          iconBg="bg-brand-500/10"
          linkTo="/leads"
        />
      </div>

      {/* Main Grid: Recent Activities (Left/Center) + Calendar Widget (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <RecentLiveActivitiesTable
            activities={dashboardData?.recentActivities || []}
            isLoading={isLoading}
          />
        </div>

        <div className="xl:col-span-4">
          <ReleaseCalendarWidget />
        </div>
      </div>

      {/* Bottom Grid: 3 Cards (Universities, Features by University Matrix, Lead Tracking) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <UniversitiesSummaryCard
          universities={dashboardData?.universities || []}
          isLoading={isLoading}
        />

        <FeaturesMatrixCard
          matrix={dashboardData?.matrix || { universities: [], features: [], environment: 'PRODUCTION' }}
          isLoading={isLoading}
        />

        <LeadTrackingSummaryCard
          leads={dashboardData?.recentLeads || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
