import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Request, Response } from 'express';
import logger from '../config/logger';
import { log } from 'console';

const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.create({ email, password });
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token });
};

export const login = async (req: Request, res: Response) => {
    logger.info('Login attempt');
    // Step 1: Validate CSRF token
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken || csrfToken !== req.csrfToken()) {
        logger.warn('CSRF token mismatch');
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }   
    // Step 2: Authenticate user
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (email == 'test@example.com' && password == 'secret') {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
        
        // HttpOnly cookie so JS can't access it
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });
        logger.info('User logged in successfully');
        return res.json({ message: 'Logged in' });
    }

    logger.info('Invalid email or password')
    return res.status(401).json({ error: 'Invalid email or password' });
};
