# 🚀 Complete Setup Guide - Autonomous Internship Agent

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Anthropic API Key (get from https://console.anthropic.com/)

---

## Step 1: Clone & Navigate

```bash
cd autonomous-internship-agent
```

---

## Step 2: Backend Setup

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Your actual API key
PORT=3001
NODE_ENV=development
```

**Important:** Get your API key from https://console.anthropic.com/

### Start Backend Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  Ara Autonomous Internship Agent - Backend API      ║
║                                                           ║
║   Status: Running                                         ║
║   Port: 3001                                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

Backend will be running at: **http://localhost:3001**

---

## Step 3: Frontend Setup

Open a **new terminal** and navigate to the root directory:

### Install Frontend Dependencies

```bash
npm install
```

### Start Frontend Server

```bash
npm run dev
```

Frontend will be running at: **http://localhost:5173**

---

## Step 4: Test the Integration

### Test 1: Backend Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Ara backend is running"
}
```

### Test 2: Test Strategy Generation

```bash
curl http://localhost:3001/test-strategy
```

This will generate a strategy with sample data.

### Test 3: Full E2E Test

1. Open browser: http://localhost:5173
2. Fill out the form:
   - **Name:** Alex Chen
   - **Major:** Computer Science
   - **Graduation Year:** 2025
   - **Target Roles:** SWE, AI/ML
   - **Locations:** San Francisco, Remote
   - **Skills:** React, Python, TensorFlow
3. Click "Generate Strategy"
4. Watch the loading animation
5. See personalized results!

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frontend (React + TypeScript + Tailwind)          │
│  Port: 5173                                         │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ POST /generate-strategy
                   │ { name, major, skills, ... }
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Backend (Express + TypeScript)                     │
│  Port: 3001                                         │
│                                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ API Call with System Prompt
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Ara Agent (Claude Sonnet 4.5 via Anthropic SDK)   │
│                                                     │
│  • Analyzes student profile                        │
│  • Generates personalized strategy                 │
│  • Returns structured JSON                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### ❌ Error: "Failed to generate strategy"

**Solution:**
- Make sure backend is running (`cd backend && npm run dev`)
- Check if `ANTHROPIC_API_KEY` is set in `backend/.env`
- Verify API key is valid at https://console.anthropic.com/

### ❌ Error: "Port 3001 already in use"

**Solution:**
- Change `PORT` in `backend/.env` to `3002`
- Update `API_URL` in `src/App.tsx` to match

### ❌ Error: "Module not found"

**Solution:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

### ❌ CORS errors

**Solution:**
- Backend already has CORS enabled
- Make sure both servers are running
- Try clearing browser cache

---

## Development Tips

### Watch Logs

**Backend logs:**
```bash
cd backend
npm run dev
# Watch for "✅ Strategy generated successfully"
```

**Frontend console:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API requests

### Test with curl

```bash
# Test backend directly
curl -X POST http://localhost:3001/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "major": "Computer Science",
    "graduationYear": "2025",
    "targetRoles": "SWE, AI",
    "locations": "Remote",
    "skills": "Python, React"
  }'
```

---

## Production Build

### Build Backend

```bash
cd backend
npm run build
npm start
```

### Build Frontend

```bash
npm run build
npm run preview
```

---

## Tech Stack Summary

### Frontend
- ⚛️ **React 18** - UI framework
- 📘 **TypeScript** - Type safety
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** - Styling
- 🎯 **Lucide React** - Icons

### Backend
- 🟢 **Node.js + Express** - Server
- 📘 **TypeScript** - Type safety
- 🤖 **Anthropic SDK** - Claude API
- 🧠 **Claude Sonnet 4.5** - AI model

---

## Environment Variables Reference

### Backend `.env`
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx   # Required
PORT=3001                         # Optional (default: 3001)
NODE_ENV=development              # Optional (default: development)
```

---

## API Endpoints

### `GET /health`
Health check

### `POST /generate-strategy`
Generate internship strategy
- **Input:** UserProfile JSON
- **Output:** InternshipStrategy JSON

### `GET /test-strategy`
Test with sample data

---

## Next Steps

✅ Both servers running  
✅ API key configured  
✅ Integration tested  
🎉 **Ready for hackathon demo!**

---

## Support

Issues? Check:
1. Both servers running?
2. API key valid?
3. CORS enabled?
4. Ports not blocked?

Still stuck? Check the logs!
