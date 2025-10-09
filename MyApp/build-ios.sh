#!/bin/bash

# BeauMED iOS Build Script
# This script helps build the iOS app with the correct settings

echo "🏗️  Building BeauMED iOS App..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Kill existing Metro bundler
echo "🛑 Stopping any existing Metro bundler..."
killall -9 node 2>/dev/null || true
sleep 2

# Start Metro bundler in background
echo "🚀 Starting Metro bundler..."
node ./node_modules/.bin/react-native start --reset-cache &
METRO_PID=$!
echo "   Metro PID: $METRO_PID"
sleep 5

# Open Xcode
echo ""
echo "📱 Opening Xcode..."
echo "   Please build and run from Xcode using ⌘R"
echo ""
open ios/MyApp.xcworkspace

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. In Xcode, select a simulator from the top toolbar"
echo "2. Press ⌘R to build and run"
echo "3. Metro bundler is running in the background (PID: $METRO_PID)"
echo ""
echo "To stop Metro bundler later, run: kill $METRO_PID"
