import { FileSearch, BarChart3, Target, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function JobDescriptionKeywordTool({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
            <FileSearch size={16} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Smart Analysis</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Job Description Keyword Tool
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Decode any job description in seconds. Our AI identifies the must-have skills, 
            nice-to-haves, and hidden requirements recruiters are looking for.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Analyze Job Description
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">Free tool - no account needed</p>
        </div>
      </section>

      {/* What It Extracts */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">What We Extract From JDs</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Our tool analyzes job descriptions to give you actionable insights
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold mb-2">Hard Skills</h3>
              <p className="text-slate-400 text-xs">Technical skills, tools, languages</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold mb-2">Soft Skills</h3>
              <p className="text-slate-400 text-xs">Communication, leadership, teamwork</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold mb-2">Experience Level</h3>
              <p className="text-slate-400 text-xs">Junior, Mid, Senior requirements</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <FileSearch className="text-amber-400" size={24} />
              </div>
              <h3 className="font-bold mb-2">Hidden Hints</h3>
              <p className="text-slate-400 text-xs">Culture fit, growth opportunities</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How to Use This Tool</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Copy the Job Description</h3>
                <p className="text-slate-400">Go to the job posting and copy the full description text</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Paste Into Our Tool</h3>
                <p className="text-slate-400">Click "Analyze Job Description" and paste the text</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Get Instant Analysis</h3>
                <p className="text-slate-400">See keywords ranked by importance, plus tailoring suggestions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Optimize Your Resume</h3>
                <p className="text-slate-400">Add missing keywords to your resume for better ATS matching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Analyze Job Descriptions?</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Understand exactly what the company is looking for</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Tailor your resume to match specific requirements</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Prepare better for interviews by knowing key topics</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Identify if you're a good fit before applying</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Decode Your Next Job Posting</h2>
          <p className="text-slate-400 mb-8">Paste any job description and get instant keyword analysis</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
          >
            Analyze Now - Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
