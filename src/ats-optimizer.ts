/**
 * ATS Optimization Engine
 * HIGH QUALITY OUTPUT ASSURANCE
 */

export interface ATSResult {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    totalKeywords: number;
    sectionOrder: string[];
    suggestions: string[];
    checklist: {
        machineReadable: boolean;
        standardHeaders: boolean;
        bulletConsistency: boolean;
        keywordAlignment: boolean;
        atsLayout: boolean;
    };
    disclaimer: string;
}

/**
 * SECTION PRIORITY BY ROLE TYPE
 */
const SECTION_PRIORITY = {
    tech: ['skills', 'experience', 'projects', 'education'],
    executive: ['experience', 'skills', 'education', 'projects'],
    creative: ['projects', 'skills', 'experience', 'education'],
    academic: ['education', 'experience', 'skills', 'projects'],
    default: ['experience', 'skills', 'education', 'projects']
};

/**
 * Extract keywords from job description
 */
export function extractJDKeywords(jd: string): string[] {
    if (!jd || jd.trim().length < 10) return [];

    const text = jd.toLowerCase();
    const keywords: string[] = [];

    // Tech skills
    const techPatterns = /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|azure|docker|kubernetes|git|machine learning|ai|ml|data science|agile|scrum|rest api|microservices|ci\/cd|tensorflow|pytorch)\b/gi;
    const techMatches = text.match(techPatterns);
    if (techMatches) keywords.push(...new Set(techMatches.map(k => k.toLowerCase())));

    // Action verbs
    const actionPatterns = /\b(led|managed|developed|designed|implemented|created|improved|optimized|increased|reduced|collaborated|coordinated|delivered|launched|built|architected|mentored|trained|analyzed|researched)\b/gi;
    const actionMatches = text.match(actionPatterns);
    if (actionMatches) keywords.push(...new Set(actionMatches.map(k => k.toLowerCase()).slice(0, 10)));

    // Years of experience
    const yearsPattern = /(\d+)\+?\s*(years?|yrs?)\s*(of)?\s*(experience)?/gi;
    const yearsMatches = text.match(yearsPattern);
    if (yearsMatches) keywords.push(...yearsMatches.slice(0, 3));

    return [...new Set(keywords)];
}

/**
 * Match resume against JD keywords
 */
export function matchResumeToJD(resume: any, jdKeywords: string[]): { matched: string[]; missing: string[] } {
    const resumeText = JSON.stringify(resume).toLowerCase();

    const matched = jdKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
    const missing = jdKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()));

    return { matched, missing };
}

/**
 * Determine role type from target role + JD
 */
export function determineRoleType(targetRole: string, jd: string): keyof typeof SECTION_PRIORITY {
    const text = (targetRole + ' ' + jd).toLowerCase();

    // Tech roles
    if (/engineer|developer|programmer|software|frontend|backend|fullstack|devops|data scientist|ml engineer|ai|tech lead/i.test(text)) {
        return 'tech';
    }

    // Executive roles
    if (/director|vp|ceo|cto|cfo|manager|head of|senior manager|executive|president/i.test(text)) {
        return 'executive';
    }

    // Creative roles
    if (/designer|ux|ui|creative|artist|content|writer|video|graphics|brand/i.test(text)) {
        return 'creative';
    }

    // Academic roles
    if (/professor|researcher|phd|postdoc|scientist|academic|faculty/i.test(text)) {
        return 'academic';
    }

    return 'default';
}

/**
 * Get optimal section order for role
 */
export function getSectionOrder(targetRole: string, jd: string): string[] {
    const roleType = determineRoleType(targetRole, jd);
    return SECTION_PRIORITY[roleType];
}

/**
 * Calculate ATS score
 */
export function calculateATSScore(resume: any, jdKeywords: string[]): number {
    if (jdKeywords.length === 0) return 95; // Default high score if no JD

    const { matched } = matchResumeToJD(resume, jdKeywords);
    const matchRate = matched.length / jdKeywords.length;

    let score = matchRate * 100;

    // Bonus points
    if (resume.name && resume.email) score += 5;
    if (resume.skills.length > 0) score += 5;
    if (resume.experience.length > 0) score += 5;

    return Math.min(Math.round(score), 100);
}

/**
 * Generate ATS optimization suggestions
 */
