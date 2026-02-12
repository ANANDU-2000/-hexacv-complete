import { ExtractedKeywords } from './extractKeywords';

export interface JDAnalysis {
    roleType: string;
    seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'unknown';
    coreSkills: string[];
    niceToHave: string[];
    senioritySignals: string[];
    responsibilities: string[];
}

export function analyzeJobDescription(text: string): JDAnalysis {
    // Simplified analysis logic
    let roleType = 'General';
    if (/frontend|front-end|react|angular|vue|ui/i.test(text)) roleType = 'Frontend Developer';
    else if (/backend|back-end|api|server/i.test(text)) roleType = 'Backend Developer';
    else if (/full.?stack|fullstack/i.test(text)) roleType = 'Full Stack Developer';
    else if (/data\s*scientist|ml\s*engineer/i.test(text)) roleType = 'ML/AI Engineer';
    else if (/product\s*manager|pm\b/i.test(text)) roleType = 'Product Manager';

    let seniorityLevel: JDAnalysis['seniorityLevel'] = 'unknown';
    if (/\bsenior\b|\bsr\.?\b|\bstaff\b/i.test(text)) seniorityLevel = 'senior';
    else if (/\blead\b|\bmanager\b|\bdirector\b/i.test(text)) seniorityLevel = 'lead';
    else if (/\bjunior\b|\bentry\b|\bintern\b/i.test(text)) seniorityLevel = 'entry';
    else if (/\b[3-5]\+?\s*years?\b/i.test(text)) seniorityLevel = 'mid';

    // Simplified logic for signals and responsibilities
    const senioritySignals = [];
    if (seniorityLevel === 'senior') senioritySignals.push('Senior role keywords found');
    if (seniorityLevel === 'lead') senioritySignals.push('Leadership keywords found');

    const responsibilities: string[] = []; // Placeholder

    return {
        roleType,
        seniorityLevel,
        coreSkills: [],
        niceToHave: [],
        senioritySignals,
        responsibilities
    };
}

export interface KeywordMatch {
    keyword: string;
    found: boolean;
    category: string;
}

export interface ATSScoreResult {
    score: number;
    matched: KeywordMatch[];
    missing: KeywordMatch[];
    found?: KeywordMatch[]; // For compatibility
    overused: string[];
    totalKeywords: number;
    suggestions?: string[];
}

export function scoreATS(resumeText: string, jdKeywords: ExtractedKeywords): ATSScoreResult {
    const lowerResume = resumeText.toLowerCase();
    const matched: KeywordMatch[] = [];
    const missing: KeywordMatch[] = [];

    const check = (keyword: string, category: string) => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const isFound = regex.test(lowerResume);
        const match = { keyword, found: isFound, category };
        if (isFound) matched.push(match);
        else missing.push(match);
    };

    jdKeywords.skills.forEach(k => check(k, 'skill'));
    jdKeywords.tools.forEach(k => check(k, 'tool'));
    jdKeywords.technologies.forEach(k => check(k, 'tech'));
    jdKeywords.softSkills.forEach(k => check(k, 'soft'));
    jdKeywords.roleKeywords.forEach(k => check(k, 'role'));
    jdKeywords.businessTerms.forEach(k => check(k, 'business'));

    const total = matched.length + missing.length;
    const score = total > 0 ? Math.round((matched.length / total) * 100) : 0;

    return {
        score,
        matched,
        missing,
        found: matched, // Alias for backward compatibility if needed
        overused: [], // Placeholder for overused words
        totalKeywords: total
    };
}

export interface SectionCheckResult {
    sections: { section: string; present: boolean; warning?: string }[];
    score: number;
    warnings: string[];
    suggestions: string[];
}

/** Contact info is present if we see section labels OR actual data (email @, phone digits). */
function hasContactInfo(lower: string): boolean {
    const hasLabel = ['email', 'phone', 'address', 'linkedin', 'github'].some(k => lower.includes(k));
    if (hasLabel) return true;
    if (/@/.test(lower)) return true; // has email
    if (/[\d+\s\-()]{7,}/.test(lower) || /\+\d{1,4}[\s\d\-]+/.test(lower)) return true; // phone-like
    return false;
}

// Helper to count occurrences
function countMatches(text: string, regex: RegExp): number {
    return (text.match(regex) || []).length;
}

