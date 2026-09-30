import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { PasswordResetRequest } from '../models/PasswordResetRequest';
import { Notification } from '../models/Notification';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError, AppError } from '../utils/response';
import { logAudit } from '../services/auditService';
import crypto from 'crypto';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password', 400, 'MISSING_FIELDS');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials. User not found.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Please contact an administrator.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Incorrect password.', 401, 'INVALID_CREDENTIALS');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logAudit({
      event: 'LOGIN',
      performedBy: user._id,
      userName: user.name,
      userRole: user.role,
      entityType: 'User',
      entityId: user._id,
      details: `User ${user.email} logged in successfully`,
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(
      res,
      {
        token,
        user: userObj,
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }
    return sendSuccess(res, user, 'Current user profile fetched');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await logAudit({
        event: 'LOGOUT',
        performedBy: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        entityType: 'User',
        entityId: req.user.id,
        details: `User ${req.user.email} logged out`,
        req,
      });
    }
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * User requests password reset.
 * Instead of instant reset, this files a PasswordResetRequest with status 'PENDING'
 * and alerts the administrator.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return sendError(res, 'Email is required', 400, 'MISSING_EMAIL');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return neutral message for security
      return sendSuccess(
        res,
        { status: 'PENDING' },
        'If the account exists, a password reset request has been submitted for administrator approval.'
      );
    }

    // Check if there is already an active pending request
    let resetReq = await PasswordResetRequest.findOne({
      user: user._id,
      status: 'PENDING',
    });

    if (!resetReq) {
      resetReq = await PasswordResetRequest.create({
        user: user._id,
        email: user.email,
        userName: user.name,
        userRole: user.role,
        reason: reason || 'User requested password reset from login screen',
        status: 'PENDING',
        requestedAt: new Date(),
      });

      // Notify Administrators
      await Notification.create({
        title: '🔑 Password Reset Approval Required',
        message: `${user.name} (${user.email} - ${user.role}) has requested a password reset. Admin approval is required.`,
        type: 'ALERT',
        priority: 'HIGH',
        link: '/users',
        readBy: [],
      });

      await logAudit({
        event: 'CREATE_USER',
        performedBy: user._id,
        userName: user.name,
        userRole: user.role,
        entityType: 'User',
        entityId: user._id,
        details: `Password reset requested for ${user.email} - awaiting administrator approval`,
        req,
      });
    }

    return sendSuccess(
      res,
      {
        status: 'PENDING',
        requestId: resetReq._id,
        email: user.email,
      },
      'Password reset request submitted successfully. An administrator must approve your request before you can reset your password.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Check the status of a user's password reset request (Pending, Approved, Rejected)
 */
export const checkPasswordResetStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = (req.query.email as string) || '';
    const requestId = (req.query.requestId as string) || '';

    if (!email && !requestId) {
      return sendError(res, 'Email or Request ID is required', 400, 'MISSING_FIELDS');
    }

    const query: Record<string, any> = {};
    if (requestId) query._id = requestId;
    if (email) query.email = email.toLowerCase();

    const resetReq = await PasswordResetRequest.findOne(query).sort({ createdAt: -1 });

    if (!resetReq) {
      return sendError(res, 'No password reset request found', 404, 'NOT_FOUND');
    }

    return sendSuccess(
      res,
      {
        status: resetReq.status,
        requestId: resetReq._id,
        email: resetReq.email,
        userName: resetReq.userName,
        token: resetReq.status === 'APPROVED' ? resetReq.resetToken : undefined,
        requestedAt: resetReq.requestedAt,
        approvedAt: resetReq.approvedAt,
        approvedByName: resetReq.approvedByName,
        rejectionReason: resetReq.rejectionReason,
      },
      `Password reset request status: ${resetReq.status}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all Password Reset Requests
 */
export const getPasswordResetRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await PasswordResetRequest.find()
      .populate('user', 'name email role department')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Password reset requests fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Approve a Password Reset Request
 */
export const approvePasswordResetRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const resetReq = await PasswordResetRequest.findById(id);

    if (!resetReq) {
      return sendError(res, 'Password reset request not found', 404, 'NOT_FOUND');
    }

    if (resetReq.status === 'COMPLETED') {
      return sendError(res, 'This request has already been completed.', 400, 'ALREADY_COMPLETED');
    }

    // Generate secure token (8-character alphanumeric code for ease or 32-hex)
    const rawToken = crypto.randomBytes(16).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update the request
    resetReq.status = 'APPROVED';
    resetReq.resetToken = rawToken;
    resetReq.hashedToken = hashedToken;
    resetReq.tokenExpire = expireTime;
    resetReq.approvedBy = req.user?.id as any;
    resetReq.approvedByName = req.user?.name || 'Administrator';
    resetReq.approvedAt = new Date();
    await resetReq.save();

    // Update the user record
    await User.findByIdAndUpdate(resetReq.user, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: expireTime,
    });

    // Notify requester
    await Notification.create({
      title: '✅ Password Reset Approved',
      message: `Password reset for ${resetReq.email} has been approved by ${req.user?.name}. Token: ${rawToken}`,
      type: 'SYSTEM',
      priority: 'HIGH',
      link: `/reset-password?token=${rawToken}`,
      readBy: [],
    });

    await logAudit({
      event: 'UPDATE_USER',
      performedBy: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      entityType: 'User',
      entityId: resetReq.user,
      details: `Administrator ${req.user?.name} approved password reset for ${resetReq.email}`,
      req,
    });

    return sendSuccess(
      res,
      {
        resetReq,
        resetToken: rawToken,
        resetLink: `/reset-password?token=${rawToken}`,
      },
      `Password reset approved for ${resetReq.email}. User can now reset password using the authorized token.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Reject a Password Reset Request
 */
export const rejectPasswordResetRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const resetReq = await PasswordResetRequest.findById(id);
    if (!resetReq) {
      return sendError(res, 'Password reset request not found', 404, 'NOT_FOUND');
    }

    resetReq.status = 'REJECTED';
    resetReq.rejectionReason = reason || 'Declined by security administrator';
    await resetReq.save();

    await logAudit({
      event: 'UPDATE_USER',
      performedBy: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      entityType: 'User',
      entityId: resetReq.user,
      details: `Administrator ${req.user?.name} rejected password reset for ${resetReq.email} (Reason: ${resetReq.rejectionReason})`,
      req,
    });

    return sendSuccess(res, resetReq, `Password reset request for ${resetReq.email} rejected.`);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password using approved token
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', 400, 'MISSING_FIELDS');
    }

    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400, 'PASSWORD_TOO_SHORT');
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // Find User and check token expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      // Also check if matches raw token on PasswordResetRequest
      const resetReq = await PasswordResetRequest.findOne({
        resetToken: token.trim(),
        status: 'APPROVED',
        tokenExpire: { $gt: Date.now() },
      });

      if (!resetReq) {
        return sendError(
          res,
          'Password reset token is invalid, expired, or has not been approved by an administrator.',
          400,
          'INVALID_RESET_TOKEN'
        );
      }

      const matchingUser = await User.findById(resetReq.user);
      if (!matchingUser) {
        return sendError(res, 'User account not found', 404, 'NOT_FOUND');
      }

      matchingUser.password = newPassword;
      matchingUser.resetPasswordToken = undefined;
      matchingUser.resetPasswordExpire = undefined;
      await matchingUser.save();

      resetReq.status = 'COMPLETED';
      await resetReq.save();

      await logAudit({
        event: 'UPDATE_USER',
        performedBy: matchingUser._id,
        userName: matchingUser.name,
        userRole: matchingUser.role,
        entityType: 'User',
        entityId: matchingUser._id,
        details: `Password reset completed successfully for ${matchingUser.email}`,
        req,
      });

      return sendSuccess(res, null, 'Password has been successfully updated. You may now log in.');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Mark any active request as completed
    await PasswordResetRequest.updateMany(
      { user: user._id, status: 'APPROVED' },
      { status: 'COMPLETED' }
    );

    await logAudit({
      event: 'UPDATE_USER',
      performedBy: user._id,
      userName: user.name,
      userRole: user.role,
      entityType: 'User',
      entityId: user._id,
      details: `Password reset completed successfully for ${user.email}`,
      req,
    });

    return sendSuccess(res, null, 'Password has been successfully updated. You may now log in.');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400, 'MISSING_FIELDS');
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password does not match', 400, 'PASSWORD_MISMATCH');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};
