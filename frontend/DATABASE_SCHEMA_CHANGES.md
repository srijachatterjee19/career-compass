# Database Schema Changes Flow

This document outlines the complete process for handling database schema changes in the Career Compass application, which uses Prisma ORM with PostgreSQL.

## Overview

When you make changes to the Prisma schema (`prisma/schema.prisma`), you need to follow a specific flow to ensure the database and application stay in sync.

## Prerequisites

- Docker and Docker Compose running
- PostgreSQL container accessible at `localhost:5433`
- Frontend development server running at `localhost:3002`

## Complete Flow for Schema Changes

### 1. Make Schema Changes


### 2. Clear Database (When Schema Changes Are Breaking)

**Option A: Reset Database (Recommended for major changes)**
```bash
# Stop containers
cd .. && docker compose down

# Remove PostgreSQL volume (WARNING: This deletes ALL data)
docker volume rm career-compass_postgres_data

# Start fresh PostgreSQL container
docker compose up -d postgres

# Wait for PostgreSQL to be ready
sleep 5

# Go back to frontend directory
cd frontend
```

**Option B: Force Reset Database (Alternative)**
```bash
# Force reset with data loss
npx prisma db push --force-reset --accept-data-loss
```

### 3. Apply Schema Changes

```bash
# Push schema to database
npx prisma db push

# Verify schema is synced
npx prisma db pull
```

### 4. Regenerate Prisma Client

```bash
# Generate new Prisma client with updated types
npx prisma generate
```

### 5. Verify Schema

Check that your schema file contains the expected changes:

```bash
# View the introspected schema
cat prisma/schema.prisma
```

### 6. Test the Changes

```bash
# Test basic functionality
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","display_name":"Test User"}'

# Test your new fields/functionality
curl -X POST "http://localhost:3000/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","company":"Test Company","status":"Applied","userId":1}'
```

## Common Scenarios

### Adding New Fields

1. **Add field to schema.prisma**
2. **Clear database** (if field is non-nullable without default)
3. **Push schema**: `npx prisma db push`
4. **Regenerate client**: `npx prisma generate`
5. **Update API validation** (Zod schemas)
6. **Update frontend types** (TypeScript interfaces)
7. **Update frontend components** (forms, displays)

### Removing Fields

1. **Remove field from schema.prisma**
2. **Clear database** (to remove column)
3. **Push schema**: `npx prisma db push`
4. **Regenerate client**: `npx prisma generate`
5. **Remove from API validation**
6. **Remove from frontend types**
7. **Remove from frontend components**

### Changing Field Types

1. **Update field type in schema.prisma**
2. **Clear database** (type changes often require reset)
3. **Push schema**: `npx prisma db push`
4. **Regenerate client**: `npx prisma generate`
5. **Update validation logic**
6. **Update frontend handling**

## Database Seeding (After Schema Changes)

After making schema changes and clearing the database:

```bash
# Seed with test data
npm run db:seed

# Or run the seed script directly
npx tsx prisma/seed.ts
```

## Best Practices

1. **Always clear database** when making breaking schema changes
2. **Test immediately** after schema changes
3. **Use `npx prisma db pull`** to verify actual database state
4. **Regenerate client** after every schema change
5. **Update validation schemas** to match new fields
6. **Update frontend types** to match backend changes
7. **Test CRUD operations** for new/modified fields

## Commands Reference

```bash
# Database operations
npx prisma db push          # Push schema to database
npx prisma db pull          # Pull database state to schema
npx prisma db push --force-reset  # Reset and sync database
npx prisma generate         # Generate Prisma client
npx prisma studio           # Open database GUI

# Docker operations
docker compose down          # Stop all containers
docker compose up -d postgres # Start only PostgreSQL
docker volume rm career-compass_postgres_data  # Clear data

# Testing
curl -X POST "http://localhost:3000/api/auth/register" # Test registration
curl -X POST "http://localhost:3000/api/jobs"          # Test job creation
```
