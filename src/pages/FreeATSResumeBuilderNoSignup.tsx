import { useEffect } from 'react';
import { Check, FileText, Zap, Shield, ArrowRight, Users, Award, Clock, Target, CheckCircle, XCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function FreeATSResumeBuilderNoSignup({ onStart }: LandingPageProps) {
  useEffect(() => {
    document.title = 'Free ATS Resume Builder - No Signup Required | HexaCV';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Build ATS-optimized resume instantly. No account, no payment, no signup. Extract keywords from job descriptions. Download in 2 minutes.');
    }

    // Add FAQ Schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an ATS resume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An ATS (Applicant Tracking System) resume is formatted to be easily parsed by automated screening software used by 99% of Fortune 500 companies. It uses simple formatting, standard fonts, and keyword optimization to pass automated filters."
          }
        },
        {
          "@type": "Question",
          "name": "Why do I need an ATS-optimized resume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "77% of resumes are rejected by ATS before a human ever sees them. An ATS-optimized resume ensures your application passes automated screening and reaches recruiters."
          }
        },
        {
          "@type": "Question",
          "name": "Is HexaCV really free with no signup?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, HexaCV is 100% free and requires no signup, email, or account creation. Start building immediately and download your resume in minutes."
          }
        },
        {
          "@type": "Question",
          "name": "Is my resume data stored on your servers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No, all your resume data stays in your browser's local storage. We never upload, store, or access your personal information."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <Check size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">100% Free Forever - No Signup Required</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Free ATS Resume Builder - No Signup Required
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build an ATS-optimized resume in 2 minutes. No account creation, no payment, no hidden fees. 
            Extract keywords from job descriptions instantly. Your data stays private - we never store it.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Start Building Now
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">No credit card required - Download in 2 minutes</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-10 bg-slate-900/30 border-y border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-red-400 mb-1">77%</div>
            <p className="text-slate-500 text-sm">of resumes rejected by ATS</p>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 mb-1">50K+</div>
            <p className="text-slate-500 text-sm">resumes created</p>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400 mb-1">2 min</div>
            <p className="text-slate-500 text-sm">average build time</p>
          </div>
        </div>
      </section>

      {/* What is ATS Section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">What is an ATS and Why Does It Matter?</h2>
          <p className="text-slate-400 text-center mb-10 max-w-3xl mx-auto leading-relaxed">
            An Applicant Tracking System (ATS) is software that 99% of Fortune 500 companies and 75% of all employers use to filter resumes before a human ever sees them. Understanding how ATS works is crucial for getting your resume past the first screening.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-red-400">How ATS Rejects Resumes</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <span>Complex formatting (tables, columns, graphics) can't be parsed</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <span>Missing keywords that match the job description</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <span>Non-standard section headers confuse the parser</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                  <span>Images and logos are completely ignored</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-4 text-emerald-400">How HexaCV Helps</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Clean, ATS-friendly formatting that parses correctly</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Automatic keyword extraction from job descriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Standard section headers recognized by all ATS</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <span>Bold keywords for human readability after ATS passes</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
            <p className="text-center text-slate-300 leading-relaxed">
              <strong className="text-white">Did you know?</strong> Studies show that 77% of resumes are rejected by ATS before reaching a human recruiter. 
              The average corporate job receives 250 applications, but only 4-6 candidates get interviewed. 
              An ATS-optimized resume dramatically increases your chances of being in that top group.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Why Choose HexaCV?</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            Built specifically to help job seekers beat ATS systems and land more interviews.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">ATS-Safe Templates</h3>
              <p className="text-slate-400 text-sm">Clean layouts designed to parse correctly on all major ATS platforms including Workday, Greenhouse, and Lever.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Keyword Optimization</h3>
              <p className="text-slate-400 text-sm">Paste any job description and instantly extract the keywords recruiters are looking for. Match your resume to the job.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">100% Private</h3>
              <p className="text-slate-400 text-sm">Your resume data never leaves your browser. No server storage, no accounts, no tracking. Complete privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">HexaCV vs Other Resume Builders</h2>
          
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="p-4 font-bold">Feature</th>
                  <th className="p-4 font-bold text-emerald-400 text-center">HexaCV</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Resume.io</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Canva</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Indeed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="p-4">No Signup Required</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center text-slate-500">Login Required</td>
                  <td className="p-4 text-center text-slate-500">Login Required</td>
                  <td className="p-4 text-center text-slate-500">Login Required</td>
                </tr>
                <tr>
                  <td className="p-4">ATS Keyword Extraction</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center text-slate-500">Premium Only</td>
                  <td className="p-4 text-center"><XCircle className="text-red-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center text-slate-500">Basic</td>
                </tr>
                <tr>
                  <td className="p-4">Free PDF Download</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center text-slate-500">Watermarked</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                </tr>
                <tr>
                  <td className="p-4">Data Privacy</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center text-slate-500">Data Stored</td>
                  <td className="p-4 text-center text-slate-500">Data Stored</td>
                  <td className="p-4 text-center text-slate-500">Data Stored</td>
                </tr>
                <tr>
                  <td className="p-4">ATS-Optimized Templates</td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center"><XCircle className="text-red-400 mx-auto" size={18} /></td>
                  <td className="p-4 text-center"><Check className="text-emerald-400 mx-auto" size={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">How It Works - 3 Simple Steps</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4">1</div>
              <h3 className="font-bold text-xl mb-2">Upload or Create</h3>
              <p className="text-slate-400 text-sm">Upload your existing resume PDF for instant parsing, or start fresh with our guided editor.</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4">2</div>
              <h3 className="font-bold text-xl mb-2">Paste Job Description</h3>
              <p className="text-slate-400 text-sm">Copy-paste the job posting and our AI extracts relevant keywords to optimize your resume.</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 bg-white text-slate-900 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-4">3</div>
              <h3 className="font-bold text-xl mb-2">Download PDF</h3>
              <p className="text-slate-400 text-sm">Get your ATS-optimized resume instantly. No watermarks, no signup, completely free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">What is an ATS resume?</h3>
              <p className="text-slate-400">An ATS (Applicant Tracking System) resume is formatted to be easily parsed by automated screening software used by 99% of Fortune 500 companies. It uses simple formatting, standard fonts, and keyword optimization to pass automated filters.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Why do I need an ATS-optimized resume?</h3>
              <p className="text-slate-400">77% of resumes are rejected by ATS before a human ever sees them. An ATS-optimized resume ensures your application passes automated screening and reaches recruiters. Without proper formatting and keywords, even the most qualified candidates get filtered out.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Is HexaCV really free with no signup?</h3>
              <p className="text-slate-400">Yes, HexaCV is 100% free and requires no signup, email, or account creation. Start building immediately and download your resume in minutes. We believe everyone deserves access to professional resume tools.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">Is my resume data stored on your servers?</h3>
              <p className="text-slate-400">No, all your resume data stays in your browser's local storage. We never upload, store, or access your personal information. Your privacy is our priority - there are no tracking cookies, no analytics on your content, and no data mining.</p>
            </div>
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-lg mb-2">How does keyword extraction work?</h3>
              <p className="text-slate-400">Paste any job description into our tool, and our AI analyzes it to identify key skills, technologies, and requirements. These keywords are then highlighted in your resume, helping you match the exact language recruiters and ATS systems are looking for.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get More Interviews?</h2>
          <p className="text-slate-400 mb-8">Join over 50,000 job seekers who've improved their job search with HexaCV</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
          >
            Start Building - It's Free
            <ArrowRight size={20} />
          </button>
          <p className="mt-4 text-slate-600 text-xs">No signup required. No credit card. No hidden fees.</p>
        </div>
      </section>
    </div>
  );
}
