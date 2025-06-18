// @ts-nocheck
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Client, Budget, Event, Material, Task, Notification } from './models';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';

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
const MONGO_URI = process.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Models:', mongoose.modelNames());
    // Start server after DB connection
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    

  })
  .catch((err) => {
    console.error('❌ DB connection error:', err);

  });



// Health check

app.get('/', (req, res) => res.send('ReSona Events CRM API is up'));

// Test: list users (initially empty)

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});


