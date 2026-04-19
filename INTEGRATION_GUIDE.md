# 🔗 End-to-End Integration Guide

## Architecture Overview

```
┌──────────────┐
│   Frontend   │  React + TypeScript
│   (Port 5173)│  User fills profile form
└──────┬───────┘
       │ POST /generate-strategy
       │ { name, major, skills, ... }
       ▼
┌──────────────────────────────────────┐
│   Backend (Port 3001)                │  Express + TypeScript
│                                      │
│   1. Validate input                  │
│   2. Fetch real job data             │
│      (Greenhouse API + fallback)     │
│   3. Write temp input file           │
│   4. Call Ara automation             │
│   5. Parse JSON response             │
│   6. Return to frontend              │
└──────┬───────────────────────────────┘
       │ ARA_INPUT_FILE=/tmp/ara-input-*.json
       │ ara run app.py
       ▼
┌──────────────────────────────────────┐
│   Ara Automation (app.py)            │  Python + ara_sdk
│                                      │
│   Tools:                             │
│   • get_student_profile()            │
│   • get_available_jobs()             │
│   • get_utc_time()                   │
│                                      │
│   Process:                           │
│   1. Load input from file            │
│   2. Analyze student profile         │
│   3. Match with job opportunities    │
│   4. Generate personalized strategy  │
│   5. Return structured JSON          │
└──────────────────────────────────────┘
```

---

## What's New

### ✅ Real Job Data Integration
- **Primary Source:** Greenhouse API (public job boards)
- **Boards:** Airbnb, Dropbox, GitLab
- **Fallback:** Hardcoded dataset (Google, Meta, OpenAI, Jane Street, Datadog, etc.)
- **Filtering:** Intern/Co-op positions only
- **Demo Safety:** Never fails, always returns data

### ✅ Dynamic Ara Integration
- **Input:** Temporary JSON file with profile + jobs
- **Invocation:** `ara run app.py` via Node.js subprocess
- **Output:** Structured JSON parsed from stdout
- **Timeout:** 60 seconds
- **Fallback:** TypeScript-generated strategy if Ara fails

### ✅ Updated app.py
- **New Tools:**
  - `get_student_profile()` - Returns user profile
  - `get_available_jobs()` - Returns job list
- **Input Loading:** Reads from `ARA_INPUT_FILE` environment variable
- **Output:** Valid JSON with strategy, companies, resume bullets, etc.

---

## File Structure

```
autonomous-internship-agent/
├── frontend/
│   └── src/
│       └── App.tsx              ✅ Calls backend API
│
├── backend/
│   └── src/
│       ├── server.ts            ✅ Main API server (updated)
│       ├── jobFetcher.ts        ✅ NEW - Fetch job data
│       ├── araIntegration.ts    ✅ NEW - Call Ara automation
│       ├── types.ts             ✅ TypeScript interfaces
│       └── araAgent.ts          ⚠️  OLD - Not used (kept as backup)
│
└── app.py                       ✅ UPDATED - Dynamic Ara automation
```

---

## Setup Instructions

### Prerequisites
- ✅ Node.js v18+
- ✅ Ara CLI installed (`ara --version`)
- ✅ Ara app deployed (`ara run app.py` works)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Test Ara App Standalone
```bash
# From root directory
ara run app.py
```

You should see Ara starting up. Press Ctrl+C to stop.

### Step 3: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════════════════════╗
║   🤖  Ara Autonomous Internship Agent - Backend API      ║
║   Status: ✅ Running                                      ║
║   Port: 3001                                              ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 4: Start Frontend
```bash
# In new terminal
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Testing the Integration

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

Expected:
```json
{
  "status": "ok",
  "message": "Ara backend is running",
  "timestamp": "2026-04-19T..."
}
```

### Test 2: View Job Data
```bash
curl http://localhost:3001/debug/jobs
```

Expected:
```json
{
  "count": 8,
  "jobs": [
    {
      "company": "Airbnb",
      "title": "Software Engineering Intern",
      "location": "San Francisco",
      "url": "https://..."
    }
  ]
}
```

### Test 3: Test Full Flow
```bash
curl http://localhost:3001/test-strategy
```

This will:
1. Use sample profile (Alex Chen)
2. Fetch real jobs
3. Call Ara automation
4. Return complete strategy

### Test 4: Frontend E2E
1. Open http://localhost:5173
2. Fill form:
   - Name: **Your Name**
   - Major: **Computer Science**
   - Graduation: **2025**
   - Roles: **SWE, AI/ML**
   - Locations: **San Francisco, Remote**
   - Skills: **React, Python, TensorFlow**
3. Click "Generate Strategy"
4. Watch the magic! ✨

---

## Sample Request/Response

### Request to Backend
```http
POST http://localhost:3001/generate-strategy
Content-Type: application/json

