#!/bin/bash

# Build script for Mac app
# Usage: ./build-mac-app.sh

set -e  # Exit on error

echo "🎨 Building Audiovisual Art Studio for Mac..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Install it first: npm install -g pnpm"
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg not found. Install it: brew install ffmpeg"
    echo "   (The app will still build but won't work without FFmpeg)"
fi

echo "${BLUE}1/5${NC} Installing dependencies..."
pnpm install --frozen-lockfile

echo ""
echo "${BLUE}2/5${NC} Building shared types..."
cd packages/shared
pnpm build
cd ../..

echo ""
echo "${BLUE}3/5${NC} Building backend server..."
cd packages/server
pnpm build
cd ../..

echo ""
echo "${BLUE}4/5${NC} Building frontend..."
cd packages/client
pnpm build
cd ../..

echo ""
echo "${BLUE}5/5${NC} Building Mac application..."
cd packages/electron

# Check if electron dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing Electron dependencies..."
    pnpm install
fi

# Check if icon exists
if [ ! -f "assets/icon.icns" ]; then
    echo ""
    echo "⚠️  No app icon found at packages/electron/assets/icon.icns"
    echo "   The app will build but won't have a custom icon."
    echo "   Create one later and rebuild."
    echo ""
    
    # Create assets directory if it doesn't exist
    mkdir -p assets
fi

# Build the app
pnpm build:mac

cd ../..

echo ""
echo "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Your Mac app is ready:"
echo "  📦 packages/electron/dist/Audiovisual Art Studio.app"
echo "  💿 packages/electron/dist/Audiovisual Art Studio-1.0.0.dmg"
echo ""
echo "To test the app:"
echo "  open 'packages/electron/dist/Audiovisual Art Studio.app'"
echo ""
echo "To remove quarantine (for testing):"
echo "  xattr -cr 'packages/electron/dist/Audiovisual Art Studio.app'"
echo ""
