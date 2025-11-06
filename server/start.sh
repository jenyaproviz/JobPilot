#!/bin/bash
# Render start script for JobPilot Server

echo "🚀 Starting JobPilot Server..."
echo "� Current directory:"
pwd

echo "📂 Directory contents:"
ls -la

echo "📂 Checking dist directory:"
if [ -d "dist" ]; then
    echo "✅ Dist directory exists"
    ls -la dist/
    if [ -f "dist/index.js" ]; then
        echo "✅ Found dist/index.js - starting server..."
        NODE_OPTIONS="--max-old-space-size=512" node dist/index.js
    else
        echo "❌ dist/index.js not found!"
        exit 1
    fi
else
    echo "❌ Dist directory not found!"
    echo "📂 Available directories:"
    ls -la
    exit 1
fi