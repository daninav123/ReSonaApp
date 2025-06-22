import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { authenticateJWT } from '../middleware/auth';
import { User } from '../models';
import { auditLogMiddleware } from '../middleware/auditLog';
import AuditLog from '../models/AuditLog';

const router = Router();

// Admin authorization middleware
const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.roles.includes('CEO')) {
    next();
    return;
  }
  res.status(403).json({ message: 'Forbidden' });
  return;
};

// Self or CEO authorization middleware
const authorizeSelfOrCEO = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.roles.includes('CEO') || req.user?.userId === req.params.id) {
    next();
    return;
  }
  res.status(403).json({ message: 'Forbidden' });
  return;
};

// Get own profile
router.get('/me', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// Get list of users
router.get('/', authenticateJWT, authorizeAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Get user by ID
router.get('/:id', authenticateJWT, authorizeAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Create new user
router.post('/', authenticateJWT, authorizeAdmin, auditLogMiddleware('create', 'user'), async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, roles } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email, and password are required' });
    return;
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
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

// Update avatar
router.put('/:id/avatar', authenticateJWT, authorizeSelfOrCEO, async (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).json({ message: 'Avatar URL required' });
    return;
  }
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { avatar }, { new: true }).select('-passwordHash');
    if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json({ message: 'Avatar updated', avatar: updated.avatar });
  } catch (err) {
    console.error('Update avatar error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// Update preferences
router.put('/:id/preferences', authenticateJWT, authorizeSelfOrCEO, async (req: Request, res: Response, next: NextFunction) => {
  const { preferences } = req.body;
  if (!preferences) {
    res.status(400).json({ message: 'Preferences required' });
    return;
  }
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { preferences }, { new: true }).select('-passwordHash');
    if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json({ message: 'Preferences updated', preferences: updated.preferences });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// Logout all sessions
router.post('/:id/logoutAll', authenticateJWT, authorizeSelfOrCEO, async (req: Request, res: Response, next: NextFunction) => {
  // Implement token invalidation logic as needed
  res.json({ message: 'All sessions logged out' });
});

// Get activity history
router.get('/:id/activity', authenticateJWT, authorizeSelfOrCEO, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await AuditLog.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ data: logs });
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

// Update user by ID
router.put('/:id', authenticateJWT, authorizeSelfOrCEO, auditLogMiddleware('update', 'user'), async (req: Request, res: Response, next: NextFunction) => {
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
    if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Delete user by ID
router.delete('/:id', authenticateJWT, authorizeSelfOrCEO, auditLogMiddleware('delete', 'user'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Update theme
router.put('/:id/theme', authenticateJWT, authorizeSelfOrCEO, async (req: Request, res: Response, next: NextFunction) => {
  const { theme } = req.body;
  if (!theme || (theme !== 'light' && theme !== 'dark')) {
    res.status(400).json({ message: 'Theme must be light or dark' });
    return;
  }
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { 'preferences.theme': theme },
      { new: true }
    ).select('-passwordHash');
    if (!updated) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
    res.json({ message: 'Theme updated', theme: updated!.preferences!.theme });
  } catch (err) {
    console.error('Update theme error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : String(err) });
  }
});

export default router;

