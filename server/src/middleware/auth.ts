import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { sendError } from '../utils/response';
import { User, IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { doc?: IUser };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 'Authentication token missing or invalid. Please login.', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const userDoc = await User.findById(decoded.id);
    if (!userDoc || !userDoc.isActive) {
      return sendError(res, 'User account no longer active or exists.', 401, 'USER_INACTIVE');
    }

    req.user = {
      ...decoded,
      doc: userDoc,
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired session token.', 401, 'INVALID_TOKEN');
  }
};