{
  "name": "Alex Chen",
  "major": "Computer Science",
  "graduationYear": "2025",
  "targetRoles": "SWE, AI/ML",
  "locations": "San Francisco, Remote",
  "skills": "React, Python, TensorFlow"
}
```

### Input to Ara (auto-generated temp file)
```json
{
  "profile": {
    "name": "Alex Chen",
    "major": "Computer Science",
    "graduationYear": "2025",
    "targetRoles": "SWE, AI/ML",
    "locations": "San Francisco, Remote",
    "skills": "React, Python, TensorFlow"
  },
  "jobs": [
    {
      "company": "Airbnb",
      "title": "Software Engineering Intern",
      "location": "San Francisco, CA",
      "url": "https://..."
    },
    {
      "company": "Dropbox",
      "title": "ML Engineering Intern",
      "location": "Remote",
      "url": "https://..."
    }
  ]
}
```

### Response from Backend
```json
{
  "strategy": {
    "industries": [
      "Tech (FAANG & Unicorns)",
      "AI/ML Startups",
      "Cloud Infrastructure"
    ],
    "weeklyPlan": [
      "Apply to 15-20 companies per week",
      "Send 10 personalized cold emails",
      "Attend 2 networking events"
    ],
    "priority": "High urgency - graduating in 2025"
  },
  "companies": [
    {
      "name": "Airbnb",
      "logo": "🏠",
      "color": "from-blue-500 to-blue-600",
      "matchPercentage": 95,
      "reason": "Strong CS fundamentals match"
    }
  ],
  "resumeBullets": [
    "Developed full-stack applications using React, improving performance by 40%",
    "Led team of 4 in building AI features processing 1M+ requests daily",
    "Optimized algorithms reducing query time by 60%"
  ],
  "outreachMessage": "Hi [Recruiter Name],\n\nI'm Alex Chen...",
  "followupTimeline": [
    { "time": "Today", "action": "Send application and outreach" },
    { "time": "3 Days Later", "action": "Follow up if no response" },
    { "time": "1 Week Later", "action": "Connect on LinkedIn" }
  ]
}
```

---

## How It Works

### Backend Flow (`server.ts`)

```typescript
// 1. Receive profile
const profile: UserProfile = req.body;

// 2. Fetch jobs (with fallback)
const jobs = await fetchMultiSourceJobs(
  profile.targetRoles,
  profile.locations
);

// 3. Call Ara (with fallback)
try {
  strategy = await callAraAgent(profile, jobs);
} catch {
  strategy = generateFallbackStrategy(profile, jobs);
}

// 4. Return to frontend
res.json(strategy);
```

### Job Fetching (`jobFetcher.ts`)

```typescript
// Try real API first
try {
  const response = await fetch('https://boards-api.greenhouse.io/...');
  return parseJobs(response);
} catch {
  // Fallback to hardcoded data
  return FALLBACK_JOBS;
}
```

### Ara Integration (`araIntegration.ts`)

```typescript
// 1. Create temp file
const tempFile = `/tmp/ara-input-${Date.now()}.json`;
writeFileSync(tempFile, JSON.stringify({ profile, jobs }));

// 2. Spawn Ara process
const ara = spawn('ara', ['run', 'app.py'], {
  env: { ARA_INPUT_FILE: tempFile }
});

// 3. Capture stdout
ara.stdout.on('data', (data) => {
  stdout += data.toString();
});

