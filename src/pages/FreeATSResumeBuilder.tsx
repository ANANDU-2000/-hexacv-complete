import { Check, FileText, Zap, Shield, ArrowRight, Users, Award, Clock } from 'lucide-react';
import { useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export default function FreeATSResumeBuilder({ onStart }: LandingPageProps) {
  // Set page meta on mount - focus this page purely on generic free ATS intent.
  useEffect(() => {
    document.title = 'Free ATS Resume Builder - No Signup Required | HexaCV';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Build an ATS-optimized resume instantly. No account, no payment, no signup. Download a clean PDF in minutes with ATS-safe formatting.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <Check size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">100% Free Forever - No Signup Required</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Free ATS Resume Builder - No Signup Required
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build an ATS-optimized resume in minutes. No signup, no payment, no hidden fees.
            Your resume stays in your browser - we never store your data.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Start Building Now
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">No credit card required - Download in 2 minutes</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-white mb-1">77%</div>
            <p className="text-slate-500 text-sm">of resumes rejected by ATS</p>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 mb-1">50K+</div>
            <p className="text-slate-500 text-sm">resumes created</p>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1">2 min</div>
            <p className="text-slate-500 text-sm">average build time</p>
          </div>
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
              <p className="text-slate-400 text-sm">Clean layout that ATS systems can read without issues. No tables, columns, or graphics that break parsing.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Keyword Optimization</h3>
              <p className="text-slate-400 text-sm">Extract and match keywords from job descriptions automatically. Increase your match score instantly.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Privacy First</h3>
              <p className="text-slate-400 text-sm">Your data never leaves your browser. No account needed, no data stored on our servers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">HexaCV vs Other Resume Builders</h2>
          
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold text-emerald-400">HexaCV</th>
                  <th className="p-4 font-bold text-slate-500">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="p-4">No Signup Required</td>
                  <td className="p-4"><Check className="text-emerald-400" size={20} /></td>
                  <td className="p-4 text-slate-500">Login Required</td>
                </tr>
                <tr>
                  <td className="p-4">ATS Keyword Extraction</td>
                  <td className="p-4"><Check className="text-emerald-400" size={20} /></td>
                  <td className="p-4 text-slate-500">Premium Only</td>
                </tr>
                <tr>
                  <td className="p-4">Free PDF Download</td>
                  <td className="p-4"><Check className="text-emerald-400" size={20} /></td>
                  <td className="p-4 text-slate-500">Watermarked</td>
                </tr>
                <tr>
                  <td className="p-4">Data Privacy</td>
                  <td className="p-4"><Check className="text-emerald-400" size={20} /></td>
                  <td className="p-4 text-slate-500">Data Stored</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-slate-900/30">
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

      {/* FAQ Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Is HexaCV really free?</h3>
              <p className="text-slate-400">Yes, HexaCV is 100% free forever. No hidden costs, no premium upgrades required for basic features, no payment needed.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Do I need to create an account?</h3>
              <p className="text-slate-400">No, HexaCV requires no login, signup, or account creation. Start building your resume immediately.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Is my resume data stored on your servers?</h3>
              <p className="text-slate-400">No, all resume data stays in your browser. We don't store any personal information on servers.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">How does ATS keyword extraction work?</h3>
              <p className="text-slate-400">Paste a job description and our AI extracts relevant keywords. Your resume is then optimized to include these keywords naturally.</p>
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
