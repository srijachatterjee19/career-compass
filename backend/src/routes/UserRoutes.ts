import express from 'express';
import User from '../models/User';

const router = express.Router();

// GET /api/users - fetch all users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - create a new user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    console.error('❌ Failed to create user:', err.message);
    res.status(400).json({
      error: 'Failed to create user',
      message: err.message,
    });
  }
});
export default router;
