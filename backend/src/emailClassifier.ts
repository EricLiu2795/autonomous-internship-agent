/**
 * Email Classifier - Classifies recruiting emails using Ara Gmail connector
 *
 * Primary: Ara automation with Gmail connector (reads Gmail directly)
 * Fallback: Mock data for demo mode
 */

import { spawn } from 'child_process';
import { join } from 'path';

// Ara Gmail classification categories
export type AraEmailCategory =
  | 'recruiter_outreach'
  | 'application_received'
  | 'oa_assigned'
  | 'interview_invite'
  | 'rejection'
  | 'follow_up_needed'
  | 'irrelevant';

export interface AraClassifiedEmail {
  id: string;
  from: string;
  subject: string;
  receivedDate: string;
  category: AraEmailCategory;
  company: string | null;
  role: string | null;
  nextAction: string | null;
  dueDate: string | null;
}

export interface AraClassificationResult {
  summary: {
    totalEmails: number;
    recruitingEmails: number;
    byCategory: Record<AraEmailCategory, number>;
  };
  emails: AraClassifiedEmail[];
}

// Legacy interface for backward compatibility
export interface ClassifiedEmail {
  email: {
    id: string;
    from: string;
    subject: string;
    body: string;
    receivedAt: Date;
  };
  category: 'application_response' | 'recruiter_outreach' | 'irrelevant';
  subcategory: 'oa' | 'interview' | 'rejection' | 'application_received' | 'follow_up_needed' | 'none';
  company: string | null;
  role: string | null;
  confidence: number;
  reasoning: string;
  extractedData?: {
    interviewDate?: string;
    deadline?: string;
    actionRequired?: string;
  };
}

/**
 * Classify emails using Ara Gmail connector
 * Tier 1: Ara automation with Gmail connector (reads Gmail directly)
 * Tier 2: Mock data fallback for demo
 */
export async function classifyEmailsWithAra(): Promise<ClassifiedEmail[]> {
  console.log('\n🔍 Classifying emails with Ara Gmail connector...');

  try {
    console.log('[Tier 1] Calling Ara with Gmail connector...');
    const araResult = await runAraGmailClassifier();
    console.log(`[OK] Ara classified ${araResult.summary.recruitingEmails} recruiting emails`);

    // Convert Ara format to ClassifiedEmail format
    const classifiedEmails = convertAraToClassifiedEmails(araResult);
    return classifiedEmails;
  } catch (araError) {
    console.warn('[WARN] Ara Gmail classification failed:', araError);
    console.log('[Tier 2] Using mock data fallback...');
    const mockData = getMockClassificationData();
    console.log(`[OK] Loaded ${mockData.length} mock emails`);
    return mockData;
  }
}

/**
 * Run Ara Gmail classifier
 * Uses Ara's Gmail connector to read and classify emails directly
 */
function runAraGmailClassifier(): Promise<AraClassificationResult> {
  return new Promise((resolve, reject) => {
    const classifierPath = join(process.cwd(), '..', 'email_classifier.py');

    console.log(`[INFO] Running Ara automation: ${classifierPath}`);

    const ara = spawn('ara', ['run', classifierPath], {
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    ara.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`[Ara Gmail] ${output.trim()}`);
    });

    ara.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (!output.includes('WARNING') && !output.includes('INFO')) {
        console.error(`[Ara Error] ${output.trim()}`);
      }
    });

    const timeout = setTimeout(() => {
      ara.kill();
      reject(new Error('Ara Gmail classifier timed out after 60 seconds'));
    }, 60000);

    ara.on('close', (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        console.error(`[ERROR] Ara exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
        reject(new Error(`Ara Gmail classifier failed with code ${code}`));
        return;
      }

      try {
        // Extract JSON from output
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[ERROR] No JSON found in Ara output');
          console.error('Raw output:', stdout);
          throw new Error('No JSON found in Ara output');
        }

        const result: AraClassificationResult = JSON.parse(jsonMatch[0]);

        // Validate structure
        if (!result.summary || !result.emails) {
          throw new Error('Invalid Ara output structure - missing summary or emails');
        }

        console.log(`[OK] Parsed ${result.emails.length} emails from Ara`);
        resolve(result);
      } catch (error) {
        console.error('[ERROR] Failed to parse Ara output:', error);
        console.error('Raw output:', stdout);
        reject(new Error(`Failed to parse Ara output: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    ara.on('error', (error) => {
      clearTimeout(timeout);
      console.error('[ERROR] Failed to spawn Ara process:', error);
      reject(new Error(`Failed to start Ara: ${error.message}`));
    });
  });
}

/**
 * Convert Ara classification result to ClassifiedEmail format
 */
