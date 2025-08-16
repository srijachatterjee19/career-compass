import { PrismaClient } from '@prisma/client';

describe('Simple Database Test', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });
    
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    }
  });

  it('should connect to database', async () => {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toEqual([{ test: 1 }]);
  });

  it('should have access to database schema', async () => {
    // Check if we can access the User model
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  it('should handle basic database operations', async () => {
    // Test creating and deleting a simple record
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password_hash: 'test-hash',
        display_name: 'Test User',
        role: 'user'
      }
    });

    expect(testUser).toBeDefined();
    expect(testUser.email).toContain('@example.com');
    expect(testUser.display_name).toBe('Test User');

    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    // Verify deletion
    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });
    expect(deletedUser).toBeNull();
  });
});
