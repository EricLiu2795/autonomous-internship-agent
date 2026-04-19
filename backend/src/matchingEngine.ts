/**
 * Deterministic Matching Engine
 * Computes weighted scores for each job based on user profile
 */

export interface Job {
  company: string;
  title: string;
  location: string;
  url: string;
}

export interface UserProfile {
  name: string;
  major: string;
  graduationYear: string;
  targetRoles: string;
  locations: string;
  skills: string;
}

export interface MatchBreakdown {
  role: number;
  skills: number;
  location: number;
  seniority: number;
  preference: number;
}

export interface ScoredJob extends Job {
  score: number;
  breakdown: MatchBreakdown;
}

/**
 * Weighted scoring dimensions
 */
const WEIGHTS = {
  role: 0.30,
  skills: 0.30,
  location: 0.15,
  seniority: 0.15,
  preference: 0.10,
};

/**
 * Company preference categories
 */
const COMPANY_CATEGORIES = {
  bigTech: ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft', 'Netflix'],
  ai: ['OpenAI', 'Anthropic', 'Scale AI', 'Cohere', 'Hugging Face', 'DeepMind'],
  quant: ['Jane Street', 'Citadel', 'Two Sigma', 'Jump Trading', 'HRT'],
  startup: ['Scale', 'Ramp', 'Vercel', 'Linear', 'Stripe'],
  saas: ['Datadog', 'Snowflake', 'Databricks', 'Dropbox', 'Gitlab', 'Airbnb'],
};

/**
 * Common SWE/intern keywords
 */
const ROLE_KEYWORDS = {
  swe: ['software', 'engineer', 'developer', 'backend', 'frontend', 'full stack', 'fullstack'],
  ai: ['ai', 'machine learning', 'ml', 'deep learning', 'nlp', 'computer vision'],
  data: ['data', 'analytics', 'scientist', 'engineer'],
  pm: ['product', 'manager', 'management'],
  quant: ['quant', 'trading', 'algorithmic', 'quantitative'],
};

/**
 * Seniority keywords (favor intern/entry-level for students)
 */
const SENIORITY_KEYWORDS = {
  intern: ['intern', 'internship', 'co-op', 'coop', 'student'],
  entry: ['entry', 'junior', 'new grad', 'associate'],
  senior: ['senior', 'staff', 'principal', 'lead', 'manager'],
};

/**
 * Compute role match score (0-100)
 */
function computeRoleMatch(job: Job, profile: UserProfile): number {
  const jobTitle = job.title.toLowerCase();
  const targetRoles = profile.targetRoles.toLowerCase();

  let score = 50; // Base score

  // Check if job title matches any target role keywords
  for (const [category, keywords] of Object.entries(ROLE_KEYWORDS)) {
    if (targetRoles.includes(category) || keywords.some(k => targetRoles.includes(k))) {
      // User wants this category
      if (keywords.some(k => jobTitle.includes(k))) {
        score += 30;
        break;
      }
    }
  }

  // Boost for exact keyword matches
  const userKeywords = targetRoles.split(/[,\s]+/).filter(k => k.length > 2);
  for (const keyword of userKeywords) {
    if (jobTitle.includes(keyword)) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * Compute skill match score (0-100)
 */
function computeSkillMatch(job: Job, profile: UserProfile): number {
  const jobText = `${job.title} ${job.company}`.toLowerCase();
  const skills = profile.skills.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);

  if (skills.length === 0) return 70; // Default if no skills provided

  let matches = 0;
  for (const skill of skills) {
    if (jobText.includes(skill)) {
      matches++;
    }
  }

  // Score based on percentage of skills matched
  const matchRate = matches / skills.length;
  return Math.round(50 + matchRate * 50); // 50-100 range
}

/**
 * Compute location match score (0-100)
 */
function computeLocationMatch(job: Job, profile: UserProfile): number {
  const jobLocation = job.location.toLowerCase();
  const preferredLocations = profile.locations.toLowerCase();

  // Remote is always a match
  if (jobLocation.includes('remote') || preferredLocations.includes('remote')) {
    return 100;
  }

  // Check for city/state matches
  const locationKeywords = preferredLocations.split(/[,\s]+/).filter(l => l.length > 2);
  for (const keyword of locationKeywords) {
    if (jobLocation.includes(keyword)) {
      return 100;
    }
  }

  // Partial match for same state or region
  const regions = {
    'bay area': ['san francisco', 'palo alto', 'mountain view', 'menlo park', 'sunnyvale'],
    'nyc': ['new york', 'manhattan', 'brooklyn'],
    'seattle': ['seattle', 'redmond', 'bellevue'],
  };

  for (const [region, cities] of Object.entries(regions)) {
    if (preferredLocations.includes(region) && cities.some(c => jobLocation.includes(c))) {
      return 90;
    }
  }

  return 60; // Default score for no match
}

/**
 * Compute seniority match score (0-100)
 */
function computeSeniorityMatch(job: Job): number {
  const jobTitle = job.title.toLowerCase();

  // Strongly favor internships for students
  if (SENIORITY_KEYWORDS.intern.some(k => jobTitle.includes(k))) {
    return 100;
  }

  // Entry-level is good
  if (SENIORITY_KEYWORDS.entry.some(k => jobTitle.includes(k))) {
    return 85;
  }

  // Penalize senior roles
  if (SENIORITY_KEYWORDS.senior.some(k => jobTitle.includes(k))) {
    return 40;
  }

  return 70; // Default
}

/**
 * Compute preference/industry match score (0-100)
 */
function computePreferenceMatch(job: Job, profile: UserProfile): number {
  const company = job.company;
  const targetRoles = profile.targetRoles.toLowerCase();

  let score = 70; // Base score

  // Check if company matches any preferred categories
  for (const [category, companies] of Object.entries(COMPANY_CATEGORIES)) {
    if (companies.some(c => company.includes(c))) {
      // Boost if user's target roles align with this category
      if (
        (category === 'ai' && (targetRoles.includes('ai') || targetRoles.includes('ml'))) ||
        (category === 'quant' && targetRoles.includes('quant')) ||
        (category === 'bigTech' && targetRoles.includes('faang'))
      ) {
        score += 30;
      } else {
        score += 10;
      }
      break;
    }
  }

  return Math.min(100, score);
}

/**
 * Compute overall match score for a job
 */
export function computeMatchScore(job: Job, profile: UserProfile): ScoredJob {
  const breakdown: MatchBreakdown = {
    role: computeRoleMatch(job, profile),
    skills: computeSkillMatch(job, profile),
    location: computeLocationMatch(job, profile),
    seniority: computeSeniorityMatch(job),
    preference: computePreferenceMatch(job, profile),
  };

  // Weighted total
  const score = Math.round(
    breakdown.role * WEIGHTS.role +
    breakdown.skills * WEIGHTS.skills +
    breakdown.location * WEIGHTS.location +
    breakdown.seniority * WEIGHTS.seniority +
    breakdown.preference * WEIGHTS.preference
  );

  return {
    ...job,
    score,
    breakdown,
  };
}

/**
 * Score and rank all jobs
 */
export function scoreAndRankJobs(jobs: Job[], profile: UserProfile): ScoredJob[] {
  const scoredJobs = jobs.map(job => computeMatchScore(job, profile));

  // Sort by score descending
  scoredJobs.sort((a, b) => b.score - a.score);

  return scoredJobs;
}
