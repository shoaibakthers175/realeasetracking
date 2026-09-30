import { Request, Response, NextFunction } from 'express';
import { Release, IRelease } from '../models/Release';
import { University } from '../models/University';
import { Feature } from '../models/Feature';
import { BugTicket } from '../models/BugTicket';
import { SanityReport } from '../models/SanityReport';
import { Lead } from '../models/Lead';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError, AppError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getReleases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const university = (req.query.university as string) || '';
    const feature = (req.query.feature as string) || '';
    const releaseType = (req.query.releaseType as string) || '';
    const environment = (req.query.environment as string) || '';
    const status = (req.query.status as string) || '';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const date = req.query.date as string; // Exact single day filter e.g. 2026-09-25

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { version: { $regex: search, $options: 'i' } },
      ];
    }

    if (university) {
      // Support either ObjectId or University Code
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        filter.university = university;
      } else {
        const uniDoc = await University.findOne({ code: university.toUpperCase() });
        if (uniDoc) filter.university = uniDoc._id;
      }
    }

    if (feature) {
      if (feature.match(/^[0-9a-fA-F]{24}$/)) {
        filter.feature = feature;
      } else {
        const featDoc = await Feature.findOne({ $or: [{ code: feature.toUpperCase() }, { name: feature }] });
        if (featDoc) filter.feature = featDoc._id;
      }
    }

    if (releaseType) filter.releaseType = releaseType;
    if (environment) filter.environment = environment;
    if (status) filter.status = status;

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      filter.releaseDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate || endDate) {
      filter.releaseDate = {};
      if (startDate) filter.releaseDate.$gte = new Date(startDate);
      if (endDate) filter.releaseDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await Release.countDocuments(filter);

    const releases = await Release.find(filter)
      .populate('university', 'name code type primaryEnvironment logoUrl')
      .populate('feature', 'name code category')
      .populate('bugTickets', 'ticketId title priority status jiraUrl')
      .populate('sanityReports', 'sanityStatus passed failed totalTestCases notes attachments')
      .populate('leads', 'leadId program source verificationStatus lsqStatus opportunityStatus erpStatus')
      .sort({ releaseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, releases, 'Releases fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getReleaseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const release = await Release.findById(id)
      .populate('university')
      .populate('feature')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads');

    if (!release) {
      return sendError(res, 'Release not found', 404, 'NOT_FOUND');
    }

    // Fetch related audit logs for release timeline
    const timeline = await AuditLog.find({
      $or: [{ entityId: release._id }, { 'changes.releaseId': release._id.toString() }],
    }).sort({ createdAt: 1 });

    return sendSuccess(
      res,
      {
        release,
        timeline,
      },
      'Release details fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const createRelease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      university,
      feature,
      title,
      description,
      releaseType,
      environment,
      releaseDate,
      releaseTime,
      status,
      deployedBy,
      version,
      bugTickets, // Array of ticketIds or bug objects
      sanityReport, // Sanity report details
      leads, // Array of lead IDs or lead objects
      attachments,
    } = req.body;

    if (!university || !feature || !title || !releaseType || !environment || !releaseDate) {
      return sendError(res, 'University, Feature, Title, Release Type, Environment, and Release Date are required', 400, 'MISSING_FIELDS');
    }

    // Resolve University
    let uniId = university;
    if (!university.match(/^[0-9a-fA-F]{24}$/)) {
      const uniDoc = await University.findOne({ code: university.toUpperCase() });
      if (!uniDoc) return sendError(res, `University '${university}' not found`, 404, 'UNI_NOT_FOUND');
      uniId = uniDoc._id;
    }

    // Resolve Feature
    let featId = feature;
    if (!feature.match(/^[0-9a-fA-F]{24}$/)) {
      const featDoc = await Feature.findOne({ $or: [{ code: feature.toUpperCase() }, { name: feature }] });
      if (!featDoc) return sendError(res, `Feature '${feature}' not found`, 404, 'FEAT_NOT_FOUND');
      featId = featDoc._id;
    }

    const createdBugTicketIds: any[] = [];
    const createdLeadIds: any[] = [];
    const createdSanityReportIds: any[] = [];

    // Create Release document
    const newRelease = new Release({
      university: uniId,
      feature: featId,
      title,
      description: description || '',
      releaseType,
      environment,
      releaseDate: new Date(releaseDate),
      releaseTime: releaseTime || '12:00 PM',
      status: status || 'LIVE',
      deployedBy: deployedBy || (req.user?.name) || 'QA DevOps',
      releasedBy: req.user?.id || 'QA Team',
      version: version || 'v1.0.0',
      attachments: attachments || [],
    });

    await newRelease.save();

    // 1. Process Bug Tickets
    if (bugTickets && Array.isArray(bugTickets)) {
      for (const bug of bugTickets) {
        if (typeof bug === 'string') {
          // If existing ticketId or ObjectId
          const existing = await BugTicket.findOne({
            $or: [{ ticketId: bug.toUpperCase() }, { _id: bug.match(/^[0-9a-fA-F]{24}$/) ? bug : null }],
          });
          if (existing) {
            existing.release = newRelease._id;
            existing.university = uniId;
            await existing.save();
            createdBugTicketIds.push(existing._id);
          } else {
            const newBug = await BugTicket.create({
              ticketId: bug.toUpperCase(),
              title: `Issue ${bug.toUpperCase()}`,
              university: uniId,
              release: newRelease._id,
              status: 'RESOLVED',
              priority: 'HIGH',
            });
            createdBugTicketIds.push(newBug._id);
          }
        } else if (typeof bug === 'object' && bug.ticketId) {
          const newBug = await BugTicket.create({
            ticketId: bug.ticketId.toUpperCase(),
            title: bug.title || `Bug ${bug.ticketId}`,
            description: bug.description || '',
            jiraUrl: bug.jiraUrl || '',
            priority: bug.priority || 'HIGH',
            status: bug.status || 'RESOLVED',
            university: uniId,
            release: newRelease._id,
            resolvedDate: bug.status === 'RESOLVED' ? new Date() : undefined,
          });
          createdBugTicketIds.push(newBug._id);
        }
      }
    }

    // 2. Process Sanity Report
    if (sanityReport) {
      const sanity = await SanityReport.create({
        title: sanityReport.title || `${title} Sanity Verification`,
        release: newRelease._id,
        university: uniId,
        sanityStatus: sanityReport.sanityStatus || 'PASSED',
        testedBy: sanityReport.testedBy || req.user?.name || 'QA Lead',
        testDate: sanityReport.testDate ? new Date(sanityReport.testDate) : new Date(releaseDate),
        testTime: sanityReport.testTime || releaseTime || '04:00 PM',
        environment,
        totalTestCases: sanityReport.totalTestCases || 10,
        passed: sanityReport.passed !== undefined ? sanityReport.passed : 10,
        failed: sanityReport.failed || 0,
        blocked: sanityReport.blocked || 0,
        notes: sanityReport.notes || 'Sanity test cases successfully verified.',
        attachments: sanityReport.attachments || [],
      });
      createdSanityReportIds.push(sanity._id);
    }

    // 3. Process Leads
    if (leads && Array.isArray(leads)) {
      for (const lead of leads) {
        if (typeof lead === 'string') {
          const newLead = await Lead.create({
            leadId: lead,
            university: uniId,
            release: newRelease._id,
            program: 'B.Tech',
            environment,
            source: 'Website',
            lsqStatus: 'CREATED',
            opportunityStatus: 'CREATED',
            erpStatus: 'CREATED',
            verificationStatus: 'SUCCESS',
          });
          createdLeadIds.push(newLead._id);
        } else if (typeof lead === 'object' && lead.leadId) {
          const newLead = await Lead.create({
            leadId: lead.leadId,
            university: uniId,
            release: newRelease._id,
            program: lead.program || 'B.Tech',
            form: lead.form || 'Lead Enquiry Form',
            environment: lead.environment || environment,
            source: lead.source || 'Website',
            utmSource: lead.utmSource || 'google',
            utmMedium: lead.utmMedium || 'cpc',
            utmCampaign: lead.utmCampaign || 'admissions_2026',
            lsqStatus: lead.lsqStatus || 'CREATED',
            opportunityStatus: lead.opportunityStatus || 'CREATED',
            erpStatus: lead.erpStatus || 'CREATED',
            verificationStatus: lead.verificationStatus || 'SUCCESS',
            leadEmail: lead.leadEmail || '',
            leadPhone: lead.leadPhone || '',
            notes: lead.notes || '',
          });
          createdLeadIds.push(newLead._id);
        }
      }
    }

    // Link relations to release
    newRelease.bugTickets = createdBugTicketIds;
    newRelease.sanityReports = createdSanityReportIds;
    newRelease.leads = createdLeadIds;
    await newRelease.save();

    // Populate for clean response
    const populated = await Release.findById(newRelease._id)
      .populate('university', 'name code type')
      .populate('feature', 'name code')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads');

    // Audit logs
    await logAudit({
      event: 'CREATE_RELEASE',
      entityType: 'Release',
      entityId: newRelease._id,
      entityTitle: newRelease.title,
      details: `Created release '${newRelease.title}' for ${(populated?.university as any)?.code || 'University'} (${newRelease.releaseType}) in ${newRelease.environment}`,
      req,
      notify: {
        title: 'New Release Created',
        message: `${newRelease.title} is now ${newRelease.status} on ${(populated?.university as any)?.code || 'University'}`,
        type: 'RELEASE',
        priority: newRelease.releaseType === 'HOTFIX' ? 'HIGH' : 'NORMAL',
      },
    });

    if (newRelease.status === 'LIVE') {
      await logAudit({
        event: 'MARK_RELEASE_LIVE',
        entityType: 'Release',
        entityId: newRelease._id,
        entityTitle: newRelease.title,
        details: `Release '${newRelease.title}' was marked LIVE`,
        req,
      });
    }

    return sendSuccess(res, populated, 'Release created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateRelease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const release = await Release.findById(id);
    if (!release) {
      return sendError(res, 'Release not found', 404, 'NOT_FOUND');
    }

    const previousStatus = release.status;

    if (updates.status === 'ROLLED_BACK' && previousStatus !== 'ROLLED_BACK') {
      updates.rolledBackAt = new Date();
      updates.rollbackReason = updates.rollbackReason || 'Rolled back due to QA findings or production issue';
    }

    const updated = await Release.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('university', 'name code type')
      .populate('feature', 'name code')
      .populate('bugTickets')
      .populate('sanityReports')
      .populate('leads');

    // Log status change audit
    if (updates.status && updates.status !== previousStatus) {
      if (updates.status === 'LIVE') {
        await logAudit({
          event: 'MARK_RELEASE_LIVE',
          entityType: 'Release',
          entityId: release._id,
          entityTitle: release.title,
          details: `Release marked LIVE from ${previousStatus}`,
          req,
        });
      } else if (updates.status === 'ROLLED_BACK') {
        await logAudit({
          event: 'ROLLBACK_RELEASE',
          entityType: 'Release',
          entityId: release._id,
          entityTitle: release.title,
          details: `Release rolled back. Reason: ${updates.rollbackReason}`,
          req,
        });
      }
    } else {
      await logAudit({
        event: 'UPDATE_RELEASE',
        entityType: 'Release',
        entityId: release._id,
        entityTitle: release.title,
        details: `Updated release metadata for ${release.title}`,
        req,
      });
    }

    return sendSuccess(res, updated, 'Release updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteRelease = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const release = await Release.findById(id);
    if (!release) {
      return sendError(res, 'Release not found', 404, 'NOT_FOUND');
    }

    await Release.findByIdAndDelete(id);

    await logAudit({
      event: 'DELETE_RELEASE',
      entityType: 'Release',
      entityId: id,
      entityTitle: release.title,
      details: `Deleted release ${release.title}`,
      req,
    });

    return sendSuccess(res, null, 'Release deleted successfully');
  } catch (error) {
    next(error);
  }
};
