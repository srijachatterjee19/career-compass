#!/bin/bash

echo "🚀 Setting up Career Compass database with Prisma..."

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5433 -U postgres; then
    echo "❌ PostgreSQL is not running on port 5433"
    echo "💡 Make sure your Docker container is running:"
    echo "   docker-compose up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Push the schema to the database
echo "📊 Pushing Prisma schema to database..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully"
else
    echo "❌ Failed to update database schema"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Failed to seed database"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start your Next.js development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Try registering a new user or logging in with:"
echo "   - Email: john.doe@example.com"
echo "   - Password: Password123"
echo ""
echo "🔧 Useful commands:"
echo "   - View database: npx prisma studio"
echo "   - Reset database: npx prisma db push --force-reset"
echo "   - Seed database: npm run db:seed"
