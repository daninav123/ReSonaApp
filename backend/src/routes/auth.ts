import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models';



const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: 'Name, email and password are required' });
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
    const user = new User({ name, email, passwordHash, roles: [] });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
    const payload = { userId: user._id, roles: user.roles };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ message: 'Server error', error: err instanceof Error ? err.message : JSON.stringify(err) });
  }
});

export default router;
