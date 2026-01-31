import { UserX, Lock, Zap, Clock, ArrowRight, Shield, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function NoLoginResumeBuilder({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <UserX size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">No Account Needed</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Resume Builder Without Login
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tired of creating accounts just to build a resume? 
            Start immediately - no signup, no email verification, no password to remember.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Start Now - No Login
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">Literally zero signup required</p>
        </div>
      </section>

      {/* Why No Login */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Why We Don't Require Login</h2>
          <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
            Your time is valuable. We respect that.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Save Time</h3>
              <p className="text-slate-400 text-sm">No email verification, no password setup, no profile creation</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Privacy First</h3>
              <p className="text-slate-400 text-sm">We don't collect your email, name, or any personal data</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Access</h3>
              <p className="text-slate-400 text-sm">Click and start building - it's that simple</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">HexaCV vs Others</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-red-400">Other Resume Builders</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  Create account with email
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  Verify email address
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  Set up password
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  Fill profile information
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-red-400">✗</span>
                  Then finally build resume
                </li>
              </ul>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-emerald-400">HexaCV</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  Click "Start"
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  Build your resume
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  Download PDF
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  Done. That's it.
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400">✓</span>
                  No data stored anywhere
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-800/30 p-5 rounded-xl">
              <h3 className="font-bold mb-2">Can I save my resume?</h3>
              <p className="text-slate-400 text-sm">Your resume auto-saves in your browser. Download the PDF to keep a permanent copy.</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-xl">
              <h3 className="font-bold mb-2">Is my data safe?</h3>
              <p className="text-slate-400 text-sm">Yes. Everything stays in your browser. We never send your resume data to any server.</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-xl">
              <h3 className="font-bold mb-2">Why is it free?</h3>
              <p className="text-slate-400 text-sm">We believe everyone deserves access to good tools for job hunting. Premium templates coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Just Start Building</h2>
          <p className="text-slate-400 mb-8">No forms to fill. No emails to verify. Just your resume.</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
          >
            Build Resume Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
