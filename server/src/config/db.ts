import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

let mongoMemoryServer: MongoMemoryServer | null = null;

const ensureDataDir = (): string => {
  const dataDir = path.resolve(__dirname, '../../data/db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};

const tryStartLocalMongod = async (dataDir: string): Promise<boolean> => {
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'mongod',
  ];

  let mongodBin: string | null = null;
  for (const p of possiblePaths) {
    if (p === 'mongod' || fs.existsSync(p)) {
      mongodBin = p;
      break;
    }
  }

  if (!mongodBin) return false;

  try {
    console.log(`[Database] Starting persistent local mongod engine with dbpath "${dataDir}"...`);
    const child = spawn(mongodBin, ['--dbpath', dataDir, '--port', '27017'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();

    // Give it 2 seconds to initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  } catch (err) {
    console.warn('[Database] Failed to auto-start local mongod binary:', err);
    return false;
  }
};

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    // Enable strictQuery
    mongoose.set('strictQuery', false);

    const rawUri = (process.env.MONGODB_URI || config.mongoUri || 'mongodb://127.0.0.1:27017/releasetrack').trim();
    const dataDir = ensureDataDir();

    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log(`[Database] Connecting to persistent MongoDB at: ${rawUri.replace(/:([^@]+)@/, ':****@')}`);

    if (rawUri && (rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://'))) {
      try {
        const conn = await mongoose.connect(rawUri, options);
        console.log(`[Database] Connected successfully to persistent MongoDB: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (primaryErr) {
        console.warn(`[Database] Direct connection to ${rawUri} failed (${(primaryErr as Error).message}). Attempting to start local MongoDB...`);

        // Attempt starting local mongod with persistent dbPath
        const started = await tryStartLocalMongod(dataDir);
        if (started) {
          try {
            const localUri = 'mongodb://127.0.0.1:27017/releasetrack';
            const conn = await mongoose.connect(localUri, options);
            console.log(`[Database] Connected successfully to auto-started persistent MongoDB at ${localUri}`);
            return conn;
          } catch (localErr) {
            console.warn(`[Database] Connection after starting mongod failed (${(localErr as Error).message}).`);
          }
        }
      }
    }

    // Fallback: MongoMemoryServer with persistent dbPath
    console.log(`[Database] Starting self-contained MongoDB engine with persistent storage at "${dataDir}"...`);
    mongoMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir,
        dbName: 'releasetrack',
        storageEngine: 'wiredTiger',
      },
    });

    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected to persistent MongoDB at: ${memoryUri}`);
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
