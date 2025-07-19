import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import clientsRouter from './routes/clients';
import materialsRouter from './routes/materials';
import path from 'path';
import auditLogsRouter from './routes/auditlogs';
import invoiceRouter from './routes/invoiceRoutes';
import quoteRouter from './routes/quoteRoutes';
import rolesRouter from './routes/roles';
import permissionsRouter from './routes/permissions';


const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Handle preflight requests
// Express v5 requires paths to start with '/'. Handle all preflight requests.


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

// Rutas de facturación y presupuestos
app.use('/api/invoices', invoiceRouter);
app.use('/api/quotes', quoteRouter);

// Rutas para el sistema RBAC (gestión de roles y permisos)
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);

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
