#!/bin/bash
# Vercel build script for Jeeravan frontend

echo "🚀 Starting build process..."

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Output directory: dist/"