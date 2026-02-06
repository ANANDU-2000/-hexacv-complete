/**
 * Premium Comparison Modal
 * 
 * Shows side-by-side comparison of Free vs Premium AI Rewrite template
 * with example transformations and feature comparison table.
 */

import React from 'react';

interface PremiumComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFree: () => void;
  onSelectPremium: () => void;
  price?: string;
}

// Example bullet transformations
const EXAMPLE_TRANSFORMATIONS = [
  {
    free: "Worked on React projects and helped the team",
    premium: "Led development of 3 React-based web applications, improving team velocity by 25% through implementation of reusable component library and CI/CD best practices"
  },
  {
    free: "Responsible for database management",
    premium: "Architected and optimized PostgreSQL database schema, reducing query latency by 40% and supporting 50K+ daily transactions"
  },
  {
    free: "Helped with customer support",
    premium: "Resolved 200+ customer inquiries monthly with 98% satisfaction rate, implementing ticket automation that reduced response time by 60%"
  }
];

// Feature comparison data
const FEATURE_COMPARISON = [
  { feature: "ATS-safe format", free: true, premium: true },
  { feature: "Keyword insertion", free: true, premium: true },
  { feature: "Grammar & spelling fix", free: true, premium: true },
  { feature: "Full AI sentence rewrite", free: false, premium: true },
  { feature: "Quantified impact metrics", free: false, premium: true },
  { feature: "Industry-specific keywords", free: false, premium: true },
  { feature: "Achievement optimization", free: false, premium: true },
  { feature: "Action verb enhancement", free: false, premium: true },
  { feature: "Skill inference from context", free: false, premium: true },
  { feature: "Color-coded keyword matching", free: false, premium: true }
];

export const PremiumComparisonModal: React.FC<PremiumComparisonModalProps> = ({
  isOpen,
  onClose,
  onSelectFree,
  onSelectPremium,
  price = "₹49"
}) => {
  const [activeExample, setActiveExample] = React.useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-black text-white">Free Template vs AI-Rewrite Template</h2>
            <p className="text-sm text-slate-400 mt-1">See the difference AI can make to your resume</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Example Transformation Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-black text-purple-400 uppercase tracking-wider">Live Example</h3>
            </div>
            
            {/* Example Tabs */}
            <div className="flex gap-2 mb-4">
              {EXAMPLE_TRANSFORMATIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveExample(idx)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeExample === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Example {idx + 1}
                </button>
              ))}
            </div>

            {/* Split Screen Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Version */}
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] font-black rounded uppercase">Free</span>
                  <span className="text-xs text-slate-500">Basic formatting only</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {EXAMPLE_TRANSFORMATIONS[activeExample].free}
                </p>
              </div>

              {/* Premium Version */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-black rounded uppercase">Premium AI</span>
                  <span className="text-xs text-purple-300">Full AI optimization</span>
                </div>
                <p className="text-sm text-white leading-relaxed font-medium">
                  {EXAMPLE_TRANSFORMATIONS[activeExample].premium}
                </p>
                {/* Highlighted keywords */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30">+metrics</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">+impact</span>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/30">+keywords</span>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">Feature Comparison</h3>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Free</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-purple-400 uppercase tracking-wider w-24">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_COMPARISON.map((row, idx) => (
                    <tr key={idx} className={idx < FEATURE_COMPARISON.length - 1 ? 'border-b border-slate-700/50' : ''}>
                      <td className="px-4 py-2.5 text-sm text-slate-300">{row.feature}</td>
                      <td className="text-center px-4 py-2.5">
                        {row.free ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-slate-600">✗</span>
                        )}
                      </td>
                      <td className="text-center px-4 py-2.5">
                        {row.premium ? (
                          <span className="text-green-400 font-bold">✓</span>
                        ) : (
                          <span className="text-slate-600">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-2xl font-black text-green-400">+40%</p>
              <p className="text-xs text-slate-400 mt-1">ATS Score Boost</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-2xl font-black text-blue-400">3x</p>
              <p className="text-xs text-slate-400 mt-1">More Interview Calls</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-2xl font-black text-purple-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Recruiter Optimized</p>
            </div>
          </section>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={onSelectPremium}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Premium - {price}
            </button>
            <button
              onClick={onSelectFree}
              className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border border-slate-600"
            >
              Stay with Free
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Instant Access
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              No Recurring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumComparisonModal;
