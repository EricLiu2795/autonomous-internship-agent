import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserProfile } from './types.js';
import { fetchMultiSourceJobs } from './jobFetcher.js';
import { callAraAgent, generateFallbackStrategy } from './araIntegration.js';
import { scoreAndRankJobs } from './matchingEngine.js';
import { fetchRecruiterEmails, generateFollowUpDraft, inferStatusFromEmails } from './outlookIntegration.js';
import { syncToNotion, getNotionApplications, getNotionStats, batchUpdateFromEmails } from './notionIntegration.js';
import { classifyEmailsWithAra } from './emailClassifier.js';
import { generateTrackerUpdates, applyTrackerUpdates, PipelineState } from './pipelineUpdater.js';
import { generateCalendarActions } from './calendarPlanner.js';
import { buildInboxDigest, generateSummaryText, getQuickStats } from './digestBuilder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory pipeline state (for demo)
let pipelineState: PipelineState = {};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Ara backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Main endpoint: Generate internship strategy
app.post('/generate-strategy', async (req, res) => {
  const startTime = Date.now();

  try {
    const profile: UserProfile = req.body;

    // Validate required fields
    if (!profile.name || !profile.major || !profile.graduationYear) {
      return res.status(400).json({
        error: 'Missing required fields: name, major, graduationYear',
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🚀 NEW REQUEST - Generating strategy');
    console.log('='.repeat(60));
    console.log('👤 Student:', profile.name);
    console.log('🎓 Major:', profile.major);
    console.log('📅 Graduating:', profile.graduationYear);
    console.log('🎯 Target Roles:', profile.targetRoles);
    console.log('📍 Locations:', profile.locations);
    console.log('💼 Skills:', profile.skills);

    // Step 1: Fetch real job data
    console.log('\n📊 Fetching job opportunities...');
    const jobs = await fetchMultiSourceJobs(
      profile.targetRoles,
      profile.locations
    );
    console.log(`✅ Got ${jobs.length} jobs`);

    // Step 2: Score and rank jobs using matching engine
    console.log('\n🎯 Computing match scores...');
    const scoredJobs = scoreAndRankJobs(jobs, profile);
    console.log(`✅ Scored and ranked ${scoredJobs.length} jobs`);

    // Step 2.5: Deduplicate by company (keep highest scored)
    const seenCompanies = new Set<string>();
    const uniqueJobs = scoredJobs.filter(job => {
      const companyKey = job.company.toLowerCase().trim();
      if (seenCompanies.has(companyKey)) {
        return false;
      }
      seenCompanies.add(companyKey);
      return true;
    });
    console.log(`✅ Deduplicated to ${uniqueJobs.length} unique companies`);

    uniqueJobs.slice(0, 5).forEach((job, idx) => {
      console.log(`  ${idx + 1}. ${job.company} - ${job.title} (${job.score}%)`);
    });

    // Step 3: Generate strategy with two-tier fallback
    // Tier 1: Ara automation (primary - includes Claude access)
    // Tier 2: TypeScript generator (fallback for demo reliability)
    let strategy;
    try {
      console.log('\n🤖 [Tier 1] Calling Ara automation (primary)...');
      strategy = await callAraAgent(profile, uniqueJobs);
      console.log('✅ Ara agent completed successfully');
    } catch (araError) {
      console.error('⚠️ Ara agent failed:', araError);
      console.log('🔧 [Tier 2] Using TypeScript fallback...');
      strategy = generateFallbackStrategy(profile, uniqueJobs);
      console.log('✅ TypeScript fallback strategy generated');
    }

    // Step 4: Sync top unique jobs to Notion
    console.log('\n📝 Syncing to Notion...');
    const topJobs = uniqueJobs.slice(0, 5).map(job => ({
      company: job.company,
      title: job.title,
      score: job.score,
      url: job.url,
    }));
    const notionResult = await syncToNotion(topJobs);
    console.log(`✅ Synced ${notionResult.synced} jobs to Notion`);

    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Total time: ${duration}ms`);
    console.log('='.repeat(60) + '\n');

    res.json({
      ...strategy,
      notionSynced: notionResult.success,
      notionDemoMode: notionResult.demoMode,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Error after ${duration}ms:`, error);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({
      error: 'Failed to generate strategy',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Test endpoint with mock data
app.get('/test-strategy', async (req, res) => {
  try {
    const testProfile: UserProfile = {
      name: 'Alex Chen',
      major: 'Computer Science',
      graduationYear: '2025',
      targetRoles: 'SWE, AI/ML',
      locations: 'San Francisco, Remote',
      skills: 'React, Python, TensorFlow',
    };

    console.log('🧪 Testing with sample profile...');

    // Fetch jobs
    const jobs = await fetchMultiSourceJobs(
      testProfile.targetRoles,
      testProfile.locations
    );

    // Score and deduplicate
    const scoredJobs = scoreAndRankJobs(jobs, testProfile);
    const seenCompanies = new Set<string>();
    const uniqueJobs = scoredJobs.filter(job => {
      const companyKey = job.company.toLowerCase().trim();
      if (seenCompanies.has(companyKey)) {
        return false;
      }
      seenCompanies.add(companyKey);
      return true;
    });

    // Two-tier fallback
    let strategy;
    try {
      strategy = await callAraAgent(testProfile, uniqueJobs);
    } catch (araError) {
      strategy = generateFallbackStrategy(testProfile, uniqueJobs);
    }

    console.log('✅ Test successful');
    res.json(strategy);
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Debug endpoint: View available jobs
app.get('/debug/jobs', async (req, res) => {
  try {
    const jobs = await fetchMultiSourceJobs();
    res.json({
      count: jobs.length,
      jobs: jobs,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Outlook endpoints
app.get('/outlook/emails', async (req, res) => {
  try {
    const summary = await fetchRecruiterEmails();
    res.json(summary);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/outlook/generate-followup', async (req, res) => {
  try {
    const { recipientName, companyName, roleName, studentName } = req.body;
    const draft = generateFollowUpDraft(recipientName, companyName, roleName, studentName);
    res.json({ draft });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate follow-up',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/outlook/sync-status', async (req, res) => {
  try {
    const emails = await fetchRecruiterEmails();
    const statusMap = inferStatusFromEmails(emails.recent);
    const result = await batchUpdateFromEmails(statusMap);
    res.json({ success: true, updated: result.updated, statusMap });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to sync status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Notion endpoints
app.get('/notion/status', async (req, res) => {
  try {
    const { isNotionConnected } = await import('./notionIntegration.js');
    const connected = isNotionConnected();
    res.json({
      connected,
      demoMode: !connected,
      message: connected
        ? 'Notion API connected'
        : 'Demo mode - using simulated Notion sync',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check Notion status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/notion/applications', async (req, res) => {
  try {
    const applications = await getNotionApplications();
    res.json({ applications });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Notion applications',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/notion/stats', async (req, res) => {
  try {
    const stats = getNotionStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch Notion stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================
// NEW: Inbox Analysis Endpoints
// ============================================================

/**
 * POST /analyze-inbox - Main inbox analysis workflow
 *
 * Orchestrates the full recruiting inbox workflow:
 * 1. Fetch emails (mock data for demo)
 * 2. Classify emails (Ara primary, TypeScript fallback)
 * 3. Update pipeline tracker
 * 4. Generate calendar actions
 * 5. Build combined digest
 */
app.post('/analyze-inbox', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('\n' + '='.repeat(60));
    console.log('📧 NEW REQUEST - Analyzing Inbox with Ara Gmail Connector');
    console.log('='.repeat(60));

    // Step 1: Classify emails using Ara Gmail connector
    // Ara will read Gmail directly and classify recruiting emails
    console.log('\n🔍 Fetching and classifying emails with Ara...');
    const classifiedEmails = await classifyEmailsWithAra();
    console.log(`[OK] Classified ${classifiedEmails.length} recruiting emails`);

    // Step 3: Generate tracker updates
    console.log('\n📊 Updating pipeline tracker...');
    const trackerUpdates = generateTrackerUpdates(classifiedEmails, pipelineState);
    pipelineState = applyTrackerUpdates(trackerUpdates, pipelineState);
    console.log(`[OK] Applied ${trackerUpdates.length} tracker updates`);

    // Step 4: Generate calendar actions
    console.log('\n📅 Generating calendar actions...');
    const calendarActions = generateCalendarActions(classifiedEmails, trackerUpdates);
    console.log(`[OK] Generated ${calendarActions.length} calendar actions`);

    // Step 5: Build digest
    console.log('\n📦 Building digest...');
    const emailsForDigest = classifiedEmails.map(ce => ce.email);
    const digest = buildInboxDigest(
      emailsForDigest,
      classifiedEmails,
      trackerUpdates,
      pipelineState,
      calendarActions
    );
    const summaryText = generateSummaryText(digest);
    const quickStats = getQuickStats(digest);

    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Total time: ${duration}ms`);
    console.log('='.repeat(60) + '\n');

    res.json({
      success: true,
      digest,
      summary: summaryText,
      quickStats,
      metadata: {
        processedAt: new Date().toISOString(),
        duration: `${duration}ms`,
        demoMode: true,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Error after ${duration}ms:`, error);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({
      error: 'Failed to analyze inbox',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /demo-emails - View classified emails from Ara
 */
app.get('/demo-emails', async (req, res) => {
  try {
    const classifiedEmails = await classifyEmailsWithAra();

    res.json({
      emails: classifiedEmails.map(ce => ({
        id: ce.email.id,
        from: ce.email.from,
        subject: ce.email.subject,
        receivedAt: ce.email.receivedAt,
        category: ce.category,
        subcategory: ce.subcategory,
        company: ce.company,
        role: ce.role,
      })),
      count: classifiedEmails.length,
      demoMode: true,
      source: 'Ara Gmail Connector',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /tracker - View current pipeline tracker state
 */
app.get('/tracker', (req, res) => {
  try {
    const companies = Object.entries(pipelineState).map(([company, entry]) => ({
      company,
      role: entry.role,
      status: entry.status,
      lastUpdated: entry.lastUpdated.toISOString(),
      updateCount: entry.history.length,
    }));

    const stats = {
      total: companies.length,
      byStatus: companies.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({
      companies,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch tracker',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /tracker/reset - Reset pipeline tracker (demo utility)
 */
app.delete('/tracker/reset', (req, res) => {
  try {
    pipelineState = {};
    console.log('[INFO] Pipeline tracker reset');

    res.json({
      success: true,
      message: 'Pipeline tracker reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reset tracker',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  Ara Autonomous Recruiting Inbox Agent              ║
║                                                           ║
║   Status: ✅ Running                                      ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   Primary Endpoints:                                      ║
║   • POST /analyze-inbox       - Analyze recruiting emails ║
║   • GET  /demo-emails         - View classified emails    ║
║   • GET  /tracker             - View pipeline tracker     ║
║   • DELETE /tracker/reset     - Reset tracker (demo)      ║
║                                                           ║
║   Legacy Endpoints:                                       ║
║   • POST /generate-strategy   - Job matching (secondary)  ║
║   • GET  /health              - Health check              ║
║                                                           ║
║   Architecture:                                           ║
║   • Email Source: Ara Gmail Connector (reads Gmail)       ║
║   • Classifier: Ara automation (email_classifier.py)      ║
║   • Fallback: Mock data for demo stability               ║
║   • Actions: Pipeline tracking + calendar planning        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
