// Test environment configuration
// Try to load .env.test first, then fall back to .env
try {
  require('dotenv').config({ path: '.env.test' });
} catch (error) {
  require('dotenv').config();
}

// Set test environment
process.env.NODE_ENV = 'test';

// Ensure we have required environment variables
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  console.warn('⚠️  No DATABASE_URL or TEST_DATABASE_URL found. Tests may fail.');
}

// Set default test values - prioritize TEST_DATABASE_URL
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Log test environment info
console.log('🧪 Test Environment Configuration:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   Main Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
console.log(`   Test Database: ${process.env.TEST_DATABASE_URL ? 'Configured' : 'Not configured'}`);
console.log(`   Test Timeout: 30s`);
