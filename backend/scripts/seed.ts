import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User'; 
import bcrypt from 'bcrypt';
import logger from '../src/config/logger';
import jwt from 'jsonwebtoken';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const JWT_SECRET = process.env.JWT_SECRET!;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();

    // Dummy data
    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com',password: await bcrypt.hash('admin123', 10),role: 'admin',},
      { name: 'Bob Singh', email: 'bob@example.com',password: await bcrypt.hash('admin123', 10),role: 'admin', },
      { name: 'Carlos Ramos', email: 'carlos@example.com', password: await bcrypt.hash('admin123', 10),role: 'user',}
    ];
    
    await User.insertMany(users);
    logger.info('🌱 Users seeded with roles: admin, user');

    users.forEach((user) => {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log(`🪪 ${user.role} token for ${user.email}:`);
      console.log(token);
    });

    
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();