/**
 * KEYWORD MATCH COMPONENT
 * 
 * Shows factual keyword comparison between resume and JD
 * NO scores, NO percentages, NO hype language
 * 
 * Output ONLY:
 * - Matched keywords (list)
 * - Missing keywords (list)
 * - Total keywords compared (number)
 */

import React from 'react';
import { Check, X, Info } from 'lucide-react';

interface KeywordMatchProps {
    resumeText: string;
    jdKeywords: string[];
    compact?: boolean;
    showMissing?: boolean;
}

// Synonym normalization map for better matching
const SYNONYMS: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'machine learning': ['ml', 'machine-learning'],
    'artificial intelligence': ['ai'],
    'react': ['reactjs', 'react.js'],
    'node': ['nodejs', 'node.js'],
    'angular': ['angularjs', 'angular.js'],
    'vue': ['vuejs', 'vue.js'],
    'next': ['nextjs', 'next.js'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'kubernetes': ['k8s'],
    'amazon web services': ['aws'],
    'google cloud platform': ['gcp'],
    'microsoft azure': ['azure'],
    'continuous integration': ['ci', 'ci/cd'],
    'continuous deployment': ['cd', 'ci/cd'],
    'natural language processing': ['nlp'],
    'computer vision': ['cv'],
    'large language model': ['llm'],
    'retrieval augmented generation': ['rag'],
};

/**
 * Normalize a keyword for comparison
 */
function normalizeKeyword(keyword: string): string {
    return keyword
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ');
}

/**
 * Check if two keywords match (including synonyms)
 */
function keywordsMatch(keyword1: string, keyword2: string): boolean {
    const norm1 = normalizeKeyword(keyword1);
    const norm2 = normalizeKeyword(keyword2);
    
    // Direct match
    if (norm1 === norm2) return true;
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    
    // Check synonyms
    for (const [canonical, synonyms] of Object.entries(SYNONYMS)) {
        const allVariants = [canonical, ...synonyms].map(normalizeKeyword);
        if (allVariants.includes(norm1) && allVariants.includes(norm2)) {
            return true;
        }
        if (allVariants.some(v => norm1.includes(v)) && allVariants.some(v => norm2.includes(v))) {
            return true;
        }
    }
    
    return false;
}

/**
 * Compare resume text against JD keywords
 * Returns matched and missing keywords (NO score)
 */
export function compareKeywords(
    resumeText: string,
    jdKeywords: string[]
): { matched: string[]; missing: string[]; total: number } {
    if (!jdKeywords.length || !resumeText.trim()) {
        return { matched: [], missing: [], total: 0 };
    }

    const resumeNorm = normalizeKeyword(resumeText);
    const matched: string[] = [];
    const missing: string[] = [];
    
    // Deduplicate keywords
    const uniqueKeywords = [...new Set(jdKeywords.map(k => k.trim()).filter(k => k))];

    uniqueKeywords.forEach(keyword => {
        const keywordNorm = normalizeKeyword(keyword);
        
        // Check if keyword or any synonym exists in resume
        let found = false;
        
        // Direct check
        if (resumeNorm.includes(keywordNorm)) {
            found = true;
        }
        
        // Word boundary check
        const regex = new RegExp(`\\b${keywordNorm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        if (regex.test(resumeNorm)) {
            found = true;
        }
        
        // Synonym check
        for (const [canonical, synonyms] of Object.entries(SYNONYMS)) {
            const allVariants = [canonical, ...synonyms].map(normalizeKeyword);
            if (allVariants.some(v => keywordNorm.includes(v) || v.includes(keywordNorm))) {
                // This keyword has synonyms - check all of them
                if (allVariants.some(v => resumeNorm.includes(v))) {
                    found = true;
                    break;
                }
            }
        }
        
        if (found) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    return {
        matched,
        missing,
        total: uniqueKeywords.length
    };
}

/**
 * Keyword Match Display Component
 * Factual, neutral, no hype
 */
export default function KeywordMatch({ 
    resumeText, 
    jdKeywords, 
    compact = false,
    showMissing = true 
}: KeywordMatchProps) {
    const { matched, missing, total } = compareKeywords(resumeText, jdKeywords);
    
    // No JD provided
    if (jdKeywords.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500">
                    <Info size={14} />
                    <span className="text-xs">Add a job description to see keyword comparison</span>
                </div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xs text-gray-600">
                    {matched.length} of {total} keywords found
                </span>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            {/* Header - Factual count only */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">Keyword Comparison</h4>
                <span className="text-xs text-gray-500">
                    {matched.length} of {total} found
                </span>
            </div>

            {/* Matched Keywords */}
            {matched.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <Check size={12} />
                        <span>Found in resume ({matched.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {matched.slice(0, 12).map((keyword, i) => (
                            <span 
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-700"
                            >
                                {keyword}
                            </span>
                        ))}
                        {matched.length > 12 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">
                                +{matched.length - 12} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Missing Keywords */}
            {showMissing && missing.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                        <X size={12} />
                        <span>Not found ({missing.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {missing.slice(0, 8).map((keyword, i) => (
                            <span 
                                key={i}
                                className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500"
                            >
                                {keyword}
                            </span>
                        ))}
                        {missing.length > 8 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">
                                +{missing.length - 8} more
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">
                        Consider adding these if they match your experience
                    </p>
                </div>
            )}

            {matched.length === 0 && (
                <p className="text-xs text-gray-500">
                    No matching keywords found. Review the job description for relevant terms.
                </p>
            )}
        </div>
    );
}

// Remove the old badge export - not needed
