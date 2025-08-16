// Database test setup
const { PrismaClient } = require('@prisma/client');

// Global test database client - prioritize TEST_DATABASE_URL
const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
console.log(`🔗 Connecting to test database: ${testDbUrl ? 'Configured' : 'Using main database'}`);

global.testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

// Setup before all tests
beforeAll(async () => {
  // Ensure database connection
  await global.testPrisma.$connect();
  
  // Verify database is accessible
  try {
    await global.testPrisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (global.testPrisma) {
    await global.testPrisma.$disconnect();
    console.log('✅ Database connection closed');
  }
});

// Global test utilities
global.clearTestDatabase = async () => {
  if (global.testPrisma) {
    // Clear all data in reverse dependency order
    await global.testPrisma.coverLetter.deleteMany();
    await global.testPrisma.resume.deleteMany();
    await global.testPrisma.job.deleteMany();
    await global.testPrisma.user.deleteMany();
  }
};

global.createTestUser = async (userData = {}) => {
  const bcrypt = require('bcrypt');
  
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password_hash: await bcrypt.hash('TestPassword123', 12),
    display_name: 'Test User',
    role: 'user',
    ...userData
  };

  return await global.testPrisma.user.create({ data: defaultUser });
};

global.createTestJob = async (userId, jobData = {}) => {
  const defaultJob = {
    user_id: userId,
    title: 'Test Job',
    company: 'Test Company',
    ...jobData
  };

  return await global.testPrisma.job.create({ data: defaultJob });
};

global.createTestResume = async (userId, resumeData = {}) => {
  const defaultResume = {
    user_id: userId,
    name: 'Test Resume',
    ...resumeData
  };

  return await global.testPrisma.resume.create({ data: defaultResume });
};

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for database operations
jest.setTimeout(30000);
