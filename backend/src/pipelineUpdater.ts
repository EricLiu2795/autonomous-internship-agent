/**
 * Pipeline Updater - Converts email classifications into tracker updates
 *
 * Takes classified emails and updates recruiting pipeline status
 * Infers next actions and due dates where possible
 */

import { ClassifiedEmail, EmailSubcategory } from './emailClassifier.js';

export type PipelineStatus = 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Opportunity';

export interface TrackerUpdate {
  company: string;
  role: string | null;
  oldStatus: PipelineStatus | null;
  newStatus: PipelineStatus;
  emailId: string;
  confidence: number;
  reasoning: string;
  nextAction?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface PipelineState {
  [company: string]: {
    status: PipelineStatus;
    role: string | null;
    lastUpdated: Date;
    history: TrackerUpdate[];
  };
}

/**
 * Convert classified emails into pipeline tracker updates
 */
export function generateTrackerUpdates(
  classifiedEmails: ClassifiedEmail[],
  currentPipeline: PipelineState = {}
): TrackerUpdate[] {
  console.log('\n📊 Generating tracker updates...');

  const updates: TrackerUpdate[] = [];

  for (const classified of classifiedEmails) {
    // Skip irrelevant emails
    if (classified.category === 'irrelevant') {
      continue;
    }

    // Skip if no company identified
    if (!classified.company) {
      console.log(`[SKIP] No company identified for email ${classified.email.id}`);
      continue;
    }

    const company = classified.company;
    const currentEntry = currentPipeline[company];
    const oldStatus = currentEntry?.status || null;

    // Determine new status and actions based on email type
    const update = buildUpdate(classified, oldStatus);

    if (update) {
      updates.push(update);
      console.log(`  • ${company}: ${oldStatus || 'NEW'} → ${update.newStatus}`);
    }
  }

  console.log(`[OK] Generated ${updates.length} tracker updates`);
  return updates;
}

/**
 * Build tracker update from classified email
 */
function buildUpdate(
  classified: ClassifiedEmail,
  oldStatus: PipelineStatus | null
): TrackerUpdate | null {
  const { email, category, subcategory, company, role, confidence, reasoning, extractedData } = classified;

  if (!company) return null;

  const baseUpdate = {
    company,
    role,
    oldStatus,
    emailId: email.id,
    confidence,
    reasoning,
  };

  // Handle recruiter outreach
  if (category === 'recruiter_outreach') {
    return {
      ...baseUpdate,
      newStatus: 'Opportunity',
      nextAction: 'Respond to recruiter outreach',
      priority: 'high',
      dueDate: calculateDueDate(2), // 2 days
    };
  }

  // Handle application responses
  if (category === 'application_response') {
    switch (subcategory) {
      case 'oa':
        return {
          ...baseUpdate,
          newStatus: 'OA',
          nextAction: 'Complete online assessment',
          priority: 'high',
          dueDate: extractedData?.deadline || calculateDueDate(5),
        };

      case 'interview':
        return {
          ...baseUpdate,
          newStatus: 'Interview',
          nextAction: extractedData?.actionRequired || 'Schedule interview',
          priority: 'high',
          dueDate: calculateDueDate(2),
        };

      case 'rejection':
        return {
          ...baseUpdate,
          newStatus: 'Rejected',
          nextAction: 'Archive and move on',
          priority: 'low',
        };

      case 'application_received':
        // Only update if new application or provide timeline update
        if (!oldStatus || oldStatus === 'Applied') {
          return {
            ...baseUpdate,
            newStatus: 'Applied',
            nextAction: 'Wait for response (typically 2-3 weeks)',
            priority: 'medium',
            dueDate: calculateDueDate(21),
          };
        }
        break;

      case 'follow_up_needed':
        return {
          ...baseUpdate,
          newStatus: oldStatus || 'Applied',
          nextAction: 'Send follow-up email',
          priority: 'medium',
          dueDate: calculateDueDate(3),
        };
    }
  }

  return null;
}

/**
 * Apply tracker updates to current pipeline state
 */
export function applyTrackerUpdates(
  updates: TrackerUpdate[],
  currentPipeline: PipelineState = {}
): PipelineState {
  const newPipeline = { ...currentPipeline };

  for (const update of updates) {
    const existing = newPipeline[update.company];

    newPipeline[update.company] = {
      status: update.newStatus,
      role: update.role || existing?.role || null,
      lastUpdated: new Date(),
      history: [
        ...(existing?.history || []),
        update,
      ],
    };
  }

  return newPipeline;
}

/**
 * Get action queue from tracker updates
 */
export function getActionQueue(updates: TrackerUpdate[]): {
  urgent: TrackerUpdate[];
  high: TrackerUpdate[];
  medium: TrackerUpdate[];
  low: TrackerUpdate[];
} {
  const queue = {
    urgent: [] as TrackerUpdate[],
    high: [] as TrackerUpdate[],
    medium: [] as TrackerUpdate[],
    low: [] as TrackerUpdate[],
  };

  for (const update of updates) {
    // Urgent: OA or interview with due date within 3 days
    if (update.dueDate && isDueSoon(update.dueDate, 3)) {
      queue.urgent.push(update);
    } else if (update.priority === 'high') {
      queue.high.push(update);
    } else if (update.priority === 'medium') {
      queue.medium.push(update);
    } else {
      queue.low.push(update);
    }
  }

  return queue;
}

/**
 * Get summary statistics from pipeline
 */
export function getPipelineStats(pipeline: PipelineState): {
  total: number;
  byStatus: Record<PipelineStatus, number>;
  actionNeeded: number;
} {
  const stats = {
    total: 0,
    byStatus: {
      Applied: 0,
      OA: 0,
      Interview: 0,
      Rejected: 0,
      Opportunity: 0,
    },
    actionNeeded: 0,
  };

  for (const entry of Object.values(pipeline)) {
    stats.total++;
    stats.byStatus[entry.status]++;

    // Count action-needed statuses
    if (['OA', 'Interview', 'Opportunity'].includes(entry.status)) {
      stats.actionNeeded++;
    }
  }

  return stats;
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
 * Check if date is due soon
 */
function isDueSoon(dueDate: string, daysThreshold: number): boolean {
  try {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays <= daysThreshold && diffDays >= 0;
  } catch {
    return false;
  }
}
