import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config/env';

export const createApp = () => {
  const app = express();

  // Security headers with Cross-Origin Resource Policy for uploads
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all in development or check origin
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1500,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests from this IP, please try again after 15 minutes.' } },
  });
  app.use('/api', limiter);

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads serving
  app.use('/uploads', express.static(config.uploadDir));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'RELEASETRACK API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Main API routes
  app.use('/api', routes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    });
  });

  // Centralized Error handler
  app.use(errorHandler);

  return app;
};
