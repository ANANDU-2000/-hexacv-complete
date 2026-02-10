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

export function checkResumeStructure(text: string): SectionCheckResult {
    const lower = text.toLowerCase();
    const sections: { name: string; keywords: string[]; present?: (t: string) => boolean }[] = [
        { name: 'Contact Information', keywords: ['email', 'phone', 'address', 'linkedin', 'github'], present: hasContactInfo },
        { name: 'Professional Summary', keywords: ['summary', 'profile', 'objective', 'about'] },
        { name: 'Experience', keywords: ['experience', 'work history', 'employment', 'roles'] },
        { name: 'Education', keywords: ['education', 'university', 'college', 'degree', 'certification'] },
        { name: 'Skills', keywords: ['skills', 'technologies', 'technical', 'tools'] },
        { name: 'Projects', keywords: ['projects', 'portfolio'] }
    ];

    const results = sections.map(s => {
        const present = s.present ? s.present(lower) : s.keywords.some(k => lower.includes(k));
        return {
            section: s.name,
            present,
            warning: present ? undefined : `Missing ${s.name} section or keywords.`
        };
    });

    const presentCount = results.filter(r => r.present).length;
    const score = Math.round((presentCount / sections.length) * 100);

    const warnings: string[] = results.filter(r => !r.present).map(r => r.warning || '');
    const suggestions: string[] = [];
    if (score < 100) suggestions.push('Try adding missing sections to improve ATS parsing.');

    return {
        sections: results,
        score,
        warnings,
        suggestions
    };
}
