export interface UserProfile {
  name: string;
  major: string;
  graduationYear: string;
  targetRoles: string;
  locations: string;
  skills: string;
}

export interface Strategy {
  industries: string[];
  weeklyPlan: string[];
  priority: string;
}

export interface MatchBreakdown {
  role: number;
  skills: number;
  location: number;
  seniority: number;
  preference: number;
}

export interface Company {
  name: string;
  logo: string;
  color: string;
  matchPercentage: number;
  reason: string;
  breakdown?: MatchBreakdown;
}

export interface FollowUpStep {
  time: string;
  action: string;
}

export interface InternshipStrategy {
  strategy: Strategy;
  companies: Company[];
  resumeBullets: string[];
  outreachMessage: string;
  followupTimeline: FollowUpStep[];
}
