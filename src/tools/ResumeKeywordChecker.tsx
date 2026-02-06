/**
 * TOOL 2: Resume Keyword Checker
 * URL: /resume-keyword-checker
 * 
 * Compare resume against job description keywords
 * Shows matched, missing, overused - NO percentage scores
 */

import { useState } from 'react';
import { FileText, ArrowRight, Check, X, AlertCircle, ChevronLeft, Home } from 'lucide-react';
import { extractKeywordsFromJD, compareResumeToJD, ComparisonResult } from '../services/keywordEngine';

interface Props {
  onNavigateHome: () => void;
}

export default function ResumeKeywordChecker({ onNavigateHome }: Props) {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCheck = () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    const jdKeywords = extractKeywordsFromJD(jdText);
    const comparison = compareResumeToJD(resumeText, jdKeywords);
    setResult(comparison);
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
          Resume Keyword Checker
        </h1>

        {/* Short explanation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Check if your resume contains keywords from the job description. See which keywords are matched, missing, or overused.
        </p>

        {/* Tool UI */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Your Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Job Description
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleCheck}
            disabled={!resumeText.trim() || !jdText.trim()}
            className={`w-full h-11 rounded-lg font-medium text-sm transition-colors ${resumeText.trim() && jdText.trim()
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Check Keywords
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Summary - NO percentage */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{result.matchedCount}</span> matching keywords out of <span className="font-semibold text-gray-900">{result.totalKeywords}</span> identified in the job description.
              </p>
            </div>

            {/* Matched Keywords */}
            {result.matched.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Check size={16} className="text-green-600" />
                  <h3 className="text-sm font-medium text-gray-900">Matched Keywords ({result.matched.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matched.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700"
                      title={`Category: ${item.category}`}
                    >
                      {item.keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {result.missing.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <X size={16} className="text-red-500" />
                  <h3 className="text-sm font-medium text-gray-900">Missing Keywords ({result.missing.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing.map((item, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700"
                      title={`Category: ${item.category}`}
                    >
                      {item.keyword}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Consider adding these keywords to your resume if they match your experience.
                </p>
              </div>
            )}

            {/* Overused Words */}
            {result.overused.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-amber-500" />
                  <h3 className="text-sm font-medium text-gray-900">Overused Words ({result.overused.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.overused.map((word, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700"
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  These words appear frequently. Consider varying your language.
                </p>
              </div>
            )}

            {result.totalKeywords === 0 && (
              <p className="text-sm text-gray-500 italic">
                No specific keywords identified in the job description.
              </p>
            )}
          </div>
        )}

        {/* Supporting Content */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About Keyword Matching</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              This tool compares your resume text against keywords extracted from a job description.
              It identifies technical skills, soft skills, tools, and industry terms.
            </p>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Important notes:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Only add keywords for skills you actually have</li>
                <li>Missing keywords aren't always bad - focus on relevant ones</li>
                <li>Quality of experience matters more than keyword count</li>
                <li>Write for humans first, then optimize for ATS</li>
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
                href="#/free-ats-keyword-extractor"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FileText size={14} />
                <span>ATS Keyword Extractor</span>
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
