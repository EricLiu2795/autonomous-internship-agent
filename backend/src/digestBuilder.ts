/**
 * Digest Builder - Combines all workflow results into frontend-ready response
 *
 * Aggregates:
 * - Inbox summary
 * - Classified emails
 * - Action queue
 * - Pipeline tracker
 * - Calendar actions
 */

import { Email } from './emailSource.js';
import { ClassifiedEmail } from './emailClassifier.js';
import { TrackerUpdate, PipelineState, PipelineStatus, getActionQueue, getPipelineStats } from './pipelineUpdater.js';
import { CalendarAction, getActionCounts, getActionsDueSoon } from './calendarPlanner.js';

export interface InboxDigest {
  summary: {
    totalEmails: number;
    recruitingEmails: number;
    actionNeeded: number;
    processedAt: string;
  };
  classifiedEmails: ClassifiedEmailDigest[];
  actionQueue: {
    urgent: ActionItem[];
    high: ActionItem[];
    medium: ActionItem[];
    low: ActionItem[];
    counts: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  tracker: {
    companies: CompanyTrackerItem[];
    stats: {
      total: number;
      byStatus: Record<PipelineStatus, number>;
      actionNeeded: number;
    };
  };
  calendarActions: CalendarActionDigest[];
  calendarSummary: {
    total: number;
    interviews: number;
    assessments: number;
    followUps: number;
    responses: number;
    dueSoon: CalendarActionDigest[];
  };
}

interface ClassifiedEmailDigest {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  category: string;
  subcategory: string;
  company: string | null;
  role: string | null;
  confidence: number;
  reasoning: string;
  actionRequired?: string;
  deadline?: string;
}

interface ActionItem {
  id: string;
  company: string;
  action: string;
  status: string;
  dueDate?: string;
  priority: string;
  source: string;
}

interface CompanyTrackerItem {
  company: string;
  role: string | null;
  status: PipelineStatus;
  lastUpdated: string;
  nextAction?: string;
  dueDate?: string;
  updateCount: number;
}

interface CalendarActionDigest {
  id: string;
  type: string;
  title: string;
  company: string;
  description: string;
  dueDate?: string;
  priority: string;
  status: string;
}

/**
 * Build complete inbox digest from workflow results
 */
export function buildInboxDigest(
  emails: Email[],
  classifiedEmails: ClassifiedEmail[],
  trackerUpdates: TrackerUpdate[],
  pipeline: PipelineState,
  calendarActions: CalendarAction[]
): InboxDigest {
  console.log('\n📦 Building inbox digest...');

  // Build action queue
  const actionQueue = getActionQueue(trackerUpdates);

  // Get pipeline stats
  const pipelineStats = getPipelineStats(pipeline);

  // Get calendar summary
  const calendarCounts = getActionCounts(calendarActions);
  const dueSoon = getActionsDueSoon(calendarActions, 7);

  const digest: InboxDigest = {
    summary: {
      totalEmails: emails.length,
      recruitingEmails: classifiedEmails.filter(e => e.category !== 'irrelevant').length,
      actionNeeded: actionQueue.urgent.length + actionQueue.high.length,
      processedAt: new Date().toISOString(),
    },
    classifiedEmails: classifiedEmails.map(formatClassifiedEmail),
    actionQueue: {
      urgent: actionQueue.urgent.map(formatActionItem),
      high: actionQueue.high.map(formatActionItem),
      medium: actionQueue.medium.map(formatActionItem),
      low: actionQueue.low.map(formatActionItem),
      counts: {
        urgent: actionQueue.urgent.length,
        high: actionQueue.high.length,
        medium: actionQueue.medium.length,
        low: actionQueue.low.length,
      },
    },
    tracker: {
      companies: formatTrackerItems(pipeline),
      stats: pipelineStats,
    },
    calendarActions: calendarActions.map(formatCalendarAction),
    calendarSummary: {
      total: calendarCounts.total,
      interviews: calendarCounts.interviews,
      assessments: calendarCounts.assessments,
      followUps: calendarCounts.followUps,
      responses: calendarCounts.responses,
      dueSoon: dueSoon.map(formatCalendarAction),
    },
  };

  console.log('[OK] Digest built successfully');
  console.log(`  • ${digest.summary.recruitingEmails} recruiting emails`);
  console.log(`  • ${digest.summary.actionNeeded} actions needed`);
  console.log(`  • ${digest.tracker.stats.total} companies tracked`);
  console.log(`  • ${digest.calendarSummary.total} calendar actions`);

  return digest;
}

/**
 * Format classified email for digest
 */
function formatClassifiedEmail(classified: ClassifiedEmail): ClassifiedEmailDigest {
  return {
    id: classified.email.id,
    from: classified.email.from,
    subject: classified.email.subject,
    receivedAt: classified.email.receivedAt.toISOString(),
    category: classified.category,
    subcategory: classified.subcategory,
    company: classified.company,
    role: classified.role,
    confidence: classified.confidence,
    reasoning: classified.reasoning,
    actionRequired: classified.extractedData?.actionRequired,
    deadline: classified.extractedData?.deadline,
  };
}

/**
 * Format tracker update as action item
 */
function formatActionItem(update: TrackerUpdate): ActionItem {
  return {
    id: update.emailId,
    company: update.company,
    action: update.nextAction || 'Review status',
    status: `${update.oldStatus || 'NEW'} → ${update.newStatus}`,
    dueDate: update.dueDate,
    priority: update.priority || 'medium',
    source: 'email',
  };
}

/**
 * Format pipeline state as tracker items
 */
function formatTrackerItems(pipeline: PipelineState): CompanyTrackerItem[] {
  return Object.entries(pipeline)
    .map(([company, entry]) => {
      const latestUpdate = entry.history[entry.history.length - 1];

      return {
        company,
        role: entry.role,
        status: entry.status,
        lastUpdated: entry.lastUpdated.toISOString(),
        nextAction: latestUpdate?.nextAction,
        dueDate: latestUpdate?.dueDate,
        updateCount: entry.history.length,
      };
    })
    .sort((a, b) => {
      // Sort by status priority
      const statusPriority: Record<PipelineStatus, number> = {
        Interview: 1,
        OA: 2,
        Opportunity: 3,
        Applied: 4,
        Rejected: 5,
      };

      return statusPriority[a.status] - statusPriority[b.status];
    });
}

/**
 * Format calendar action for digest
 */
function formatCalendarAction(action: CalendarAction): CalendarActionDigest {
  return {
    id: action.id,
    type: action.type,
    title: action.title,
    company: action.company,
    description: action.description,
    dueDate: action.dueDate,
    priority: action.priority,
    status: action.status,
  };
}

/**
 * Generate summary text for frontend display
 */
export function generateSummaryText(digest: InboxDigest): string {
  const { summary, actionQueue, tracker, calendarSummary } = digest;

  const parts: string[] = [];

  if (summary.actionNeeded > 0) {
    parts.push(`${summary.actionNeeded} action${summary.actionNeeded === 1 ? '' : 's'} needed`);
  }

  if (calendarSummary.interviews > 0) {
    parts.push(`${calendarSummary.interviews} interview${calendarSummary.interviews === 1 ? '' : 's'} to schedule`);
  }

  if (calendarSummary.assessments > 0) {
    parts.push(`${calendarSummary.assessments} assessment${calendarSummary.assessments === 1 ? '' : 's'} due`);
  }

  if (tracker.stats.actionNeeded > 0) {
    parts.push(`${tracker.stats.actionNeeded} active opportunit${tracker.stats.actionNeeded === 1 ? 'y' : 'ies'}`);
  }

  if (parts.length === 0) {
    return 'All caught up! No urgent actions needed.';
  }

  return parts.join(' • ');
}

/**
 * Get quick stats for frontend dashboard
 */
export function getQuickStats(digest: InboxDigest): {
  followUpNeeded: number;
  oaDueSoon: number;
  interviewInvites: number;
  recruiterOutreach: number;
} {
  const { classifiedEmails } = digest;

  return {
    followUpNeeded: classifiedEmails.filter(e => e.subcategory === 'follow_up_needed').length,
    oaDueSoon: classifiedEmails.filter(e => e.subcategory === 'oa').length,
    interviewInvites: classifiedEmails.filter(e => e.subcategory === 'interview').length,
    recruiterOutreach: classifiedEmails.filter(e => e.category === 'recruiter_outreach').length,
  };
}
