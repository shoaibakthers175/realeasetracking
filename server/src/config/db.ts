import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    // Enable strictQuery
    mongoose.set('strictQuery', false);

    const rawUri = (process.env.MONGODB_URI || config.mongoUri || '').trim();

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    };

    console.log(`[Database] Attempting connection to MongoDB at: ${rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : '(empty)'}`);

    if (rawUri && (rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://'))) {
      try {
        const conn = await mongoose.connect(rawUri, options);
        console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (primaryErr) {
        console.warn(`[Database] Primary MongoDB connection failed (${(primaryErr as Error).message}).`);
      }
    }

    // Fallback: In-memory MongoDB (with Debian 12 compatible binary version)
    console.log(`[Database] Starting self-contained in-memory MongoDB engine (v7.0.14)...`);

    mongoMemoryServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.14',
      },
      instance: {
        dbName: 'releasetrack',
      },
    });

    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected to self-contained in-memory MongoDB at: ${memoryUri}`);
    return conn;
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
