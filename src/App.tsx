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
  Zap
} from 'lucide-react';

interface UserData {
  name: string;
  major: string;
  graduationYear: string;
  targetRoles: string;
  locations: string;
  skills: string;
}

const COMPANIES = [
  { name: 'Google', logo: '🔍', color: 'from-blue-500 to-blue-600' },
  { name: 'Meta', logo: '👥', color: 'from-blue-600 to-purple-600' },
  { name: 'OpenAI', logo: '🤖', color: 'from-green-500 to-teal-600' },
  { name: 'Jane Street', logo: '📈', color: 'from-purple-500 to-pink-600' },
  { name: 'Datadog', logo: '🐕', color: 'from-purple-600 to-indigo-600' },
];

const PIPELINE_STAGES = [
  { name: 'Applied', count: 12, color: 'bg-blue-500/20 border-blue-500/50' },
  { name: 'OA', count: 5, color: 'bg-yellow-500/20 border-yellow-500/50' },
  { name: 'Interview', count: 3, color: 'bg-purple-500/20 border-purple-500/50' },
  { name: 'Offer', count: 1, color: 'bg-green-500/20 border-green-500/50' },
];

function App() {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    major: '',
    graduationYear: '',
    targetRoles: '',
    locations: '',
    skills: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setShowResults(true);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }, 2500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-glow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Powered by Autonomous AI Agents</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Autonomous</span>
              <br />
              Internship Agent
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your AI copilot for landing internships. Automate applications, tailor resumes, and track your pipeline—all in one place.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => document.getElementById('input-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-105 flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Launch Agent
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-semibold transition-all duration-200">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Input Panel */}
      <div id="input-form" className="max-w-4xl mx-auto px-6 py-20">
        <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold">Tell Us About Yourself</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Major
                </label>
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Graduation Year
                </label>
                <input
                  type="text"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  placeholder="2025"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Target Roles
                </label>
                <input
                  type="text"
                  name="targetRoles"
                  value={formData.targetRoles}
                  onChange={handleInputChange}
                  placeholder="SWE, AI/ML, PM"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Preferred Locations
                </label>
                <input
                  type="text"
                  name="locations"
                  value={formData.locations}
                  onChange={handleInputChange}
                  placeholder="San Francisco, New York, Remote"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, Python, Machine Learning"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Strategy
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* AI Output Dashboard */}
      {showResults && (
        <div id="results" className="max-w-7xl mx-auto px-6 py-20 space-y-12 animate-fade-in">
          {/* Application Strategy */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Application Strategy</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-indigo-400">Recommended Industries</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Tech (FAANG, Unicorns)</li>
                  <li>• AI/ML Startups</li>
                  <li>• Fintech Companies</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">Weekly Action Plan</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Apply to 15-20 companies</li>
                  <li>• Send 10 cold outreach emails</li>
                  <li>• Attend 2 networking events</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2 text-pink-400">Priority Level</h3>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  </div>
                  <span className="text-sm font-semibold">85%</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">High urgency - graduation in {formData.graduationYear}</p>
              </div>
            </div>
          </div>

          {/* Top Companies */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">Top Target Companies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {COMPANIES.map((company, idx) => (
                <div
                  key={company.name}
                  className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group hover:scale-105"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`text-4xl mb-3 bg-gradient-to-br ${company.color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                    {company.logo}
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Match: {90 - idx * 5}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tailored Resume Bullets & Outreach */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Resume Bullets */}
            <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold">Tailored Resume Bullets</h2>
              </div>

              <div className="space-y-4">
                {[
                  `Developed full-stack applications using ${formData.skills.split(',')[0] || 'React'}, improving user engagement by 40%`,
                  `Led team of 4 in building AI-powered features, processing 1M+ requests daily`,
                  `Optimized algorithms reducing query time by 60% and increasing system efficiency`
                ].map((bullet, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Outreach Message */}
            <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold">Outreach Template</h2>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Hi [Recruiter Name],
                  <br /><br />
                  I'm {formData.name || '[Your Name]'}, a {formData.major || '[Major]'} student graduating in {formData.graduationYear || '[Year]'}. I'm really excited about [Company]'s work in [specific area].
                  <br /><br />
                  I've built projects in {formData.skills.split(',')[0] || '[Skill]'} that align with your team's mission. Would love to chat about {formData.targetRoles.split(',')[0] || 'SWE'} opportunities!
                  <br /><br />
                  Best,<br />
                  {formData.name || '[Your Name]'}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-up Timeline */}
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Follow-up Timeline</h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

              <div className="space-y-6 ml-12">
                {[
                  { time: 'Today', action: 'Send initial application + outreach email', icon: Mail },
                  { time: '3 Days Later', action: 'Follow up if no response', icon: Clock },
                  { time: '1 Week Later', action: 'Connect on LinkedIn, send reminder', icon: TrendingUp },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-14 w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center border-4 border-[#0a0a0a]">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="font-semibold text-indigo-400">{item.time}</div>
                      <div className="text-gray-300 mt-1">{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Tracker */}
      {showResults && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="gradient-border rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Application Pipeline</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PIPELINE_STAGES.map((stage, idx) => (
                <div
                  key={stage.name}
                  className={`${stage.color} rounded-lg p-6 border transition-all duration-200 hover:scale-105 cursor-pointer`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="text-3xl font-bold">{stage.count}</div>
                  <div className="text-sm text-gray-300 mt-1">{stage.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Why ARA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Powered by Cloud Agents</span>
          </div>

          <h2 className="text-4xl font-bold">Why Autonomous Internship Agent?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fully Autonomous</h3>
              <p className="text-gray-400 text-sm">
                AI agents work 24/7 to find opportunities, tailor applications, and track your progress without manual effort.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Personalized Strategy</h3>
              <p className="text-gray-400 text-sm">
                Every recommendation is tailored to your profile, skills, and career goals for maximum success rate.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">10x Faster</h3>
              <p className="text-gray-400 text-sm">
                Automate the tedious parts of job searching and focus on what matters—preparing for interviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold">Autonomous Internship Agent</span>
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
