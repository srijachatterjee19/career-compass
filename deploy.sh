#!/bin/bash

echo "🚀 Career Compass Deployment Script"
echo "=================================="

# Check if required tools are installed
echo "Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the project
echo "🏗️ Building the project..."
npm run build

echo ""
echo "🎉 Local build completed successfully!"
echo ""
echo "Next steps for deployment:"
echo "1. Push your code to GitHub"
echo "2. Set up Neon Postgres database (see DEPLOYMENT.md)"
echo "3. Deploy to Vercel (see DEPLOYMENT.md)"
echo "4. Configure environment variables in Vercel"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
