#!/usr/bin/env node

/**
 * Database Test Runner
 * 
 * This script runs database seeding tests in a controlled environment.
 * It ensures the database is properly configured and tests are isolated.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Database Seeding Tests...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  require(packageJsonPath);
} catch (error) {
  console.error('❌ Error: Must run from project root directory');
  process.exit(1);
}

// Check environment
if (!process.env.DATABASE_URL && !process.env.TEST_DATABASE_URL) {
  console.warn('⚠️  Warning: No DATABASE_URL or TEST_DATABASE_URL found');
  console.warn('   Tests may fail if database is not accessible\n');
}

try {
  // Run the database tests
  console.log('📋 Running tests with Jest...\n');
  
  const testCommand = 'npm run test:database';
  execSync(testCommand, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Database tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Database tests failed!');
  console.error('Exit code:', error.status);
  process.exit(error.status || 1);
}
