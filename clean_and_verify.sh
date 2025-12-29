#!/usr/bin/env bash
set -e

echo "=========================================="
echo "AudioScribe AI - Cleanup & Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${YELLOW}Step 1: Backing up original files...${NC}"
if [ ! -d "backup" ]; then
    mkdir -p backup
    cp -r . backup/ 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created in backup/ directory${NC}"
else
    echo -e "${GREEN}✓ Backup already exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 2: Removing old Google AI Studio references...${NC}"
# Remove old geminiService.ts if it exists
if [ -f "services/geminiService.ts" ]; then
    rm -f services/geminiService.ts
    echo -e "${GREEN}✓ Removed services/geminiService.ts${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Verifying cleaned files...${NC}"
# Check for any remaining Google/Gemini/AI Studio references
REFERENCES=$(grep -ri "google\|gemini\|ai studio" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --exclude-dir=node_modules --exclude-dir=backup --exclude-dir=dist . || true)

if [ -z "$REFERENCES" ]; then
    echo -e "${GREEN}✓ No Google AI Studio references found${NC}"
else
    echo -e "${RED}⚠ Found remaining references:${NC}"
    echo "$REFERENCES"
fi
echo ""

echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 5: Checking environment configuration...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    if grep -q "API_KEY=" .env.local; then
        echo -e "${GREEN}✓ API_KEY variable found${NC}"
    else
        echo -e "${YELLOW}⚠ API_KEY not set in .env.local${NC}"
        echo "  Add your API key: echo 'API_KEY=your_key_here' >> .env.local"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo "  Creating template..."
    echo "API_KEY=" > .env.local
    echo -e "${GREEN}✓ Created .env.local template${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Running TypeScript type check...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "${RED}✗ TypeScript compilation failed${NC}"
    echo "  Run 'npm run build' to see errors"
fi
echo ""

echo -e "${YELLOW}Step 7: Generating project structure...${NC}"
echo "Project Structure:"
tree -L 3 -I 'node_modules|dist|backup' . 2>/dev/null || find . -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/backup/*' -not -path '*/.git/*' | head -50
echo ""

echo "=========================================="
echo -e "${GREEN}Cleanup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Set your API_KEY in .env.local"
echo "2. Configure API_ENDPOINT if needed (in transcriptionService.ts)"
echo "3. Run 'npm run dev' to start development server"
echo "4. Or build Docker image: docker build -t audioscribe-ai ."
echo ""
echo "Test Commands:"
echo "  npm run dev          # Start development server"
echo "  npm run build        # Build for production"
echo "  npm run preview      # Preview production build"
echo ""
