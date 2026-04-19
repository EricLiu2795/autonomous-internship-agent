import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { UserProfile, InternshipStrategy } from './types.js';

interface MatchBreakdown {
  role: number;
  skills: number;
  location: number;
  seniority: number;
  preference: number;
}

interface Job {
  company: string;
  title: string;
  location: string;
  url: string;
  score?: number;
  breakdown?: MatchBreakdown;
}

interface AraInput {
  profile: {
    name: string;
    major: string;
    graduationYear: string;
    targetRoles: string;
    locations: string;
    skills: string;
  };
  jobs: Job[];
}

/**
 * Call Ara automation to generate internship strategy
 */
export async function callAraAgent(
  profile: UserProfile,
  jobs: Job[]
): Promise<InternshipStrategy> {
  const startTime = Date.now();

  // Create temporary input file
  const tempFile = join(tmpdir(), `ara-input-${Date.now()}.json`);
  const araInput: AraInput = {
    profile: {
      name: profile.name,
      major: profile.major,
      graduationYear: profile.graduationYear,
      targetRoles: profile.targetRoles,
      locations: profile.locations,
      skills: profile.skills,
    },
    jobs: jobs,
  };

  try {
    // Write input file
    writeFileSync(tempFile, JSON.stringify(araInput, null, 2));
    console.log(`📝 Wrote input to ${tempFile}`);

    // Call Ara automation
    const result = await runAraAutomation(tempFile);

    const duration = Date.now() - startTime;
    console.log(`✅ Ara agent completed in ${duration}ms`);

    return result;
  } catch (error) {
    console.error('❌ Ara agent failed:', error);
    throw error;
  } finally {
    // Cleanup temp file
    if (existsSync(tempFile)) {
      unlinkSync(tempFile);
      console.log(`🗑️  Cleaned up ${tempFile}`);
    }
  }
}

/**
 * Run Ara automation as subprocess
 */
function runAraAutomation(inputFile: string): Promise<InternshipStrategy> {
  return new Promise((resolve, reject) => {
    const appPyPath = join(process.cwd(), '..', 'app.py');

    console.log(`🤖 Starting Ara automation...`);
    console.log(`   Input file: ${inputFile}`);
    console.log(`   App path: ${appPyPath}`);

    const ara = spawn('ara', ['run', appPyPath], {
      env: {
        ...process.env,
        ARA_INPUT_FILE: inputFile,
      },
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    ara.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`[Ara stdout] ${output.trim()}`);
    });

    ara.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.log(`[Ara stderr] ${output.trim()}`);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      ara.kill();
      reject(new Error('Ara automation timed out after 60 seconds'));
    }, 60000);

    ara.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        console.error(`❌ Ara process exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
        reject(new Error(`Ara automation failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        // Try to extract JSON from output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in Ara output');
        }

        const result: InternshipStrategy = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!result.strategy || !result.companies || !result.resumeBullets) {
          throw new Error('Invalid Ara output structure');
        }

        resolve(result);
      } catch (error) {
        console.error('❌ Failed to parse Ara output:', error);
        console.error('Raw output:', stdout);
        reject(new Error(`Failed to parse Ara output: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    ara.on('error', (error) => {
      clearTimeout(timeout);
      console.error('❌ Failed to spawn Ara process:', error);
      reject(new Error(`Failed to start Ara: ${error.message}`));
    });
  });
}

/**
 * Fallback: Generate strategy without Ara (for demo stability)
 */
export function generateFallbackStrategy(
  profile: UserProfile,
  jobs: Job[]
): InternshipStrategy {
  console.log('⚠️ Using fallback strategy generator');

  // Simple matching logic - use scores if available
  const matchedCompanies = jobs.slice(0, 5).map((job, idx) => ({
    name: job.company,
    logo: getCompanyLogo(job.company),
    color: getGradientColor(idx),
    matchPercentage: job.score || (95 - idx * 2),
    reason: `Strong match for ${profile.targetRoles.split(',')[0]?.trim() || 'software engineering'} based on your ${profile.skills.split(',')[0]?.trim() || 'technical'} skills`,
    breakdown: job.breakdown,
  }));

  const skills = profile.skills.split(',').map(s => s.trim());

  return {
    strategy: {
      industries: [
        'Tech (FAANG & Unicorns)',
        profile.targetRoles.toLowerCase().includes('ai') ? 'AI/ML Startups' : 'Fintech',
        'Product Companies',
      ],
      weeklyPlan: [
        'Apply to 15-20 companies per week',
        'Send 10 personalized cold outreach emails',
        'Attend 2 networking events or coffee chats',
      ],
      priority: `High urgency - graduating in ${profile.graduationYear}`,
    },
    companies: matchedCompanies,
    resumeBullets: [
      `Developed full-stack applications using ${skills[0] || 'modern technologies'}, improving system performance by 40%`,
      `Led team of 4 in building scalable features processing 1M+ requests daily`,
      `Optimized algorithms and data structures, reducing query time by 60%`,
    ],
    outreachMessage: `Hi [Recruiter Name],\n\nI'm ${profile.name}, a ${profile.major} student graduating in ${profile.graduationYear}. I'm really excited about [Company]'s work and mission.\n\nI've built projects using ${skills[0] || 'various technologies'} that align with your team's goals. I'd love to chat about ${profile.targetRoles.split(',')[0]?.trim() || 'internship'} opportunities for ${profile.graduationYear}.\n\nBest regards,\n${profile.name}`,
    followupTimeline: [
      { time: 'Today', action: 'Send initial application and cold outreach email' },
      { time: '3 Days Later', action: 'Follow up if no response received' },
      { time: '1 Week Later', action: 'Connect on LinkedIn and send polite reminder' },
    ],
  };
}

function getCompanyLogo(company: string): string {
  const logos: Record<string, string> = {
    'Google': '🔍',
    'Meta': '👥',
    'Facebook': '👥',
    'OpenAI': '🤖',
    'Anthropic': '🤖',
    'Microsoft': '⊞',
    'Apple': '🍎',
    'Amazon': '📦',
    'Netflix': '🎬',
    'Tesla': '⚡',
    'Stripe': '💳',
    'Airbnb': '🏠',
    'Uber': '🚗',
    'Lyft': '🚗',
    'Dropbox': '📁',
    'Gitlab': '🦊',
    'Jane Street': '📈',
    'Citadel': '📊',
    'Two Sigma': '📊',
    'HRT': '📊',
    'Datadog': '🐕',
    'Databricks': '🧱',
    'Scale AI': '🎯',
    'Notion': '📝',
    'Linear': '📐',
    'Figma': '🎨',
  };

  for (const [key, logo] of Object.entries(logos)) {
    if (company.toLowerCase().includes(key.toLowerCase())) {
      return logo;
    }
  }

  // Default logos based on industry
  if (company.toLowerCase().includes('ai') || company.toLowerCase().includes('ml')) {
    return '🤖';
  }
  if (company.toLowerCase().includes('data')) {
    return '📊';
  }
  if (company.toLowerCase().includes('finance') || company.toLowerCase().includes('capital')) {
    return '💰';
  }

  return '🏢';
}

function getGradientColor(index: number): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-violet-600',
  ];
  return colors[index % colors.length];
}
