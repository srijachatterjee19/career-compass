import express, { Request, Response } from 'express';
import User from '../models/User';
import logger from '../config/logger';
import 'express-session';

const router = express.Router();

// Extend the Session type to include userId
declare module 'express-session' {
  interface Session {
    userId?: string;
  }
}

// POST /api/auth/login - login a user
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!req.session) {
    logger.error('❌ Session not initialized');
    return res.status(500).json({ error: 'Session not initialized' });
  }
  req.session.userId = user._id.toString();

  logger.info(`✅ User ${user.email} logged in`);
  
  res.json({ message: 'Logged in successfully' });
});

// POST /api/auth/logout - logout a user
router.post('/logout', async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    
    res.clearCookie('connect.sid');

    logger.info('✅ User logged out');
    res.json({ message: 'Logged out' });
});

router.post('/me', async (req: Request, res: Response) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  const user = await User.findById(req.session.userId).select('-password');
  res.json(user);});
});

export default router;
