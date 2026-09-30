import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    // Enable strictQuery
    mongoose.set('strictQuery', false);

    // Try primary connection first with short timeout
    const options = {
      serverSelectionTimeoutMS: 2500,
    };

    console.log(`[Database] Attempting connection to MongoDB at: ${config.mongoUri}`);
    
    try {
      const conn = await mongoose.connect(config.mongoUri, options);
      console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[Database] Primary MongoDB connection failed (${(primaryErr as Error).message}).`);
      console.log(`[Database] Starting self-contained in-memory MongoDB engine...`);

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'releasetrack',
        }
      });
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to self-contained in-memory MongoDB at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`[Database] Error initializing MongoDB:`, error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected from database.');
  } catch (error) {
    console.error('[Database] Error disconnecting database:', error);
  }
};
