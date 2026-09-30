import { Request, Response, NextFunction } from 'express';
import { Release } from '../models/Release';
import { University } from '../models/University';
import { Feature } from '../models/Feature';
import { BugTicket } from '../models/BugTicket';
import { SanityReport } from '../models/SanityReport';
import { Lead } from '../models/Lead';
import { sendSuccess, sendError } from '../utils/response';
import * as XLSX from 'xlsx';

export const getReportsData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportType = (req.query.type as string) || 'monthly'; // 'daily' | 'weekly' | 'monthly' | 'university' | 'feature' | 'bug' | 'sanity' | 'lead'
    const universityId = req.query.university as string;
    const startDateQuery = req.query.startDate as string;
    const endDateQuery = req.query.endDate as string;

    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    if (startDateQuery) startDate = new Date(startDateQuery);
    if (endDateQuery) endDate = new Date(endDateQuery);

    const dateFilter: Record<string, any> = {
      releaseDate: { $gte: startDate, $lte: endDate },
    };
    if (universityId) {
      dateFilter.university = universityId;
    }

    // 1. Release Breakdown by Type
    const releaseTypeStats = await Release.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$releaseType', count: { $sum: 1 } } },
    ]);

    // 2. Releases by University
    const releasesByUni = await Release.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $lookup: { from: 'universities', localField: '_id', foreignField: '_id', as: 'uni' } },
      { $unwind: '$uni' },
      { $project: { code: '$uni.code', name: '$uni.name', count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // 3. Releases by Environment
    const releasesByEnv = await Release.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$environment', count: { $sum: 1 } } },
    ]);

    // 4. Sanity Testing Results
    const sanityStats = await SanityReport.aggregate([
      { $match: { testDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$sanityStatus',
          count: { $sum: 1 },
          totalCases: { $sum: '$totalTestCases' },
          passedCases: { $sum: '$passed' },
          failedCases: { $sum: '$failed' },
        },
      },
    ]);

    // 5. Lead Verification Statuses
    const leadStats = await Lead.aggregate([
      { $match: { generatedAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 },
          lsqCreated: { $sum: { $cond: [{ $eq: ['$lsqStatus', 'CREATED'] }, 1, 0] } },
          oppCreated: { $sum: { $cond: [{ $eq: ['$opportunityStatus', 'CREATED'] }, 1, 0] } },
          erpCreated: { $sum: { $cond: [{ $eq: ['$erpStatus', 'CREATED'] }, 1, 0] } },
        },
      },
    ]);

    // 6. Bug priority distribution
    const bugStats = await BugTicket.aggregate([
      { $match: { createdDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // 7. Full detailed records for table
    const detailedReleases = await Release.find(dateFilter)
      .populate('university', 'name code type')
      .populate('feature', 'name code')
      .populate('bugTickets', 'ticketId status')
      .populate('sanityReports', 'sanityStatus passed failed')
      .populate('leads', 'leadId verificationStatus')
      .sort({ releaseDate: -1 });

    const totalReleases = detailedReleases.length;
    const featuresCount = detailedReleases.filter((r) => r.releaseType === 'FEATURE').length;
    const enhancementsCount = detailedReleases.filter((r) => r.releaseType === 'ENHANCEMENT').length;
    const bugFixesCount = detailedReleases.filter((r) => r.releaseType === 'BUG_FIX').length;
    const hotfixesCount = detailedReleases.filter((r) => r.releaseType === 'HOTFIX').length;
    const uniqueUnisTouched = new Set(detailedReleases.map((r) => (r.university as any)?._id?.toString())).size;

    return sendSuccess(
      res,
      {
        period: { startDate, endDate },
        summary: {
          totalReleases,
          features: featuresCount,
          enhancements: enhancementsCount,
          bugFixes: bugFixesCount,
          hotfixes: hotfixesCount,
          universitiesTouched: uniqueUnisTouched,
        },
        releaseTypeStats,
        releasesByUni,
        releasesByEnv,
        sanityStats,
        leadStats,
        bugStats,
        releases: detailedReleases,
      },
      'Report generated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const exportReportExcel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDateQuery = req.query.startDate as string;
    const endDateQuery = req.query.endDate as string;

    const dateFilter: Record<string, any> = {};
    if (startDateQuery || endDateQuery) {
      dateFilter.releaseDate = {};
      if (startDateQuery) dateFilter.releaseDate.$gte = new Date(startDateQuery);
      if (endDateQuery) dateFilter.releaseDate.$lte = new Date(endDateQuery);
    }

    const releases = await Release.find(dateFilter)
      .populate('university', 'name code type')
      .populate('feature', 'name code')
      .populate('bugTickets', 'ticketId status')
      .populate('sanityReports', 'sanityStatus')
      .sort({ releaseDate: -1 });

    const rows = releases.map((r, i) => ({
      '#': i + 1,
      'Release Date': r.releaseDate.toISOString().split('T')[0],
      'Release Time': r.releaseTime,
      'University': (r.university as any)?.code || '',
      'University Name': (r.university as any)?.name || '',
      'Feature': (r.feature as any)?.name || '',
      'Title': r.title,
      'Release Type': r.releaseType,
      'Environment': r.environment,
      'Status': r.status,
      'Bug Tickets': (r.bugTickets || []).map((b: any) => b.ticketId).join(', '),
      'Sanity Status': (r.sanityReports && r.sanityReports.length > 0) ? (r.sanityReports[0] as any).sanityStatus : 'NOT_TESTED',
      'Deployed By': r.deployedBy,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Releases');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="ReleaseTrack_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};
