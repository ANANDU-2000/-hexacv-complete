/**
 * TOOL 3: Resume Bullet Point Improver
 * URL: /resume-bullet-improver
 * 
 * Improves resume bullet points - TRUTH-LOCKED
 * Same meaning, same experience level, no fabrication
 */

import { useState } from 'react';
import { FileText, ArrowRight, RefreshCw, Sparkles, ChevronLeft } from 'lucide-react';
import { improveBullet } from '../services/keywordEngine';

interface Props {
  onNavigateHome: () => void;
}

interface BulletResult {
  original: string;
  improved: string;
  changes: string[];
}

export default function ResumeBulletImprover({ onNavigateHome }: Props) {
  const [bulletText, setBulletText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState<BulletResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImprove = () => {
    if (!bulletText.trim()) return;
    setLoading(true);

    // Simulate brief processing
    setTimeout(() => {
      const improved = improveBullet(bulletText, targetRole || undefined);
      setResult(improved);
      setLoading(false);
    }, 300);
  };

  const handleClear = () => {
    setBulletText('');
    setResult(null);
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
          Resume Bullet Point Improver
        </h1>

        {/* Short explanation */}
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Improve your resume bullet points for clarity and impact. This tool rewrites without adding fake achievements or exaggerating your experience.
        </p>

        {/* Tool UI */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Your Resume Bullet
            </label>
            <textarea
              value={bulletText}
              onChange={(e) => setBulletText(e.target.value)}
              placeholder="e.g., Worked on building features for the company website..."
              className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Target Role <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager..."
              className="w-full h-10 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImprove}
              disabled={!bulletText.trim() || loading}
              className={`flex-1 h-11 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${bulletText.trim() && !loading
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Improving...
                </>
              ) : (
                'Improve Bullet'
              )}
            </button>
            {result && (
              <button
                onClick={handleClear}
                className="px-4 h-11 rounded-lg font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-4">
            {/* Original */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">Original</p>
              <p className="text-sm text-gray-600">{result.original}</p>
            </div>

            {/* Improved */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">Improved</p>
              <p className="text-sm text-gray-900 font-medium">{result.improved}</p>
            </div>

            {/* Changes Made */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">What was changed</p>
              <ul className="space-y-1">
                {result.changes.map((change, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>

            {/* Truth Notice */}
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> This tool only improves wording and clarity. It does not add numbers, achievements, or technologies not present in your original bullet.
              </p>
            </div>
          </div>
        )}

        {/* Supporting Content */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Writing Better Resume Bullets</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Strong resume bullets start with action verbs and clearly describe what you did,
              how you did it, and what impact it had. This tool helps improve your wording
              without changing the facts.
            </p>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Principles we follow:</h3>
              <ul className="list-disc list-inside space-y-1.5 text-gray-600">
                <li>Start with strong action verbs (Built, Led, Developed)</li>
                <li>Remove filler words and weak phrases</li>
                <li>Keep the same meaning and experience level</li>
                <li>Never add fake metrics or achievements</li>
                <li>Preserve your authentic voice</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">Example</p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Before:</strong> "Was responsible for working on the backend API"
              </p>
              <p className="text-sm text-gray-900">
                <strong>After:</strong> "Developed backend API services."
              </p>
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
                href="#/resume-section-checker"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FileText size={14} />
                <span>Resume Section Checker</span>
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
