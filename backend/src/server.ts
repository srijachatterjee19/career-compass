import dotenv from 'dotenv';
import app from './app';
import { connectMongo } from './config/db';
import logger from './config/logger';
import authRoutes from './routes/auth';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use('/api/auth', authRoutes);

connectMongo();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  logger.error('❌ Failed to start server:', err);
  process.exit(1);
});


  
