#!/usr/bin/env node

/**
 * Test Database Setup Script
 * 
 * This script helps set up and verify the test database configuration.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('🧪 Setting up Test Database...\n');

// Check environment variables
const mainDbUrl = process.env.DATABASE_URL;
const testDbUrl = process.env.TEST_DATABASE_URL;

console.log('📋 Environment Configuration:');
console.log(`   Main Database: ${mainDbUrl ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   Test Database: ${testDbUrl ? '✅ Configured' : '❌ Not configured'}`);

if (!testDbUrl) {
  console.log('\n⚠️  No TEST_DATABASE_URL found. You can:');
  console.log('   1. Create a .env.test file with TEST_DATABASE_URL');
  console.log('   2. Export TEST_DATABASE_URL in your shell');
  console.log('   3. Use the same database (not recommended for production)');
  console.log('\n   Example .env.test file:');
  console.log('   TEST_DATABASE_URL="postgresql://user:pass@host:port/db_test"');
  process.exit(1);
}

// Test database connection
async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDbUrl,
      },
    },
  });

  try {
    console.log('\n🔗 Testing test database connection...');
    await prisma.$connect();
    
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Test database connection successful');
    console.log(`   Query result: ${JSON.stringify(result)}`);
    
    // Check if schema exists
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Schema exists - Users table has ${userCount} records`);
    } catch (error) {
      console.log('⚠️  Schema may not exist yet. Run: npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Test database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if the test database exists');
    console.log('   2. Verify connection string format');
    console.log('   3. Ensure database is accessible');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup
testConnection().then(() => {
  console.log('\n🎉 Test database setup complete!');
  console.log('   You can now run: npm run test:database');
}).catch((error) => {
  console.error('\n💥 Setup failed:', error);
  process.exit(1);
});
