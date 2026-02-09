import React from 'react';

interface SectionWarning {
  section: string;
  present: boolean;
  warning?: string;
}

interface ATSScoreCardProps {
  score: number | null;
  structureOk: boolean;
  structureScore: number;
  missingKeywords: string[];
  sectionWarnings?: SectionWarning[];
  loading?: boolean;
  onKeywordClick?: (keyword: string) => void;
  /** When false, only structure + missing keywords (no title/score line). Used when card is inside a collapsible header. */
  showHeader?: boolean;
}

const MAX_MISSING = 12;

export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  score,
  structureOk,
  structureScore,
  missingKeywords,
  sectionWarnings = [],
  loading = false,
  onKeywordClick,
  showHeader = true,
}) => {
  const displayScore = score ?? 0;
  const missing = missingKeywords.slice(0, MAX_MISSING);
  const hasJD = score !== null;

  return (
    <div
      className={showHeader ? 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm sticky top-0 z-10' : ''}
      role="region"
      aria-label="ATS feedback"
    >
      {showHeader && <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ATS feedback</h3>}
      {loading ? (
        <p className="text-sm text-gray-500">Updating…</p>
      ) : (
        <>
          {showHeader && (
            <>
              <p className="text-sm text-gray-700 mb-1">
                {hasJD ? 'ATS feedback based on your job description.' : 'ATS feedback available once you add a job description.'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {structureOk ? 'Core sections look good for ATS.' : `Sections: ${structureScore}% — consider completing contact, summary, and experience.`}
              </p>
            </>
          )}

          {sectionWarnings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Structure</p>
              <ul className="text-sm space-y-0.5">
                {sectionWarnings.map((s) => (
                  <li key={s.section} className={s.present ? 'text-green-700' : 'text-amber-700'}>
                    {s.present ? '✓' : '⚠'} {s.section}
                    {!s.present && s.warning && <span className="text-gray-500"> — {s.warning}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missing.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {missing.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => onKeywordClick?.(kw)}
                    className="px-2 py-1 text-xs font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