export function checkResumeStructure(text: string): SectionCheckResult {
    const lower = text.toLowerCase();
    const suggestions: string[] = [];
    let score = 0;

    // 1. Section Presence (40 points)
    const sections: { name: string; keywords: string[]; points: number; present?: (t: string) => boolean }[] = [
        { name: 'Contact Information', keywords: [], points: 5, present: hasContactInfo },
        { name: 'Professional Summary', keywords: ['summary', 'profile', 'objective', 'about me'], points: 5 },
        { name: 'Experience', keywords: ['experience', 'work history', 'employment', 'roles'], points: 10 },
        { name: 'Education', keywords: ['education', 'university', 'college', 'degree', 'certification'], points: 10 },
        { name: 'Skills', keywords: ['skills', 'technologies', 'technical', 'tools'], points: 5 },
        { name: 'Projects', keywords: ['projects', 'portfolio'], points: 5 }
    ];

    const results = sections.map(s => {
        const isPresent = s.present
            ? s.present(lower)
            : s.keywords.some(k => new RegExp(`\\b${k}\\b`, 'i').test(lower)); // Use regex for stricter word boundary match

        if (isPresent) score += s.points;
        return {
            section: s.name,
            present: isPresent,
            warning: isPresent ? undefined : `Missing ${s.name} section.`
        };
    });

    // 2. Content Quality (60 points)

    // A. Contact Details (10 points)
    // We already checked presence, but let's be stricter about valid email/phone
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/.test(text);
    if (hasEmail) score += 5; else suggestions.push('Resume likely missing a valid email address.');
    if (hasPhone) score += 5; else suggestions.push('Resume likely missing a phone number.');

    // B. Experience Content (Dates) (10 points)
    // Check for years like 20xx or 19xx, or months
    const dateCount = countMatches(text, /\b(20\d{2}|19\d{2}|present|current)\b/gi);
    if (dateCount >= 2) score += 10;
    else suggestions.push('Could not detect clear dates in Experience section. Use standard formats (e.g., "Jan 2023 - Present").');

    // C. Action Verbs (10 points)
    const actionVerbs = [
        'managed', 'created', 'developed', 'led', 'designed', 'implemented', 'orchestrated',
        'engineered', 'built', 'analyzed', 'optimized', 'reduced', 'increased', 'generated',
        'initiated', 'launched', 'delivered', 'collaborated', 'spearheaded', 'resolved'
    ];
    const verbCount = actionVerbs.reduce((acc, verb) => acc + (lower.includes(verb) ? 1 : 0), 0);
    if (verbCount >= 5) score += 10;
    else if (verbCount >= 2) score += 5;
    else suggestions.push(`Found only ${verbCount} strong action verbs. Use words like "Developed", "Optimized", "Led".`);

    // D. Quantifiable Results (10 points)
    // Look for %, $, numbers associated with improvements
    const metricsCount = countMatches(text, /(\d+%|\$\d+|\d+\s*\+?)/g);
    if (metricsCount >= 3) score += 10;
    else if (metricsCount >= 1) score += 5;
    else suggestions.push('Add quantifiable metrics (e.g., "Increased sales by 20%", "Reduced load time by 2s").');

    // E. Formatting / Bullet Points (10 points)
    // Check for common bullet characters
    const bulletCount = countMatches(text, /[\•\-\*]\s/g);
    if (bulletCount >= 5) score += 10;
    else suggestions.push('Use bullet points to display experience and skills for better readability.');

    // F. Skill Density (10 points)
    // We assume the caller might have extracted keywords, but we can do a quick check here too or rely on the caller.
    // Since we don't have the extracted keywords passed in here easily without changing signature, let's do a rough check.
    // Actually, let's simply check for a reasonable length of text in the "Skills" area if we could, 
    // but simpler is to check for common tech terms if it's a tech resume, or just length.
    // For now, let's assume if "Skills" section is present, we give 5 points, and add 5 more if we find common separators like commas or pipes
    if (results.find(r => r.section === 'Skills')?.present) {
        if ((text.match(/,/g) || []).length > 5 || (text.match(/\|/g) || []).length > 2) {
            score += 10; // Good list structure
        } else {
            score += 5; // Section exists but maybe sparse
            suggestions.push('Ensure your Skills section lists specific tools and technologies.');
        }
    }

    const warnings: string[] = results.filter(r => !r.present).map(r => r.warning || '');

    // Cap score at 100 just in case
    score = Math.min(100, score);

    return {
        sections: results, // Map back to original simple structure if needed
        score,
        warnings,
        suggestions
    };
}
