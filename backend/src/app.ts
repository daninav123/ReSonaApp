import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import materialsRouter from './routes/materials';
import path from 'path';
import auditLogsRouter from './routes/auditlogs';


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/users', usersRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/auditlogs', auditLogsRouter);
import tasksRouter from './routes/tasks';
app.use('/api/tasks', tasksRouter);
import budgetsRouter from './routes/budgets';
app.use('/api/budgets', budgetsRouter);

// Serve material uploads statically
app.use('/uploads/materials', express.static(path.join(__dirname, '../uploads/materials')));

// Health check
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('ReSona Events CRM API is up');
});

// Test: list users (initially empty)
import { User } from './models';
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

export default app;
