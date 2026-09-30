import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists (${err.keyValue[field]}). Please use a unique value.`;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Resource not found or invalid identifier for ${err.path}`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  // Log error internally in non-test mode
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[API Error] [${req.method} ${req.originalUrl}] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
