import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (_req, res) => {
  const mongoStatus = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    mongo: {
      connected: mongoStatus === 1,
      state:
        mongoStatus === 0
          ? 'disconnected'
          : mongoStatus === 1
          ? 'connected'
          : mongoStatus === 2
          ? 'connecting'
          : 'disconnecting',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
