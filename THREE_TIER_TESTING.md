# Testing Three-Tier Fallback System

## Quick Test Guide

### Prerequisites

```bash
# Verify Ara is installed (optional - system works without it)
ara --version

# Start backend
cd backend
npm run dev
```

---

## Test 1: Tier 1 (Ara Primary) ✅

**Goal**: Verify Ara runs successfully

**Setup**:
```bash
# Ensure Ara is installed and app.py exists
ls ../app.py
```

**Test**:
```bash
curl -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Chen",
    "major": "Computer Science",
    "graduationYear": "2025",
    "targetRoles": "SWE, AI/ML",
    "locations": "San Francisco, Remote",
    "skills": "Python, React, TensorFlow"
  }'
```

**Expected Console Output**:
```
🤖 [Tier 1] Calling Ara automation (primary)...
[Ara stdout] ✅ Loaded input from /tmp/ara-input-xxx.json
[Ara stdout] Calling get_student_profile()...
[Ara stdout] Calling get_available_jobs()...
✅ Ara agent completed successfully
📝 Syncing to Notion...
```

**Success Criteria**:
- ✅ Response returns JSON with companies
- ✅ Console shows "Ara agent completed successfully"
- ✅ No fallback messages

---

## Test 2: Tier 2 (Anthropic API Fallback)

**Goal**: Verify Anthropic API fallback works when Ara fails

**Setup**:
```bash
# Method 1: Temporarily rename app.py
mv ../app.py ../app.py.backup

# OR Method 2: Set short timeout (in araIntegration.ts, change timeout to 100ms)

# Set API key
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Test**: Same curl command as Test 1

**Expected Console Output**:
```
🤖 [Tier 1] Calling Ara automation (primary)...
⚠️ Ara agent failed: Error: Command failed: ara run
📞 [Tier 2] Trying Anthropic API fallback...
✅ Anthropic API fallback succeeded
📝 Syncing to Notion...
```

**Success Criteria**:
- ✅ Response returns JSON with companies
- ✅ Console shows "Anthropic API fallback succeeded"
- ✅ Tier 1 failed, Tier 2 succeeded

**Cleanup**:
```bash
# Restore app.py
mv ../app.py.backup ../app.py
```

---

## Test 3: Tier 3 (TypeScript Fallback)

**Goal**: Verify TypeScript generator works when both Ara and API fail

**Setup**:
```bash
# Break Ara (rename app.py)
mv ../app.py ../app.py.backup

# Remove API key
unset ANTHROPIC_API_KEY
```

**Test**: Same curl command as Test 1

**Expected Console Output**:
```
🤖 [Tier 1] Calling Ara automation (primary)...
⚠️ Ara agent failed: Error: Command failed: ara run
📞 [Tier 2] Trying Anthropic API fallback...
⚠️ Anthropic API failed: Error: ANTHROPIC_API_KEY not set
🔧 [Tier 3] Using TypeScript generator (final fallback)...
✅ TypeScript fallback strategy generated
📝 Syncing to Notion...
```

**Success Criteria**:
- ✅ Response returns JSON with companies
- ✅ Console shows "TypeScript fallback strategy generated"
- ✅ All tiers attempted in order
- ✅ Never fails to return valid response

**Cleanup**:
```bash
# Restore app.py
mv ../app.py.backup ../app.py
```

---

## Test 4: Frontend Integration

**Goal**: Verify frontend works with all tiers

**Setup**:
```bash
# Start frontend (in separate terminal)
cd ..
npm run dev
```

**Test**: Manual UI testing

1. Open http://localhost:5173
2. Fill form with test data
3. Click "Generate Strategy"
4. Verify results display correctly

**Try with each tier**:
- Tier 1: Normal setup (Ara working)
- Tier 2: Ara broken, API key set
- Tier 3: Ara broken, no API key

**Success Criteria**:
- ✅ Frontend displays results for all tiers
- ✅ No errors in browser console
- ✅ Company cards show match percentages
- ✅ Hover tooltips work
- ✅ Outlook panel displays
- ✅ Notion sync confirmation shows

---

## Test 5: Stress Test (Rapid Requests)

**Goal**: Verify system handles multiple rapid requests

**Test**:
```bash
# Send 3 requests in quick succession
for i in {1..3}; do
  curl -X POST http://localhost:3001/generate-strategy \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test '$i'",
      "major": "CS",
      "graduationYear": "2025",
      "targetRoles": "SWE",
      "locations": "SF",
      "skills": "Python"
    }' &
