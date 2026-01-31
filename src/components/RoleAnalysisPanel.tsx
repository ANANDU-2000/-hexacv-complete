/**
 * Role Analysis Panel Component
 * Shows detailed role analysis and keyword matching insights
 */

import React from 'react';
import { Target, TrendingUp, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface RoleAnalysisPanelProps {
    targetRole: string;
    jdKeywords: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    atsScore: number;
    roleCategory?: string;
    experienceLevel?: string;
}

export default function RoleAnalysisPanel({
    targetRole,
    jdKeywords,
    matchedKeywords,
    missingKeywords,
    atsScore,
    roleCategory,
    experienceLevel
}: RoleAnalysisPanelProps) {
    if (!targetRole) {
        return null;
    }

    const matchPercentage = jdKeywords.length > 0 
        ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
        : 0;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-400/30';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30';
        return 'bg-red-500/20 border-red-400/30';
    };

    return (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 md:p-5 space-y-4 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Target size={16} className="text-blue-400" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Role Analysis</h4>
                    <p className="text-xs text-slate-400">ATS Optimization Insights</p>
                </div>
            </div>

            {/* Target Role Info */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Target Role</span>
                    {roleCategory && (
                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                            {roleCategory}
                        </span>
                    )}
                </div>
                <p className="text-sm font-semibold text-white">{targetRole}</p>
                {experienceLevel && (
                    <p className="text-xs text-slate-400 mt-1">Level: {experienceLevel}</p>
                )}
            </div>

            {/* ATS Score */}
            <div className={`${getScoreBg(atsScore)} border rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-white" />
                        <span className="text-xs font-semibold text-white">ATS Match Score</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(atsScore)}`}>
                        {atsScore}%
                    </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            atsScore >= 80 ? 'bg-green-400' :
                            atsScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${atsScore}%` }}
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    {atsScore >= 80 ? '✅ Excellent match - high shortlist probability' :
                     atsScore >= 60 ? '⚠️ Good match - consider adding more keywords' :
                     '❌ Low match - add missing keywords to improve'}
                </p>
            </div>

            {/* Keyword Matching Stats */}
            {jdKeywords.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-xs font-semibold text-white">Keyword Matching</span>
                    </div>

                    {/* Matched Keywords */}
                    {matchedKeywords.length > 0 && (
                        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={12} className="text-green-400" />
                                <span className="text-xs font-semibold text-green-300">
                                    {matchedKeywords.length} / {jdKeywords.length} Keywords Matched ({matchPercentage}%)
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {matchedKeywords.slice(0, 8).map((kw, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-green-400/20 text-green-200 text-[10px] rounded border border-green-400/30 font-medium"
                                    >
                                        {kw} ✓
                                    </span>
                                ))}
                                {matchedKeywords.length > 8 && (
                                    <span className="px-2 py-0.5 text-green-300 text-[10px]">
                                        +{matchedKeywords.length - 8} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Missing Keywords */}
                    {missingKeywords.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle size={12} className="text-amber-400" />
                                <span className="text-xs font-semibold text-amber-300">
                                    {missingKeywords.length} Keywords Missing
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {missingKeywords.slice(0, 8).map((kw, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 bg-amber-400/20 text-amber-200 text-[10px] rounded border border-amber-400/30 font-medium"
                                    >
                                        {kw}
                                    </span>
                                ))}
                                {missingKeywords.length > 8 && (
                                    <span className="px-2 py-0.5 text-amber-300 text-[10px]">
                                        +{missingKeywords.length - 8} more
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-amber-300/80 mt-2">
                                💡 Add these keywords to your resume to improve ATS match score
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <Sparkles size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-300 mb-1">Recommendations</p>
                        <ul className="space-y-1 text-[10px] text-blue-200/80">
                            {atsScore < 60 && (
                                <li>• Add missing keywords from JD to your experience bullets</li>
                            )}
                            {atsScore < 80 && (
                                <li>• Use JD keywords naturally in your summary</li>
                            )}
                            <li>• Ensure skills section includes all technical keywords</li>
                            <li>• Use action verbs and metrics in experience descriptions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
