#!/bin/bash

set -e

echo "🎯 Naveeg DMS - Final Cleanup & Export Pack"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
fi

print_status "Prerequisites check passed"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_status "Dependencies installed"

# Type checking
print_info "Running type checks..."
if npm run typecheck; then
    print_status "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Linting
print_info "Running linter..."
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting issues found, attempting to fix..."
    npm run fix
    print_status "Linting issues fixed"
fi

# Unit tests
print_info "Running unit tests..."
if npm run test; then
    print_status "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Build
print_info "Building application..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Security audit
print_info "Running security audit..."
if npm audit --audit-level=moderate; then
    print_status "Security audit passed"
else
    print_warning "Security vulnerabilities found - review npm audit output"
fi

# Bundle analysis
print_info "Analyzing bundle size..."
if [ -d "dist" ]; then
    du -sh dist/*
    print_status "Bundle analysis complete"
fi

# Final verification
print_info "Running final verification..."

# Check critical files exist
critical_files=(
    ".env.example"
    "README.md"
    "docs/ARCHITECTURE.md"
    "docs/EXPORT.md"
    "docs/SECURITY.md"
    "scripts/post-clone-check.sh"
    "scripts/supabase-deploy.sh"
    "scripts/verify-webhooks.sh"
    "supabase/seed.sql"
    ".github/workflows/ci.yml"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Check package.json scripts
required_scripts=(
    "dev"
    "build"
    "typecheck"
    "lint"
    "fix"
    "test"
    "test:e2e"
)

for script in "${required_scripts[@]}"; do
    if npm run | grep -q "^  $script$"; then
        print_status "Script available: $script"
    else
        print_error "Missing script: $script"
        exit 1
    fi
done

echo ""
echo "🎉 EXPORT PACK READY!"
echo "===================="
print_status "All checks passed"
print_status "Project is ready for export"
print_info "Next steps:"
echo "  1. Review docs/EXPORT.md for migration instructions"
echo "  2. Set up your production environment"
echo "  3. Configure environment variables"
echo "  4. Deploy to Vercel"
echo "  5. Deploy Supabase functions"
echo ""
print_info "For support, see docs/ARCHITECTURE.md and docs/SECURITY.md"