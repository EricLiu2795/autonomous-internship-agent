# ✅ Pre-Demo Checklist

## 15 Minutes Before Demo

### 1. Environment Check

```bash
# Check Node.js
node --version
# Should be v18+

# Check Ara CLI
ara --version
# Should show version

# Check Python
python --version
# Should be 3.8+
```

**Status:** [ ] All checked

---

### 2. Backend Test

```bash
cd backend
npm run dev
```

**Look for:**
```
╔═══════════════════════════════════════════╗
║   🤖  Ara Autonomous Internship Agent    ║
║   Status: ✅ Running                      ║
║   Port: 3001                              ║
╚═══════════════════════════════════════════╝
```

**Status:** [ ] Backend running

**Test:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok",...}
```

**Status:** [ ] Health check passed

---

### 3. Ara Test

```bash
# From root directory
ara run app.py
# Should start up, press Ctrl+C
```

**Look for:**
- No Python errors
- Automation loads successfully

**Status:** [ ] Ara runs

---

### 4. Frontend Test

```bash
npm run dev
```

**Open:** http://localhost:5173

**Check:**
- [ ] Page loads
- [ ] Gradients visible
- [ ] Form fields work
- [ ] No console errors (F12)

**Status:** [ ] Frontend working

---

### 5. End-to-End Test

**Fill form with test data:**
- Name: `Test Student`
- Major: `Computer Science`
- Year: `2025`
- Roles: `SWE, AI/ML`
- Location: `San Francisco`
- Skills: `React, Python`

**Click:** "Generate Strategy"

**Expected:**
- [ ] Loading animation shows
- [ ] Takes 10-30 seconds
- [ ] Results appear
- [ ] 5 companies shown
- [ ] Resume bullets present
- [ ] No error messages

**Status:** [ ] E2E test passed

---

### 6. Different Input Test

**Try profile 2:**
- Name: `Jane Doe`
- Major: `Mathematics`
- Year: `2026`
- Roles: `Quant, Trading`
- Location: `New York`
- Skills: `C++, Statistics`

**Click:** "Generate Strategy"

**Verify:**
- [ ] Different companies (should show finance)
- [ ] Different resume bullets
- [ ] Different outreach message

**Status:** [ ] Different outputs confirmed

---

### 7. Backend Logs Check

**Look at terminal running backend**

**Should see:**
```
🚀 NEW REQUEST - Generating strategy
📊 Fetching job opportunities...
✅ Got X jobs
🤖 Calling Ara automation...
✅ Ara agent completed successfully
⏱️  Total time: XXXXms
```

**Status:** [ ] Logs look good

---

### 8. Fallback Test (Optional)

**Stop Ara:**
- Make sure Ara is not running separately
- Backend will use fallback if Ara fails

**Submit form**

**Should still work:**
- [ ] Returns results
- [ ] No user-facing errors
- [ ] Backend logs show fallback

**Status:** [ ] Fallback works

---

## 5 Minutes Before Demo

### Quick Run-Through

1. **Open tabs:**
   - [ ] http://localhost:5173 (frontend)
   - [ ] Backend terminal (logs visible)
   - [ ] This checklist

2. **Prepare demo profile:**
   ```
   Name: Alex Chen
   Major: Computer Science
   Year: 2025
   Roles: SWE, AI/ML
   Location: San Francisco, Remote
   Skills: React, Python, TensorFlow
   ```

3. **Practice demo script:** (90 seconds)
   - [ ] "This is our Autonomous Internship Agent"
   - [ ] "It helps students automate their job search"
   - [ ] Fill form (talk while filling)
   - [ ] "Powered by Ara autonomous agents"
   - [ ] Click "Generate Strategy"
   - [ ] "Processing with real job data..."
   - [ ] Show results: strategy, companies, bullets
   - [ ] "Different profiles get different strategies"

4. **Backup plan:**
   - [ ] Screenshots of working demo
   - [ ] Recorded video (optional)
   - [ ] Presentation slides (optional)

---

## Troubleshooting Before Demo

### Issue: Backend won't start

**Fix:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Status:** [ ] Fixed

---

### Issue: Ara not found

**Fix:**
```bash
pip install ara-sdk
ara --version
```

**Status:** [ ] Fixed

---

### Issue: Frontend errors

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Status:** [ ] Fixed

---

### Issue: Ports in use

**Backend:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port
# Edit backend/.env: PORT=3002
# Edit src/App.tsx: API_URL = 'http://localhost:3002'
```

