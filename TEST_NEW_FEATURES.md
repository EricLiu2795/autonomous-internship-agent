# Test New Features

## Quick Test Commands

### 1. Test Backend Compilation

```bash
cd backend
npm run build
```

Expected: No TypeScript errors

---

### 2. Test Matching Engine

```bash
# Start backend
cd backend
npm run dev
```

Then in another terminal:

```bash
# Generate strategy and check for scores
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

Expected: Companies with scores and breakdown object

---

### 3. Test Outlook Integration

```bash
curl http://localhost:3001/outlook/emails | jq
```

Expected:
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

---

### 4. Test Notion Integration

```bash
curl http://localhost:3001/notion/stats | jq
```

Expected:
```json
{
  "total": N,
  "byStatus": {
    "To Apply": N
  }
}
```

---

### 5. Test Frontend

```bash
# Start frontend
npm run dev
```

1. Open http://localhost:5173
2. Fill form
3. Click "Generate Strategy"
4. **Hover over companies** → Should see breakdown tooltip
5. Scroll down → Should see Outlook insights panel
6. Should see "Notion sync" confirmation

---

## Expected Console Output

When running the backend and making a request, you should see:

```
📊 Fetching job opportunities...
✅ Got 8 jobs

🎯 Computing match scores...
✅ Scored and ranked 8 jobs
  1. Google - Software Engineering Intern (93%)
  2. Anthropic - AI Safety Research Intern (91%)
  3. Stripe - Software Engineering Intern (89%)
  4. Datadog - Software Engineer Intern (85%)
  5. OpenAI - AI Research Intern (84%)

🤖 Calling Ara automation...
✅ Ara agent completed successfully

📝 Syncing to Notion...
✅ Synced 5 jobs to Notion

⏱️  Total time: XXXXms
```

---

## Troubleshooting

### TypeScript errors
```bash
cd backend
npm install
```

### Missing dependencies
```bash
cd backend
npm install
```

### Frontend not showing new features
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check console for errors

---

## Verification Checklist

- [ ] Backend compiles without errors
- [ ] Jobs have `score` and `breakdown` fields
- [ ] Companies show match percentages in console
- [ ] Outlook endpoint returns email summary
- [ ] Notion endpoint returns stats
- [ ] Frontend shows breakdown tooltip on hover
- [ ] Frontend shows Outlook panel
- [ ] Frontend shows Notion sync status
- [ ] No console errors in browser
- [ ] Strategy generation completes successfully

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/generate-strategy` | POST | Main flow (scoring + Ara + Notion) |
| `/debug/jobs` | GET | View raw jobs |
| `/outlook/emails` | GET | Recruiter email summary |
| `/outlook/generate-followup` | POST | Generate follow-up draft |
| `/notion/applications` | GET | View Notion tracker |
| `/notion/stats` | GET | Notion statistics |

---

## Success Criteria

✅ All endpoints return 200 status
✅ Jobs are ranked by score
✅ Score breakdown is computed correctly
✅ Outlook returns mock email data
✅ Notion sync happens automatically
✅ Frontend displays all new features
✅ No runtime errors
✅ Demo is stable and fast
