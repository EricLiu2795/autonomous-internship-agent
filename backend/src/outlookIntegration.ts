/**
 * Outlook Integration (MVP)
 * Uses Microsoft Graph API or mock data for demo
 */

export interface RecruiterEmail {
  from: string;
  subject: string;
  snippet: string;
  date: string;
  category: 'OA' | 'interview' | 'rejection' | 'follow_up' | 'other';
}

export interface OutlookSummary {
  total: number;
  byCategory: {
    OA: number;
    interview: number;
    rejection: number;
    follow_up: number;
    other: number;
  };
  recent: RecruiterEmail[];
}

/**
 * Mock email data for demo
 */
const MOCK_EMAILS: RecruiterEmail[] = [
  {
    from: 'recruiting@google.com',
    subject: 'Google SWE Intern - Online Assessment',
    snippet: 'Congratulations! You have been invited to complete an online assessment...',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    category: 'OA',
  },
  {
    from: 'talent@stripe.com',
    subject: 'Interview Invitation - Stripe SWE Intern',
    snippet: 'We would like to invite you for a technical interview on April 25th...',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    category: 'interview',
  },
  {
    from: 'careers@meta.com',
    subject: 'Thank you for your application',
    snippet: 'Thank you for your interest in Meta. Unfortunately, we will not be moving forward...',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    category: 'rejection',
  },
  {
    from: 'jobs@databricks.com',
    subject: 'Application Status Update',
    snippet: 'Your application for Software Engineering Intern is under review...',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    category: 'follow_up',
  },
];

/**
 * Categorize email based on subject/content
 */
function categorizeEmail(subject: string, snippet: string): RecruiterEmail['category'] {
  const text = `${subject} ${snippet}`.toLowerCase();

  if (text.includes('assessment') || text.includes('oa') || text.includes('online test')) {
    return 'OA';
  }
  if (text.includes('interview') || text.includes('phone screen') || text.includes('technical call')) {
    return 'interview';
  }
  if (text.includes('unfortunately') || text.includes('not moving forward') || text.includes('another candidate')) {
    return 'rejection';
  }
  if (text.includes('follow up') || text.includes('checking in') || text.includes('status')) {
    return 'follow_up';
  }

  return 'other';
}

/**
 * Fetch recruiting emails (mock for demo)
 */
export async function fetchRecruiterEmails(): Promise<OutlookSummary> {
  // TODO: Integrate with Microsoft Graph API
  // For now, return mock data

  const emails = MOCK_EMAILS;

  const byCategory = {
    OA: emails.filter(e => e.category === 'OA').length,
    interview: emails.filter(e => e.category === 'interview').length,
    rejection: emails.filter(e => e.category === 'rejection').length,
    follow_up: emails.filter(e => e.category === 'follow_up').length,
    other: emails.filter(e => e.category === 'other').length,
  };

  return {
    total: emails.length,
    byCategory,
    recent: emails.slice(0, 10),
  };
}

/**
 * Generate follow-up email draft
 */
export function generateFollowUpDraft(
  recipientName: string,
  companyName: string,
  roleName: string,
  studentName: string
): string {
  return `Subject: Following up on ${roleName} application

Hi ${recipientName},

I hope this email finds you well. I wanted to follow up on my application for the ${roleName} position at ${companyName}, which I submitted last week.

I'm very excited about the opportunity to contribute to ${companyName}'s mission and would love to learn more about next steps in the process.

Please let me know if there's any additional information I can provide to support my application.

Thank you for your time and consideration.

Best regards,
${studentName}`;
}

/**
 * Update application status based on email signals
 */
export function inferStatusFromEmails(emails: RecruiterEmail[]): Record<string, string> {
  const statusMap: Record<string, string> = {};

  for (const email of emails) {
    // Extract company name from email domain
    const domain = email.from.split('@')[1];
    const company = domain?.split('.')[0] || 'Unknown';

    // Map category to status
    switch (email.category) {
      case 'OA':
        statusMap[company] = 'OA Received';
        break;
      case 'interview':
        statusMap[company] = 'Interview Scheduled';
        break;
      case 'rejection':
        statusMap[company] = 'Rejected';
        break;
      case 'follow_up':
        statusMap[company] = 'Under Review';
        break;
      default:
        statusMap[company] = 'Applied';
    }
  }

  return statusMap;
}
