/**
 * Calendar Planner - Generates calendar actions from classified emails
 *
 * Detects interview times and OA deadlines
 * Returns demo calendar actions (no real Google Calendar writes yet)
 */

import { ClassifiedEmail } from './emailClassifier.js';
import { TrackerUpdate } from './pipelineUpdater.js';

export type CalendarActionType =
  | 'interview_event'
  | 'oa_deadline'
  | 'follow_up_reminder'
  | 'recruiter_response_deadline';

export interface CalendarAction {
  id: string;
  type: CalendarActionType;
  title: string;
  company: string;
  description: string;
  date?: string;
  time?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'scheduled' | 'completed';
  sourceEmailId: string;
}

/**
 * Generate calendar actions from classified emails and tracker updates
 */
export function generateCalendarActions(
  classifiedEmails: ClassifiedEmail[],
  trackerUpdates: TrackerUpdate[]
): CalendarAction[] {
  console.log('\n📅 Generating calendar actions...');

  const actions: CalendarAction[] = [];

  // Generate actions from classified emails
  for (const classified of classifiedEmails) {
    const emailActions = extractActionsFromEmail(classified);
    actions.push(...emailActions);
  }

  // Generate actions from tracker updates
  for (const update of trackerUpdates) {
    const updateActions = extractActionsFromUpdate(update);
    actions.push(...updateActions);
  }

  // Deduplicate by company + type
  const uniqueActions = deduplicateActions(actions);

  console.log(`[OK] Generated ${uniqueActions.length} calendar actions`);
  return uniqueActions;
}

/**
 * Extract calendar actions from classified email
 */
function extractActionsFromEmail(classified: ClassifiedEmail): CalendarAction[] {
  const actions: CalendarAction[] = [];
  const { email, company, subcategory, extractedData } = classified;

  if (!company) return actions;

  // Interview invitation → create interview event
  if (subcategory === 'interview') {
    actions.push({
      id: `cal-${email.id}-interview`,
      type: 'interview_event',
      title: `Interview: ${company}`,
      company,
      description: `Technical interview with ${company}. Review: data structures, algorithms, system design.`,
      priority: 'high',
      status: 'pending',
      sourceEmailId: email.id,
    });

    // Add preparation reminder 1 day before
    actions.push({
      id: `cal-${email.id}-prep`,
      type: 'follow_up_reminder',
      title: `Prep for ${company} Interview`,
      company,
      description: `Review notes, practice coding problems, research company.`,
      dueDate: calculateDueDate(1),
      priority: 'high',
      status: 'pending',
      sourceEmailId: email.id,
    });
  }

  // OA invitation → create deadline reminder
  if (subcategory === 'oa' && extractedData?.deadline) {
    actions.push({
      id: `cal-${email.id}-oa`,
      type: 'oa_deadline',
      title: `Complete OA: ${company}`,
      company,
      description: `Online assessment deadline. Allocate 90-120 minutes in a quiet environment.`,
      dueDate: extractedData.deadline,
      priority: 'high',
      status: 'pending',
      sourceEmailId: email.id,
    });
  }

  // Recruiter outreach → response deadline
  if (classified.category === 'recruiter_outreach') {
    actions.push({
      id: `cal-${email.id}-respond`,
      type: 'recruiter_response_deadline',
      title: `Respond to ${company} Recruiter`,
      company,
      description: `Reply to recruiter outreach. Express interest and suggest call times.`,
      dueDate: calculateDueDate(2),
      priority: 'high',
      status: 'pending',
      sourceEmailId: email.id,
    });
  }

  return actions;
}

/**
 * Extract calendar actions from tracker update
 */
function extractActionsFromUpdate(update: TrackerUpdate): CalendarAction[] {
  const actions: CalendarAction[] = [];

  // Add follow-up reminder for stale applications
  if (update.newStatus === 'Applied' && update.dueDate) {
    actions.push({
      id: `cal-update-${update.emailId}-followup`,
      type: 'follow_up_reminder',
      title: `Follow up: ${update.company}`,
      company: update.company,
      description: `Send polite follow-up email if no response received.`,
      dueDate: update.dueDate,
      priority: 'medium',
      status: 'pending',
      sourceEmailId: update.emailId,
    });
  }

  return actions;
}

/**
 * Deduplicate actions by company and type
 * Keep the most recent/highest priority
 */
function deduplicateActions(actions: CalendarAction[]): CalendarAction[] {
  const seen = new Map<string, CalendarAction>();

  for (const action of actions) {
    const key = `${action.company}-${action.type}`;
    const existing = seen.get(key);

    if (!existing || action.priority === 'high') {
      seen.set(key, action);
    }
  }

  return Array.from(seen.values());
}

/**
 * Get action counts by type
 */
export function getActionCounts(actions: CalendarAction[]): {
  total: number;
  interviews: number;
  assessments: number;
  followUps: number;
  responses: number;
} {
  return {
    total: actions.length,
    interviews: actions.filter(a => a.type === 'interview_event').length,
    assessments: actions.filter(a => a.type === 'oa_deadline').length,
    followUps: actions.filter(a => a.type === 'follow_up_reminder').length,
    responses: actions.filter(a => a.type === 'recruiter_response_deadline').length,
  };
}

/**
 * Get actions due within N days
 */
export function getActionsDueSoon(actions: CalendarAction[], days: number = 7): CalendarAction[] {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);

  return actions.filter(action => {
    if (!action.dueDate) return false;

    try {
      const dueDate = new Date(action.dueDate);
      return dueDate >= now && dueDate <= threshold;
    } catch {
      return false;
    }
  }).sort((a, b) => {
    const dateA = new Date(a.dueDate!);
    const dateB = new Date(b.dueDate!);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Format calendar action for demo display
 */
export function formatActionForDisplay(action: CalendarAction): string {
  const emoji = {
    interview_event: '📞',
    oa_deadline: '💻',
    follow_up_reminder: '📧',
    recruiter_response_deadline: '✉️',
  };

  const icon = emoji[action.type];
  const dueInfo = action.dueDate ? ` (Due: ${action.dueDate})` : '';

  return `${icon} ${action.title}${dueInfo}`;
}

/**
 * Calculate due date from today
 */
function calculateDueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Demo: Simulate creating calendar event
 * Returns success status (no real API call)
 */
export async function createCalendarEventDemo(action: CalendarAction): Promise<{
  success: boolean;
  eventId: string;
  message: string;
}> {
  console.log(`[DEMO] Creating calendar event: ${action.title}`);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return {
    success: true,
    eventId: `demo-event-${Date.now()}`,
    message: `Calendar event created (DEMO MODE): ${action.title}`,
  };
}
