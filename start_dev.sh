#!/bin/bash

echo "Starting Giftify (Firebase Mode)..."

# Check for node
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH."
    exit 1
fi

# Start Frontend only (Backend is now via Firebase)
echo "Starting Frontend..."
npm run dev
