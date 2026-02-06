/**
 * Keyword Highlighter Utility
 * Highlights JD-matched keywords in resume text
 */

export interface HighlightedText {
    text: string;
    isKeyword: boolean;
    keyword?: string;
}

/**
 * Highlight keywords in text
 */
export function highlightKeywords(text: string, keywords: string[]): HighlightedText[] {
    if (!text || !keywords.length) {
        return [{ text, isKeyword: false }];
    }

    const lowerText = text.toLowerCase();
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    // Find all keyword positions
    const matches: Array<{ start: number; end: number; keyword: string }> = [];
    
    lowerKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        while ((match = regex.exec(lowerText)) !== null) {
            matches.push({
                start: match.index,
                end: match.index + match[0].length,
                keyword: text.substring(match.index, match.index + match[0].length)
            });
        }
    });

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    // Merge overlapping matches
    const merged: typeof matches = [];
    matches.forEach(match => {
        const last = merged[merged.length - 1];
        if (!last || match.start > last.end) {
            merged.push(match);
        } else {
            last.end = Math.max(last.end, match.end);
            last.keyword = text.substring(last.start, last.end);
        }
    });

    // Build highlighted segments
    const segments: HighlightedText[] = [];
    let lastIndex = 0;

    merged.forEach(match => {
        // Add text before match
        if (match.start > lastIndex) {
            segments.push({
                text: text.substring(lastIndex, match.start),
                isKeyword: false
            });
        }

        // Add highlighted keyword
        segments.push({
            text: match.keyword,
            isKeyword: true,
            keyword: match.keyword
        });

        lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
        segments.push({
            text: text.substring(lastIndex),
            isKeyword: false
        });
    }

    return segments.length > 0 ? segments : [{ text, isKeyword: false }];
}

/**
 * Render highlighted text as HTML string
 */
export function renderHighlightedTextAsHtml(segments: HighlightedText[]): string {
    return segments.map((segment, index) => {
        if (segment.isKeyword) {
            return `<span 
                    className="bg-yellow-400/40 text-yellow-100 font-semibold px-0.5 rounded-sm"
                    title="JD Keyword: ${segment.keyword}"
                >
                    ${segment.text}
                </span>`;
        }
        return `<span>${segment.text}</span>`;
    }).join('');
}

/**
 * Get highlighted HTML string (for non-React contexts)
 */
export function getHighlightedHTML(text: string, keywords: string[]): string {
    const segments = highlightKeywords(text, keywords);
    return segments.map(segment => {
        if (segment.isKeyword) {
            return `<mark class="bg-yellow-400/40 text-yellow-100 font-semibold px-0.5 rounded-sm" title="JD Keyword: ${segment.keyword}">${segment.text}</mark>`;
        }
        return segment.text;
    }).join('');
}
