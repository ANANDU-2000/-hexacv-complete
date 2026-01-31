import { Check, FileText, Zap, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function FreeATSResumeBuilder({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <Check size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">100% Free Forever</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Free ATS Resume Builder
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build an ATS-optimized resume in minutes. No signup, no payment, no hidden fees. 
            Your resume stays in your browser - we never store your data.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Build Your Resume Now
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">No credit card required</p>
        </div>
      </section>

      {/* Why ATS Matters */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Why ATS Optimization Matters</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            75% of resumes are rejected by ATS before a human ever sees them. 
            Our builder ensures your resume passes the first screening.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">ATS-Safe Format</h3>
              <p className="text-slate-400 text-sm">Clean layout that ATS systems can read without issues</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Keyword Optimization</h3>
              <p className="text-slate-400 text-sm">Extract and match keywords from job descriptions</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Privacy First</h3>
              <p className="text-slate-400 text-sm">Your data never leaves your browser</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Upload or Create</h3>
                <p className="text-slate-400">Upload your existing resume PDF or start fresh with our editor</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Add Job Description</h3>
                <p className="text-slate-400">Paste the job description to extract relevant keywords automatically</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Download PDF</h3>
                <p className="text-slate-400">Get your ATS-optimized resume instantly - no watermarks, no signup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get More Interviews?</h2>
          <p className="text-slate-400 mb-8">Join thousands who've improved their job search with HexaCV</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
          >
            Start Building - It's Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
