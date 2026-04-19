# Quick Start - New Features

## What's New?

### 🎯 Deterministic Matching Engine
Jobs are now scored using a rule-based algorithm with 5 weighted dimensions:
- **Role Match (30%)** - How well the job title matches your target roles
- **Skill Match (30%)** - How well your skills align with the job
- **Location Match (15%)** - Geographic fit or remote options
- **Seniority Match (15%)** - Preference for internships/entry-level
- **Preference Match (10%)** - Company category alignment (big tech, AI, etc.)

### 📧 Outlook Integration
See your recruiter inbox at a glance:
- OA invitations
- Interview requests
- Rejections
- Follow-up needed

### 📝 Notion Sync
Top 5 jobs automatically saved to your Notion application tracker with:
- Company name
- Role
- Match score
- Status
- Next follow-up date

---

## Running the Updated System

### 1. Install Dependencies (if needed)

```bash
cd backend
npm install
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║   🤖  Ara Autonomous Internship Agent - Backend API      ║
║   Status: ✅ Running                                      ║
╚═══════════════════════════════════════════════════════════╝
```

### 3. Start Frontend

In a new terminal:

```bash
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Testing New Features

### 1. Generate Strategy

1. Open http://localhost:5173
2. Fill in your profile:
   ```
   Name: Alex Chen
   Major: Computer Science
   Graduation Year: 2025
   Target Roles: SWE, AI/ML
   Locations: San Francisco, Remote
   Skills: Python, React, TensorFlow
   ```
3. Click "Generate Strategy"

### 2. View Score Breakdown

**Hover over any company card** to see the detailed match breakdown:

```
Score Breakdown
Role:        95%
Skills:      88%
Location:   100%
Seniority:  100%
Preference:  90%
```

This shows exactly WHY each job matched!

### 3. Check Outlook Insights

Scroll down to see the **Recruiter Inbox Summary** panel:
- Number of OAs received
- Interview invitations
- Rejections
- Follow-ups needed
- Recent emails with categories

### 4. Verify Notion Sync

Look for the **Notion Sync** confirmation panel:
```
✅ Top 5 jobs synced to your Notion application tracker
```

---

## API Testing

### Test Score Breakdown

```bash
curl -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "major": "Computer Science",
    "graduationYear": "2025",
    "targetRoles": "SWE, AI/ML",
    "locations": "San Francisco, Remote",
    "skills": "Python, React, TensorFlow"
  }' | jq '.companies[] | {name, matchPercentage, breakdown}'
```

Expected output:
```json
{
  "name": "Google",
  "matchPercentage": 93,
  "breakdown": {
    "role": 95,
    "skills": 88,
    "location": 100,
    "seniority": 100,
    "preference": 90
  }
}
```

### Test Outlook Integration

```bash
curl http://localhost:3001/outlook/emails | jq
```

Expected output:
```json
{
  "total": 4,
  "byCategory": {
    "OA": 1,
    "interview": 1,
    "rejection": 1,
    "follow_up": 1,
    "other": 0
  },
  "recent": [...]
}
```

### Test Notion Integration

```bash
curl http://localhost:3001/notion/stats | jq
```

Expected output:
```json
{
  "total": 5,
  "byStatus": {
    "To Apply": 5
  }
}
```

---

## Key Differences from Before

### Before:
- Match percentages were AI-generated (random/inconsistent)
- No explanation of why jobs matched
- No email/tracker integration

### After:
- Match percentages are deterministic (same input = same output)
- Detailed breakdown shows exactly why each job matched
- Outlook panel shows recruiting pipeline status
- Notion automatically tracks applications
- Ara focuses on strategy, not scoring

---

## Demo Tips

1. **Show determinism**: Run same profile twice, scores will be identical
2. **Hover interaction**: Demonstrate tooltip with breakdown
3. **Outlook panel**: Point out email categorization
4. **Notion sync**: Emphasize automation (no manual tracking)
5. **Compare old vs new**: "Before: random scores. Now: transparent scoring."

---

## Troubleshooting

### TypeScript compilation errors?
```bash
cd backend
rm -rf node_modules dist
npm install
npm run build
```

### Scores not showing?
Check console output for:
```
🎯 Computing match scores...
✅ Scored and ranked 8 jobs
  1. Google - Software Engineering Intern (93%)
  2. Anthropic - AI Safety Research Intern (91%)
  ...
```

### Outlook panel not showing?
- Frontend may fail silently if backend is down
- Check browser console for errors
- Verify backend is running on port 3001

### Notion sync not showing?
- Should appear after strategy generation
- Check for `notionSynced: true` in API response
- Non-blocking, so strategy will still work if it fails

---

## Architecture Summary

```
User Input
    ↓
Fetch Jobs (Greenhouse API)
    ↓
Score & Rank Jobs (Matching Engine) ← NEW
    ↓
Pass Scored Jobs to Ara
    ↓
Ara Generates Strategy (Not Scores) ← CHANGED
    ↓
Sync Top 5 to Notion ← NEW
    ↓
Frontend Fetches Outlook ← NEW
    ↓
Display Results with Breakdown ← NEW
```

---

## Files Changed

### New Files:
1. `backend/src/matchingEngine.ts` - Scoring algorithm
2. `backend/src/outlookIntegration.ts` - Email connector
3. `backend/src/notionIntegration.ts` - Tracker sync

### Modified Files:
1. `backend/src/server.ts` - Added scoring + new endpoints
2. `backend/src/types.ts` - Added breakdown interface
3. `backend/src/araIntegration.ts` - Handle scored jobs
4. `app.py` - Updated Ara instructions
5. `src/App.tsx` - Added tooltips, panels, interactions

---

## Next Steps

1. Test with different profiles to see scoring variations
2. Experiment with hover tooltips
3. Check Outlook panel for mock email data
4. Verify Notion sync confirmation
5. Compare match percentages across profiles

---

## Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend displays form
- [ ] Strategy generation completes
- [ ] Companies show match percentages
- [ ] Hover shows score breakdown
- [ ] Outlook panel displays
- [ ] Notion sync confirmation shows
- [ ] No console errors

**All green? You're ready to demo! 🚀**
