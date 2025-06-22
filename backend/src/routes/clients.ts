import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Client } from '../models';
import { auditLogMiddleware } from '../middleware/auditLog';
import Joi from 'joi';

const clientSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null),
  assignedCommercial: Joi.string().hex().length(24).allow(null),
  dni: Joi.string().allow('', null),
  tags: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().allow('', null),
  notes: Joi.string().allow('', null)
});

function validateClient(req: Request, res: Response, next: NextFunction) {
  const { error } = clientSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
    return;
  }
  next();
}

const router = Router();

// CEO authorization middleware
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.roles.includes('CEO')) {
    next();
    return;
  }
  res.status(403).json({ message: 'Forbidden' });
};

// GET /api/clients?search=&status=&tags=&page=&limit=
router.get('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', search = '', status, tags } = req.query;
    const filter: any = {};
    if (search) {
    filter.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
      { phone: { $regex: search as string, $options: 'i' } },
      { address: { $regex: search as string, $options: 'i' } },
      { dni: { $regex: search as string, $options: 'i' } }
    ];
  }
    if (status) filter.status = status;
    if (tags) filter.tags = { $in: (tags as string).split(',') };
    const pageNum = parseInt(page as string, 10);
    const lim = parseInt(limit as string, 10);
    const clients = await Client.find(filter)
      .skip((pageNum - 1) * lim)
      .limit(lim);
    const total = await Client.countDocuments(filter);
    res.json({ data: clients, page: pageNum, limit: lim, total });
  } catch (err) {
    console.error('Clients fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/clients/:id
router.get('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json(client);
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/clients
router.post('/', authenticateJWT, authorizeAdmin, validateClient, auditLogMiddleware('create', 'client'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, phone, email, address, assignedCommercial, dni, tags = [], status, notes } = req.body;
  if (!name) { res.status(400).json({ message: 'Name is required' }); return; }
  try {
    const client = new Client({ name, phone, email, address, assignedCommercial, dni, tags, status, notes });
    await client.save();
    res.status(201).json({ message: 'Client created', client });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/clients/:id
router.put('/:id', authenticateJWT, authorizeAdmin, validateClient, auditLogMiddleware('update', 'client'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json({ message: 'Client updated', client: updated });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticateJWT, authorizeAdmin, auditLogMiddleware('delete', 'client'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
