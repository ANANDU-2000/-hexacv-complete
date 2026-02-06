/**
 * Role Analysis Panel Component
 * Shows factual keyword comparison - NO scores, NO predictions
 */

import React from 'react';
import { Target, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface RoleAnalysisPanelProps {
    targetRole: string;
    jdKeywords: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    atsScore?: number; // Deprecated - ignored
    roleCategory?: string;
    experienceLevel?: string;
}

export default function RoleAnalysisPanel({
    targetRole,
    jdKeywords,
    matchedKeywords,
    missingKeywords,
    roleCategory,
    experienceLevel
}: RoleAnalysisPanelProps) {
    if (!targetRole) {
        return null;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Target size={16} className="text-gray-600" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-900">Role Context</h4>
                    <p className="text-xs text-gray-500">Keyword comparison</p>
                </div>
            </div>

            {/* Target Role Info */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Target Role</span>
                    {roleCategory && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                            {roleCategory}
                        </span>
                    )}
                </div>
                <p className="text-sm font-medium text-gray-900">{targetRole}</p>
                {experienceLevel && (
                    <p className="text-xs text-gray-500 mt-1">Level: {experienceLevel}</p>
                )}
            </div>

            {/* Keyword Count - Factual only */}
            {jdKeywords.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Keywords from JD</span>
                        <span className="text-xs font-medium text-gray-900">
                            {matchedKeywords.length} of {jdKeywords.length} found
                        </span>
                    </div>
                </div>
            )}

            {/* Matched Keywords */}
            {matchedKeywords.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-600">
                            Found ({matchedKeywords.length})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {matchedKeywords.slice(0, 10).map((kw, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-medium"
                            >
                                {kw}
                            </span>
                        ))}
                        {matchedKeywords.length > 10 && (
                            <span className="px-2 py-0.5 text-gray-500 text-[10px]">
                                +{matchedKeywords.length - 10} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {missingKeywords.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-600">
                            Not found ({missingKeywords.length})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {missingKeywords.slice(0, 8).map((kw, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-500 text-[10px] rounded font-medium"
                            >
                                {kw}
                            </span>
                        ))}
                        {missingKeywords.length > 8 && (
                            <span className="px-2 py-0.5 text-gray-400 text-[10px]">
                                +{missingKeywords.length - 8} more
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                        Consider adding these if they match your experience
                    </p>
                </div>
            )}

            {/* No JD provided */}
            {jdKeywords.length === 0 && (
                <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-lg p-3">
                    <Info size={14} />
                    <span className="text-xs">Add a job description to compare keywords</span>
                </div>
            )}
        </div>
    );
}
