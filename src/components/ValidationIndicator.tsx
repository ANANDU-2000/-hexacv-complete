/**
 * Inline Validation UI Component
 * Shows helpful feedback as users type
 */

import React from 'react';
import { ValidationResult, FieldValidation } from '../validation-service';

interface ValidationIndicatorProps {
    validation: FieldValidation | null;
    showWhenValid?: boolean;
    compact?: boolean;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
    validation,
    showWhenValid = false,
    compact = false
}) => {
    if (!validation) return null;

    const { results, isValid } = validation;

    // Don't show anything if valid and showWhenValid is false
    if (isValid && !showWhenValid && results.length === 0) return null;

    const errors = results.filter(r => r.type === 'error');
    const warnings = results.filter(r => r.type === 'warning');
    const suggestions = results.filter(r => r.type === 'suggestion');

    if (compact) {
        // Compact mode: just show icon and first message
        const firstResult = errors[0] || warnings[0] || suggestions[0];
        if (!firstResult) return null;

        return (
            <div className={`flex items-center gap-1.5 mt-1 text-xs ${
                firstResult.type === 'error' ? 'text-red-600' :
                firstResult.type === 'warning' ? 'text-amber-600' :
                'text-slate-500'
            }`}>
                {firstResult.type === 'error' && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                )}
                {firstResult.type === 'warning' && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
                {firstResult.type === 'suggestion' && isValid && (
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )}
                <span className="truncate">{firstResult.message}</span>
            </div>
        );
    }

    // Full mode: show all messages
    return (
        <div className="mt-2 space-y-1">
            {errors.map((result, idx) => (
                <ValidationMessage key={`error-${idx}`} result={result} />
            ))}
            {warnings.map((result, idx) => (
                <ValidationMessage key={`warning-${idx}`} result={result} />
            ))}
            {showWhenValid && suggestions.map((result, idx) => (
                <ValidationMessage key={`suggestion-${idx}`} result={result} />
            ))}
        </div>
    );
};

interface ValidationMessageProps {
    result: ValidationResult;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ result }) => {
    const bgColor = result.type === 'error' ? 'bg-red-50 border-red-200' :
                    result.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-slate-50 border-slate-200';
    
    const textColor = result.type === 'error' ? 'text-red-700' :
                      result.type === 'warning' ? 'text-amber-700' :
                      'text-slate-600';

    const iconColor = result.type === 'error' ? 'text-red-500' :
                      result.type === 'warning' ? 'text-amber-500' :
                      'text-slate-400';

    return (
        <div className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${bgColor} ${textColor}`}>
            <div className={`mt-0.5 ${iconColor}`}>
                {result.type === 'error' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                )}
                {result.type === 'warning' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
                {result.type === 'suggestion' && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span className="text-xs leading-relaxed">{result.message}</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// FIELD GUIDANCE COMPONENT
// ═══════════════════════════════════════════════════════════════

interface FieldGuidanceProps {
    field: string;
    show?: boolean;
}

const FIELD_GUIDANCE: Record<string, { title: string; tip: string }> = {
    targetRole: {
        title: 'Why this matters',
        tip: 'Recruiters filter by job title. Using the exact title from the job posting helps your resume get seen.'
    },
    jobDescription: {
        title: 'How we use this',
        tip: 'We compare your resume against the JD to show which keywords match and which are missing. No fake scores.'
    },
    fullName: {
        title: 'Best practice',
        tip: 'Use your professional name. This appears at the top of your resume.'
    },
    email: {
        title: 'Recruiter contact',
        tip: 'This is how recruiters will reach you. Use a professional email address.'
    },
    summary: {
        title: 'First impression',
        tip: 'Recruiters spend 6-7 seconds on initial scan. A strong summary captures attention immediately.'
    },
    experience: {
        title: 'Impact focus',
        tip: 'Start bullets with action verbs. Quantify results when possible (e.g., "Increased sales by 30%").'
    },
    skills: {
        title: 'Keyword matching',
        tip: 'Include tools and technologies you actually use. These get matched against job requirements.'
    },
    projects: {
        title: 'Show your work',
        tip: 'For recent graduates, projects can demonstrate skills when work experience is limited.'
    }
};

export const FieldGuidance: React.FC<FieldGuidanceProps> = ({ field, show = true }) => {
    const guidance = FIELD_GUIDANCE[field];
    if (!guidance || !show) return null;

    return (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                    <div className="text-xs font-semibold text-blue-800">{guidance.title}</div>
                    <div className="text-xs text-blue-700 mt-0.5">{guidance.tip}</div>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ATS COMPARISON DISPLAY
// ═══════════════════════════════════════════════════════════════

interface ATSComparisonDisplayProps {
    matchedKeywords: string[];
    missingKeywords: { keyword: string; suggestion: string }[];
    weakAreas: { area: string; issue: string; fix: string }[];
    hasJD: boolean;
}

export const ATSComparisonDisplay: React.FC<ATSComparisonDisplayProps> = ({
    matchedKeywords,
    missingKeywords,
    weakAreas,
    hasJD
}) => {
    if (!hasJD) {
        return (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">Paste a job description to see keyword matching</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    We'll compare your resume against the JD and show exactly which keywords match and which are missing.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Matched Keywords */}
            {matchedKeywords.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Matched Keywords ({matchedKeywords.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {matchedKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {missingKeywords.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Missing Keywords ({missingKeywords.length})
                    </div>
                    <div className="space-y-2">
                        {missingKeywords.slice(0, 5).map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                                    {item.keyword}
                                </span>
                                <span className="text-xs text-amber-600 flex-1">{item.suggestion}</span>
                            </div>
                        ))}
                        {missingKeywords.length > 5 && (
                            <div className="text-xs text-amber-600">
                                +{missingKeywords.length - 5} more missing keywords
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Weak Areas */}
            {weakAreas.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Areas to Improve
                    </div>
                    <div className="space-y-3">
                        {weakAreas.map((area, i) => (
                            <div key={i} className="border-l-2 border-slate-300 pl-3">
                                <div className="text-xs font-semibold text-slate-700">{area.area}</div>
                                <div className="text-xs text-slate-600">{area.issue}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    <span className="font-medium">Fix:</span> {area.fix}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Honest disclaimer */}
            <div className="text-[10px] text-slate-400 text-center">
                This analysis is based on keyword matching and resume best practices. 
                It does not guarantee hiring outcomes.
            </div>
        </div>
    );
};

export default ValidationIndicator;
