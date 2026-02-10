import React from 'react';

interface OptimizationPanelProps {
  atsScoreBefore: number | null;
  isPaidUnlocked: boolean;
  onUnlockClick: () => void;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  atsScoreBefore,
  isPaidUnlocked,
  onUnlockClick,
}) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      role="region"
      aria-label="Optimization"
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        ATS score
      </h3>
      <p className="text-sm text-gray-700 mb-4">
        {atsScoreBefore != null
          ? (atsScoreBefore >= 100 ? 'Keyword match strong — good for callbacks.' : `Keyword match: ${atsScoreBefore} / 100. Improve to get more callbacks.`)
          : 'Add a job description to see how well your resume matches.'}
      </p>
      {!isPaidUnlocked && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Match your bullets to the job description keywords. One-time.
          </p>
          <button
            type="button"
            onClick={onUnlockClick}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
          >
            Pay ₹49 & get keyword-matched wording
          </button>
        </>
      )}
      {isPaidUnlocked && (
        <p className="text-sm text-green-700 font-medium">Unlocked. Download your PDF when ready.</p>
      )}
    </div>
  );
};
