import { Request, Response, NextFunction } from 'express';
import { Feature } from '../models/Feature';
import { Release } from '../models/Release';
import { University } from '../models/University';
import { sendSuccess, sendError } from '../utils/response';
import { getFeatureUniversityMatrix } from '../services/metricsService';
import { logAudit } from '../services/auditService';

export const getFeatures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const status = (req.query.status as string) || '';

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const features = await Feature.find(filter).sort({ name: 1 });

    // Compute live universities count for each feature
    const enhancedFeatures = await Promise.all(
      features.map(async (feat) => {
        const liveReleases = await Release.find({
          feature: feat._id,
          environment: 'PRODUCTION',
          status: 'LIVE',
        }).populate('university', 'name code');

        const liveUniversities = Array.from(
          new Set(liveReleases.map((r) => (r.university as any)?.code).filter(Boolean))
        );

        return {
          ...feat.toObject(),
          liveUniversitiesCount: liveUniversities.length,
          liveUniversities,
        };
      })
    );

    return sendSuccess(res, enhancedFeatures, 'Features fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getMatrix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const environment = (req.query.environment as any) || 'PRODUCTION';
    const matrixData = await getFeatureUniversityMatrix(environment);
    return sendSuccess(res, matrixData, 'Feature-University matrix generated successfully');
  } catch (error) {
    next(error);
  }
};

export const getFeatureById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findById(id);
    if (!feature) {
      return sendError(res, 'Feature not found', 404, 'NOT_FOUND');
    }

    // Find all releases for this feature
    const releases = await Release.find({ feature: feature._id })
      .populate('university', 'name code type primaryEnvironment')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads')
      .sort({ releaseDate: -1 });

    // Identify which universities have this feature currently live in Production
    const allUniversities = await University.find({ status: 'ACTIVE' }).sort({ code: 1 });
    const liveReleases = await Release.find({
      feature: feature._id,
      environment: 'PRODUCTION',
      status: 'LIVE',
    }).populate('university', 'name code type');

    const liveUniIds = new Set(liveReleases.map((r) => (r.university as any)?._id?.toString()));

    const universityDeploymentStatus = allUniversities.map((uni) => ({
      _id: uni._id,
      code: uni.code,
      name: uni.name,
      type: uni.type,
      isLive: liveUniIds.has(uni._id.toString()),
      latestRelease: releases.find((r) => (r.university as any)?._id?.toString() === uni._id.toString()) || null,
    }));

    return sendSuccess(
      res,
      {
        feature,
        releases,
        universityStatus: universityDeploymentStatus,
        totalLiveUniversities: liveUniIds.size,
      },
      'Feature detail fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const createFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, category, description, isActive } = req.body;
    if (!name || !code) {
      return sendError(res, 'Feature Name and Code are required', 400, 'MISSING_FIELDS');
    }

    const featureCode = code.toUpperCase().replace(/\s+/g, '_');
    const existing = await Feature.findOne({
      $or: [{ name: { $regex: `^${name}$`, $options: 'i' } }, { code: featureCode }],
    });

    if (existing) {
      return sendError(res, 'Feature with this name or code already exists', 409, 'DUPLICATE_FEATURE');
    }

    const feature = await Feature.create({
      name,
      code: featureCode,
      category: category || 'CORE',
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAudit({
      event: 'CREATE_FEATURE',
      entityType: 'Feature',
      entityId: feature._id,
      entityTitle: feature.name,
      details: `Created master feature '${feature.name}' [${feature.code}]`,
      req,
    });

    return sendSuccess(res, feature, 'Feature created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateFeature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.toUpperCase().replace(/\s+/g, '_');
    }

    const feature = await Feature.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!feature) {
      return sendError(res, 'Feature not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPDATE_FEATURE',
      entityType: 'Feature',
      entityId: feature._id,
      entityTitle: feature.name,
      details: `Updated feature '${feature.name}'`,
      req,
    });

    return sendSuccess(res, feature, 'Feature updated successfully');
  } catch (error) {
    next(error);
  }
};