function convertAraToClassifiedEmails(araResult: AraClassificationResult): ClassifiedEmail[] {
  return araResult.emails
    .filter(e => e.category !== 'irrelevant')
    .map(araEmail => {
      // Map Ara categories to legacy format
      const categoryMapping: Record<AraEmailCategory, { category: string; subcategory: string }> = {
        recruiter_outreach: { category: 'recruiter_outreach', subcategory: 'follow_up_needed' },
        application_received: { category: 'application_response', subcategory: 'application_received' },
        oa_assigned: { category: 'application_response', subcategory: 'oa' },
        interview_invite: { category: 'application_response', subcategory: 'interview' },
        rejection: { category: 'application_response', subcategory: 'rejection' },
        follow_up_needed: { category: 'application_response', subcategory: 'follow_up_needed' },
        irrelevant: { category: 'irrelevant', subcategory: 'none' },
      };

      const mapped = categoryMapping[araEmail.category];

      return {
        email: {
          id: araEmail.id,
          from: araEmail.from,
          subject: araEmail.subject,
          body: '', // Body not needed for frontend
          receivedAt: new Date(araEmail.receivedDate),
        },
        category: mapped.category as any,
        subcategory: mapped.subcategory as any,
        company: araEmail.company,
        role: araEmail.role,
        confidence: 0.9, // Ara is highly confident
        reasoning: `Classified as ${araEmail.category}`,
        extractedData: {
          actionRequired: araEmail.nextAction || undefined,
          deadline: araEmail.dueDate || undefined,
        },
      };
    });
}

/**
 * Mock data fallback for demo
 */
function getMockClassificationData(): ClassifiedEmail[] {
  console.log('[INFO] Using mock classification data');

  return [
    {
      email: {
        id: 'mock-001',
        from: 'recruiting@google.com',
        subject: 'Google - Software Engineering Intern Interview Invitation',
        body: 'We would like to schedule a technical phone screen...',
        receivedAt: new Date('2026-04-19T09:30:00Z'),
      },
      category: 'application_response',
      subcategory: 'interview',
      company: 'Google',
      role: 'Software Engineering Intern',
      confidence: 0.95,
      reasoning: 'Interview invitation',
      extractedData: {
        actionRequired: 'Schedule technical phone screen',
        deadline: 'April 22, 2026',
      },
    },
    {
      email: {
        id: 'mock-002',
        from: 'careers@stripe.com',
        subject: 'Stripe - Online Assessment for Full Stack Intern Role',
        body: 'Please complete within the next 5 days. Deadline: April 24, 2026',
        receivedAt: new Date('2026-04-18T14:20:00Z'),
      },
      category: 'application_response',
      subcategory: 'oa',
      company: 'Stripe',
      role: 'Full Stack Intern',
      confidence: 0.95,
      reasoning: 'Online assessment with deadline',
      extractedData: {
        actionRequired: 'Complete 90-minute assessment',
        deadline: 'April 24, 2026',
      },
    },
    {
      email: {
        id: 'mock-003',
        from: 'talent@openai.com',
        subject: 'OpenAI - Application Received',
        body: 'We have received your application...',
        receivedAt: new Date('2026-04-17T16:45:00Z'),
      },
      category: 'application_response',
      subcategory: 'application_received',
      company: 'OpenAI',
      role: 'ML Engineering Intern',
      confidence: 0.85,
      reasoning: 'Application confirmation',
    },
    {
      email: {
        id: 'mock-004',
        from: 'recruiter@meta.com',
        subject: 'Meta - Thanks for your interest',
        body: 'We have decided to move forward with other candidates...',
        receivedAt: new Date('2026-04-16T11:00:00Z'),
      },
      category: 'application_response',
      subcategory: 'rejection',
      company: 'Meta',
      role: 'Software Engineer Intern',
      confidence: 0.9,
      reasoning: 'Application rejected',
    },
    {
      email: {
        id: 'mock-005',
        from: 'jdoe@datadog.com',
        subject: 'Quick chat about Datadog internship opportunities?',
        body: 'I came across your profile and was impressed...',
        receivedAt: new Date('2026-04-19T08:15:00Z'),
      },
      category: 'recruiter_outreach',
      subcategory: 'follow_up_needed',
      company: 'Datadog',
      role: 'Backend Engineer Intern',
      confidence: 0.85,
      reasoning: 'Direct recruiter outreach',
      extractedData: {
        actionRequired: 'Respond to recruiter',
        deadline: 'April 21, 2026',
      },
    },
    {
      email: {
        id: 'mock-006',
        from: 'careers@nvidia.com',
        subject: 'NVIDIA - Schedule Your Interview',
        body: 'Congratulations! Please schedule within 48 hours...',
        receivedAt: new Date('2026-04-19T11:00:00Z'),
      },
      category: 'application_response',
      subcategory: 'interview',
      company: 'NVIDIA',
      role: 'Software Engineering Intern',
      confidence: 0.95,
      reasoning: 'Interview scheduling required',
      extractedData: {
        actionRequired: 'Schedule interview',
        deadline: 'April 21, 2026',
      },
    },
    {
      email: {
        id: 'mock-007',
        from: 'noreply@microsoft.com',
        subject: 'Microsoft - Your application status',
        body: 'Your application is under review...',
        receivedAt: new Date('2026-04-15T10:30:00Z'),
      },
      category: 'application_response',
      subcategory: 'application_received',
      company: 'Microsoft',
      role: 'Software Engineering Intern',
      confidence: 0.85,
      reasoning: 'Application status update',
    },
    {
      email: {
        id: 'mock-008',
        from: 'hiring@anthropic.com',
        subject: 'Follow-up: Anthropic Software Engineering Intern',
        body: 'We wanted to follow up on your application...',
        receivedAt: new Date('2026-04-18T15:30:00Z'),
      },
      category: 'application_response',
      subcategory: 'follow_up_needed',
      company: 'Anthropic',
      role: 'Software Engineering Intern',
      confidence: 0.8,
      reasoning: 'Recruiter follow-up',
    },
  ];
}
