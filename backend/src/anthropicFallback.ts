/**
 * Anthropic Direct API Fallback
 * Used when Ara fails (middle fallback before TypeScript generator)
 */

import Anthropic from '@anthropic-ai/sdk';
import { UserProfile, InternshipStrategy } from './types.js';

interface ScoredJob {
  company: string;
  title: string;
  location: string;
  url: string;
  score: number;
  breakdown: {
    role: number;
    skills: number;
    location: number;
    seniority: number;
    preference: number;
  };
}

/**
 * Generate strategy using Anthropic API directly
 */
export async function generateWithAnthropic(
  profile: UserProfile,
  jobs: ScoredJob[]
): Promise<InternshipStrategy> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set - cannot use direct API fallback');
  }

  const client = new Anthropic({ apiKey });

  const prompt = buildPrompt(profile, jobs);

  console.log('📞 Calling Anthropic API directly...');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract JSON from response
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API');
  }

  const text = content.text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Anthropic API response');
  }

  const strategy: InternshipStrategy = JSON.parse(jsonMatch[0]);

  // Validate structure
  if (!strategy.strategy || !strategy.companies || !strategy.resumeBullets) {
    throw new Error('Invalid response structure from Anthropic API');
  }

  console.log('✅ Anthropic API returned valid strategy');

  return strategy;
}

/**
 * Build prompt for Anthropic API
 */
function buildPrompt(profile: UserProfile, jobs: ScoredJob[]): string {
  const topJobs = jobs.slice(0, 10);

  return `You are an Autonomous Internship Agent helping college students land internships.

STUDENT PROFILE:
Name: ${profile.name}
Major: ${profile.major}
Graduation Year: ${profile.graduationYear}
Target Roles: ${profile.targetRoles}
Locations: ${profile.locations}
Skills: ${profile.skills}

RANKED JOB OPPORTUNITIES (with match scores):
${topJobs
  .map(
    (job, idx) =>
      `${idx + 1}. ${job.company} - ${job.title}
   Location: ${job.location}
   Match Score: ${job.score}%
   Breakdown: Role=${job.breakdown.role}%, Skills=${job.breakdown.skills}%, Location=${job.breakdown.location}%, Seniority=${job.breakdown.seniority}%, Preference=${job.breakdown.preference}%`
  )
  .join('\n\n')}

TASK:
Generate a comprehensive internship strategy for ${profile.name}. The jobs above are PRE-RANKED by a deterministic matching engine. Use the provided scores and breakdowns - do NOT invent new scores.

Return ONLY a valid JSON object (no markdown, no code blocks) with this EXACT structure:

{
  "strategy": {
    "industries": ["Industry 1", "Industry 2", "Industry 3"],
    "weeklyPlan": ["Action 1", "Action 2", "Action 3"],
    "priority": "High/Medium/Low urgency - brief reason"
  },
  "companies": [
    {
      "name": "Company Name",
      "role": "Job Title from the ranked list",
      "logo": "emoji (🔍 Google, 👥 Meta, 🤖 AI companies, 📈 Finance, etc.)",
      "color": "from-blue-500 to-blue-600",
      "matchPercentage": 95,
      "reason": "Explain WHY this matched based on the score breakdown"
    }
  ],
  "resumeBullets": [
    "Bullet 1 with metrics and impact tailored to ${profile.targetRoles}",
    "Bullet 2 with specific achievements relevant to top companies",
    "Bullet 3 with quantifiable results matching job requirements"
  ],
  "outreachMessage": "Professional cold outreach email template using ${profile.name} and ${profile.major}",
  "followupTimeline": [
    {"time": "Today", "action": "Specific action for today"},
    {"time": "3 Days Later", "action": "Follow-up action"},
    {"time": "1 Week Later", "action": "Next step"}
  ]
}

IMPORTANT:
- Select top 5 companies from the ranked list above
- Use the EXACT match scores provided (matchPercentage = score from ranking)
- Explain match reasons based on the breakdown (e.g., "Strong role alignment (95%) and excellent skill match (88%)")
- Tailor resume bullets to ${profile.skills.split(',')[0]?.trim() || 'technical skills'}
- Make advice specific and actionable
- Return ONLY the JSON, nothing else`;
}
