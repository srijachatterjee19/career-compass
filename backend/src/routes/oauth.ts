import express from 'express';
import passport from 'passport';
import { generateToken } from '../utils/jwt';
import logger from '../config/logger';

const router = express.Router();

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      const user = req.user as any;
      
        if (!user) {
            logger.error('❌ Google authentication failed');
            return res.status(401).json({ error: 'Authentication failed' });
        }

        logger.info(`✅ User ${user.email} authenticated with Google`);

      // Generate JWT token
      const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });
      
      logger.info(`✅ Token generated for user: ${user.email}`);

      logger.info('Token generated', token);

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      });

      logger.info('✅ Token set in cookie');

      // Redirect back to the frontend
      res.redirect('http://localhost:3000/');
    }
  );

// Apple
router.get('/apple', passport.authenticate('apple'));
router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login', session: true }),
  (_req, res) => res.redirect('/')
);

// Microsoft
router.get('/microsoft', passport.authenticate('azuread-openidconnect'));
router.post('/microsoft/callback',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/login', session: true }),
  (_req, res) => res.redirect('/')
);

export default router;