done
wait
```

**Success Criteria**:
- ✅ All 3 requests return successfully
- ✅ No crashes or hangs
- ✅ Reasonable response times (<30s per request)

---

## Test 6: Invalid Input Handling

**Goal**: Verify proper error handling

**Test**:
```bash
# Missing required fields
curl -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test"
  }'
```

**Expected**:
```json
{
  "error": "Missing required fields: name, major, graduationYear"
}
```

**Success Criteria**:
- ✅ Returns 400 status
- ✅ Clear error message
- ✅ No server crash

---

## Verification Checklist

### Backend
- [ ] Tier 1 (Ara) works when Ara is installed
- [ ] Tier 2 (Anthropic) works with API key
- [ ] Tier 3 (TypeScript) always works
- [ ] Fallback cascade works correctly
- [ ] Console logging is clear and helpful
- [ ] No compilation errors
- [ ] No runtime errors

### Frontend
- [ ] Results display correctly for all tiers
- [ ] No visual differences between tiers
- [ ] Hover tooltips work
- [ ] Outlook panel displays
- [ ] Notion sync confirmation shows
- [ ] No console errors

### Integration
- [ ] Same JSON schema for all tiers
- [ ] Match percentages are deterministic
- [ ] Score breakdowns are consistent
- [ ] Deduplication works
- [ ] Notion sync completes

---

## Common Issues

### Ara subprocess hangs

**Symptom**: Request takes exactly 60s, then fallback
**Solution**: Normal - timeout is 60s. Fallback will activate.
**Action**: None needed, Tier 2 or 3 will handle it

### Anthropic API rate limit

**Symptom**: "429 Too Many Requests"
**Solution**: Tier 3 will activate automatically
**Action**: Wait 60s or use smaller model

### TypeScript fallback always used

**Symptom**: Both Ara and API fail every time
**Check**:
```bash
# Verify Ara
ara --version
ls ../app.py

# Verify API key
echo $ANTHROPIC_API_KEY
```

---

## Performance Expectations

| Tier | Time Range | Expected Usage |
|------|-----------|----------------|
| Tier 1 | 5-30s | 90-95% of requests |
| Tier 2 | 2-5s | 5-10% of requests |
| Tier 3 | <100ms | <1% of requests |

**Hackathon Demo**: Expect Tier 1 to handle most requests, with occasional fallback to Tier 2/3

---

## Debug Commands

### Check which tier was used
```bash
# Look for these patterns in backend logs:
grep "Tier 1\|Tier 2\|Tier 3" backend_log.txt
```

### Check Ara installation
```bash
which ara
ara --version
python -c "import ara_sdk; print(ara_sdk.__version__)"
```

### Check API key
```bash
echo $ANTHROPIC_API_KEY | head -c 10
# Should show: sk-ant-xxx
```

### Check TypeScript compilation
```bash
cd backend
npm run build
# Should succeed (ignore jobFetcher warnings)
```

---

## Success Metrics

✅ **100% uptime** - System never fails to return response  
✅ **Fast primary path** - Ara completes in 5-30s when working  
✅ **Reliable fallbacks** - API and TypeScript always succeed  
✅ **Transparent logging** - Clear indication of which tier executed  
✅ **No frontend changes** - Same JSON schema for all tiers  

---

## Ready for Demo

**Recommended Configuration**:
```bash
# backend/.env
PORT=3001
NODE_ENV=development
# ANTHROPIC_API_KEY optional
```

**Pre-Demo Checklist**:
- [ ] Ara installed and working
- [ ] API key set (optional, for redundancy)
- [ ] Test Tier 1 works
- [ ] Test fallback works (if Tier 1 fails)
- [ ] Frontend displays correctly
- [ ] No console errors

**Demo Script**:
1. Show form input
2. Click "Generate Strategy"
3. **Highlight**: "Using Ara with included Claude access"
4. Show results with score breakdown
5. **If Ara fails**: "Automatic fallback to Anthropic API"
6. **Result**: "Always get results, never fails"

---

**Status**: ✅ Three-tier fallback system ready for testing
