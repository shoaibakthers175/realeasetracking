import { Request, Response, NextFunction } from 'express';
import { Release } from '../models/Release';
import { sendSuccess } from '../utils/response';

export const getCalendarEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month as string, 10); // 1-12 or 0-11
    const environment = (req.query.environment as string) || '';

    let startDate: Date;
    let endDate: Date;

    if (!isNaN(month)) {
      // Specified month
      const m = month > 0 ? month - 1 : 0;
      startDate = new Date(year, m, 1, 0, 0, 0);
      endDate = new Date(year, m + 1, 0, 23, 59, 59);
    } else {
      // Full year
      startDate = new Date(year, 0, 1, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    const filter: Record<string, any> = {
      releaseDate: { $gte: startDate, $lte: endDate },
    };
    if (environment) {
      filter.environment = environment;
    }

    const releases = await Release.find(filter)
      .populate('university', 'name code type')
      .populate('feature', 'name code category')
      .populate('bugTickets', 'ticketId title priority status')
      .populate('sanityReports', 'sanityStatus passed failed totalTestCases')
      .populate('leads', 'leadId verificationStatus')
      .sort({ releaseDate: 1, releaseTime: 1 });

    // Group releases by date string (YYYY-MM-DD)
    const calendarDaysMap: Record<string, any> = {};

    releases.forEach((rel) => {
      const dateStr = rel.releaseDate.toISOString().split('T')[0];
      if (!calendarDaysMap[dateStr]) {
        calendarDaysMap[dateStr] = {
          date: dateStr,
          totalCount: 0,
          types: {
            FEATURE: 0,
            ENHANCEMENT: 0,
            BUG_FIX: 0,
            HOTFIX: 0,
            OTHER: 0,
          },
          releases: [],
        };
      }

      calendarDaysMap[dateStr].totalCount += 1;
      const typeKey = ['FEATURE', 'ENHANCEMENT', 'BUG_FIX', 'HOTFIX'].includes(rel.releaseType)
        ? rel.releaseType
        : 'OTHER';
      calendarDaysMap[dateStr].types[typeKey] = (calendarDaysMap[dateStr].types[typeKey] || 0) + 1;

      calendarDaysMap[dateStr].releases.push({
        _id: rel._id,
        title: rel.title,
        description: rel.description,
        releaseType: rel.releaseType,
        environment: rel.environment,
        releaseTime: rel.releaseTime,
        status: rel.status,
        version: rel.version,
        university: rel.university,
        feature: rel.feature,
        bugTickets: rel.bugTickets,
        sanityReports: rel.sanityReports,
        leadCount: (rel.leads || []).length,
        sanityStatus: (rel.sanityReports && rel.sanityReports.length > 0)
          ? (rel.sanityReports[0] as any).sanityStatus
          : 'NOT_TESTED',
      });
    });

    return sendSuccess(
      res,
      {
        year,
        month: !isNaN(month) ? month : null,
        days: calendarDaysMap,
        totalReleases: releases.length,
      },
      'Calendar releases fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getDayActivities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params; // e.g. "2026-09-25"
    const parsedDate = new Date(date);

    const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59);

    const releases = await Release.find({
      releaseDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('university', 'name code type primaryEnvironment logoUrl')
      .populate('feature', 'name code category')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads')
      .sort({ releaseTime: -1, createdAt: -1 });

    return sendSuccess(
      res,
      {
        date,
        totalActivities: releases.length,
        releases,
      },
      `Activities for ${date} fetched successfully`
    );
  } catch (error) {
    next(error);
  }
};
