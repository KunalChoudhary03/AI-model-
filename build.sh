#!/bin/bash
set -e

echo "🚀 Starting Vercel build process..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting permissions for node_modules..."
find ./node_modules/.bin -type f -exec chmod +x {} \; 2>/dev/null || true

echo "🏗️ Building the application..."
# Try multiple build approaches
if command -v npx >/dev/null 2>&1; then
    echo "Using npx..."
    npx vite build
elif [ -f "./node_modules/.bin/vite" ]; then
    echo "Using direct binary..."
    ./node_modules/.bin/vite build
else
    echo "Using Node.js directly..."
    node ./node_modules/vite/bin/vite.js build
fi

echo "✅ Build completed successfully!"