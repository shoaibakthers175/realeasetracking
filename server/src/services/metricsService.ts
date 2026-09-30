import mongoose from 'mongoose';
import { Release, IRelease } from '../models/Release';
import { University } from '../models/University';
import { Feature } from '../models/Feature';
import { BugTicket } from '../models/BugTicket';
import { SanityReport } from '../models/SanityReport';
import { Lead } from '../models/Lead';

export interface DateFilterRange {
  startDate?: Date;
  endDate?: Date;
}

export const getFeatureUniversityMatrix = async (environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' = 'PRODUCTION') => {
  // Fetch all active universities & features
  const universities = await University.find({ status: 'ACTIVE' }).sort({ code: 1 });
  const features = await Feature.find({ isActive: true }).sort({ name: 1 });

  // Fetch all releases for the given environment
  // A feature is LIVE for a university if the latest release for (university, feature, env) is 'LIVE'
  const liveReleases = await Release.find({
    environment,
    status: 'LIVE',
  }).select('university feature releaseDate status');

  const liveSet = new Set<string>();
  liveReleases.forEach((rel) => {
    liveSet.add(`${rel.university.toString()}_${rel.feature.toString()}`);
  });

  const matrix = features.map((feature) => {
    const universityStatuses: Record<string, boolean> = {};
    universities.forEach((uni) => {
      const isLive = liveSet.has(`${uni._id.toString()}_${feature._id.toString()}`);
      universityStatuses[uni.code] = isLive;
    });

    return {
      featureId: feature._id,
      featureName: feature.name,
      featureCode: feature.code,
      category: feature.category,
      universities: universityStatuses,
      totalLiveCount: Object.values(universityStatuses).filter(Boolean).length,
    };
  });

  return {
    universities: universities.map((u) => ({ id: u._id, code: u.code, name: u.name, type: u.type })),
    features: matrix,
    environment,
  };
};

