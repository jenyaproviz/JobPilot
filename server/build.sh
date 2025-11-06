#!/bin/bash
# Render build script for JobPilot Server

echo "🔧 Installing dependencies..."
npm install --production=false

echo "🔧 Building TypeScript..."
npx tsc --skipLibCheck

echo "✅ Build completed successfully!"