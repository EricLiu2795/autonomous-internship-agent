# Testing the Inbox Workflow

## Quick Start

```bash
# Start the backend
cd backend
npm run dev
```

## Test Endpoints

### 1. Analyze Inbox (Main Workflow)

**Endpoint**: `POST /analyze-inbox`

**Description**: Runs the full agentic workflow:
1. Fetches recruiting emails (mock data)
2. Classifies emails (Ara primary, TypeScript fallback)
3. Updates pipeline tracker
4. Generates calendar actions
5. Returns combined digest

**Example**:
```bash
curl -X POST http://localhost:3001/analyze-inbox -H "Content-Type: application/json"
```

**Response Structure**:
```json
{
  "success": true,
  "digest": {
    "summary": {
      "totalEmails": 10,
      "recruitingEmails": 8,
      "actionNeeded": 4,
      "processedAt": "2026-04-19T..."
    },
    "classifiedEmails": [...],
    "actionQueue": {
      "urgent": [...],
      "high": [...],
      "medium": [...],
      "low": [...]
    },
    "tracker": {
      "companies": [...],
      "stats": {...}
    },
    "calendarActions": [...],
    "calendarSummary": {...}
  },
  "summary": "4 actions needed • 1 interview to schedule • 1 assessment due • 4 active opportunities",
  "quickStats": {
    "followUpNeeded": 2,
    "oaDueSoon": 1,
    "interviewInvites": 1,
    "recruiterOutreach": 2
  },
  "metadata": {
    "processedAt": "...",
    "duration": "546ms",
    "demoMode": true
  }
}
```

**Console Output**:
```
============================================================
📧 NEW REQUEST - Analyzing Inbox
============================================================

📬 Fetching recruiting emails...
[INFO] Fetching recruiting emails (DEMO MODE)
[INFO] Retrieved 10 emails
[OK] Retrieved 10 emails (8 recruiting, 2 other)

🔍 Classifying emails...
[Tier 2] Using TypeScript fallback classifier...
[INFO] Using regex-based classification
[OK] TypeScript classification completed
[OK] Classified 10 emails

📊 Updating pipeline tracker...
  • Google: NEW → Opportunity
  • Stripe: NEW → OA
  • Openai: NEW → Applied
  • Meta: NEW → Rejected
  • Datadog: NEW → Opportunity
  • Microsoft: NEW → Applied
  • Anthropic: NEW → Applied
  • Nvidia: NEW → Interview
[OK] Generated 8 tracker updates
[OK] Applied 8 tracker updates

📅 Generating calendar actions...
[OK] Generated 8 calendar actions

📦 Building digest...
[OK] Digest built successfully
  • 8 recruiting emails
  • 4 actions needed
  • 8 companies tracked
  • 8 calendar actions

⏱️  Total time: 546ms
============================================================
```

---

### 2. View Demo Emails

**Endpoint**: `GET /demo-emails`

**Description**: View raw mock recruiting emails

**Example**:
```bash
curl http://localhost:3001/demo-emails
```

**Response**:
```json
{
  "emails": [
    {
      "id": "email-001",
      "from": "recruiting@google.com",
      "subject": "Google - Software Engineering Intern Interview Invitation",
      "body": "Hi Alex, ...",
      "receivedAt": "2026-04-19T09:30:00.000Z"
    },
    ...
  ],
  "counts": {
    "total": 10,
    "recruiting": 8,
    "other": 2
  },
  "demoMode": true
}
```

---

### 3. View Tracker State

**Endpoint**: `GET /tracker`

**Description**: View current pipeline tracker state

**Example**:
```bash
curl http://localhost:3001/tracker
```

**Response**:
```json
{
  "companies": [
    {
      "company": "Nvidia",
      "role": "Software Engineering Intern",
      "status": "Interview",
      "lastUpdated": "2026-04-19T...",
      "updateCount": 1
    },
    ...
  ],
  "stats": {
    "total": 8,
    "byStatus": {
      "Opportunity": 2,
      "OA": 1,
      "Applied": 3,
      "Rejected": 1,
      "Interview": 1
    }
  }
}
```

---

### 4. Reset Tracker (Demo Utility)

**Endpoint**: `DELETE /tracker/reset`

**Description**: Clears pipeline tracker state (useful for testing)

**Example**:
```bash
curl -X DELETE http://localhost:3001/tracker/reset
```

**Response**:
```json
{
  "success": true,
  "message": "Pipeline tracker reset successfully"
}
```

---

## Mock Email Scenarios

The demo inbox includes 10 realistic recruiting emails:

### High Priority Actions (Urgent)
1. **Google** - Recruiter outreach requesting response
2. **Datadog** - Recruiter outreach for 15-minute call
3. **NVIDIA** - Interview invitation (schedule within 48 hours)

### High Priority Actions
4. **Stripe** - Online assessment due April 24, 2026

### Medium Priority
5. **OpenAI** - Application received, under review
6. **Microsoft** - Application status confirmed
7. **Anthropic** - Follow-up from recruiter

### Low Priority
8. **Meta** - Rejection

### Irrelevant (Filtered Out)
9. **University** - CS Department Newsletter
10. **LeetCode** - Coding challenge notification

---

## Classification Categories

### Primary Categories
- `application_response` - Response to job application
- `recruiter_outreach` - Direct recruiter outreach
- `irrelevant` - Not recruiting-related

