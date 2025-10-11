#!/bin/bash
set -e

echo "🚀 Starting Vercel build process..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔧 Setting up build environment..."
export NODE_ENV=production

echo "🏗️ Building the application..."
npx vite build

echo "✅ Build completed successfully!"
echo "📁 Output directory: frontend/dist/"

# List the output files for verification
echo "📋 Build output:"
ls -la dist/