import { useEffect } from 'react';
import { GraduationCap, Briefcase, Star, TrendingUp, ArrowRight, CheckCircle, Award, Code, Users, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function ATSResumeForFreshers({ onStart }: LandingPageProps) {
  useEffect(() => {
    document.title = 'ATS Resume for Freshers - Free Template & Guide | HexaCV';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Free ATS-optimized resume template for freshers. No experience needed. Highlight projects, skills, and education. Download free PDF - no signup.');
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
          "name": "How do freshers write a resume with no experience?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Focus on academic projects, internships, technical skills, and coursework. Use action verbs and quantify achievements where possible. Our fresher-focused template puts education and projects first."
          }
        },
        {
          "@type": "Question",
          "name": "What should a fresher include in their resume?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Include education details, academic projects, internships, technical skills, certifications, and relevant coursework. Soft skills and extracurricular activities can also be included."
          }
        },
        {
          "@type": "Question",
          "name": "How long should a fresher resume be?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Keep it to 1 page. Recruiters spend only 6 seconds scanning resumes. Focus on quality over quantity - include only relevant information."
          }
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const fresherBulletExamples = [
    { bad: "Worked on a project", good: "Built a full-stack e-commerce platform using React and Node.js, serving 500+ users" },
    { bad: "Learned programming", good: "Completed 200+ hours of Python programming coursework with 95% score" },
    { bad: "Did an internship", good: "Developed automated testing scripts during 3-month internship, reducing QA time by 40%" },
    { bad: "Part of college club", good: "Led technical team of 12 members for college hackathon, winning 2nd place among 50 teams" },
    { bad: "Good at communication", good: "Presented research findings to 200+ audience at national tech symposium" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <GraduationCap size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Designed for Fresh Graduates</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            ATS Resume for Freshers - Free Template & Guide
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            No experience? No problem. Our ATS-optimized template is designed specifically for fresh graduates 
            to highlight projects, skills, and potential - not years of experience.
          </p>
          
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Build Your First Resume
            <ArrowRight size={20} />
          </button>
          
          <p className="mt-4 text-slate-500 text-sm">Free forever - Perfect for students & recent graduates</p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">The Fresher Job Search Struggle is Real</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            We understand the challenges fresh graduates face. Here's how we help.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-red-400">Common Fresher Struggles</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>"Requires 2+ years experience" on every job posting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Don't know what to put when you have no work history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Generic templates don't work for freshers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>ATS rejects resume before recruiter sees it</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Competing with experienced candidates for same roles</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-emerald-400">How HexaCV Helps</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Education-first template that highlights your degree</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Projects section to showcase what you've built</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Skills-based layout that emphasizes capabilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>ATS-optimized format that passes automated screening</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Keyword matching for entry-level job descriptions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What to Include */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">What Freshers Should Include in Their Resume</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            You have more to offer than you think. Here's what to highlight.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
                <GraduationCap className="text-amber-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Education</h3>
              <p className="text-slate-400 text-sm">Degree, major, GPA (if good), relevant coursework, academic achievements</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                <Code className="text-blue-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Projects</h3>
              <p className="text-slate-400 text-sm">Capstone projects, personal projects, hackathon entries, thesis work</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                <Briefcase className="text-emerald-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Internships</h3>
              <p className="text-slate-400 text-sm">Even short internships count - include responsibilities and achievements</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="text-purple-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Skills</h3>
              <p className="text-slate-400 text-sm">Technical skills, programming languages, tools, frameworks, soft skills</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center mb-3">
                <Award className="text-pink-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Certifications</h3>
              <p className="text-slate-400 text-sm">Online courses, certifications, workshops, bootcamps completed</p>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-3">
                <Users className="text-cyan-400" size={20} />
              </div>
              <h3 className="font-bold mb-2">Activities</h3>
              <p className="text-slate-400 text-sm">Club leadership, volunteering, competitions, extracurriculars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bullet Point Examples */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Example Resume Bullet Points for Freshers</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            Transform weak statements into powerful, ATS-friendly bullet points.
          </p>
          
          <div className="space-y-4">
            {fresherBulletExamples.map((example, index) => (
              <div key={index} className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-4 bg-red-500/5 border-r border-slate-700">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Weak</span>
                    <p className="text-slate-400 mt-2 text-sm">{example.bad}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/5">
                    <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Strong</span>
                    <p className="text-slate-300 mt-2 text-sm">{example.good}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Pro Tips for Fresher Resumes</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Put Education First</h3>
                <p className="text-slate-400 text-sm">As a fresher, education is your strongest section. Lead with it.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Use Action Verbs</h3>
                <p className="text-slate-400 text-sm">"Built", "Developed", "Designed", "Led", "Analyzed" - start strong.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Quantify Everything</h3>
                <p className="text-slate-400 text-sm">"Increased efficiency by 30%", "Served 500 users", "Led team of 5"</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Keep It to 1 Page</h3>
                <p className="text-slate-400 text-sm">Recruiters spend 6 seconds scanning. Less is more.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Match Job Keywords</h3>
                <p className="text-slate-400 text-sm">Use our keyword extractor to match the job description.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
              <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold mb-1">Include GitHub/Portfolio</h3>
                <p className="text-slate-400 text-sm">Show your work. Link to projects, code, or portfolio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold mb-2">How do freshers write a resume with no experience?</h3>
              <p className="text-slate-400 text-sm">Focus on academic projects, internships, technical skills, and coursework. Use action verbs and quantify achievements where possible. Our fresher-focused template puts education and projects first.</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold mb-2">What should a fresher include in their resume?</h3>
              <p className="text-slate-400 text-sm">Include education details, academic projects, internships, technical skills, certifications, and relevant coursework. Soft skills and extracurricular activities can also be included to show well-roundedness.</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold mb-2">How long should a fresher resume be?</h3>
              <p className="text-slate-400 text-sm">Keep it to 1 page. Recruiters spend only 6 seconds scanning resumes. Focus on quality over quantity - include only relevant information that highlights your potential.</p>
            </div>
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700">
              <h3 className="font-bold mb-2">Should freshers include GPA on resume?</h3>
              <p className="text-slate-400 text-sm">Include GPA if it's above 3.0 (or 7.0 CGPA in India). If lower, focus on relevant coursework, projects, and skills instead. Some industries value GPA more than others.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Career Right</h2>
          <p className="text-slate-400 mb-8">Build a professional, ATS-optimized resume that gets you interviews - even as a fresher</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
          >
            Create Fresher Resume - Free
            <ArrowRight size={20} />
          </button>
          <p className="mt-4 text-slate-600 text-xs">No signup required. Education-first template pre-selected.</p>
        </div>
      </section>
    </div>
  );
}
