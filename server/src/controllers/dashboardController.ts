import { Request, Response, NextFunction } from 'express';
import { getDashboardStats, getFeatureUniversityMatrix } from '../services/metricsService';
import { Release } from '../models/Release';
import { University } from '../models/University';
import { Lead } from '../models/Lead';
import { sendSuccess } from '../utils/response';

export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = (req.query.range as string) || 'this_month';
    const customStart = req.query.startDate as string;
    const customEnd = req.query.endDate as string;
    const environment = (req.query.environment as any) || 'PRODUCTION';

    // 1. Dynamic KPI Stats
    const stats = await getDashboardStats(range, customStart, customEnd);

    // 2. Recent Live Activities
    const recentActivities = await Release.find({
      status: 'LIVE',
      ...(environment !== 'ALL' ? { environment } : {}),
    })
      .populate('university', 'name code type primaryEnvironment')
      .populate('feature', 'name code category')
      .populate('bugTickets', 'ticketId title priority status')
      .populate('sanityReports', 'sanityStatus passed failed totalTestCases')
      .populate('leads', 'leadId verificationStatus')
      .sort({ releaseDate: -1, releaseTime: -1, createdAt: -1 })
      .limit(10);

    // 3. Mini Universities Summary (First 5 universities)
    const universities = await University.find({ status: 'ACTIVE' })
      .sort({ code: 1 })
      .limit(5);

    // 4. Dynamic Feature Matrix (Top 5 features)
    const fullMatrix = await getFeatureUniversityMatrix(environment === 'ALL' ? 'PRODUCTION' : environment);
    const topFeaturesMatrix = {
      universities: fullMatrix.universities.slice(0, 5),
      features: fullMatrix.features.slice(0, 5),
    };

    // 5. Recent Lead Tracking (Latest 5 test leads)
    const recentLeads = await Lead.find()
      .populate('university', 'name code')
      .populate('release', 'title releaseDate')
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(5);

    return sendSuccess(
      res,
      {
        kpi: stats.kpi,
        period: stats.period,
        recentActivities,
        universities,
        matrix: topFeaturesMatrix,
        recentLeads,
      },
      'Dashboard data loaded successfully'
    );
  } catch (error) {
    next(error);
  }
};