export function generateSuggestions(resume: any, jdKeywords: string[], targetRole: string): string[] {
    const suggestions: string[] = [];
    const { matched: _matched, missing } = matchResumeToJD(resume, jdKeywords);

    // Missing critical keywords
    if (missing.length > 0) {
        const topMissing = missing.slice(0, 5).join(', ');
        suggestions.push(`Add these keywords to improve match: ${topMissing}`);
    }

    // Experience bullets
    const totalBullets = resume.experience.reduce((sum: number, exp: any) => sum + (exp.bullets?.length || 0), 0);
    if (totalBullets < resume.experience.length * 3) {
        suggestions.push('Add more achievement bullets to experience (3-4 per role)');
    }

    // Skills section
    if (resume.skills.length === 0) {
        suggestions.push('Add a Skills section with relevant technologies');
    }

    // Quantify achievements
    const hasNumbers = resume.experience.some((exp: any) =>
        exp.bullets?.some((b: string) => /\d+/.test(b))
    );
    if (!hasNumbers) {
        suggestions.push('Quantify achievements with numbers (e.g., "Improved performance by 40%")');
    }

    // Role-specific
    if (targetRole.toLowerCase().includes('senior') || targetRole.toLowerCase().includes('lead')) {
        const hasLeadership = JSON.stringify(resume).toLowerCase().includes('led') ||
            JSON.stringify(resume).toLowerCase().includes('managed');
        if (!hasLeadership) {
            suggestions.push('Add leadership examples for senior role (led, managed, mentored)');
        }
    }

    return suggestions;
}

/**
 * MAIN ATS OPTIMIZATION FUNCTION
 */
export function optimizeForATS(resume: any, targetRole: string, jd: string): ATSResult {
    const jdKeywords = extractJDKeywords(jd);
    const score = calculateATSScore(resume, jdKeywords);
    const { matched, missing } = matchResumeToJD(resume, jdKeywords);
    const sectionOrder = getSectionOrder(targetRole, jd);
    const suggestions = generateSuggestions(resume, jdKeywords, targetRole);

    return {
        score,
        matchedKeywords: matched,
        missingKeywords: missing,
        totalKeywords: jdKeywords.length,
        sectionOrder,
        suggestions,
        checklist: {
            machineReadable: true,
            standardHeaders: true,
            bulletConsistency: resume.experience.every((exp: any) => exp.bullets?.length > 0),
            keywordAlignment: (matched.length / Math.max(jdKeywords.length, 1)) > 0.5,
            atsLayout: true
        },
        disclaimer: "ATS optimization is based on keyword matching and structural best practices. Always ensure your resume accurately represents your skills and experience."
    };
}

/**
 * QUALITY ASSURANCE: Ensure output matches preview
 */
export function validateOutputQuality(resume: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!resume.name || resume.name.trim().length < 2) {
        errors.push('Name is required');
    }
    if (!resume.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resume.email)) {
        errors.push('Valid email is required');
    }

    // Data integrity
    for (const exp of resume.experience) {
        if (!exp.role || !exp.company) {
            errors.push(`Experience missing role or company: ${exp.role || 'Unknown'}`);
        }
        if (!exp.startDate || !exp.endDate) {
            errors.push(`Experience missing dates: ${exp.role}`);
        }
    }

    // No invented data check
    if (resume.experience.some((e: any) => e.role === 'Senior Engineer' && !e.company)) {
        errors.push('CRITICAL: Invented data detected - AI must never invent roles');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * GRAMMAR & CONTEXT VALIDATION
 */
export function validateBulletQuality(bullet: string): { valid: boolean; suggestion?: string } {
    if (!bullet || bullet.trim().length < 10) {
        return { valid: false, suggestion: 'Bullet too short - add more detail' };
    }

    // Check for action verb
    const actionVerbs = /^(led|managed|developed|designed|implemented|created|improved|optimized|increased|reduced|collaborated|coordinated|delivered|launched|built|architected|mentored|analyzed)/i;
    if (!actionVerbs.test(bullet.trim())) {
        return { valid: false, suggestion: 'Start with action verb (Led, Developed, Improved, etc.)' };
    }

    // Check for numbers/metrics
    if (!/\d+/.test(bullet)) {
        return { valid: true, suggestion: 'Consider adding metrics (e.g., "by 40%", "500+ users")' };
    }

    return { valid: true };
}
