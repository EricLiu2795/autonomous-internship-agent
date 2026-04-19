# ⚡ Quick Start - Autonomous Internship Agent

## You're 3 steps away from running Ara!

### Step 1: Get Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Create API key
4. Copy the key (starts with `sk-ant-`)

### Step 2: Configure Backend
```bash
cd backend
```

Open `backend/.env` and replace `your_api_key_here` with your actual API key:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:5173**

---

## 🎯 Demo Flow for Judges

1. Fill out form:
   - Name: Alex Chen
   - Major: Computer Science  
   - Graduation: 2025
   - Roles: SWE, AI/ML
   - Locations: San Francisco, Remote
   - Skills: React, Python, TensorFlow

2. Click "Generate Strategy"

3. Watch Ara agent work its magic! ✨

4. See personalized:
   - Application strategy
   - Top 5 matched companies
   - Resume bullets
   - Outreach message
   - Follow-up timeline

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check if API key is set in `backend/.env`
- Make sure you ran `npm install` in backend directory

**Frontend shows error?**
- Make sure backend is running first
- Check browser console (F12)

**Still stuck?**
- See full [SETUP.md](./SETUP.md) guide
- Check both terminal outputs for errors

---

## 🎉 That's it!

Your Ara agent is ready to help students land internships!

Built at JHU Hackathon 2026 🚀
