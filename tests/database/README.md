# Database Seeding Tests

This directory contains comprehensive tests for the database seeding functionality of the Career Compass application.

## Overview

The tests verify that:
- Users can be created with proper password hashing
- Jobs are created with correct relationships and optional fields
- Resumes are created with JSON fields and proper linking
- Cover letters maintain referential integrity
- Data validation works correctly
- Cascade deletions work as expected

## Test Files

### `seeding.test.ts`
Comprehensive tests for all database seeding operations including:
- User creation and validation
- Job creation and relationships
- Resume creation with JSON fields
- Cover letter creation and linking
- Data integrity and validation
- Cascade deletion behavior

### `seed-script.test.ts`
Tests that specifically validate the seed script functionality by:
- Mocking the actual seed script
- Verifying data creation patterns
- Testing relationships and constraints
- Validating data quality

## Running the Tests

### Prerequisites
1. Ensure your database is running and accessible
2. Set up environment variables (see Configuration section)
3. Install dependencies: `npm install`

### Test Commands

```bash
# Run all database tests
npm run test:database

# Run only seed script tests
npm run test:seed

# Run with custom Jest config
jest --config jest.config.database.js

# Run specific test file
jest --config jest.config.database.js tests/database/seeding.test.ts
```

### Using the Test Runner Script

```bash
# Make script executable (first time only)
chmod +x scripts/test-database.js

# Run tests
./scripts/test-database.js
```

## Configuration

### Environment Variables

The tests use these environment variables:

- `DATABASE_URL`: Primary database connection string
- `TEST_DATABASE_URL`: Test database connection string (optional, falls back to DATABASE_URL)

### Test Database Setup

For isolated testing, you can:

1. **Use a separate test database:**
   ```bash
   export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/career_compass_test"
   ```

2. **Use the same database with test isolation:**
   The tests automatically clear data before each test run.

### Coverage Reports

Generate coverage reports:
```bash
npm run test:database -- --coverage
```

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Include proper error handling
4. Test both success and failure cases
5. Validate data integrity
6. Update this README if needed

## Related Files

- `prisma/seed.ts`: Main seeding script
- `prisma/schema.prisma`: Database schema
- `jest.config.database.js`: Test configuration
- `jest.setup.database.js`: Test setup and utilities
