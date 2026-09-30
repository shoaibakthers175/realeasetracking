import { Request, Response, NextFunction } from 'express';
import { BugTicket } from '../models/BugTicket';
import { University } from '../models/University';
import { Release } from '../models/Release';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getBugs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const search = (req.query.search as string) || '';
    const priority = (req.query.priority as string) || '';
    const status = (req.query.status as string) || '';
    const university = (req.query.university as string) || '';

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (university) {
      if (university.match(/^[0-9a-fA-F]{24}$/)) {
        filter.university = university;
      } else {
        const uniDoc = await University.findOne({ code: university.toUpperCase() });
        if (uniDoc) filter.university = uniDoc._id;
      }
    }

    const skip = (page - 1) * limit;
    const total = await BugTicket.countDocuments(filter);
    const bugs = await BugTicket.find(filter)
      .populate('university', 'name code type')
      .populate('release', 'title releaseDate environment status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, bugs, 'Bug tickets fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const createBug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId, title, description, jiraUrl, priority, status, university, release, resolvedDate, reportedBy } = req.body;

    if (!ticketId || !title) {
      return sendError(res, 'Ticket ID and Title are required', 400, 'MISSING_FIELDS');
    }

    const cleanTicketId = ticketId.toUpperCase().trim();
    const existing = await BugTicket.findOne({ ticketId: cleanTicketId });
    if (existing) {
      return sendError(res, `Bug Ticket with ID '${cleanTicketId}' already exists`, 409, 'DUPLICATE_TICKET');
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

    const bug = await BugTicket.create({
      ticketId: cleanTicketId,
      title,
      description: description || '',
      jiraUrl: jiraUrl || (cleanTicketId.startsWith('http') ? cleanTicketId : `https://jira.company.internal/browse/${cleanTicketId}`),
      priority: priority || 'MEDIUM',
      status: status || 'OPEN',
      university: uniId,
      release: relId,
      resolvedDate: resolvedDate ? new Date(resolvedDate) : (status === 'RESOLVED' ? new Date() : undefined),
      reportedBy: reportedBy || req.user?.name || 'QA Engineer',
    });

    if (relId) {
      await Release.findByIdAndUpdate(relId, {
        $addToSet: { bugTickets: bug._id },
      });
    }

    await logAudit({
      event: 'CREATE_BUG',
      entityType: 'BugTicket',
      entityId: bug._id,
      entityTitle: bug.ticketId,
      details: `Created Jira Bug ticket ${bug.ticketId} - ${bug.title}`,
      req,
    });

    return sendSuccess(res, bug, 'Bug ticket created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateBug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.university === '') delete updates.university;
    if (updates.release === '') delete updates.release;

    if (updates.status === 'RESOLVED' && !updates.resolvedDate) {
      updates.resolvedDate = new Date();
    }

    const bug = await BugTicket.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('university', 'name code')
      .populate('release', 'title releaseDate');

    if (!bug) {
      return sendError(res, 'Bug ticket not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPDATE_BUG',
      entityType: 'BugTicket',
      entityId: bug._id,
      entityTitle: bug.ticketId,
      details: `Updated Bug ticket ${bug.ticketId} (Status: ${bug.status})`,
      req,
    });

    return sendSuccess(res, bug, 'Bug ticket updated successfully');
  } catch (error) {
    next(error);
  }
};
