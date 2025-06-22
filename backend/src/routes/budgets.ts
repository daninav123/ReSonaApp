import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middleware/auth';
import Budget from '../models/Budget';
import { auditLogMiddleware } from '../middleware/auditLog';

const router = Router();

// GET /api/budgets
router.get('/', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const budgets = await Budget.find().populate('client', 'name').populate('createdBy', 'name').sort({ date: -1 });
    res.json({ data: budgets });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/budgets/:id
router.get('/:id', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const budget = await Budget.findById(req.params.id).populate('client', 'name').populate('createdBy', 'name');
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/budgets
router.post('/', authenticateJWT, auditLogMiddleware('create', 'budget'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { client, title, amount, items, notes } = req.body;
    const createdBy = req.user?.userId;
    if (!client || !title || !amount || !createdBy) { res.status(400).json({ message: 'Client, title, amount and creator required' }); return; }
    const budget = new Budget({ client, title, amount, items, notes, createdBy });
    await budget.save();
    res.status(201).json({ message: 'Budget created', budget });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/budgets/:id
router.put('/:id', authenticateJWT, auditLogMiddleware('update', 'budget'), async (req: Request, res: Response): Promise<void> => {
  try {
    const update = req.body;
    const budget = await Budget.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!budget) {
      res.status(404).json({ message: 'Budget not found' });
      return;
    }
    res.json({ message: 'Budget updated', budget });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticateJWT, auditLogMiddleware('delete', 'budget'), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Budget.findByIdAndDelete(req.params.id);
    if (!deleted) { res.status(404).json({ message: 'Budget not found' }); return; }
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
