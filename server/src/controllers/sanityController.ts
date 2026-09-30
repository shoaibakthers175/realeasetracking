import { Request, Response, NextFunction } from 'express';
import { SanityReport } from '../models/SanityReport';
import { Release } from '../models/Release';
import { University } from '../models/University';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getSanityReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const environment = (req.query.environment as string) || '';
    const university = (req.query.university as string) || '';

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { testedBy: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.sanityStatus = status;
    if (environment) filter.environment = environment;
    if (university) {
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        filter.university = university;
      } else {
        const uniDoc = await University.findOne({ code: university.toUpperCase() });
        if (uniDoc) filter.university = uniDoc._id;
      }
    }

    const skip = (page - 1) * limit;
    const total = await SanityReport.countDocuments(filter);
    const reports = await SanityReport.find(filter)
      .populate('university', 'name code type primaryEnvironment')
      .populate('release', 'title releaseDate environment status releaseType')
      .sort({ testDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, reports, 'Sanity reports fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getSanityReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const report = await SanityReport.findById(id)
      .populate('university')
      .populate('release');

    if (!report) {
      return sendError(res, 'Sanity report not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, report, 'Sanity report fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createSanityReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      release,
      university,
      sanityStatus,
      testedBy,
      testDate,
      testTime,
      environment,
      totalTestCases,
      passed,
      failed,
      blocked,
      notes,
      attachments,
    } = req.body;

    if (!title) {
      return sendError(res, 'Sanity report title is required', 400, 'MISSING_TITLE');
    }

    let uniId: any = undefined;
    if (university && typeof university === 'string' && university.trim().length > 0) {
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        uniId = university;
      } else {
        const u = await University.findOne({ code: university.toUpperCase() });
        if (u) uniId = u._id;
      }
    }

    let relId: any = undefined;
    if (release && typeof release === 'string' && release.match(/^[0-9a-fA-F]{24}$/)) {
      relId = release;
    }

    const report = await SanityReport.create({
      title,
      release: relId,
      university: uniId,
      sanityStatus: sanityStatus || 'PASSED',
      testedBy: testedBy || req.user?.name || 'QA Lead',
      testDate: testDate ? new Date(testDate) : new Date(),
      testTime: testTime || '04:00 PM',
      environment: environment || 'PRODUCTION',
      totalTestCases: totalTestCases !== undefined ? Number(totalTestCases) : 10,
      passed: passed !== undefined ? Number(passed) : 10,
      failed: failed !== undefined ? Number(failed) : 0,
      blocked: blocked !== undefined ? Number(blocked) : 0,
      notes: notes || '',
      attachments: attachments || [],
    });

    if (relId) {
      await Release.findByIdAndUpdate(relId, {
        $addToSet: { sanityReports: report._id },
      });
    }

    await logAudit({
      event: 'UPLOAD_REPORT',
      entityType: 'SanityReport',
      entityId: report._id,
      entityTitle: report.title,
      details: `Created Sanity Report '${report.title}' with status ${report.sanityStatus} (${report.passed}/${report.totalTestCases} passed)`,
      req,
    });

    return sendSuccess(res, report, 'Sanity report created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSanityReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.university === '') delete updates.university;
    if (updates.release === '') delete updates.release;

    const report = await SanityReport.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('university', 'name code')
      .populate('release', 'title releaseDate');

    if (!report) {
      return sendError(res, 'Sanity report not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPLOAD_REPORT',
      entityType: 'SanityReport',
      entityId: report._id,
      entityTitle: report.title,
      details: `Updated Sanity Report '${report.title}'`,
      req,
    });

    return sendSuccess(res, report, 'Sanity report updated successfully');
  } catch (error) {
    next(error);
  }
};
