import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User'; 

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();

    // Dummy data
    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Singh', email: 'bob@example.com' },
      { name: 'Carlos Ramos', email: 'carlos@example.com' }
    ];

    await User.insertMany(users);
    console.log('🌱 Seeded user data');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();