#!/bin/bash

set -e

echo "🎯 Naveeg DMS - Export Pack Generator"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Create export directory
EXPORT_DIR="naveeg-dms-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$EXPORT_DIR"

print_info "Creating export pack in: $EXPORT_DIR"

# Copy essential files
print_info "Copying project files..."
cp -r src/ "$EXPORT_DIR/"
cp -r supabase/ "$EXPORT_DIR/"
cp -r public/ "$EXPORT_DIR/"
cp -r .github/ "$EXPORT_DIR/"
cp -r scripts/ "$EXPORT_DIR/"
cp -r docs/ "$EXPORT_DIR/"

# Copy configuration files
cp package.json "$EXPORT_DIR/"
cp package-lock.json "$EXPORT_DIR/" 2>/dev/null || true
cp tsconfig.json "$EXPORT_DIR/"
cp tsconfig.app.json "$EXPORT_DIR/" 2>/dev/null || true
cp tsconfig.node.json "$EXPORT_DIR/" 2>/dev/null || true
cp vite.config.ts "$EXPORT_DIR/"
cp tailwind.config.ts "$EXPORT_DIR/"
cp postcss.config.js "$EXPORT_DIR/" 2>/dev/null || true
cp .env.example "$EXPORT_DIR/"
cp README.md "$EXPORT_DIR/"
cp .prettierrc "$EXPORT_DIR/" 2>/dev/null || true
cp eslint.config.js "$EXPORT_DIR/"
cp vitest.config.ts "$EXPORT_DIR/" 2>/dev/null || true
cp playwright.config.ts "$EXPORT_DIR/" 2>/dev/null || true

# Create deployment instructions
cat > "$EXPORT_DIR/DEPLOYMENT.md" << 'EOF'
# Naveeg DMS - Deployment Instructions

## Quick Start
1. `npm ci`
2. `cp .env.example .env` (fill in your values)
3. `npm run build`
4. Deploy to Vercel/Netlify

## Supabase Setup
1. Create new Supabase project
2. `supabase link --project-ref your-project-id`
3. `supabase db push`
4. `supabase functions deploy`

## Environment Variables
See `.env.example` for required variables.

## Health Check
After deployment, verify:
- Frontend loads: `https://your-domain.com`
- Functions healthy: `https://your-project.supabase.co/functions/v1/billing/health`

For detailed instructions, see `docs/EXPORT.md`.
EOF

# Create package info
cat > "$EXPORT_DIR/EXPORT_INFO.json" << EOF
{
  "export_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": "naveeg-dms",
  "version": "1.0.0",
  "source": "lovable",
  "target": "cursor-vercel-supabase",
  "features": [
    "Next.js-like file structure",
    "TypeScript strict mode ready",
    "Supabase integration",
    "Stripe payments",
    "10Web API integration",
    "PageSpeed Insights",
    "Internationalization",
    "CI/CD pipeline",
    "Production optimized"
  ],
  "stack": {
    "frontend": "React + TypeScript + Vite + Tailwind",
    "backend": "Supabase Edge Functions",
    "database": "PostgreSQL (Supabase)",
    "payments": "Stripe",
    "hosting": "Vercel",
    "external_apis": ["10Web", "PageSpeed Insights"]
  }
}
EOF

# Create archive
tar -czf "${EXPORT_DIR}.tar.gz" "$EXPORT_DIR"

print_status "Export pack created successfully!"
print_info "Location: ${EXPORT_DIR}.tar.gz"
print_info "Size: $(du -h "${EXPORT_DIR}.tar.gz" | cut -f1)"

echo ""
echo "📋 Export Contents:"
echo "  ✓ Source code (src/)"
echo "  ✓ Supabase setup (supabase/)"
echo "  ✓ Edge functions"
echo "  ✓ Database migrations"
echo "  ✓ CI/CD pipeline"
echo "  ✓ Documentation"
echo "  ✓ Deployment scripts"
echo ""
print_info "Ready for migration to Cursor + Vercel + Supabase"
print_info "See DEPLOYMENT.md for next steps"