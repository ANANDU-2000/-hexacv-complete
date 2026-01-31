import { GraduationCap, Briefcase, Star, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function ATSResumeForFreshers({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
            <GraduationCap size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">For Fresh Graduates</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            ATS Resume for Freshers
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            No experience? No problem. Build an ATS-optimized resume that highlights your 
            projects, skills, and potential - designed specifically for fresh graduates.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Build Your First Resume
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">Free forever - perfect for students</p>
        </div>
      </section>

      {/* Fresher Challenges */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">We Understand Fresher Challenges</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Getting your first job is tough. We help you stand out even without years of experience.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">😰</span>
              </div>
              <h3 className="font-bold text-lg mb-2">The Problem</h3>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>"Requires 2+ years experience" everywhere</li>
                <li>Don't know what to put in resume</li>
                <li>Generic templates don't work</li>
                <li>ATS rejects before humans see</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Our Solution</h3>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>Highlight projects & internships</li>
                <li>Showcase skills over experience</li>
                <li>ATS-optimized format</li>
                <li>Keyword matching for entry-level jobs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What to Include */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What Freshers Should Include</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-slate-800/30 p-5 rounded-xl">
              <Star className="text-amber-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold mb-1">Academic Projects</h3>
                <p className="text-slate-400 text-sm">Capstone projects, thesis work, lab projects</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-slate-800/30 p-5 rounded-xl">
              <Briefcase className="text-blue-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold mb-1">Internships</h3>
                <p className="text-slate-400 text-sm">Even short internships count as experience</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-slate-800/30 p-5 rounded-xl">
              <TrendingUp className="text-emerald-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold mb-1">Skills & Certifications</h3>
                <p className="text-slate-400 text-sm">Online courses, certifications, technical skills</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-slate-800/30 p-5 rounded-xl">
              <GraduationCap className="text-purple-400 shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold mb-1">Education Details</h3>
                <p className="text-slate-400 text-sm">GPA, relevant coursework, achievements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Pro Tips for Fresher Resumes</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Put Education at the top - it's your strongest section</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Use action verbs: "Built", "Developed", "Designed", "Analyzed"</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Quantify wherever possible: "Increased efficiency by 30%"</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span>Keep it to 1 page - recruiters spend only 6 seconds scanning</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Career Right</h2>
          <p className="text-slate-400 mb-8">Build a professional resume that gets you interviews</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
          >
            Create Fresher Resume - Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
