#!/bin/bash
# Build script for Vercel deployment

echo "Setting up build environment..."

# Ensure node_modules/.bin has execute permissions
chmod +x ./node_modules/.bin/* 2>/dev/null || true

# Run the build with explicit binary path
echo "Building the application..."
npx vite build

echo "Build completed successfully!"