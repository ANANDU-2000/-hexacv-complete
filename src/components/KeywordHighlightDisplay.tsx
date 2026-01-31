/**
 * Keyword Highlight Display Component
 * Shows JD-matched keywords visually below text fields
 */

import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface KeywordHighlightDisplayProps {
    found: string[];
    missing: string[];
    compact?: boolean;
}

export default function KeywordHighlightDisplay({ found, missing, compact = false }: KeywordHighlightDisplayProps) {
    if (found.length === 0 && missing.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-2 ${compact ? 'mt-1' : 'mt-3'}`}>
            {/* Matched Keywords */}
            {found.length > 0 && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-2 md:p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />
                        <span className={`${compact ? 'text-[9px]' : 'text-xs'} font-semibold text-green-300`}>
                            {found.length} JD Keyword{found.length !== 1 ? 's' : ''} Matched
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {found.slice(0, compact ? 5 : 10).map((kw, idx) => (
                            <span
                                key={idx}
                                className={`${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'} bg-green-400/20 text-green-200 rounded border border-green-400/30 font-medium`}
                            >
                                {kw}
                            </span>
                        ))}
                        {found.length > (compact ? 5 : 10) && (
                            <span className={`${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'} text-green-300`}>
                                +{found.length - (compact ? 5 : 10)} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {missing.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-2 md:p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
                        <span className={`${compact ? 'text-[9px]' : 'text-xs'} font-semibold text-amber-300`}>
                            {missing.length} Keyword{missing.length !== 1 ? 's' : ''} Missing from Resume
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {missing.slice(0, compact ? 5 : 10).map((kw, idx) => (
                            <span
                                key={idx}
                                className={`${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'} bg-amber-400/20 text-amber-200 rounded border border-amber-400/30 font-medium`}
                            >
                                {kw}
                            </span>
                        ))}
                        {missing.length > (compact ? 5 : 10) && (
                            <span className={`${compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'} text-amber-300`}>
                                +{missing.length - (compact ? 5 : 10)} more
                            </span>
                        )}
                    </div>
                    <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-amber-300/80 mt-1`}>
                        💡 Consider adding these keywords to improve ATS match score
                    </p>
                </div>
            )}
        </div>
    );
}
