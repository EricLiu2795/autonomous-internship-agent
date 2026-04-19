import { useState } from 'react';
import {
  Sparkles,
  Rocket,
  Target,
  Calendar,
  TrendingUp,
  Briefcase,
  Mail,
  Clock,
  CheckCircle2,
  FileText,
  Bot,
  Zap,
  AlertCircle
} from 'lucide-react';

// Backend API types
interface ClassifiedEmail {
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
  status: 'Applied' | 'OA' | 'Interview' | 'Rejected' | 'Opportunity';
  lastUpdated: string;
  nextAction?: string;
  dueDate?: string;
  updateCount: number;
}

interface CalendarAction {
  id: string;
  type: string;
  title: string;
  company: string;
  description: string;
  dueDate?: string;
  priority: string;
  status: string;
}

interface InboxDigest {
  summary: {
    totalEmails: number;
    recruitingEmails: number;
    actionNeeded: number;
    processedAt: string;
  };
  classifiedEmails: ClassifiedEmail[];
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
      byStatus: Record<string, number>;
      actionNeeded: number;
    };
  };
  calendarActions: CalendarAction[];
  calendarSummary: {
    total: number;
    interviews: number;
    assessments: number;
    followUps: number;
    responses: number;
    dueSoon: CalendarAction[];
  };
}

interface InboxResponse {
  success: boolean;
  digest: InboxDigest;
  summary: string;
  quickStats: {
    followUpNeeded: number;
    oaDueSoon: number;
    interviewInvites: number;
    recruiterOutreach: number;
  };
  metadata: {
    processedAt: string;
    duration: string;
    demoMode: boolean;
  };
}

