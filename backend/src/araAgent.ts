import Anthropic from '@anthropic-ai/sdk';
import { UserProfile, InternshipStrategy } from './types.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ARA_SYSTEM_PROMPT = `You are an Autonomous Internship Agent (ARA) helping college students land internships.

Your mission: Analyze a student's profile and generate a comprehensive internship application strategy.

You must return ONLY valid JSON in this exact structure (no markdown, no code blocks):

{
  "strategy": {
    "industries": ["Industry 1", "Industry 2", "Industry 3"],
    "weeklyPlan": ["Action 1", "Action 2", "Action 3"],
    "priority": "High/Medium/Low urgency - brief reason"
  },
  "companies": [
    {
      "name": "Company Name",
      "logo": "emoji",
      "color": "from-blue-500 to-blue-600",
      "matchPercentage": 95,
      "reason": "Why this company is a great fit"
    }
  ],
  "resumeBullets": [
    "Bullet point 1 with metrics",
    "Bullet point 2 with impact",
    "Bullet point 3 with results"
  ],
  "outreachMessage": "Professional cold outreach message",
  "followupTimeline": [
    {"time": "Today", "action": "What to do today"},
    {"time": "3 Days Later", "action": "What to do in 3 days"},
    {"time": "1 Week Later", "action": "What to do in 1 week"}
  ]
}

Guidelines:
- Recommend 5 companies with high match percentages (85-98%)
- Use relevant emojis for company logos (🔍 for Google, 👥 for Meta, 🤖 for AI companies, etc.)
- Tailor resume bullets to the student's skills and target roles
- Create a compelling but concise outreach message
- Make the strategy actionable and specific
- Consider graduation timeline for urgency

Return ONLY the JSON object, nothing else.`;

export async function generateInternshipStrategy(
  profile: UserProfile
): Promise<InternshipStrategy> {
  const userPrompt = `Generate an internship strategy for this student:

Name: ${profile.name}
Major: ${profile.major}
Graduation Year: ${profile.graduationYear}
Target Roles: ${profile.targetRoles}
Preferred Locations: ${profile.locations}
Skills: ${profile.skills}

Analyze this profile and create a personalized strategy that maximizes their chances of landing top internships.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.7,
      system: ARA_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const responseText = content.text.trim();

    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonText = responseText;
    if (responseText.startsWith('```')) {
      const match = responseText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) {
        jsonText = match[1];
      }
    }

    const strategy: InternshipStrategy = JSON.parse(jsonText);

    // Validate the response structure
    if (!strategy.strategy || !strategy.companies || !strategy.resumeBullets) {
      throw new Error('Invalid response structure from Ara agent');
    }

    return strategy;
  } catch (error) {
    console.error('Error calling Ara agent:', error);
    throw new Error(`Failed to generate strategy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
