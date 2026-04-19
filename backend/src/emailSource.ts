/**
 * Email Source - Provides recruiting emails
 *
 * Demo Mode: Uses local mock JSON (realistic recruiting emails)
 * Future: Can be extended to real Gmail API
 */

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
}

/**
 * Mock recruiting emails for demo
 * These simulate a real inbox with various recruiting scenarios
 */
const MOCK_RECRUITING_EMAILS: Email[] = [
  {
    id: 'email-001',
    from: 'recruiting@google.com',
    subject: 'Google - Software Engineering Intern Interview Invitation',
    body: `Hi Alex,

Thank you for applying to the Software Engineering Intern position at Google!

We're impressed with your background and would like to invite you to the next stage of our process. We'd like to schedule a technical phone screen for next week.

Please use this link to schedule a 45-minute interview slot that works best for you: calendly.com/google-recruiting/alex-chen

The interview will cover data structures, algorithms, and system design fundamentals.

Looking forward to speaking with you!

Best regards,
Sarah Johnson
Technical Recruiter, Google`,
    receivedAt: new Date('2026-04-19T09:30:00Z'),
  },
  {
    id: 'email-002',
    from: 'careers@stripe.com',
    subject: 'Stripe - Online Assessment for Full Stack Intern Role',
    body: `Hello Alex,

Thanks for your interest in the Full Stack Engineering Intern position at Stripe.

You've been selected to complete our online assessment. Please complete it within the next 5 days.

Assessment Link: https://stripe.hackerrank.com/oa/abc123xyz
Time Limit: 90 minutes
Topics: JavaScript, React, Node.js, SQL
Deadline: April 24, 2026 at 11:59 PM PST

Please reach out if you have any questions.

Best,
Michael Chen
Engineering Recruiter, Stripe`,
    receivedAt: new Date('2026-04-18T14:20:00Z'),
  },
  {
    id: 'email-003',
    from: 'talent@openai.com',
    subject: 'OpenAI - Application Received',
    body: `Dear Alex Chen,

Thank you for applying to the ML Engineering Intern position at OpenAI.

We have received your application and our team is currently reviewing all submissions. Due to the high volume of applications, this process may take 2-3 weeks.

We'll be in touch if your profile matches what we're looking for.

Best regards,
OpenAI Talent Team`,
    receivedAt: new Date('2026-04-17T16:45:00Z'),
  },
  {
    id: 'email-004',
    from: 'recruiter@meta.com',
    subject: 'Meta - Thanks for your interest',
    body: `Hi Alex,

Thank you for your interest in the Software Engineer Intern role at Meta.

After careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.

We encourage you to apply again in the future as your skills develop. Your application will remain in our system for one year.

We wish you the best in your career search.

Best regards,
Meta Recruiting Team`,
    receivedAt: new Date('2026-04-16T11:00:00Z'),
  },
  {
    id: 'email-005',
    from: 'jdoe@datadog.com',
    subject: 'Quick chat about Datadog internship opportunities?',
    body: `Hi Alex,

I came across your profile and was really impressed with your projects, particularly your work with Python and distributed systems.

We have several backend engineering intern positions opening up at Datadog for Summer 2025, and I think you'd be a great fit for our observability platform team.

Would you be open to a quick 15-minute call this week to discuss? I'm free Tuesday or Thursday afternoon if that works for you.

Looking forward to connecting!

Best,
Jessica Doe
Senior Technical Recruiter, Datadog
jdoe@datadog.com`,
    receivedAt: new Date('2026-04-19T08:15:00Z'),
  },
  {
    id: 'email-006',
    from: 'noreply@microsoft.com',
    subject: 'Microsoft - Your application status',
    body: `Dear Alex Chen,

Thank you for your interest in opportunities at Microsoft.

Your application for Software Engineering Intern - Cloud Infrastructure has been received and is under review.

Application ID: MSFT-2026-SWE-04192
Position: Software Engineering Intern
Location: Redmond, WA
Application Date: April 15, 2026

You can check your application status at any time through our careers portal.

We appreciate your patience during our review process.

Microsoft Talent Acquisition`,
    receivedAt: new Date('2026-04-15T10:30:00Z'),
  },
  {
    id: 'email-007',
    from: 'admin@university.edu',
    subject: 'CS Department Newsletter - April 2026',
    body: `Dear CS Students,

This month's highlights:

- Spring career fair on April 25th
- New research lab opening in robotics
- Guest lecture series continues next week

Full newsletter: https://cs.university.edu/newsletter

CS Department`,
    receivedAt: new Date('2026-04-14T09:00:00Z'),
  },
  {
    id: 'email-008',
    from: 'hiring@anthropic.com',
    subject: 'Follow-up: Anthropic Software Engineering Intern',
    body: `Hi Alex,

I wanted to follow up on the Software Engineering Intern application you submitted two weeks ago.

We're still reviewing applications, but I wanted to let you know that your background in Python and ML caught our attention. Your GitHub projects demonstrate strong fundamentals.

We should have an update for you by end of next week. In the meantime, if you have any questions about the role or Anthropic, feel free to reach out.

Thanks for your patience!

Best,
David Park
Recruiting, Anthropic`,
    receivedAt: new Date('2026-04-18T15:30:00Z'),
  },
  {
    id: 'email-009',
    from: 'careers@nvidia.com',
    subject: 'NVIDIA - Schedule Your Interview',
    body: `Dear Alex,

Congratulations! You've advanced to the interview stage for the Software Engineering Intern position at NVIDIA.

Next Steps:
1. Review the attached interview preparation guide
2. Schedule your interview using this link: nvidia.com/interviews/schedule/xyz789
3. Available slots: April 22-26, 2026

Interview Details:
- Duration: 1 hour
- Format: Technical coding + behavioral
- Platform: Zoom
- Interviewer: Senior Engineer from GPU Software team

Please schedule within the next 48 hours to secure your preferred time slot.

Best regards,
NVIDIA University Recruiting`,
    receivedAt: new Date('2026-04-19T11:00:00Z'),
  },
  {
    id: 'email-010',
    from: 'notifications@leetcode.com',
    subject: 'Your weekly coding challenge streak',
    body: `Hi Alex,

Great job maintaining your 15-day streak!

This week's challenge: Dynamic Programming Week
- Complete 3 medium problems
- Join the discussion forum

Keep coding!
LeetCode Team`,
    receivedAt: new Date('2026-04-19T07:00:00Z'),
  },
];