**Frontend:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Status:** [ ] Fixed

---

### Issue: Slow Ara processing

**Workaround:**
- First run is always slower (10-30s)
- Do a test run before demo
- Fallback activates after 60s timeout
- Consider using fallback demo if too slow

**Status:** [ ] Understood

---

## Demo Readiness Score

Count your checkmarks:

- [ ] Environment checked (1)
- [ ] Backend running (1)
- [ ] Health check passed (1)
- [ ] Ara runs (1)
- [ ] Frontend working (1)
- [ ] E2E test passed (1)
- [ ] Different outputs confirmed (1)
- [ ] Logs look good (1)
- [ ] Demo script practiced (1)
- [ ] Backup plan ready (1)

**Total: ___/10**

### Scoring
- **10/10** - Perfect! You're ready! 🏆
- **8-9/10** - Great shape, minor tweaks
- **6-7/10** - Good, needs some fixes
- **< 6/10** - Troubleshooting needed

---

## Confidence Boosters

### What Makes Your Demo Strong

✅ **Real integration** - Not a mock, actually works
✅ **Live data** - Fetches real job postings
✅ **AI-powered** - Uses Ara automation
✅ **Beautiful UI** - Professional design
✅ **Different outputs** - Truly personalized
✅ **Stable** - Multiple fallback systems
✅ **Fast** - 15-30 second response time

### What Judges Will Love

1. **Technical depth** - Full-stack + AI + API integration
2. **User value** - Solves real pain point
3. **Demo quality** - Polished and functional
4. **Reliability** - Doesn't crash during demo
5. **Complexity** - Multiple systems working together

### Talking Points

- "Uses Ara autonomous agents"
- "Fetches real job data from Greenhouse API"
- "Different profiles get personalized strategies"
- "Saves students 10+ hours per week"
- "Built with production-quality code"

---

## Final Checks (2 minutes before)

- [ ] Both terminals running
- [ ] Browser tabs open
- [ ] Volume up (for audio)
- [ ] Screen sharing tested
- [ ] Internet connection stable
- [ ] Demo profile ready
- [ ] Backend logs visible
- [ ] Smile! 😊

---

## During Demo

### If something goes wrong:

1. **Stay calm** - Technical difficulties happen
2. **Have backup** - Use screenshots/video
3. **Explain** - "This is why we have fallbacks"
4. **Show code** - "Let me show you how it works"
5. **Recover** - "Let's try the test endpoint"

### Emergency Commands

```bash
# Quick backend restart
cd backend && npm run dev

# Test endpoint
curl http://localhost:3001/test-strategy

# Show logs
# Terminal is already visible
```

---

## After Demo

### If it went well:
- [ ] Celebrate! 🎉
- [ ] Note what worked
- [ ] Thank the judges

### If there were issues:
- [ ] Debug calmly
- [ ] Check logs
- [ ] Test again
- [ ] Learn for next time

---

## Remember

**You built something amazing in a hackathon!**

- Full-stack application ✅
- Real AI integration ✅
- Live data sources ✅
- Beautiful UI ✅
- Multiple fallbacks ✅

**You're ready to win!** 🏆

---

## Emergency Contacts

- **README.md** - Quick overview
- **INTEGRATION_GUIDE.md** - Technical details
- **IMPLEMENTATION_COMPLETE.md** - What was built
- **Backend logs** - Real-time debugging

---

**Good luck!** 🚀

_Built at JHU Hackathon 2026_
