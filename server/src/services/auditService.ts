import { AuditLog, AuditEvent } from '../models/AuditLog';
import { Notification, NotificationType } from '../models/Notification';
import { Request } from 'express';

interface LogAuditEventOptions {
  event: AuditEvent;
  req?: Request;
  userName?: string;
  userRole?: string;
  performedBy?: any;
  entityType: 'Release' | 'University' | 'Feature' | 'BugTicket' | 'SanityReport' | 'Lead' | 'User' | 'System';
  entityId?: any;
  entityTitle?: string;
  details?: string;
  changes?: Record<string, any>;
  notify?: {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: 'LOW' | 'NORMAL' | 'HIGH';
    link?: string;
  };
}

export const logAudit = async (options: LogAuditEventOptions) => {
  try {
    const performedBy = options.performedBy || (options.req?.user?.id);
    const userName = options.userName || (options.req?.user?.name) || 'System';
    const userRole = options.userRole || (options.req?.user?.role) || 'QA_ENGINEER';
    const ipAddress = (options.req?.ip) || '127.0.0.1';
    const userAgent = options.req?.headers['user-agent'] || '';

    await AuditLog.create({
      event: options.event,
      performedBy,
      userName,
      userRole,
      entityType: options.entityType,
      entityId: options.entityId,
      entityTitle: options.entityTitle,
      details: options.details,
      changes: options.changes,
      ipAddress,
      userAgent,
    });

    if (options.notify) {
      await Notification.create({
        title: options.notify.title,
        message: options.notify.message,
        type: options.notify.type || 'RELEASE',
        priority: options.notify.priority || 'NORMAL',
        link: options.notify.link || '',
        readBy: [],
      });
    }
  } catch (error) {
    console.error('[AuditLog] Error writing audit log:', error);
  }
};
