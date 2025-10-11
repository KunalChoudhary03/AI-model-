#!/bin/bash

# Vercel Deployment Script for Frontend
echo "🚀 Deploying Frontend to Vercel..."

# Change to frontend directory
cd frontend

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"