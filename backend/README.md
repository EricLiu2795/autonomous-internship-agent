# Ara Backend - Autonomous Internship Agent API

Backend service powered by Claude API that generates personalized internship strategies.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
NODE_ENV=development
```

**Get your API key:** https://console.anthropic.com/

### 3. Run Development Server
```bash
npm run dev
```

Server will start on http://localhost:3001

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Ara backend is running"
}
```

### `POST /generate-strategy`
Generate personalized internship strategy

**Request Body:**
```json
{
  "name": "Alex Chen",
  "major": "Computer Science",
  "graduationYear": "2025",
  "targetRoles": "SWE, AI/ML",
  "locations": "San Francisco, Remote",
  "skills": "React, Python, TensorFlow"
}
```

**Response:**
```json
{
  "strategy": {
    "industries": ["Tech", "AI/ML", "Fintech"],
    "weeklyPlan": ["Apply to 15-20 companies", "Send 10 outreach emails", "Attend 2 events"],
    "priority": "High urgency - graduating in 2025"
  },
  "companies": [
    {
      "name": "Google",
      "logo": "🔍",
      "color": "from-blue-500 to-blue-600",
      "matchPercentage": 95,
      "reason": "Strong CS fundamentals match"
    }
  ],
  "resumeBullets": [
    "Developed full-stack applications...",
    "Led team of 4...",
    "Optimized algorithms..."
  ],
  "outreachMessage": "Hi [Recruiter Name]...",
  "followupTimeline": [
    {"time": "Today", "action": "Send initial application"},
    {"time": "3 Days Later", "action": "Follow up"},
    {"time": "1 Week Later", "action": "Connect on LinkedIn"}
  ]
}
```

### `GET /test-strategy`
Test endpoint with sample data (no request body needed)

## Technology Stack

- **Node.js** + **Express** - Server framework
- **TypeScript** - Type safety
- **Anthropic SDK** - Claude API integration
- **Claude Sonnet 4.5** - AI agent model

## Architecture

```
backend/
├── src/
│   ├── server.ts       # Express server & routes
│   ├── araAgent.ts     # Ara agent logic (Claude API)
│   └── types.ts        # TypeScript interfaces
├── package.json
├── tsconfig.json
└── .env
```

## How It Works

1. Frontend sends user profile to `/generate-strategy`
2. Backend constructs a specialized prompt for Claude
3. Claude (acting as Ara agent) analyzes the profile
4. Returns structured JSON with personalized strategy
5. Frontend displays the results

## Testing

### Quick Test
```bash
curl http://localhost:3001/test-strategy
```

### Manual Test
```bash
curl -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "major": "Computer Science",
    "graduationYear": "2025",
    "targetRoles": "SWE",
    "locations": "Remote",
    "skills": "JavaScript, Python"
  }'
```

## Troubleshooting

### Error: Missing API Key
Make sure you have `ANTHROPIC_API_KEY` set in your `.env` file.

### Error: Port already in use
Change the `PORT` in `.env` to a different port (e.g., 3002).

### Error: Module not found
Run `npm install` again to ensure all dependencies are installed.

## Production Build

```bash
npm run build
npm start
```

## License

MIT
