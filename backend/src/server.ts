import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserProfile } from './types.js';
import { fetchMultiSourceJobs } from './jobFetcher.js';
import { callAraAgent, generateFallbackStrategy } from './araIntegration.js';
import { scoreAndRankJobs } from './matchingEngine.js';
import { fetchRecruiterEmails, generateFollowUpDraft, inferStatusFromEmails } from './outlookIntegration.js';
import { syncToNotion, getNotionApplications, getNotionStats, batchUpdateFromEmails } from './notionIntegration.js';
import { generateWithAnthropic } from './anthropicFallback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

    // Step 3: Generate strategy with three-tier fallback
    // Tier 1: Ara (primary - includes Claude access)
    // Tier 2: Anthropic API direct (middle fallback)
    // Tier 3: TypeScript generator (final fallback)
    let strategy;
    try {
      console.log('\n🤖 [Tier 1] Calling Ara automation (primary)...');
      strategy = await callAraAgent(profile, uniqueJobs);
      console.log('✅ Ara agent completed successfully');
    } catch (araError) {
      console.error('⚠️ Ara agent failed:', araError);

      // Try Anthropic API fallback
      try {
        console.log('📞 [Tier 2] Trying Anthropic API fallback...');
        strategy = await generateWithAnthropic(profile, uniqueJobs);
        console.log('✅ Anthropic API fallback succeeded');
      } catch (anthropicError) {
        console.error('⚠️ Anthropic API failed:', anthropicError);
        console.log('🔧 [Tier 3] Using TypeScript generator (final fallback)...');
        strategy = generateFallbackStrategy(profile, uniqueJobs);
        console.log('✅ TypeScript fallback strategy generated');
      }
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

    // Three-tier fallback
    let strategy;
    try {
      strategy = await callAraAgent(testProfile, uniqueJobs);
    } catch (araError) {
      try {
        strategy = await generateWithAnthropic(testProfile, uniqueJobs);
      } catch {
        strategy = generateFallbackStrategy(testProfile, uniqueJobs);
      }
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

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  Ara Autonomous Internship Agent - Backend API      ║
║                                                           ║
║   Status: ✅ Running                                      ║
║   Port: ${PORT}                                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /health              - Health check              ║
║   • POST /generate-strategy   - Generate strategy (MAIN)  ║
║   • GET  /test-strategy       - Test with sample data     ║
║   • GET  /debug/jobs          - View job data             ║
║                                                           ║
║   Integration:                                            ║
║   • Job Data: Greenhouse API (with fallback)              ║
║   • AI Agent: Ara Automation (../app.py)                  ║
║   • Fallback: Enabled for demo stability                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
