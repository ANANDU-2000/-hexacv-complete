/**
 * TOOL 4: Job Description Analyzer
 * URL: /job-description-analyzer
 * 
 * Analyzes JD for role type, seniority, core skills
 * Neutral, informational, honest output
 */

import { useState } from 'react';
import { FileText, ArrowRight, Briefcase, TrendingUp, Code, Star, ChevronLeft } from 'lucide-react';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { analyzeJobDescription, JDAnalysis } from '../core/ats/scoreATS';

interface Props {
  onNavigateHome: () => void;
}

export default function JobDescriptionAnalyzer({ onNavigateHome }: Props) {
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);

  const handleAnalyze = () => {
    if (!jdText.trim()) return;
    const result = analyzeJobDescription(jdText);
    setAnalysis(result);
  };

  const getSeniorityLabel = (level: JDAnalysis['seniorityLevel']) => {
    switch (level) {
      case 'entry': return 'Entry Level';
      case 'mid': return 'Mid Level';
      case 'senior': return 'Senior Level';
      case 'lead': return 'Lead / Management';
      default: return 'Not Clear';
    }
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
          Job Description Analyzer
        </h1>

        {/* Short explanation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Understand what a job description is really asking for. Identifies role type, seniority level, and required skills.
        </p>

        {/* Tool UI */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Paste Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!jdText.trim()}
            className={`w-full h-11 rounded-lg font-medium text-sm transition-colors ${jdText.trim()
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Analyze Job Description
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Role Type & Seniority */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase size={16} className="text-gray-500" />
                  <p className="text-xs font-medium text-gray-500">Role Type</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{analysis.roleType}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-gray-500" />
                  <p className="text-xs font-medium text-gray-500">Seniority Level</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{getSeniorityLabel(analysis.seniorityLevel)}</p>
              </div>
            </div>

            {/* Seniority Signals */}
            {analysis.senioritySignals.length > 0 && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-3">Seniority Indicators</p>
                <ul className="space-y-2">
                  {analysis.senioritySignals.map((signal, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Core Skills */}
            {analysis.coreSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Code size={16} className="text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Core Skills Required ({analysis.coreSkills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.coreSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-900 text-white rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nice to Have */}
            {analysis.niceToHave.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} className="text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-900">Nice to Have ({analysis.niceToHave.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.niceToHave.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Responsibilities */}
            {analysis.responsibilities.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-3">Key Responsibilities</p>
                <ul className="space-y-2">
                  {analysis.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-500">
                This analysis is based on pattern matching and common indicators. Always read the full job description for complete understanding.
              </p>
            </div>
          </div>
        )}

        {/* Supporting Content */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Understanding Job Descriptions</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Job descriptions often contain signals about seniority level, required skills,
              and company expectations. This tool helps decode those signals.
            </p>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">What we look for:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Years of experience requirements</li>
                <li>Technical skills and tools mentioned</li>
                <li>Leadership or mentorship responsibilities</li>
                <li>Required vs preferred qualifications</li>
                <li>Role-specific keywords (frontend, backend, etc.)</li>
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
