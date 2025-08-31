#!/bin/bash

echo "🔍 Post-clone verification starting..."

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node --version 2>/dev/null || echo "not found")
if [[ $node_version == "not found" ]]; then
  echo "❌ Node.js not found. Please install Node.js 18 or higher."
  exit 1
fi
echo "✅ Node.js version: $node_version"

# Check package manager
if command -v pnpm &> /dev/null; then
  echo "✅ pnpm found"
  PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
  echo "✅ npm found"
  PACKAGE_MANAGER="npm"
else
  echo "❌ No package manager found. Please install npm or pnpm."
  exit 1
fi

# Check for .env file
if [[ ! -f .env ]]; then
  echo "⚠️  .env file not found. Please copy .env.example to .env and fill in values."
  echo "   cp .env.example .env"
else
  echo "✅ .env file found"
fi

# Install dependencies
echo "Installing dependencies..."
$PACKAGE_MANAGER install

echo "🎉 Post-clone check completed successfully!"
echo "Next steps:"
echo "1. Configure your .env file with appropriate values"
echo "2. Run '$PACKAGE_MANAGER run dev' to start development server"
echo "3. Run '$PACKAGE_MANAGER run typecheck' to verify TypeScript"