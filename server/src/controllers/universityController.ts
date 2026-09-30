import { Request, Response, NextFunction } from 'express';
import { University } from '../models/University';
import { Release } from '../models/Release';
import { Feature } from '../models/Feature';
import { BugTicket } from '../models/BugTicket';
import { SanityReport } from '../models/SanityReport';
import { Lead } from '../models/Lead';
import { sendSuccess, sendError, AppError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getUniversities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const type = (req.query.type as string) || '';
    const environment = (req.query.environment as string) || '';

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (environment) filter.primaryEnvironment = environment;

    const skip = (page - 1) * limit;
    const total = await University.countDocuments(filter);
    const universities = await University.find(filter)
      .sort({ code: 1 })
      .skip(skip)
      .limit(limit);

    // Compute live features count and latest release for each university
    const enhancedUniversities = await Promise.all(
      universities.map(async (uni) => {
        const liveReleases = await Release.find({
          university: uni._id,
          environment: 'PRODUCTION',
          status: 'LIVE',
        }).select('feature');

        const uniqueLiveFeatures = new Set(liveReleases.map((r) => r.feature.toString()));

        const latestRelease = await Release.findOne({ university: uni._id })
          .populate('feature', 'name code')
          .sort({ releaseDate: -1, createdAt: -1 });

        return {
          ...uni.toObject(),
          featuresLiveCount: uniqueLiveFeatures.size,
          latestRelease: latestRelease
            ? {
                id: latestRelease._id,
                title: latestRelease.title,
                date: latestRelease.releaseDate,
                time: latestRelease.releaseTime,
                featureName: (latestRelease.feature as any)?.name || 'Feature',
                releaseType: latestRelease.releaseType,
                environment: latestRelease.environment,
                status: latestRelease.status,
              }
            : null,
        };
      })
    );

    return sendSuccess(
      res,
      enhancedUniversities,
      'Universities fetched successfully',
      200,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getUniversityById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const university = await University.findById(id);
    if (!university) {
      return sendError(res, 'University not found', 404, 'NOT_FOUND');
    }

    // 1. Fetch live features list for this university
    const liveReleases = await Release.find({
      university: university._id,
      environment: 'PRODUCTION',
      status: 'LIVE',
    }).populate('feature');

    const liveFeatureMap = new Map<string, any>();
    liveReleases.forEach((rel) => {
      if (rel.feature) {
        liveFeatureMap.set((rel.feature as any)._id.toString(), rel.feature);
      }
    });

    const allFeatures = await Feature.find({ isActive: true });
    const featuresStatusList = allFeatures.map((feat) => ({
      _id: feat._id,
      name: feat.name,
      code: feat.code,
      category: feat.category,
      isLive: liveFeatureMap.has(feat._id.toString()),
    }));

    // 2. Releases history
    const releases = await Release.find({ university: university._id })
      .populate('feature', 'name code')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads')
      .sort({ releaseDate: -1, createdAt: -1 });

    // 3. Bug Tickets
    const bugTickets = await BugTicket.find({ university: university._id })
      .sort({ createdAt: -1 });

    // 4. Sanity Reports
    const sanityReports = await SanityReport.find({ university: university._id })
      .populate('release', 'title releaseDate environment')
      .sort({ testDate: -1, createdAt: -1 });

    // 5. Test Leads
    const leads = await Lead.find({ university: university._id })
      .populate('release', 'title releaseDate')
      .sort({ generatedAt: -1, createdAt: -1 });

    // 6. Overview statistics
    const openBugsCount = await BugTicket.countDocuments({
      university: university._id,
      status: { $in: ['OPEN', 'IN_PROGRESS', 'REOPENED'] },
    });

    const overview = {
      currentEnvironment: university.primaryEnvironment,
      totalFeatures: allFeatures.length,
      liveFeatures: liveFeatureMap.size,
      totalReleases: releases.length,
      openBugs: openBugsCount,
      totalLeads: leads.length,
      latestRelease: releases.length > 0 ? releases[0] : null,
    };

    return sendSuccess(
      res,
      {
        university,
        overview,
        features: featuresStatusList,
        releases,
        bugTickets,
        sanityReports,
        leads,
      },
      'University detail fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const createUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      code,
      type,
      productionUrl,
      stagingUrl,
      developmentUrl,
      tenantId,
      status,
      primaryEnvironment,
      logoUrl,
      location,
      contactEmail,
      notes,
    } = req.body;

    if (!name || !code || !type) {
      return sendError(res, 'Name, unique Code, and Type are required', 400, 'MISSING_FIELDS');
    }

    const existingCode = await University.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return sendError(res, `University with code '${code.toUpperCase()}' already exists`, 409, 'DUPLICATE_CODE');
    }

    const university = await University.create({
      name,
      code: code.toUpperCase(),
      type,
      productionUrl,
      stagingUrl,
      developmentUrl,
      tenantId,
      status: status || 'ACTIVE',
      primaryEnvironment: primaryEnvironment || 'PRODUCTION',
      logoUrl,
      location,
      contactEmail,
      notes,
    });

    await logAudit({
      event: 'CREATE_UNIVERSITY',
      entityType: 'University',
      entityId: university._id,
      entityTitle: `${university.code} - ${university.name}`,
      details: `Created new university ${university.name} (${university.type})`,
      req,
      notify: {
        title: 'New University Added',
        message: `${university.name} (${university.code}) was added to ReleaseTrack.`,
        type: 'SYSTEM',
      },
    });

    return sendSuccess(res, university, 'University created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.toUpperCase();
      const existing = await University.findOne({
        code: updates.code,
        _id: { $ne: id },
      });
      if (existing) {
        return sendError(res, `University code '${updates.code}' is already in use`, 409, 'DUPLICATE_CODE');
      }
    }

    const university = await University.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!university) {
      return sendError(res, 'University not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPDATE_UNIVERSITY',
      entityType: 'University',
      entityId: university._id,
      entityTitle: `${university.code} - ${university.name}`,
      details: `Updated university ${university.code}`,
      req,
    });

    return sendSuccess(res, university, 'University updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const university = await University.findById(id);
    if (!university) {
      return sendError(res, 'University not found', 404, 'NOT_FOUND');
    }

    // Check if releases exist
    const releasesCount = await Release.countDocuments({ university: id });
    if (releasesCount > 0) {
      // Soft-delete by setting INACTIVE
      university.status = 'INACTIVE';
      await university.save();
      await logAudit({
        event: 'UPDATE_UNIVERSITY',
        entityType: 'University',
        entityId: university._id,
        entityTitle: `${university.code} - ${university.name}`,
        details: `Deactivated university ${university.code} (${releasesCount} linked releases retained)`,
        req,
      });
      return sendSuccess(res, university, 'University marked as INACTIVE because it has active release history.');
    }

    await University.findByIdAndDelete(id);
    await logAudit({
      event: 'DELETE_UNIVERSITY',
      entityType: 'University',
      entityId: id,
      entityTitle: `${university.code} - ${university.name}`,
      details: `Deleted university ${university.code}`,
      req,
    });

    return sendSuccess(res, null, 'University deleted successfully');
  } catch (error) {
    next(error);
  }
};
