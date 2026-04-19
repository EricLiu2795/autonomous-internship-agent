import ara_sdk as ara
from datetime import datetime, timezone
import json
import os

# Global storage for input data
_input_data = {}

@ara.tool
def get_utc_time() -> dict:
    """Get current UTC time"""
    return {"utc_time": datetime.now(timezone.utc).isoformat()}

@ara.tool
def get_student_profile() -> dict:
    """Get the student's profile information"""
    global _input_data
    return _input_data.get("profile", {})

@ara.tool
def get_available_jobs() -> dict:
    """Get list of available internship opportunities"""
    global _input_data
    return {"jobs": _input_data.get("jobs", [])}

def load_input_data():
    """Load input data from file if provided"""
    global _input_data

    input_file = os.environ.get("ARA_INPUT_FILE")
    if input_file and os.path.exists(input_file):
        with open(input_file, 'r') as f:
            _input_data = json.load(f)
        print(f"✅ Loaded input from {input_file}", flush=True)
    else:
        # Use default/empty data
        _input_data = {
            "profile": {},
            "jobs": []
        }

# Load input data before creating automation
load_input_data()

ara.Automation(
    "autonomous-internship-agent",
    system_instructions=(
        "You are an Autonomous Internship Agent helping college students land internships.\n\n"
        "YOUR WORKFLOW:\n"
        "1. Call get_student_profile() to understand the student\n"
        "2. Call get_available_jobs() to see ranked opportunities with match scores\n"
        "3. Analyze the top-ranked jobs and their score breakdowns\n"
        "4. Generate actionable outputs: strategy, tailored materials, and follow-up plan\n\n"
        "IMPORTANT:\n"
        "- Jobs are PRE-RANKED by a deterministic matching engine\n"
        "- Each job has a 'score' (0-100) and 'breakdown' (role, skills, location, seniority, preference)\n"
        "- DO NOT invent new scores - use the provided scores\n"
        "- Focus on generating strategy and action-oriented outputs\n\n"
        "YOU MUST return a valid JSON object (no markdown, no code blocks) with this EXACT structure:\n"
        "{\n"
        '  "strategy": {\n'
        '    "industries": ["Industry 1", "Industry 2", "Industry 3"],\n'
        '    "weeklyPlan": ["Action 1", "Action 2", "Action 3"],\n'
        '    "priority": "High/Medium/Low urgency - brief reason"\n'
        "  },\n"
        '  "companies": [\n'
        "    {\n"
        '      "name": "Company Name",\n'
        '      "logo": "emoji",\n'
        '      "color": "from-blue-500 to-blue-600",\n'
        '      "matchPercentage": 95,  // Use the score from the job data\n'
        '      "reason": "Explain WHY this job matched based on score breakdown"\n'
        "    }\n"
        "  ],\n"
        '  "resumeBullets": [\n'
        '    "Bullet 1 with metrics and impact tailored to target roles",\n'
        '    "Bullet 2 with specific achievements relevant to top companies",\n'
        '    "Bullet 3 with quantifiable results matching job requirements"\n'
        "  ],\n"
        '  "outreachMessage": "Professional cold outreach email template",\n'
        '  "followupTimeline": [\n'
        '    {"time": "Today", "action": "Specific action for today"},\n'
        '    {"time": "3 Days Later", "action": "Follow-up action"},\n'
        '    {"time": "1 Week Later", "action": "Next step"}\n'
        "  ]\n"
        "}\n\n"
        "KEY GUIDELINES:\n"
        "- Use top 5 jobs from the ranked list\n"
        "- Preserve match scores from job data (don't regenerate them)\n"
        "- Explain match reasons based on score breakdown (e.g., 'Strong role alignment (95%) and skill match')\n"
        "- Use relevant emojis: 🔍 Google, 👥 Meta, 🤖 AI companies, 📈 Finance, etc.\n"
        "- Resume bullets must reference student's actual skills and target roles\n"
        "- Outreach message should use student's name and major\n"
        "- Make all advice specific and actionable\n"
        "- Return ONLY the JSON, nothing else"
    ),
    tools=[get_utc_time, get_student_profile, get_available_jobs],
)