import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { Client } from '../models';

const router = Router();

// Admin authorization middleware
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.roles.includes('admin')) return next();
  return res.status(403).json({ message: 'Forbidden' });
};

// GET /api/clients?search=&status=&tags=&page=&limit=
router.get('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', status, tags } = req.query;
    const filter: any = {};
    if (search) filter.name = { $regex: search as string, $options: 'i' };
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
router.get('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/clients
router.post('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { name, phone, email, address, assignedCommercial, dni, tags = [], status, notes } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
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
router.put('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client updated', client: updated });
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
