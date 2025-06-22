import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import Task from '../models/Task';
import { auditLogMiddleware } from '../middleware/auditLog';

const router = Router();

// GET /api/tasks
router.get('/', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name').populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ data: tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/tasks/:id
router.get('/:id', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name').populate('createdBy', 'name');
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/tasks
router.post('/', authenticateJWT, auditLogMiddleware('create', 'task'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, dueDate, assignedTo } = req.body;
    const createdBy = req.user?.userId;
    if (!title || !createdBy) { res.status(400).json({ message: 'Title and creator required' }); return; }
    const task = new Task({ title, description, status, dueDate, assignedTo, createdBy });
    await task.save();
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticateJWT, auditLogMiddleware('update', 'task'), async (req: Request, res: Response): Promise<void> => {
  try {
    const update = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.json({ message: 'Task updated', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateJWT, auditLogMiddleware('delete', 'task'), async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) { res.status(404).json({ message: 'Task not found' }); return; }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
