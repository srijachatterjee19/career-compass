import express, { Request, Response } from 'express';
import User from '../models/User';
import logger from '../config/logger';
import 'express-session';
import { z } from 'zod';
import csrf from 'csurf';

const router = express.Router();

// Extend the Session type to include userId
declare module 'express-session' {
    interface Session {
      userId?: string;
    }
}

const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'user']).default('user'), // Default to 'user'
  });

  // POST /api/auth/register - register a new user
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);
  
      const existingUser = await User.findOne({ email: data.email });

      // Check if user already exists
      if (existingUser) {
        logger.warn(`‼️ Registration attempt with existing email: ${data.email}`);
        return res.status(400).json({ error: 'Email already registered' });
      }
  
      // Create new user otherwise
      const user = new User(data);

      await user.save();

      logger.info(user.role);

    //   req.session.userId = user._id;
    //   req.session.role = user.role;

      logger.info(`✅ Session initialized for user: ${user.email}`);
      logger.info(`✅ User registered: ${user.email}`);
  
      res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, role: user.role } });

    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ error: err.errors });
      }
      console.error('❌ Registration error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

// POST /api/auth/login - login a user
router.post('/login', async (req: Request, res: Response) => {
  // if user is already logged in, redirect to home
    if (req.session?.userId) {
        logger.info(`✅ User already logged in: ${req.session.userId}`);
        logger.info(`Session ID: ${req.cookies['connect.sid']}`);

        // redirect to home
        return res.status(200).json({ redirect: '/' });
    }
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
  logger.info(`Cookies: ${JSON.stringify(req.cookies, null, 2)}`);
  logger.info(`Session ID: ${req.cookies['connect.sid']}`);
  logger.info('✅ Session initialized for user:');
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

// GET /api/auth/me - get current user
router.get('/me', async (req: Request, res: Response) => {
 logger.info('✅ Fetching current user data');
  if (!req.session?.userId) {
    logger.warn('⚠️ Not logged in – no session');
    return res.status(401).json({ error: 'Not logged in' });
  }

  logger.info(`✅ Fetching user data for session ID: ${req.session.userId}`);

  const user = await User.findById(req.session.userId).select('-password');
  if (!user) {
    logger.info(`Session ID: ${req.cookies['connect.sid']}`);
    logger.warn(`‼️ User not found for session ID: ${req.session.userId}`);
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);});
});



export default router;
