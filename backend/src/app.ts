import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/', (req, res) => res.send('ReSona Events CRM API is up'));

// Test: list users (initially empty)
import { User } from './models';
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

export default app;
