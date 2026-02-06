import { useEffect, useState } from 'react';
import { Search, Target, Sparkles, CheckCircle, ArrowRight, Clipboard, Zap, Award, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function ResumeKeywordExtractorFree({ onStart }: LandingPageProps) {
  const [demoJD, setDemoJD] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    document.title = 'Free Resume Keyword Extractor - Extract ATS Keywords from Job Descriptions | HexaCV';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Paste any job description and get ATS keywords instantly. Free tool. No login. Perfect for optimizing your resume for applicant tracking systems.');
    }

    // Add Schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "HexaCV Resume Keyword Extractor",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free tool to extract ATS keywords from job descriptions for resume optimization."
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleDemoExtract = () => {
    if (!demoJD.trim()) return;
    
    // Simple keyword extraction for demo
    const techKeywords = demoJD.match(/\b(react|angular|vue|node|python|java|aws|docker|kubernetes|sql|nosql|mongodb|postgresql|typescript|javascript|html|css|git|agile|scrum|ci\/cd|rest|api|graphql|redux|webpack|jenkins|terraform|linux|microservices)\b/gi) || [];
    const uniqueKeywords = [...new Set(techKeywords.map(k => k.toLowerCase()))];
    setExtractedKeywords(uniqueKeywords.slice(0, 15));
    setShowDemo(true);
  };

  const exampleJD = `We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. You will be working with AWS services, Docker containers, and implementing CI/CD pipelines. Experience with Agile methodologies, REST APIs, and PostgreSQL is required. Nice to have: GraphQL, Kubernetes, and microservices architecture.`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Search size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered Keyword Extraction</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Free Resume Keyword Extractor
          </h1>
          <h2 className="text-xl text-slate-300 mb-4">Extract ATS Keywords from Job Descriptions</h2>
          
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Paste any job description and instantly extract the keywords that ATS systems and recruiters 
            are looking for. Optimize your resume to match job requirements perfectly.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Extract Keywords Free
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">No signup required - Instant results</p>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Try It Now - Live Demo</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Paste Job Description</label>
              <textarea
                value={demoJD}
                onChange={(e) => setDemoJD(e.target.value)}
                placeholder="Paste a job description here to extract keywords..."
                className="w-full h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleDemoExtract}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                >
                  Extract Keywords
                </button>
                <button
                  onClick={() => setDemoJD(exampleJD)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium text-sm transition-all"
                >
                  Load Example
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Extracted Keywords</label>
              <div className="h-48 bg-slate-800 border border-slate-700 rounded-xl p-4 overflow-y-auto">
                {showDemo && extractedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {extractedKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Keywords will appear here after extraction...</p>
                )}
              </div>
              {showDemo && extractedKeywords.length > 0 && (
                <p className="mt-3 text-emerald-400 text-sm">
                  Found {extractedKeywords.length} keywords! Use these in your resume.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Keywords Matter */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Why Keywords Matter for Your Resume</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            ATS systems scan resumes for specific keywords before a human ever sees your application. 
            Missing keywords means automatic rejection.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <div className="text-5xl font-black text-red-400 mb-2">75%</div>
              <p className="text-slate-400">of resumes are rejected by ATS due to missing or mismatched keywords</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <div className="text-5xl font-black text-emerald-400 mb-2">3x</div>
              <p className="text-slate-400">more interview calls when your resume matches job description keywords</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span className="text-slate-300">ATS systems use exact keyword matching - synonyms often don't work</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span className="text-slate-300">Recruiters spend only 6 seconds scanning - keywords help them find what they need</span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0" size={20} />
              <span className="text-slate-300">Tailored resumes with matched keywords outperform generic resumes every time</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">How to Use the Keyword Extractor</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-black shrink-0">1</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Copy the Job Description</h3>
                <p className="text-slate-400">Go to the job posting you're interested in and copy the entire job description, including requirements and qualifications.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-black shrink-0">2</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Paste into the Extractor</h3>
                <p className="text-slate-400">Paste the job description into our tool. Our AI analyzes the text to identify technical skills, soft skills, and key qualifications.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-black shrink-0">3</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Review Extracted Keywords</h3>
                <p className="text-slate-400">See the keywords ranked by importance. Required skills are highlighted differently from nice-to-haves.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-black shrink-0">4</div>
              <div>
                <h3 className="font-bold text-xl mb-2">Optimize Your Resume</h3>
                <p className="text-slate-400">Add the missing keywords to your resume naturally. Our resume builder can help you integrate them seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center">What Our Keyword Extractor Identifies</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="text-blue-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Technical Skills</h3>
              <p className="text-slate-400 text-sm">Programming languages, frameworks, tools, and technologies mentioned in the job description.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Soft Skills</h3>
              <p className="text-slate-400 text-sm">Communication, leadership, teamwork, and other interpersonal skills employers value.</p>
            </div>
            
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <Award className="text-purple-400" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Qualifications</h3>
              <p className="text-slate-400 text-sm">Education requirements, certifications, and years of experience specified in the posting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Example: Before & After Keyword Optimization</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-red-400">Before (Generic Resume)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                "Worked on web development projects. Helped build applications. 
                Used various technologies to create software solutions. 
                Participated in team meetings and discussions."
              </p>
              <div className="mt-4 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm inline-block">
                ATS Score: 23%
              </div>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 text-emerald-400">After (Keyword Optimized)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                "Developed <span className="text-emerald-400 font-bold">React</span> and <span className="text-emerald-400 font-bold">TypeScript</span> applications deployed on <span className="text-emerald-400 font-bold">AWS</span>. 
                Built <span className="text-emerald-400 font-bold">REST APIs</span> using <span className="text-emerald-400 font-bold">Node.js</span> with <span className="text-emerald-400 font-bold">PostgreSQL</span>. 
                Implemented <span className="text-emerald-400 font-bold">CI/CD pipelines</span> following <span className="text-emerald-400 font-bold">Agile</span> methodologies."
              </p>
              <div className="mt-4 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm inline-block">
                ATS Score: 87%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Resume?</h2>
          <p className="text-slate-400 mb-8">Extract keywords from your target job and build an ATS-optimized resume in minutes</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
            >
              Start Extracting Keywords
              <Search size={20} />
            </button>
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-3 bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
            >
              Build ATS Resume
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
