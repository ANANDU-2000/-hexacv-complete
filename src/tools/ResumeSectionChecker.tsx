/**
 * TOOL 5: Resume Section & Structure Checker
 * URL: /resume-section-checker
 * 
 * Checks resume structure and sections
 * No content quality judgment, no outcome predictions
 */

import { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Info, ChevronLeft } from 'lucide-react';
import { checkResumeStructure, StructureAnalysis } from '../services/keywordEngine';

interface Props {
  onNavigateHome: () => void;
}

export default function ResumeSectionChecker({ onNavigateHome }: Props) {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<StructureAnalysis | null>(null);

  const handleCheck = () => {
    if (!resumeText.trim()) return;
    const result = checkResumeStructure(resumeText);
    setAnalysis(result);
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
          Resume Section Checker
        </h1>

        {/* Short explanation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Check if your resume has all the standard sections ATS systems expect. Identifies missing sections and formatting issues.
        </p>

        {/* Tool UI */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Paste Your Resume Text
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your entire resume text here..."
              className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={!resumeText.trim()}
            className={`w-full h-11 rounded-lg font-medium text-sm transition-colors ${resumeText.trim()
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            Check Structure
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="mt-8 space-y-6">
            {/* Sections Check */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Section Checklist</h3>
              <div className="space-y-2">
                {analysis.sections.map((section, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg flex items-center gap-3 ${section.present ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                  >
                    {section.present ? (
                      <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-gray-400 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${section.present ? 'text-green-900' : 'text-gray-600'}`}>
                        {section.section}
                      </p>
                      {section.warning && (
                        <p className="text-xs text-gray-500 mt-0.5">{section.warning}</p>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${section.present ? 'text-green-600' : 'text-gray-400'}`}>
                      {section.present ? 'Found' : 'Not found'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <h3 className="text-sm font-medium text-amber-900">Potential Issues</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-blue-600" />
                  <h3 className="text-sm font-medium text-blue-900">Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Clear */}
            {analysis.warnings.length === 0 && analysis.sections.every(s => s.present || !s.warning) && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="text-sm text-green-800">
                    Your resume structure looks good. All expected sections are present.
                  </p>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-500">
                This tool checks for section presence and common formatting issues. It does not evaluate content quality or predict hiring outcomes.
              </p>
            </div>
          </div>
        )}

        {/* Supporting Content */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS-Friendly Resume Structure</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Most ATS systems expect resumes to follow a standard structure. Missing sections
              or unusual formatting can cause parsing errors.
            </p>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Standard sections most ATS expect:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li><strong>Contact Information</strong> - Name, email, phone, location</li>
                <li><strong>Experience</strong> - Work history with dates</li>
                <li><strong>Education</strong> - Degrees and institutions</li>
                <li><strong>Skills</strong> - Technical and relevant skills</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Common formatting issues:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Tables and columns (can break parsing)</li>
                <li>Images and graphics (ATS cannot read)</li>
                <li>Special characters and symbols</li>
                <li>Headers and footers (often ignored)</li>
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