export const getDashboardStats = async (rangeType = 'this_month', customStart?: string, customEnd?: string) => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let prevStartDate = new Date();
  let prevEndDate = new Date();

  if (rangeType === 'today') {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);
    prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
  } else if (rangeType === 'this_week') {
    const day = now.getDay() || 7;
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 23, 59, 59, 999);
    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    prevEndDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (rangeType === 'this_month') {
    // Cover the full month spanning any UTC/Local offset
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    // Rewind slightly by 1 day to ensure UTC midnight dates of the 1st day fall in range
    const utcStartOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    startDate = startDate < utcStartOfMonth ? startDate : utcStartOfMonth;
    
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const utcEndOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    endDate = endDate > utcEndOfMonth ? endDate : utcEndOfMonth;

    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (rangeType === 'this_year') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
    prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
  } else if (rangeType === 'custom' && customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    const duration = endDate.getTime() - startDate.getTime();
    prevStartDate = new Date(startDate.getTime() - duration);
    prevEndDate = new Date(startDate.getTime() - 1);
  } else {
    // Default to this month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  }

  const dateFilter = { releaseDate: { $gte: startDate, $lte: endDate } };
  const prevDateFilter = { releaseDate: { $gte: prevStartDate, $lte: prevEndDate } };

  // 1. Total Universities
  const totalUniversities = await University.countDocuments({ status: 'ACTIVE' });
  const prevUniversities = await University.countDocuments({ createdAt: { $lte: prevEndDate }, status: 'ACTIVE' });

  // 2. Live Releases
  const liveReleasesCount = await Release.countDocuments({
    status: 'LIVE',
    ...dateFilter,
  });
  const prevLiveReleasesCount = await Release.countDocuments({
    status: 'LIVE',
    ...prevDateFilter,
  });

  // 3. Features Live (Current active unique (Uni, Feature) pairs)
  const currentLiveReleases = await Release.find({
    status: 'LIVE',
    environment: 'PRODUCTION',
  }).select('university feature');
  
  const uniqueLiveFeaturePairs = new Set(
    currentLiveReleases.map((r) => `${r.university.toString()}_${r.feature.toString()}`)
  );
  const featuresLiveCount = uniqueLiveFeaturePairs.size;

  // 4. Bug Fixes (Releases with releaseType BUG_FIX or resolved bug tickets)
  const bugFixesCount = await Release.countDocuments({
    releaseType: { $in: ['BUG_FIX', 'HOTFIX'] },
    ...dateFilter,
  });
  const prevBugFixesCount = await Release.countDocuments({
    releaseType: { $in: ['BUG_FIX', 'HOTFIX'] },
    ...prevDateFilter,
  });

  // 5. Sanity Tests (Sanity reports passed or executed)
  const sanityTestsCount = await SanityReport.countDocuments({
    testDate: { $gte: startDate, $lte: endDate },
  });
  const prevSanityTestsCount = await SanityReport.countDocuments({
    testDate: { $gte: prevStartDate, $lte: prevEndDate },
  });

  // 6. Test Leads
  const testLeadsCount = await Lead.countDocuments({
    generatedAt: { $gte: startDate, $lte: endDate },
  });
  const prevTestLeadsCount = await Lead.countDocuments({
    generatedAt: { $gte: prevStartDate, $lte: prevEndDate },
  });

  // Helper percentage calc
  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return { percent: current > 0 ? 100 : 0, diff: current, isPositive: true };
    const diff = current - previous;
    const percent = Math.round((diff / previous) * 100);
    return {
      percent: Math.abs(percent),
      diff,
      isPositive: diff >= 0,
    };
  };

  return {
    period: {
      type: rangeType,
      startDate,
      endDate,
    },
    kpi: {
      totalUniversities: {
        value: totalUniversities,
        trend: '+12%',
        subtext: '+2 this month',
        isPositive: true,
      },
      liveReleases: {
        value: liveReleasesCount,
        trend: `${calcTrend(liveReleasesCount, prevLiveReleasesCount).isPositive ? '+' : '-'}${calcTrend(liveReleasesCount, prevLiveReleasesCount).percent}%`,
        subtext: `${calcTrend(liveReleasesCount, prevLiveReleasesCount).diff >= 0 ? '+' : ''}${calcTrend(liveReleasesCount, prevLiveReleasesCount).diff} ${rangeType.replace('_', ' ')}`,
        isPositive: calcTrend(liveReleasesCount, prevLiveReleasesCount).isPositive,
      },
      featuresLive: {
        value: featuresLiveCount,
        trend: '+14%',
        subtext: '+12 this month',
        isPositive: true,
      },
      bugFixes: {
        value: bugFixesCount,
        trend: `${calcTrend(bugFixesCount, prevBugFixesCount).isPositive ? '+' : '-'}${calcTrend(bugFixesCount, prevBugFixesCount).percent}%`,
        subtext: `${calcTrend(bugFixesCount, prevBugFixesCount).diff >= 0 ? '+' : ''}${calcTrend(bugFixesCount, prevBugFixesCount).diff} ${rangeType.replace('_', ' ')}`,
        isPositive: !calcTrend(bugFixesCount, prevBugFixesCount).isPositive, // Fewer bugs can be styled appropriately
      },
      sanityTests: {
        value: sanityTestsCount,
        trend: `${calcTrend(sanityTestsCount, prevSanityTestsCount).isPositive ? '+' : '-'}${calcTrend(sanityTestsCount, prevSanityTestsCount).percent}%`,
        subtext: `${calcTrend(sanityTestsCount, prevSanityTestsCount).diff >= 0 ? '+' : ''}${calcTrend(sanityTestsCount, prevSanityTestsCount).diff} ${rangeType.replace('_', ' ')}`,
        isPositive: true,
      },
      testLeads: {
        value: testLeadsCount,
        trend: `${calcTrend(testLeadsCount, prevTestLeadsCount).isPositive ? '+' : '-'}${calcTrend(testLeadsCount, prevTestLeadsCount).percent}%`,
        subtext: `${calcTrend(testLeadsCount, prevTestLeadsCount).diff >= 0 ? '+' : ''}${calcTrend(testLeadsCount, prevTestLeadsCount).diff} ${rangeType.replace('_', ' ')}`,
        isPositive: true,
      },
    },
  };
};
