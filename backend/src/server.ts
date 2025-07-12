import dotenv from 'dotenv';
import app from './app';
import { connectMongo } from './config/db';
import logger from './config/logger';

dotenv.config();

const PORT = process.env.PORT || 5001;

connectMongo();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  logger.error('❌ Failed to start server:', err);
  process.exit(1);
});


  
