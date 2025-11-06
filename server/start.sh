#!/bin/bash
# Render start script for JobPilot Server

echo "🚀 Starting JobPilot Server..."
echo "📊 Memory Info:"
free -h
echo "📂 Files in dist:"
ls -la dist/

# Start the compiled server
NODE_OPTIONS="--max-old-space-size=512" node dist/index.js