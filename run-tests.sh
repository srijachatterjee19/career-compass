#!/bin/bash

echo "🧪 Career Compass - Resume Database Tests"
echo "=========================================="

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install test dependencies
echo "📦 Installing test dependencies..."
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom @types/jest

echo ""
echo "🚀 Running Resume Database Tests..."
echo ""

# Run API route tests
echo "📡 Testing API Routes..."
npm run test:api

echo ""
echo "🖥️  Testing Frontend Components..."
npm run test:resume

echo ""
echo "🗄️  Testing Database Integration..."
npm run test:e2e

echo ""
echo "📊 Running Full Test Suite with Coverage..."
npm run test:coverage

echo ""
echo "✅ All tests completed!"
echo ""
echo "📋 Test Summary:"
echo "  - API Route Tests: Unit tests for /api/resumes endpoints"
echo "  - Frontend Tests: Component tests for resume creation form"
echo "  - Database Tests: E2E tests for actual database persistence"
echo "  - Coverage Report: Full test coverage analysis"
echo ""
echo "💡 To run specific test types:"
echo "  npm run test:api      # API route tests only"
echo "  npm run test:resume   # Frontend component tests only"
echo "  npm run test:e2e      # Database integration tests only"
echo "  npm run test:watch    # Watch mode for development"
