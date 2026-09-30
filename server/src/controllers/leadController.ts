import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { Release } from '../models/Release';
import { University } from '../models/University';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const search = (req.query.search as string) || '';
    const university = (req.query.university as string) || '';
    const source = (req.query.source as string) || '';
    const status = (req.query.status as string) || '';
    const lsqStatus = (req.query.lsqStatus as string) || '';
    const opportunityStatus = (req.query.opportunityStatus as string) || '';
    const erpStatus = (req.query.erpStatus as string) || '';

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { leadId: { $regex: search, $options: 'i' } },
        { program: { $regex: search, $options: 'i' } },
        { form: { $regex: search, $options: 'i' } },
        { leadEmail: { $regex: search, $options: 'i' } },
      ];
    }

    if (university) {
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        filter.university = university;
      } else {
        const uniDoc = await University.findOne({ code: university.toUpperCase() });
        if (uniDoc) filter.university = uniDoc._id;
      }
    }

    if (source) filter.source = source;
    if (status) filter.verificationStatus = status;
    if (lsqStatus) filter.lsqStatus = lsqStatus;
    if (opportunityStatus) filter.opportunityStatus = opportunityStatus;
    if (erpStatus) filter.erpStatus = erpStatus;

    const skip = (page - 1) * limit;
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('university', 'name code type primaryEnvironment')
      .populate('release', 'title releaseDate environment status')
      .sort({ generatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, leads, 'Leads fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate('university')
      .populate('release');

    if (!lead) {
      return sendError(res, 'Lead not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, lead, 'Lead fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      leadId,
      university,
      release,
      program,
      form,
      environment,
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      lsqStatus,
      opportunityStatus,
      erpStatus,
      verificationStatus,
      leadEmail,
      leadPhone,
      notes,
      rawPayload,
    } = req.body;

    if (!leadId || !university) {
      return sendError(res, 'Lead ID and University are required', 400, 'MISSING_FIELDS');
    }

    const cleanLeadId = leadId.trim();
    const existing = await Lead.findOne({ leadId: cleanLeadId });
    if (existing) {
      return sendError(res, `Lead with ID '${cleanLeadId}' already exists`, 409, 'DUPLICATE_LEAD');
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

    if (!uniId) {
      return sendError(res, 'A valid University is required for lead tracking', 400, 'INVALID_UNIVERSITY');
    }

    let relId: any = undefined;
    if (release && typeof release === 'string' && release.match(/^[0-9a-fA-F]{24}$/)) {
      relId = release;
    }

    const lead = await Lead.create({
      leadId: cleanLeadId,
      university: uniId,
      release: relId,
      program: program || 'B.Tech',
      form: form || 'Enquiry Form',
      environment: environment || 'PRODUCTION',
      generatedAt: new Date(),
      source: source || 'Website',
      utmSource: utmSource || 'google',
      utmMedium: utmMedium || 'cpc',
      utmCampaign: utmCampaign || 'fall_2026',
      lsqStatus: lsqStatus || 'CREATED',
      opportunityStatus: opportunityStatus || 'CREATED',
      erpStatus: erpStatus || 'CREATED',
      verificationStatus: verificationStatus || 'SUCCESS',
      leadEmail: leadEmail || '',
      leadPhone: leadPhone || '',
      notes: notes || '',
      rawPayload: rawPayload || {},
    });

    if (relId) {
      await Release.findByIdAndUpdate(relId, {
        $addToSet: { leads: lead._id },
      });
    }

    await logAudit({
      event: 'CREATE_LEAD',
      entityType: 'Lead',
      entityId: lead._id,
      entityTitle: lead.leadId,
      details: `Registered test lead ${lead.leadId} for verification (LSQ: ${lead.lsqStatus}, Opp: ${lead.opportunityStatus})`,
      req,
    });

    return sendSuccess(res, lead, 'Test lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('university', 'name code')
      .populate('release', 'title releaseDate');

    if (!lead) {
      return sendError(res, 'Lead not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPDATE_LEAD',
      entityType: 'Lead',
      entityId: lead._id,
      entityTitle: lead.leadId,
      details: `Updated test lead ${lead.leadId} status`,
      req,
    });

    return sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};
