import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { sendError } from '../utils/response';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before role check.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Allowed: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
};

export const canModifyReleases = authorize('ADMIN', 'QA_LEAD', 'QA_ENGINEER');
export const canApproveReleases = authorize('ADMIN', 'QA_LEAD');
export const canAdministerSystem = authorize('ADMIN');
