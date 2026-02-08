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
          ? `Current: ${atsScoreBefore} / 100`
          : 'Add a job description in the editor to see your score.'}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Premium rewrite improves bullets and keyword alignment for better ATS results.
      </p>
      {!isPaidUnlocked && (
        <button
          type="button"
          onClick={onUnlockClick}
          className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
        >
          Unlock Premium ATS Rewrite — ₹49 one time
        </button>
      )}
      {isPaidUnlocked && (
        <p className="text-sm text-green-700 font-medium">Premium unlocked. You can download.</p>
      )}
    </div>
  );
};