// 4. Parse JSON on completion
ara.on('close', () => {
  const result = JSON.parse(extractJSON(stdout));
  resolve(result);
});

// 5. Cleanup
unlinkSync(tempFile);
```

### Ara App (`app.py`)

```python
# Load input on startup
input_file = os.environ.get("ARA_INPUT_FILE")
with open(input_file) as f:
    _input_data = json.load(f)

# Define tools
@ara.tool
def get_student_profile() -> dict:
    return _input_data["profile"]

@ara.tool
def get_available_jobs() -> dict:
    return {"jobs": _input_data["jobs"]}

# Create automation
ara.Automation(
    "autonomous-internship-agent",
    system_instructions="...",
    tools=[get_utc_time, get_student_profile, get_available_jobs]
)
```

---

## Key Features

### ✅ Different Inputs = Different Outputs
- Profile data changes what Ara sees
- Job list filtered by target roles/locations
- Resume bullets tailored to student's skills
- Outreach message uses student's name/major
- Company matches based on preferences

### ✅ Demo Stability
- **Job API fails?** → Use fallback dataset
- **Ara fails?** → Use TypeScript fallback generator
- **Timeout?** → 60s limit, then fallback
- **Result:** Demo NEVER breaks

### ✅ Real Data Integration
- Greenhouse API (3 public boards)
- Live intern/co-op positions
- Real company names and URLs
- Filtered by student preferences

---

## Troubleshooting

### ❌ "Ara command not found"
```bash
# Install Ara CLI
pip install ara-sdk
```

### ❌ "Failed to start Ara"
```bash
# Test Ara standalone
ara run app.py

# Check app.py is in root directory
ls -la app.py
```

### ❌ "Ara timeout"
- Ara takes too long (>60s)
- Fallback strategy will be used automatically
- Check Ara logs for errors

### ❌ "No jobs returned"
- All APIs failed
- Fallback dataset is being used
- This is expected and OK for demo

### ❌ "Invalid JSON from Ara"
- Ara output parsing failed
- Fallback strategy will be used
- Check Ara stdout for debugging

---

## Backend Logs Explained

```
🚀 NEW REQUEST - Generating strategy
👤 Student: Alex Chen
🎓 Major: Computer Science
...
📊 Fetching job opportunities...
✅ Got 8 jobs
🤖 Calling Ara automation...
📝 Wrote input to /tmp/ara-input-1234.json
[Ara stdout] ✅ Loaded input from /tmp/ara-input-1234.json
[Ara stdout] { "strategy": { ... } }
✅ Ara agent completed successfully
🗑️  Cleaned up /tmp/ara-input-1234.json
⏱️  Total time: 15234ms
```

---

## Production Considerations

### Security
- [ ] Validate all user inputs
- [ ] Sanitize filenames
- [ ] Rate limiting on API
- [ ] Timeout limits

### Performance
- [ ] Cache job data (refresh every 1 hour)
- [ ] Parallel job API calls
- [ ] Reuse Ara process
- [ ] Add CDN for frontend

### Monitoring
- [ ] Log all requests
- [ ] Track Ara success rate
- [ ] Alert on high failure rate
- [ ] Metrics dashboard

---

## Next Steps

### P1 - For Demo
- ✅ Backend integrated with Ara
- ✅ Real job data
- ✅ Fallbacks for stability
- [ ] Test with 5 different profiles
- [ ] Practice demo flow

### P2 - Polish
- [ ] Better error messages
- [ ] Loading states in UI
- [ ] Retry logic
- [ ] Job caching

### P3 - Future
- [ ] More job sources (LinkedIn, Indeed)
- [ ] User accounts + history
- [ ] Application tracking
- [ ] Email integration

---

## Summary

**You now have a fully integrated system:**
1. ✅ Frontend collects profile
2. ✅ Backend fetches real jobs
3. ✅ Ara analyzes and generates strategy
4. ✅ Frontend displays beautiful results

**Different inputs produce different outputs** ✨  
**Demo is stable with fallbacks** 🛡️  
**Real job data integrated** 📊  

Ready for hackathon! 🚀
