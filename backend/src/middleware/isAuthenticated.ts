import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }

  logger.warn('‼️Unauthorized access attempt');
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
};
