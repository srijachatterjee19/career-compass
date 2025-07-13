import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import 'express-session';

declare module 'express-session' {
  interface Session {
    userId?: string; // Add the userId property
  }
}
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  //  //  Session-based authentication
   if (req.session?.userId) {
      logger.info(`✅ User authenticated with session ID: ${req.session.userId}`);
      // Attach userId to request for further use
      req.user = { id: req.session.userId };
    return next(); 
    } else {
      logger.warn('⚠️ Not logged in – no session');
    }

  // JWT-based authentication 
  const token = req.cookies?.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };
      req.user = decoded; // Attach decoded user to request
      return next();
    } catch (err) {
      logger.error('❌ Invalid or expired token:', err);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}