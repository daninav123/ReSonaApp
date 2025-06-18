import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { authenticateJWT } from '../middleware/auth';
import { User } from '../models';

const router = Router();

// Admin authorization middleware
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.roles.includes('admin')) return next();
  return res.status(403).json({ message: 'Forbidden' });
};

// Get list of users
router.get('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Get user by ID
router.get('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Create new user
router.post('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { name, email, password, roles } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, passwordHash, roles: roles || [] });
    await newUser.save();
    res.status(201).json({ message: 'User created', user: { id: newUser._id, name, email, roles: newUser.roles } });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Update user by ID
router.put('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  const { name, email, password, roles } = req.body;
  const update: any = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (roles) update.roles = roles;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    update.passwordHash = await bcrypt.hash(password, salt);
  }
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Delete user by ID
router.delete('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

export default router;

