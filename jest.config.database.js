module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'tests/**/*.{ts,js}',
    '!tests/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.database.js'],
  testTimeout: 30000, // 30 seconds for database operations
  verbose: true,
  // Load test environment variables
  setupFiles: ['<rootDir>/jest.env.js'],
  // Ensure test database is used
  testEnvironmentOptions: {
    url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  }
};
