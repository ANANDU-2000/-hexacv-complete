/**
 * Keyword Match Panel
 * 
 * Displays keyword matching results for Template 2 (Premium):
 * - Overall match score card
 * - Color-coded keyword legend
 * - List of matched/missing keywords
 */

import React from 'react';

export interface KeywordMatchData {
  exactMatches: string[];
  semanticMatches: Array<{ original: string; matched: string }>;
  inferredSkills: string[];
  missingKeywords: string[];
  matchScore: number;
  totalKeywords: number;
}

interface KeywordMatchPanelProps {
  data: KeywordMatchData;
  compact?: boolean;
}

export const KeywordMatchPanel: React.FC<KeywordMatchPanelProps> = ({ data, compact = false }) => {
  const { exactMatches, semanticMatches, inferredSkills, missingKeywords, matchScore, totalKeywords } = data;
  
  const matchedCount = exactMatches.length + semanticMatches.length;
  
  // Determine score color
  const getScoreColor = () => {
    if (matchScore >= 80) return { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400', label: 'Excellent' };
    if (matchScore >= 60) return { bg: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Good' };
    if (matchScore >= 40) return { bg: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30', text: 'text-orange-400', label: 'Needs Work' };
    return { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', text: 'text-red-400', label: 'Low Match' };
  };
  
  const scoreStyle = getScoreColor();

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${scoreStyle.bg} border ${scoreStyle.border}`}>
        <span className={`text-lg font-black ${scoreStyle.text}`}>{matchScore}%</span>
        <span className="text-xs text-slate-400">keyword match</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div className={`bg-gradient-to-br ${scoreStyle.bg} border ${scoreStyle.border} rounded-xl p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Keyword Match Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${scoreStyle.text}`}>{matchScore}%</span>
              <span className="text-sm text-slate-400">({matchedCount}/{totalKeywords} keywords)</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${scoreStyle.bg} border ${scoreStyle.border}`}>
            <span className={`text-xs font-bold ${scoreStyle.text} uppercase`}>{scoreStyle.label}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${
              matchScore >= 80 ? 'from-green-500 to-emerald-400' :
              matchScore >= 60 ? 'from-yellow-500 to-amber-400' :
              matchScore >= 40 ? 'from-orange-500 to-amber-500' :
              'from-red-500 to-rose-400'
            } transition-all duration-500`}
            style={{ width: `${matchScore}%` }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Highlighting Legend</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-300">Exact Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-300">Semantic Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-slate-300">Inferred Skill</span>
          </div>
        </div>
      </div>

      {/* Keyword Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Keywords */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Found in Resume ({matchedCount})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {exactMatches.map((kw, i) => (
              <span key={`exact-${i}`} className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded border border-green-500/30">
                ✓ {kw}
              </span>
            ))}
            {semanticMatches.map((match, i) => (
              <span key={`semantic-${i}`} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-500/30" title={`Matched as: ${match.matched}`}>
                ≈ {match.original}
              </span>
            ))}
            {inferredSkills.slice(0, 5).map((skill, i) => (
              <span key={`inferred-${i}`} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded border border-blue-500/30">
                ⚡ {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Missing Keywords ({missingKeywords.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.slice(0, 10).map((kw, i) => (
              <span key={`missing-${i}`} className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded border border-red-500/30">
                ✗ {kw}
              </span>
            ))}
            {missingKeywords.length > 10 && (
              <span className="px-2 py-1 bg-slate-700 text-slate-400 text-[10px] font-bold rounded">
                +{missingKeywords.length - 10} more
              </span>
            )}
          </div>
          {missingKeywords.length > 0 && (
            <p className="mt-3 text-[10px] text-slate-500 italic">
              Tip: Consider adding these keywords to improve your ATS score
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline keyword highlighter component
 * Wraps text with appropriate highlight classes
 */
export const HighlightedText: React.FC<{
  text: string;
  exactKeywords: string[];
  semanticKeywords: string[];
  inferredKeywords: string[];
}> = ({ text, exactKeywords, semanticKeywords, inferredKeywords }) => {
  // Build regex patterns for each type
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Combine all keywords with their types
  const allKeywords: Array<{ keyword: string; type: 'exact' | 'semantic' | 'inferred' }> = [
    ...exactKeywords.map(kw => ({ keyword: kw, type: 'exact' as const })),
    ...semanticKeywords.map(kw => ({ keyword: kw, type: 'semantic' as const })),
    ...inferredKeywords.map(kw => ({ keyword: kw, type: 'inferred' as const }))
  ];
  
  if (allKeywords.length === 0) {
    return <>{text}</>;
  }
  
  // Sort by length (longest first) to avoid partial matches
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);
  
  // Create combined regex
  const pattern = new RegExp(
    `\\b(${allKeywords.map(k => escapeRegex(k.keyword)).join('|')})\\b`,
    'gi'
  );
  
  // Find keyword type for a match
  const getKeywordType = (match: string): 'exact' | 'semantic' | 'inferred' => {
    const found = allKeywords.find(k => k.keyword.toLowerCase() === match.toLowerCase());
    return found?.type || 'exact';
  };
  
  // Split text and highlight
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add highlighted match
    const matchedText = match[0];
    const type = getKeywordType(matchedText);
    const className = type === 'exact' ? 'keyword-exact' :
                      type === 'semantic' ? 'keyword-semantic' :
                      'keyword-inferred';
    
    parts.push(
      <span key={match.index} className={className}>
        {matchedText}
      </span>
    );
    
    lastIndex = pattern.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return <>{parts}</>;
};

export default KeywordMatchPanel;
