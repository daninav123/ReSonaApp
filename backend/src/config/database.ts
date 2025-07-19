import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../models';

dotenv.config();

export class DatabaseConfig {
  private static instance: DatabaseConfig;
  private mongoServer: MongoMemoryServer | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const isProd = process.env.NODE_ENV === 'production';
    const mongoUri = isProd
      ? (process.env.MONGO_URI as string)
      : (await MongoMemoryServer.create()).getUri();

    if (!isProd) console.log('✨ Using in-memory MongoDB at', mongoUri);

    try {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
      console.log('Models:', mongoose.modelNames());

      // Seed default admin in in-memory DB
      if (!isProd) {
        await this.seedAdminUser();
      }

      this.isInitialized = true;
    } catch (err) {
      console.error('❌ DB connection error:', err);
      throw err;
    }
  }

  private async seedAdminUser(): Promise<void> {
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await User.create({ 
        name: 'Admin', 
        email: 'admin@example.com', 
        passwordHash: hash, 
        roles: ['CEO'] 
      });
      console.log('✨ Seeded CEO user: admin@example.com / admin123');
    }
  }

  public async close(): Promise<void> {
    if (this.mongoServer) {
      await this.mongoServer.stop();
      this.mongoServer = null;
    }
    await mongoose.disconnect();
  }
}
