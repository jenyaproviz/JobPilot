#!/bin/bash
# Render build script for JobPilot Server

echo "🔧 Installing dependencies..."
npm install --production=false

echo "� Current directory:"
pwd
ls -la

echo "�🔧 Building TypeScript..."
npx tsc --skipLibCheck

echo "📂 After build - checking dist directory:"
ls -la
if [ -d "dist" ]; then
    echo "✅ Dist directory exists"
    ls -la dist/
    if [ -f "dist/index.js" ]; then
        echo "✅ index.js exists in dist"
    else
        echo "❌ index.js NOT found in dist"
    fi
else
    echo "❌ Dist directory NOT found"
fi

echo "✅ Build completed!"