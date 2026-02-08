/**
 * TOOL 1: Free ATS Keyword Extractor
 * URL: /free-ats-keyword-extractor
 * 
 * Extracts keywords from job descriptions
 * No scores, no predictions, just honest keyword extraction
 */

import { useState } from 'react';
import { FileText, ArrowRight, Copy, Check, ChevronLeft } from 'lucide-react';
import { extractKeywordsFromJD, ExtractedKeywords } from '../core/ats/extractKeywords';

interface Props {
  onNavigateHome: () => void;
}

export default function ATSKeywordExtractor({ onNavigateHome }: Props) {
  const [jdText, setJdText] = useState('');
  const [keywords, setKeywords] = useState<ExtractedKeywords | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExtract = () => {
    if (!jdText.trim()) return;
    const result = extractKeywordsFromJD(jdText);
    setKeywords(result);
  };

  const handleCopyAll = () => {
    if (!keywords) return;
    const allText = keywords.allKeywords.join(', ');
    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Proper Header */}
      <nav className="px-4 md:px-8 h-16 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <ChevronLeft size={20} className="text-gray-900 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-bold text-gray-900">Back</span>
        </button>

        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center p-1.5">
            <img src="/logo.svg" alt="HexaCV" className="w-full h-full brightness-0 invert" />
          </div>
          <span className="text-sm font-black text-gray-900 tracking-tight hidden sm:block uppercase">HexaCV</span>
        </div>

        <div className="w-20 hidden md:block" /> {/* Spacer */}
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* H1 with primary keyword */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Free ATS Keyword Extractor
        </h1>

        {/* Short explanation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Extract keywords from any job description. Paste a JD below to identify skills, tools, and technologies that ATS systems look for.
        </p>

        {/* Tool UI - immediately visible */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Paste Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-40 md:h-48 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={!jdText.trim()}
            className={`w-full h-11 rounded-lg font-medium text-sm transition-colors ${jdText.trim()
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Extract Keywords
          </button>
        </div>

        {/* Results */}
        {keywords && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Extracted Keywords</h2>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
            </div>

            {/* Skills */}
            {keywords.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-2">Technical Skills ({keywords.skills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {keywords.tools.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-2">Tools ({keywords.tools.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.tools.map((tool, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {keywords.softSkills.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-2">Soft Skills ({keywords.softSkills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.softSkills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Role Keywords */}
            {keywords.roleKeywords.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-2">Role Keywords ({keywords.roleKeywords.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.roleKeywords.map((role, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Business Terms */}
            {keywords.businessTerms.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-2">Business Terms ({keywords.businessTerms.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.businessTerms.map((term, i) => (
                    <span key={i} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {keywords.allKeywords.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No specific keywords identified. Try pasting a more detailed job description.
              </p>
            )}
          </div>
        )}

        {/* Supporting Content - Below Tool */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use ATS Keywords</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              ATS (Applicant Tracking Systems) scan resumes for keywords that match job descriptions.
              By including relevant keywords naturally in your resume, you increase the chances of
              passing the initial automated screening.
            </p>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tips for using extracted keywords:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Include keywords in your skills section</li>
                <li>Mention relevant tools in your experience bullets</li>
                <li>Use the exact terms from the job description</li>
                <li>Don't force keywords - only include what you actually know</li>
              </ul>
            </div>
          </div>

          {/* Internal Links */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-3">Related Tools</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#/"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FileText size={14} />
                <span>Free Resume Builder</span>
                <ArrowRight size={12} />
              </a>
              <a
                href="#/resume-keyword-checker"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FileText size={14} />
                <span>Resume Keyword Checker</span>
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-4 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>HexaCV - Free ATS Resume Tools</p>
          <p>No signup required. Your data stays in your browser.</p>
        </div>
      </footer>
    </div>
  );
}