/**
 * Get recruiting emails (demo mode)
 * Returns mock emails that simulate a real recruiting inbox
 */
export async function getRecruitingEmails(): Promise<Email[]> {
  console.log('[INFO] Fetching recruiting emails (DEMO MODE)');
  console.log(`[INFO] Retrieved ${MOCK_RECRUITING_EMAILS.length} emails`);

  // Simulate slight delay as if fetching from API
  await new Promise(resolve => setTimeout(resolve, 300));

  return MOCK_RECRUITING_EMAILS;
}

/**
 * Get email by ID
 */
export async function getEmailById(id: string): Promise<Email | null> {
  const email = MOCK_RECRUITING_EMAILS.find(e => e.id === id);
  return email || null;
}

/**
 * Count emails by basic category
 */
export function getEmailCounts(emails: Email[]): {
  total: number;
  recruiting: number;
  other: number;
} {
  const recruiting = emails.filter(e =>
    e.from.includes('recruiting') ||
    e.from.includes('careers') ||
    e.from.includes('talent') ||
    e.from.includes('hiring') ||
    e.from.includes('@google.com') ||
    e.from.includes('@stripe.com') ||
    e.from.includes('@meta.com') ||
    e.from.includes('@openai.com') ||
    e.from.includes('@anthropic.com') ||
    e.from.includes('@datadog.com') ||
    e.from.includes('@nvidia.com') ||
    e.from.includes('@microsoft.com')
  ).length;

  return {
    total: emails.length,
    recruiting,
    other: emails.length - recruiting,
  };
}
