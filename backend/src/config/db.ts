
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info(`✅ Connected to MongoDB`);
  } catch (err) {
    logger.info('❌ Connection failed:', err);
    throw err;
  }
};

