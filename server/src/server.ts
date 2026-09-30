import { createApp } from './app';
import { connectDB } from './config/db';
import { config } from './config/env';
import { seedDatabase } from './seed/seed';
import { University } from './models/University';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Check if seeding is required (if universities count is 0)
    const uniCount = await University.countDocuments();
    if (uniCount === 0) {
      console.log('[Server] Database is empty. Running initial seed...');
      await seedDatabase();
    }

    // 3. Start Express Server
    const app = createApp();
    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 RELEASETRACK API Server is running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🛡️  Environment: ${config.nodeEnv}`);
      console.log(`📦 MongoDB: ${config.mongoUri}`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
