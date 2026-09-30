import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import { Notification } from '../models/Notification';
import { sendSuccess } from '../utils/response';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const event = (req.query.event as string) || '';
    const entityType = (req.query.entityType as string) || '';
    const search = (req.query.search as string) || '';

    const filter: Record<string, any> = {};
    if (event) filter.event = event;
    if (entityType) filter.entityType = entityType;
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { entityTitle: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, logs, 'Audit logs fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      readBy: { $ne: req.user?.id },
    });

    return sendSuccess(
      res,
      {
        notifications,
        unreadCount,
      },
      'Notifications fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user?.id) {
      await Notification.updateMany(
        { readBy: { $ne: req.user.id } },
        { $addToSet: { readBy: req.user.id } }
      );
    }
    return sendSuccess(res, null, 'Notifications marked as read');
  } catch (error) {
    next(error);
  }
};