### Subcategories
- `oa` - Online assessment invitation
- `interview` - Interview invitation
- `rejection` - Application rejected
- `application_received` - Application confirmation
- `follow_up_needed` - Requires follow-up action
- `none` - No subcategory

---

## Pipeline Statuses

- **Opportunity** - New recruiter outreach (respond ASAP)
- **Interview** - Interview stage (schedule/prepare)
- **OA** - Online assessment assigned (complete by deadline)
- **Applied** - Application submitted (waiting for response)
- **Rejected** - Application rejected (archive)

---

## Calendar Action Types

- `interview_event` - Interview scheduling needed
- `oa_deadline` - OA completion deadline
- `follow_up_reminder` - Follow-up action reminder
- `recruiter_response_deadline` - Recruiter response needed

---

## Architecture Overview

```
POST /analyze-inbox
        │
        ├─► emailSource.ts
        │   └─► Get mock emails (10 realistic recruiting emails)
        │
        ├─► emailClassifier.ts
        │   ├─► [Tier 1] Try Ara automation (primary)
        │   └─► [Tier 2] TypeScript regex fallback
        │   └─► Returns classified emails with category, company, role
        │
        ├─► pipelineUpdater.ts
        │   ├─► Generate tracker updates from classifications
        │   ├─► Apply updates to pipeline state
        │   └─► Build action queue (urgent, high, medium, low)
        │
        ├─► calendarPlanner.ts
        │   ├─► Extract interview dates and OA deadlines
        │   ├─► Generate calendar actions
        │   └─► Deduplicate and prioritize
        │
        └─► digestBuilder.ts
            └─► Combine all results into frontend-ready response
```

---

## Two-Tier Classification System

### Tier 1: Ara Automation (Primary)
- **Goal**: Agentic, context-aware classification
- **Input**: JSON file with emails
- **Process**: Ara runs `email_classifier.py` (when available)
- **Output**: Structured classification results
- **Fallback**: If Ara fails or times out → Tier 2

### Tier 2: TypeScript Regex (Fallback)
- **Goal**: Demo reliability
- **Input**: Raw email objects
- **Process**: Regex pattern matching on subject/body
- **Output**: Deterministic classification results
- **Patterns**:
  - Irrelevant: `newsletter`, `leetcode.com`, `university.edu`
  - Recruiter Outreach: `came across your profile`, `quick chat`
  - OA: `online assessment`, `hackerrank`, `complete within`
  - Interview: `interview invitation`, `schedule interview`, `calendly`
  - Rejection: `move forward with other candidates`, `unfortunately`
  - Application Received: `application received`, `under review`

---

## Demo Mode Features

✅ **Mock Email Data** - 10 realistic recruiting emails  
✅ **Two-Tier Classification** - Ara primary, TypeScript fallback  
✅ **Pipeline Tracking** - In-memory state (resets on server restart)  
✅ **Calendar Planning** - Detects deadlines and generates actions  
✅ **Action Queue** - Prioritizes by urgency and due date  
✅ **No Gmail OAuth** - Postponed for post-hackathon  
✅ **No Real Calendar Writes** - Simulated for demo  

---

## Future: Real Gmail Integration

**To add real Gmail API support later**:

1. Update `emailSource.ts`:
   ```typescript
   export async function getRecruitingEmails(gmailAuth?: OAuth2Client): Promise<Email[]> {
     if (gmailAuth) {
       return await fetchFromGmail(gmailAuth);
     }
     return MOCK_RECRUITING_EMAILS; // Fallback to demo
   }
   ```

2. Add Gmail OAuth flow in server
3. Replace mock emails with real Gmail fetch
4. Keep classification workflow unchanged

**Architecture stays Gmail-ready**: Only `emailSource.ts` needs updating for real integration.

---

## Testing Tips

1. **Reset tracker between tests**:
   ```bash
   curl -X DELETE http://localhost:3001/tracker/reset
   ```

2. **Check classification fallback**: Ara is not fully implemented yet, so TypeScript fallback is always used in current demo

3. **Verify action prioritization**: Urgent actions should have due dates within 3 days

4. **Test calendar actions**: Check that interviews and OAs generate calendar entries

5. **Frontend integration**: Use `/analyze-inbox` response to populate frontend sections

---

## Performance Benchmarks (Demo Mode)

| Operation | Time | Note |
|-----------|------|------|
| Fetch emails | ~300ms | Simulated delay |
| Classify (TypeScript fallback) | ~10ms | Regex-based |
| Update tracker | ~5ms | In-memory |
| Generate calendar actions | ~5ms | In-memory |
| Build digest | ~5ms | JSON formatting |
| **Total** | **~330ms** | Fast demo mode |

With Ara classification (when available): ~5-10s depending on model complexity

---

## Troubleshooting

### Emails not classified correctly
- Check regex patterns in `emailClassifier.ts`
- Verify email subject/body contains expected keywords
- Add new patterns if needed

### Tracker not updating
- Ensure company name is extracted (check `extractCompany()`)
- Verify classification category is not `irrelevant`
- Check console logs for skip messages

### Calendar actions missing
- Verify subcategory is `oa` or `interview`
- Check deadline extraction regex patterns
- Ensure `extractedData` field is populated

### Server won't start
- Check port 3001 is available: `netstat -ano | findstr :3001`
- Verify all dependencies installed: `npm install`
- Check for TypeScript compilation errors

---

**Status**: ✅ Inbox workflow ready for demo  
**Mode**: Mock emails with real classification workflow  
**Gmail Integration**: Architecture ready, implementation postponed