const API_URL = 'http://localhost:3001';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [digestData, setDigestData] = useState<InboxResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeInbox = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/analyze-inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to analyze inbox');
      }

      const data: InboxResponse = await response.json();
      setDigestData(data);
      setShowResults(true);
    } catch (err) {
      console.error('Error analyzing inbox:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze inbox');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      interview_request: { label: 'Interview', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      oa_assigned: { label: 'OA', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      application_confirmed: { label: 'Applied', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      recruiter_outreach: { label: 'Outreach', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
      rejection: { label: 'Rejected', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
      interview: { label: 'Interview', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      oa: { label: 'OA', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      application_received: { label: 'Applied', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    };
    return badges[category as keyof typeof badges] || { label: category, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Interview: 'text-purple-400',
      OA: 'text-yellow-400',
      Applied: 'text-blue-400',
      Opportunity: 'text-green-400',
      Rejected: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getActionIcon = (type: string) => {
    const icons = {
      interview_event: <Calendar className="w-4 h-4" />,
      oa_deadline: <Clock className="w-4 h-4" />,
      follow_up_reminder: <Mail className="w-4 h-4" />,
      recruiter_response_deadline: <Zap className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Mail className="w-8 h-8" />
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Bot className="w-8 h-8" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-center mb-6 leading-tight">
            <span className="gradient-text">Autonomous</span>
            <br />
            Recruiting Inbox Agent
          </h1>

          <p className="text-xl text-gray-300 text-center mb-4 max-w-2xl mx-auto">
            Automatically classify recruiting emails, track status changes, and turn opportunities into action—so you never miss a deadline.
          </p>

          <p className="text-sm text-gray-500 text-center mb-10">
            Not a job board. A recruiting workflow agent.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAnalyzeInbox}
              disabled={isAnalyzing}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold
                       hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Inbox...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Analyze Inbox
                </>
              )}
            </button>

            <button className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              View Demo
            </button>
          </div>

          {error && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {showResults && digestData && (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Summary Banner */}
          <div className="gradient-border rounded-2xl p-6 backdrop-blur-sm text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Analysis Complete</h2>
            </div>
            <p className="text-lg text-gray-300 mb-2">{digestData.summary}</p>
            <p className="text-sm text-gray-500">
              Processed {digestData.digest.summary.recruitingEmails} recruiting emails in {digestData.metadata.duration}
            </p>
            <span className="inline-block mt-3 px-3 py-1 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400">
              DEMO MODE
            </span>
          </div>

          {/* Section 1: Inbox Digest */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold">Inbox Digest</h2>
              </div>
              <span className="text-xs bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-400">
                {digestData.digest.summary.recruitingEmails} RECRUITING EMAILS
              </span>
            </div>

            <div className="space-y-4">
              {digestData.digest.classifiedEmails
                .filter(e => e.category !== 'irrelevant')
                .slice(0, 5)
                .map((email) => {
                  const badge = getCategoryBadge(email.subcategory);
                  return (
                    <div
                      key={email.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-lg">{email.company || 'Unknown'}</span>
                            <span className={`px-2 py-1 text-xs border rounded-full ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-1">{email.subject}</p>
                          <p className="text-gray-500 text-xs">{email.from}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(email.receivedAt).toLocaleString()}
                        </span>
                      </div>

                      {email.actionRequired && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">Action Required:</span>
                            <span className="text-gray-300">{email.actionRequired}</span>
                          </div>
                          {email.deadline && (
                            <div className="flex items-center gap-2 text-sm mt-2">
                              <Clock className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 font-medium">Deadline:</span>
                              <span className="text-gray-300">{email.deadline}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Section 2: Action Queue */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Action Queue</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {digestData.digest.actionQueue.counts.urgent}
                </div>
                <div className="text-sm text-gray-300">Urgent</div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {digestData.digest.actionQueue.counts.high}
                </div>
                <div className="text-sm text-gray-300">High Priority</div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {digestData.digest.actionQueue.counts.medium}
                </div>
                <div className="text-sm text-gray-300">Medium Priority</div>
              </div>

              <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-400 mb-1">
                  {digestData.digest.actionQueue.counts.low}
                </div>
                <div className="text-sm text-gray-300">Low Priority</div>
              </div>
            </div>

            <div className="space-y-3">
              {[...digestData.digest.actionQueue.urgent, ...digestData.digest.actionQueue.high].slice(0, 5).map((action) => (
                <div key={action.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{action.company}</div>
                        <div className="text-sm text-gray-400">{action.action}</div>
                      </div>
                    </div>
                    {action.dueDate && (
                      <div className="text-sm text-red-400 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {action.dueDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Pipeline Tracker */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Pipeline Tracker</h2>
              </div>
              <div className="text-sm text-gray-400">
                {digestData.digest.tracker.stats.total} companies tracked
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(digestData.digest.tracker.stats.byStatus).map(([status, count]) => (
                <div key={status} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-bold mb-1 ${getStatusColor(status)}`}>{count}</div>
                  <div className="text-sm text-gray-400">{status}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {digestData.digest.tracker.companies.slice(0, 8).map((company) => (
                <div key={company.company} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold">{company.company}</span>
                        <span className={`text-sm ${getStatusColor(company.status)}`}>
                          {company.status}
                        </span>
                      </div>
                      {company.role && <div className="text-sm text-gray-400">{company.role}</div>}
                      {company.nextAction && (
                        <div className="text-xs text-gray-500 mt-1">→ {company.nextAction}</div>
                      )}
                    </div>
                    {company.dueDate && (
                      <div className="text-xs text-yellow-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {company.dueDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Calendar Actions */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Automated Actions</h2>
              </div>
              <span className="text-xs bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full text-purple-400">
                SIMULATED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {digestData.digest.calendarSummary.interviews}
                </div>
                <div className="text-sm text-gray-300">Interviews to Schedule</div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {digestData.digest.calendarSummary.assessments}
                </div>
                <div className="text-sm text-gray-300">OA Deadlines</div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {digestData.digest.calendarSummary.responses}
                </div>
                <div className="text-sm text-gray-300">Recruiter Responses</div>
              </div>
            </div>

            <div className="space-y-3">
              {digestData.digest.calendarSummary.dueSoon.slice(0, 5).map((action) => (
                <div key={action.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-sm text-gray-400">{action.description}</div>
                    </div>
                    {action.dueDate && (
                      <div className="text-sm text-purple-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {action.dueDate}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center">1. Classify Emails</h3>
            <p className="text-gray-400 text-sm text-center">
              AI analyzes your inbox and categorizes recruiting emails: interviews, OAs, outreach, rejections.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center">2. Update Pipeline</h3>
            <p className="text-gray-400 text-sm text-center">
              Automatically tracks status changes and updates your recruiting pipeline across all companies.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center">3. Take Action</h3>
            <p className="text-gray-400 text-sm text-center">
              Creates calendar events, sets reminders, and prioritizes follow-ups so you never miss a deadline.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold">Autonomous Recruiting Inbox Agent</span>
            </div>
            <div className="text-gray-400 text-sm">
              Built at JHU Hackathon 2026
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
