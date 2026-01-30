/**
 * Enterprise Validation Service
 * REAL production-level validation rules - NO fake checks
 */

export interface ValidationResult {
    valid: boolean;
    message: string;
    type: 'error' | 'warning' | 'suggestion';
}

export interface FieldValidation {
    field: string;
    results: ValidationResult[];
    isValid: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ACTION VERBS - For bullet point validation
// ═══════════════════════════════════════════════════════════════
const ACTION_VERBS = [
    'achieved', 'administered', 'analyzed', 'architected', 'automated',
    'built', 'collaborated', 'conducted', 'configured', 'created',
    'delivered', 'deployed', 'designed', 'developed', 'drove',
    'enabled', 'engineered', 'enhanced', 'established', 'executed',
    'facilitated', 'formulated', 'generated', 'grew', 'guided',
    'headed', 'implemented', 'improved', 'increased', 'initiated',
    'integrated', 'launched', 'led', 'maintained', 'managed',
    'mentored', 'migrated', 'modernized', 'monitored', 'negotiated',
    'optimized', 'orchestrated', 'organized', 'oversaw', 'partnered',
    'pioneered', 'planned', 'presented', 'produced', 'programmed',
    'reduced', 'refactored', 'redesigned', 'resolved', 'restructured',
    'scaled', 'secured', 'simplified', 'spearheaded', 'standardized',
    'streamlined', 'strengthened', 'supervised', 'supported', 'trained',
    'transformed', 'unified', 'upgraded', 'utilized', 'wrote'
];

// ═══════════════════════════════════════════════════════════════
// TECH KEYWORDS - Common tools and technologies
// ═══════════════════════════════════════════════════════════════
const TECH_KEYWORDS = [
    'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
    'node', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
    'redis', 'kafka', 'rabbitmq', 'git', 'ci/cd', 'jenkins', 'terraform',
    'graphql', 'rest', 'api', 'microservices', 'agile', 'scrum', 'jira',
    'machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy'
];

// ═══════════════════════════════════════════════════════════════
// 1. TARGET ROLE VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateTargetRole(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        results.push({
            valid: false,
            message: 'Target role is required. This helps tailor your resume.',
            type: 'error'
        });
        return { field: 'targetRole', results, isValid: false };
    }

    if (trimmed.length < 3) {
        results.push({
            valid: false,
            message: 'Too short to be a real job title. Example: "Software Engineer"',
            type: 'error'
        });
    }

    if (trimmed.length > 60) {
        results.push({
            valid: false,
            message: 'Too long for a professional title. Keep it concise.',
            type: 'error'
        });
    }

    if (/\d/.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Job title should not contain numbers.',
            type: 'error'
        });
    }

    if (/[^\w\s\-\/]/.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Avoid special characters in job title.',
            type: 'warning'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    
    if (isValid && trimmed.length >= 3) {
        results.push({
            valid: true,
            message: 'Good job title format.',
            type: 'suggestion'
        });
    }

    return { field: 'targetRole', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// 2. JOB DESCRIPTION VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateJobDescription(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    // JD is optional
    if (!trimmed) {
        results.push({
            valid: true,
            message: 'Paste a job description to get keyword matching and tailored suggestions.',
            type: 'suggestion'
        });
        return { field: 'jobDescription', results, isValid: true };
    }

    if (trimmed.length < 80) {
        results.push({
            valid: false,
            message: 'This seems too short. Paste the complete job description for better matching.',
            type: 'warning'
        });
    }

    if (trimmed.length > 5000) {
        results.push({
            valid: false,
            message: 'Job description is too long. Paste only the relevant sections.',
            type: 'warning'
        });
    }

    // Check if it looks like a real JD
    const jdSignals = [
        /responsib(le|ilities)/i,
        /require(d|ments)/i,
        /experience/i,
        /skills/i,
        /qualifications/i,
        /years/i
    ];

    const matchedSignals = jdSignals.filter(pattern => pattern.test(trimmed)).length;

    if (trimmed.length >= 80 && matchedSignals < 2) {
        results.push({
            valid: false,
            message: 'This does not look like a job description. Please paste the actual JD text.',
            type: 'warning'
        });
    }

    // Extract tech keywords for feedback
    const foundTech = TECH_KEYWORDS.filter(tech => 
        trimmed.toLowerCase().includes(tech.toLowerCase())
    );

    if (foundTech.length > 0) {
        results.push({
            valid: true,
            message: `Found ${foundTech.length} technical keywords. We'll match these against your resume.`,
            type: 'suggestion'
        });
    }

    const hasErrors = results.filter(r => r.type === 'error').length > 0;
    return { field: 'jobDescription', results, isValid: !hasErrors };
}

// ═══════════════════════════════════════════════════════════════
// 3. FULL NAME VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateFullName(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        results.push({
            valid: false,
            message: 'Full name is required.',
            type: 'error'
        });
        return { field: 'fullName', results, isValid: false };
    }

    if (trimmed.length < 2) {
        results.push({
            valid: false,
            message: 'Name is too short.',
            type: 'error'
        });
    }

    if (trimmed.length > 50) {
        results.push({
            valid: false,
            message: 'Name is too long. Use your professional name.',
            type: 'error'
        });
    }

    if (/\d/.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Name cannot contain numbers.',
            type: 'error'
        });
    }

    if (/[^a-zA-Z\s\.\-']/.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Name contains invalid characters.',
            type: 'error'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    return { field: 'fullName', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// 4. EMAIL VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateEmail(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        results.push({
            valid: false,
            message: 'Email is required for recruiters to contact you.',
            type: 'error'
        });
        return { field: 'email', results, isValid: false };
    }

    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Enter a valid email address.',
            type: 'error'
        });
    }

    // Check for professional email
    const unprofessionalPatterns = ['69', '420', 'sexy', 'hot', 'cool'];
    if (unprofessionalPatterns.some(p => trimmed.toLowerCase().includes(p))) {
        results.push({
            valid: true,
            message: 'Consider using a more professional email address.',
            type: 'suggestion'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    return { field: 'email', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// 5. PHONE VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validatePhone(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    // Phone is optional
    if (!trimmed) {
        return { field: 'phone', results: [], isValid: true };
    }

    // Remove common formatting characters
    const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '');

    if (!/^\d+$/.test(digitsOnly)) {
        results.push({
            valid: false,
            message: 'Phone should contain only numbers.',
            type: 'error'
        });
    }

    if (digitsOnly.length < 10) {
        results.push({
            valid: false,
            message: 'Phone number is too short.',
            type: 'error'
        });
    }

    if (digitsOnly.length > 15) {
        results.push({
            valid: false,
            message: 'Phone number is too long.',
            type: 'error'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    return { field: 'phone', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// 6. SUMMARY / PROFILE VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateSummary(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        results.push({
            valid: true,
            message: 'A summary helps recruiters quickly understand your profile.',
            type: 'suggestion'
        });
        return { field: 'summary', results, isValid: true };
    }

    if (trimmed.length < 60) {
        results.push({
            valid: false,
            message: 'Summary is too short. Add 2-3 sentences about your expertise.',
            type: 'warning'
        });
    }

    if (trimmed.length > 400) {
        results.push({
            valid: false,
            message: 'Summary is too long. Recruiters prefer concise summaries (2-4 lines).',
            type: 'warning'
        });
    }

    // Check for generic phrases
    const genericPhrases = [
        'hard working',
        'team player',
        'fast learner',
        'passionate about',
        'seeking opportunity'
    ];

    const foundGeneric = genericPhrases.filter(phrase => 
        trimmed.toLowerCase().includes(phrase)
    );

    if (foundGeneric.length > 0) {
        results.push({
            valid: true,
            message: `Avoid generic phrases like "${foundGeneric[0]}". Focus on specific skills and achievements.`,
            type: 'suggestion'
        });
    }

    // Check for URLs
    if (/https?:\/\//.test(trimmed)) {
        results.push({
            valid: false,
            message: 'Avoid URLs in summary. Put links in contact section.',
            type: 'warning'
        });
    }

    const hasErrors = results.filter(r => r.type === 'error').length > 0;
    return { field: 'summary', results, isValid: !hasErrors };
}

// ═══════════════════════════════════════════════════════════════
// 7. EXPERIENCE BULLET VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateBullet(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        return { field: 'bullet', results: [], isValid: true };
    }

    // Length check
    if (trimmed.length < 10) {
        results.push({
            valid: false,
            message: 'Bullet is too short. Add more detail.',
            type: 'error'
        });
    }

    if (trimmed.length > 180) {
        results.push({
            valid: false,
            message: 'Bullet is too long. Break into multiple points or shorten.',
            type: 'warning'
        });
    }

    // Action verb check
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    const startsWithAction = ACTION_VERBS.some(verb => 
        firstWord === verb || firstWord === verb + 'd' || firstWord === verb + 'ed'
    );

    if (!startsWithAction) {
        results.push({
            valid: true,
            message: `Start with an action verb (e.g., "Developed", "Built", "Led") for stronger impact.`,
            type: 'suggestion'
        });
    }

    // Metric/quantification check
    const hasMetric = /\d+%|\d+x|\$\d+|\d+\s*(users|customers|clients|projects|teams|people|members)/i.test(trimmed);
    
    if (!hasMetric && trimmed.length > 30) {
        results.push({
            valid: true,
            message: 'Add numbers or metrics to show impact (e.g., "increased by 30%", "serving 10k users").',
            type: 'suggestion'
        });
    }

    // Check for weak phrases
    const weakPhrases = ['responsible for', 'helped with', 'worked on', 'assisted'];
    const foundWeak = weakPhrases.find(phrase => trimmed.toLowerCase().includes(phrase));
    
    if (foundWeak) {
        results.push({
            valid: true,
            message: `Replace "${foundWeak}" with a specific action and outcome.`,
            type: 'suggestion'
        });
    }

    const hasErrors = results.filter(r => r.type === 'error').length > 0;
    return { field: 'bullet', results, isValid: !hasErrors };
}

// ═══════════════════════════════════════════════════════════════
// 8. COMPANY NAME VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateCompanyName(value: string): FieldValidation {
    const results: ValidationResult[] = [];
    const trimmed = value?.trim() || '';

    if (!trimmed) {
        results.push({
            valid: false,
            message: 'Company name is required.',
            type: 'error'
        });
        return { field: 'companyName', results, isValid: false };
    }

    if (trimmed.length < 2) {
        results.push({
            valid: false,
            message: 'Company name is too short.',
            type: 'error'
        });
    }

    if (trimmed.length > 80) {
        results.push({
            valid: false,
            message: 'Company name is too long.',
            type: 'error'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    return { field: 'companyName', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// 9. SKILLS VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateSkills(skills: string[]): FieldValidation {
    const results: ValidationResult[] = [];
    const uniqueSkills = [...new Set(skills.map(s => s.toLowerCase().trim()))];

    if (uniqueSkills.length < 5) {
        results.push({
            valid: false,
            message: `Add at least 5 skills. You have ${uniqueSkills.length}.`,
            type: 'warning'
        });
    }

    if (uniqueSkills.length > 25) {
        results.push({
            valid: false,
            message: 'Too many skills. Focus on 15-20 most relevant ones.',
            type: 'warning'
        });
    }

    // Check for duplicates
    if (skills.length !== uniqueSkills.length) {
        results.push({
            valid: true,
            message: 'Remove duplicate skills.',
            type: 'suggestion'
        });
    }

    // Check individual skill length
    const invalidSkills = skills.filter(s => s.trim().length < 2 || s.trim().length > 30);
    if (invalidSkills.length > 0) {
        results.push({
            valid: false,
            message: 'Some skills are too short or too long.',
            type: 'warning'
        });
    }

    const hasErrors = results.filter(r => r.type === 'error').length > 0;
    return { field: 'skills', results, isValid: !hasErrors };
}

// ═══════════════════════════════════════════════════════════════
// 10. DATE VALIDATION
// ═══════════════════════════════════════════════════════════════
export function validateDateRange(startDate: string, endDate: string): FieldValidation {
    const results: ValidationResult[] = [];

    if (!startDate) {
        results.push({
            valid: false,
            message: 'Start date is required.',
            type: 'error'
        });
    }

    if (!endDate) {
        results.push({
            valid: false,
            message: 'End date is required (or "Present").',
            type: 'error'
        });
    }

    // Parse dates
    const parseDate = (dateStr: string): Date | null => {
        if (dateStr.toLowerCase() === 'present') return new Date();
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (start && end && start > end) {
        results.push({
            valid: false,
            message: 'Start date cannot be after end date.',
            type: 'error'
        });
    }

    // Check for future start dates
    if (start && start > new Date()) {
        results.push({
            valid: false,
            message: 'Start date cannot be in the future.',
            type: 'error'
        });
    }

    const isValid = results.filter(r => r.type === 'error').length === 0;
    return { field: 'dateRange', results, isValid };
}

// ═══════════════════════════════════════════════════════════════
// FULL RESUME VALIDATION
// ═══════════════════════════════════════════════════════════════
export interface ResumeValidationResult {
    isValid: boolean;
    completeness: number; // 0-100
    fields: Record<string, FieldValidation>;
    summary: {
        errors: number;
        warnings: number;
        suggestions: number;
    };
}

export function validateResume(data: any): ResumeValidationResult {
    const fields: Record<string, FieldValidation> = {};
    
    // Validate each field
    fields.targetRole = validateTargetRole(data.basics?.targetRole || '');
    fields.fullName = validateFullName(data.basics?.fullName || '');
    fields.email = validateEmail(data.basics?.email || '');
    fields.phone = validatePhone(data.basics?.phone || '');
    fields.summary = validateSummary(data.summary || '');
    fields.jobDescription = validateJobDescription(data.jobDescription || '');
    fields.skills = validateSkills(data.skills || []);

    // Validate experience bullets
    let bulletErrors = 0;
    (data.experience || []).forEach((exp: any, expIdx: number) => {
        (exp.highlights || []).forEach((bullet: string, bulletIdx: number) => {
            const bulletValidation = validateBullet(bullet);
            fields[`experience_${expIdx}_bullet_${bulletIdx}`] = bulletValidation;
            if (!bulletValidation.isValid) bulletErrors++;
        });
        
        fields[`experience_${expIdx}_company`] = validateCompanyName(exp.company || '');
        fields[`experience_${expIdx}_position`] = validateTargetRole(exp.position || '');
        fields[`experience_${expIdx}_dates`] = validateDateRange(exp.startDate || '', exp.endDate || '');
    });

    // Calculate summary
    let errors = 0, warnings = 0, suggestions = 0;
    Object.values(fields).forEach(field => {
        field.results.forEach(result => {
            if (result.type === 'error') errors++;
            else if (result.type === 'warning') warnings++;
            else if (result.type === 'suggestion') suggestions++;
        });
    });

    // Calculate completeness
    const requiredFields = ['fullName', 'email', 'targetRole'];
    const optionalFields = ['phone', 'summary', 'skills'];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;

    requiredFields.forEach(f => {
        if (fields[f]?.isValid) completed++;
    });
    optionalFields.forEach(f => {
        if (fields[f]?.isValid && fields[f]?.results.length > 0) completed++;
    });

    // Add experience completeness
    if (data.experience?.length > 0) {
        completed++;
        total++;
    }

    const completeness = Math.round((completed / total) * 100);

    return {
        isValid: errors === 0,
        completeness,
        fields,
        summary: { errors, warnings, suggestions }
    };
}

export { ACTION_VERBS, TECH_KEYWORDS };
