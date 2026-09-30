import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/auditService';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const role = (req.query.role as string) || '';
    const search = (req.query.search as string) || '';

    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return sendSuccess(res, users, 'Users fetched successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, Email, and Password are required', 400, 'MISSING_FIELDS');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 'User with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'QA_ENGINEER',
      department: department || 'Quality Assurance',
      isActive: true,
    });

    await logAudit({
      event: 'CREATE_USER',
      entityType: 'User',
      entityId: user._id,
      entityTitle: user.name,
      details: `Created new user ${user.name} (${user.email}) with role ${user.role}`,
      req,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, userObj, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Disallow setting password directly through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return sendError(res, 'User not found', 404, 'NOT_FOUND');
    }

    await logAudit({
      event: 'UPDATE_USER',
      entityType: 'User',
      entityId: user._id,
      entityTitle: user.name,
      details: `Updated user profile/role for ${user.email}`,
      req,
    });

    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};
