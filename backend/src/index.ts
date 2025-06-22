// @ts-nocheck
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Client, Budget, Event, Material, Task, Notification } from './models';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);
// User routes
app.use('/api/clients', clientsRouter);
// Client routes
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const mongoUri = isProd
      ? (process.env.MONGO_URI as string)
      : (await MongoMemoryServer.create()).getUri();
    if (!isProd) console.log('✨ Using in-memory MongoDB at', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('Models:', mongoose.modelNames());
    // Seed default admin in in-memory DB
    if (!isProd) {
      const existingAdmin = await User.findOne({ email: 'admin@example.com' });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await User.create({ name: 'Admin', email: 'admin@example.com', passwordHash: hash, roles: ['CEO'] });
        console.log('✨ Seeded CEO user: admin@example.com / admin123');
      }
    }
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }
}

startServer();

// Health check

app.get('/', (req, res) => res.send('ReSona Events CRM API is up'));

// Test: list users (initially empty)

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});


