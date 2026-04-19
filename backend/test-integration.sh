#!/bin/bash

# Integration Test Script
echo "🧪 Testing Ara Integration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
HEALTH=$(curl -s http://localhost:3001/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo -e "${GREEN}✅ Backend is running${NC}"
else
  echo -e "${RED}❌ Backend is not responding${NC}"
  exit 1
fi
echo ""

# Test 2: Job Data
echo -e "${BLUE}Test 2: Job Data${NC}"
JOBS=$(curl -s http://localhost:3001/debug/jobs)
JOB_COUNT=$(echo $JOBS | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
echo "   Found $JOB_COUNT jobs"
if [[ $JOB_COUNT -gt 0 ]]; then
  echo -e "${GREEN}✅ Job fetching works${NC}"
else
  echo -e "${RED}❌ No jobs found${NC}"
fi
echo ""

# Test 3: Sample Strategy
echo -e "${BLUE}Test 3: Generate Strategy with Test Data${NC}"
echo "   Calling /test-strategy..."
RESULT=$(curl -s http://localhost:3001/test-strategy)
if [[ $RESULT == *"strategy"* ]] && [[ $RESULT == *"companies"* ]]; then
  echo -e "${GREEN}✅ Strategy generation works${NC}"

  # Parse some results
  COMPANY_COUNT=$(echo $RESULT | grep -o '"name":"[^"]*"' | wc -l)
  echo "   Generated $COMPANY_COUNT companies"

  BULLET_COUNT=$(echo $RESULT | grep -o '"resumeBullets":\[[^\]]*\]' | grep -o '"[^"]*"' | wc -l)
  echo "   Generated resume bullets"
else
  echo -e "${RED}❌ Strategy generation failed${NC}"
  echo "   Response: $RESULT"
fi
echo ""

# Test 4: Custom Profile
echo -e "${BLUE}Test 4: Generate Strategy with Custom Profile${NC}"
CUSTOM_RESULT=$(curl -s -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "major": "Electrical Engineering",
    "graduationYear": "2026",
    "targetRoles": "Hardware, Embedded Systems",
    "locations": "Seattle, Boston",
    "skills": "C++, FPGA, Embedded Linux"
  }')

if [[ $CUSTOM_RESULT == *"strategy"* ]]; then
  echo -e "${GREEN}✅ Custom profile works${NC}"

  # Check if it's personalized
  if [[ $CUSTOM_RESULT == *"Test Student"* ]] || [[ $CUSTOM_RESULT == *"Electrical Engineering"* ]]; then
    echo -e "${GREEN}✅ Output is personalized${NC}"
  else
    echo -e "${RED}⚠️  Output might not be fully personalized${NC}"
  fi
else
  echo -e "${RED}❌ Custom profile failed${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Integration tests complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Start frontend: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Fill out form and test E2E"
echo ""
