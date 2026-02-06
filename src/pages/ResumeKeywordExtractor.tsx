import { Search, Target, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function ResumeKeywordExtractor({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
            <Search size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered Extraction</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Resume Keyword Extractor
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Paste any job description and instantly extract the keywords that matter. 
            Match your resume to what recruiters are actually looking for.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Extract Keywords Free
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">No signup required</p>
        </div>
      </section>

      {/* How Keyword Extraction Works */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">How Keyword Extraction Works</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Our AI analyzes job descriptions to identify the exact skills, tools, and qualifications employers want.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Skills Detection</h3>
              <p className="text-slate-400 text-sm">Identifies technical and soft skills mentioned in the JD</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Priority Ranking</h3>
              <p className="text-slate-400 text-sm">Ranks keywords by importance based on frequency and context</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Match Analysis</h3>
              <p className="text-slate-400 text-sm">Shows which keywords your resume already has</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Keywords Matter */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Keywords Matter</h2>
          
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-5xl font-black text-red-400 mb-2">75%</div>
                <p className="text-slate-400">of resumes are rejected by ATS due to missing keywords</p>
              </div>
              <div>
                <div className="text-5xl font-black text-emerald-400 mb-2">3x</div>
                <p className="text-slate-400">more interview calls when resume matches JD keywords</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>ATS systems scan for exact keyword matches</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Recruiters spend only 6 seconds on initial resume scan</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Tailored resumes outperform generic ones every time</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Extract Keywords Now</h2>
          <p className="text-slate-400 mb-8">Paste your target job description and get instant keyword analysis</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
          >
            Start Extracting - Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
