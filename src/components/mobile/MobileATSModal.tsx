import React from 'react';

interface MobileATSModalProps {
  open: boolean;
  onClose: () => void;
  score: number | null;
  missingKeywords: string[];
}

const MAX_MISSING = 8;

export const MobileATSModal: React.FC<MobileATSModalProps> = ({
  open,
  onClose,
  score,
  missingKeywords,
}) => {
  if (!open) return null;

  const displayScore = score ?? 0;
  const missing = missingKeywords.slice(0, MAX_MISSING);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-ats-title"
    >
      <div className="bg-[#0F172A] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="mobile-ats-title" className="text-lg font-bold text-white">
              Keyword match
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-white">{displayScore}</span>
            <span className="text-slate-400">/ 100</span>
          </div>
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Missing keywords
              </p>
              <p className="text-sm text-slate-200">{missing.join(', ')}</p>
            </div>
          )}
          {missing.length === 0 && (
            <p className="text-sm text-slate-400">Add a job description to see how well your resume matches and get more callbacks.</p>
          )}
        </div>
      </div>
    </div>
  );
};
