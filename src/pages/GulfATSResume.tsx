import { useEffect } from 'react';
import { Globe, FileText, ArrowRight, CheckCircle, MapPin } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function GulfATSResume({ onStart }: LandingPageProps) {
  useEffect(() => {
    document.title = 'Gulf ATS Resume Format - Free CV for Dubai, UAE, Qatar | HexaCV';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Learn the correct Gulf CV format and build a free ATS resume for Dubai, UAE, Qatar and Saudi. Single-column, ATS-safe layout with clean PDF download.'
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Globe size={16} className="text-blue-300" />
            <span className="text-blue-300 text-sm font-medium">India → Gulf CV Format</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Gulf ATS Resume Format for Dubai, UAE, Qatar &amp; Saudi
          </h1>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Learn how Gulf recruiters expect your CV to look – and build a matching, ATS-safe resume in minutes with our free builder.
          </p>

          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Build Gulf-Ready ATS Resume
            <ArrowRight size={20} />
          </button>

          <p className="mt-4 text-slate-500 text-sm">
            No signup • No watermarks • Free PDF download
          </p>
        </div>
      </section>

      {/* Gulf CV Differences */}
      <section className="px-6 py-16 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">How Gulf CV Format Differs</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            Most Gulf employers still expect a clean, single-column CV – but with some regional nuances. Here&apos;s what usually changes when you apply to Dubai, UAE, Qatar or Saudi.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" />
                Format &amp; Layout
              </h3>
              <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                <li>Single-column, ATS-safe layout (no complex tables or graphics)</li>
                <li>Clear section titles: Summary, Experience, Skills, Education</li>
                <li>Consistent date format (e.g. Jan 2024 – Present)</li>
                <li>No photos required unless job explicitly asks</li>
              </ul>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <MapPin size={18} className="text-sky-400" />
                Location &amp; Contact
              </h3>
              <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                <li>Mention current city (e.g. Bengaluru, India) and target country (e.g. Dubai, UAE)</li>
                <li>Include WhatsApp-friendly phone number with country code</li>
                <li>Professional email and LinkedIn profile are must-haves</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ATS & Keywords */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Make Your Gulf CV ATS-Friendly</h2>
          <p className="text-slate-400 text-center mb-10 max-w-2xl mx-auto">
            Gulf job portals and internal HR systems still rely heavily on ATS. Your resume must be readable by software before a recruiter even looks at it.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="text-emerald-400" size={20} />
                <h3 className="font-bold">What ATS Sees</h3>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                ATS parses your CV into plain text. Our builder keeps your layout simple so these systems can read:
              </p>
              <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                <li>Job titles and company names</li>
                <li>Dates and locations of roles</li>
                <li>Skills and technologies</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-emerald-400" size={20} />
                <h3 className="font-bold">Keywords That Matter</h3>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                For Gulf roles, make sure your resume naturally includes:
              </p>
              <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1">
                <li>Role-specific terms (e.g. &quot;Site Engineer&quot;, &quot;Store Manager&quot;, &quot;Backend Developer&quot;)</li>
                <li>Country/region details where relevant (e.g. &quot;UAE Labour Law&quot;, &quot;GCC experience&quot;)</li>
                <li>Tools and technologies actually used in Gulf job descriptions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA back to builder */}
      <section className="px-6 py-16 bg-slate-900/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Gulf ATS CV?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Use our free ATS-safe resume builder to generate a clean, single-column Gulf CV in minutes. No signup and no watermarks.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            Start Gulf ATS Resume
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

