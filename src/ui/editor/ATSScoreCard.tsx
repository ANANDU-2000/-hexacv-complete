import React from 'react';

interface ATSScoreCardProps {
  score: number | null;
  structureOk: boolean;
  structureScore: number;
  missingKeywords: string[];
  loading?: boolean;
}

const MAX_MISSING = 8;

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  score,
  structureOk,
  structureScore,
  missingKeywords,
  loading = false,
}) => {
  const displayScore = score ?? 0;
  const missing = missingKeywords.slice(0, MAX_MISSING);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-0 z-10"
      role="region"
      aria-label="ATS feedback"
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ATS feedback</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Updating…</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{displayScore}</span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {structureOk ? 'Structure OK' : `Add contact and summary. Sections: ${structureScore}%`}
          </p>
          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Missing keywords</p>
              <p className="text-sm text-gray-700">{missing.join(', ')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
