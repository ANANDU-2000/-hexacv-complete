/**
 * React Keyword Highlighter Utility
 * Contains React components for highlighting JD-matched keywords
 */

import React from 'react';
import { HighlightedText } from './keywordHighlighter';

/**
 * Render highlighted text as React elements
 */
export function renderHighlightedText(segments: HighlightedText[]): React.ReactNode[] {
    return segments.map((segment, index) => {
        if (segment.isKeyword) {
            return (
                <span
                    key={index}
                    className="bg-yellow-400/40 text-yellow-100 font-semibold px-0.5 rounded-sm"
                    title={`JD Keyword: ${segment.keyword}`}
                >
                    {segment.text}
                </span>
            );
        }
        return <span key={index}>{segment.text}</span>;
    });
}