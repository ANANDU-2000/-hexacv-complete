/**
 * KEYWORD MATCH SCORE COMPONENT
 * 
 * Shows users how well their resume matches the JD keywords
 * This is a key value proposition visualization
 * 
 * Features:
 * - Match percentage score
 * - Matched keywords (green)
 * - Missing keywords (red) - opportunity to improve
 * - Visual progress ring
 */

import React from 'react';
import { Check, X, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface KeywordMatchScoreProps {
    resumeText: string;
    jdKeywords: string[];
    compact?: boolean;
    showMissing?: boolean;
}

export function calculateKeywordMatch(
    resumeText: string,
    jdKeywords: string[]
): { score: number; matched: string[]; missing: string[] } {
    if (!jdKeywords.length) {
        return { score: 100, matched: [], missing: [] };
    }

    const resumeLower = resumeText.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    jdKeywords.forEach(keyword => {
        // Check for the keyword with word boundaries
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(resumeLower) || resumeLower.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = Math.round((matched.length / jdKeywords.length) * 100);
    
    return { score, matched, missing };
}

export default function KeywordMatchScore({ 
    resumeText, 
    jdKeywords, 
    compact = false,
    showMissing = true 
}: KeywordMatchScoreProps) {
    const { score, matched, missing } = calculateKeywordMatch(resumeText, jdKeywords);
    
    // No JD provided
    if (jdKeywords.length === 0) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3 text-slate-500">
                    <AlertTriangle size={18} />
                    <span className="text-sm font-medium">No job description provided - add one for keyword matching</span>
                </div>
            </div>
        );
    }

    const getScoreColor = () => {
        if (score >= 70) return 'text-emerald-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-500';
    };

    const getScoreBg = () => {
        if (score >= 70) return 'bg-emerald-50 border-emerald-200';
        if (score >= 50) return 'bg-amber-50 border-amber-200';
        return 'bg-red-50 border-red-200';
    };

    const getScoreLabel = () => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 70) return 'Good Match';
        if (score >= 50) return 'Fair Match';
        return 'Needs Improvement';
    };

    if (compact) {
        return (
            <div className={`${getScoreBg()} border rounded-lg px-3 py-2 flex items-center gap-2`}>
                <div className={`text-lg font-black ${getScoreColor()}`}>{score}%</div>
                <div className="text-xs text-slate-600">
                    {matched.length}/{jdKeywords.length} keywords
                </div>
            </div>
        );
    }

    return (
        <div className={`${getScoreBg()} border rounded-2xl p-5 space-y-4`}>
            {/* Header with Score */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <Zap size={20} className={getScoreColor()} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">JD Keyword Match</h4>
                        <p className="text-xs text-slate-500">{getScoreLabel()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-black ${getScoreColor()}`}>{score}%</div>
                    <div className="text-xs text-slate-500">{matched.length} of {jdKeywords.length}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                        score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Matched Keywords */}
            {matched.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                        <Check size={14} />
                        Matched Keywords ({matched.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {matched.slice(0, 10).map((keyword, i) => (
                            <span 
                                key={i}
                                className="px-2 py-1 bg-white border border-emerald-200 rounded text-xs font-medium text-emerald-700"
                            >
                                {keyword}
                            </span>
                        ))}
                        {matched.length > 10 && (
                            <span className="px-2 py-1 text-xs text-emerald-600">
                                +{matched.length - 10} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {showMissing && missing.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600 text-xs font-bold">
                        <X size={14} />
                        Missing Keywords ({missing.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {missing.slice(0, 8).map((keyword, i) => (
                            <span 
                                key={i}
                                className="px-2 py-1 bg-white border border-red-200 rounded text-xs font-medium text-red-600"
                            >
                                {keyword}
                            </span>
                        ))}
                        {missing.length > 8 && (
                            <span className="px-2 py-1 text-xs text-red-500">
                                +{missing.length - 8} more
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Tip: Add these skills/keywords if you have relevant experience
                    </p>
                </div>
            )}

            {/* Improvement CTA for paid template */}
            {score < 80 && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                    <TrendingUp size={18} className="text-blue-600" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">AI-Enhanced Template can improve this</p>
                        <p className="text-xs text-slate-500">Naturally incorporates relevant keywords</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Inline keyword match badge for template cards
 */
export function KeywordMatchBadge({ score }: { score: number }) {
    const getColor = () => {
        if (score >= 70) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (score >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${getColor()}`}>
            <Zap size={12} />
            {score}% Match
        </div>
    );
}
