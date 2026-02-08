import { ResumeData } from '../types';
import { extractKeywordsFromJD } from '../ats/extractKeywords';

function escapeHTML(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function boldKeywords(text: string, keywords: string[]): string {
    if (!text || !keywords || keywords.length === 0) return escapeHTML(text);
    let result = escapeHTML(text);
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    sortedKeywords.forEach(keyword => {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b(${escapedKeyword})\\b`, 'gi');
        result = result.replace(regex, '<strong>$1</strong>');
    });
    return result;
}

export async function populateTemplate(templateName: string, data: ResumeData): Promise<string> {
    const templateUrl = `/templates/${templateName}.html?t=${Date.now()}`;

    try {
        const response = await fetch(templateUrl);
        if (!response.ok) throw new Error(`Failed to fetch template: ${response.status}`);

        let html = await response.text();

        const jobDescription = data.jobDescription || ''; // Assuming generic field or passed via data
        const extracted = extractKeywordsFromJD(jobDescription);
        const keywords = extracted.allKeywords;

        const basics = (data.basics || {}) as any;
        const replacements: Record<string, string> = {
            '{{FULL_NAME}}': escapeHTML(basics.fullName || 'Your Name'),
            '{{JOB_TITLE}}': escapeHTML(basics.targetRole || 'Professional'),
            '{{EMAIL}}': escapeHTML(basics.email || ''),
            '{{PHONE}}': escapeHTML(basics.phone || ''),
            '{{SUMMARY}}': boldKeywords(data.summary || '', keywords),
            // ... Add other mappings as per original template-engine.ts
            // Simplified for brevity, need full port if using original HTMLs
        };

        for (const [placeholder, value] of Object.entries(replacements)) {
            const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            html = html.replace(new RegExp(escapedPlaceholder, 'g'), value);
        }

        return html;
    } catch (e) {
        console.error("Template population failed", e);
        throw e;
    }
}
