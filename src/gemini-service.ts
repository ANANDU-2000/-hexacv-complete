/**
 * Gemini AI Service for Resume Parsing
 * Uses Google Generative AI for intelligent extraction and understanding
 */

// API Configuration - FREE TIER APIs
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// API Status tracking
let geminiAvailable = true;
let groqAvailable = true;
let lastGeminiError = 0;
let lastGroqError = 0;
const ERROR_COOLDOWN = 60000; // 1 minute cooldown after error

// Types
export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    profile: string;
    skills: { category: string; items: string[] }[];
    experience: {
        role: string;
        company: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        year: string;
    }[];
    projects: {
        name: string;
        description: string;
        tech: string[];
        startDate?: string;
        endDate?: string;
    }[];
}

export interface ExtractionResult {
    resume: ParsedResume;
    confidence: number;
    extractedFields: string[];
    missingFields: string[];
}

export interface JDMatchResult {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    roleAlignment: number;
    suggestions: string[];
}

/**
 * Clean and normalize extracted text from PDF
 */
function cleanPDFText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/(\d)([A-Za-z])/g, '$1 $2')
        .replace(/([A-Za-z])(\d)/g, '$1 $2')
        .replace(/  +/g, ' ')
        .trim();
}

/**
 * Fast parsing with Groq (Llama 3.3 70B) - 2x faster than Gemini
 */
async function parseWithGroq(cleanedText: string): Promise<ExtractionResult | null> {
    const prompt = `Extract resume data as JSON. CRITICAL: COPY 100% OF TEXT VERBATIM - NEVER SUMMARIZE.

RESUME:
${cleanedText.slice(0, 12000)}

Return JSON:
{"name":"","email":"","phone":"","linkedin":"","github":"","profile":"COPY COMPLETE SUMMARY - EVERY SINGLE SENTENCE","skills":[{"category":"","items":[]}],"experience":[{"role":"","company":"","startDate":"","endDate":"","bullets":["COPY ALL BULLETS EXACTLY - MINIMUM 5 PER JOB"]}],"education":[{"degree":"","institution":"","year":""}],"projects":[{"name":"","description":"","tech":[]}]}

MANDATORY RULES:
1. COPY every word of summary - if 100 words, output 100 words
2. COPY ALL bullet points - if 8 bullets, output 8 bullets
3. NEVER shorten, summarize, or paraphrase
4. Use "Present" for current jobs
5. Return valid JSON only.`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 8000
        })
    });

    if (!response.ok) {
        console.error('Groq API error:', response.status);
        return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = validateParsedResume(parsed);

    const extractedFields: string[] = [];
    const missingFields: string[] = [];

    if (validated.name) extractedFields.push('Name'); else missingFields.push('Name');
    if (validated.email) extractedFields.push('Email'); else missingFields.push('Email');
    if (validated.phone) extractedFields.push('Phone'); else missingFields.push('Phone');
    if (validated.linkedin) extractedFields.push('LinkedIn');
    if (validated.github) extractedFields.push('GitHub');
    if (validated.profile) extractedFields.push('Profile');
    if (validated.skills.length > 0) extractedFields.push('Skills'); else missingFields.push('Skills');
    if (validated.experience.length > 0) extractedFields.push('Experience'); else missingFields.push('Experience');
    if (validated.education.length > 0) extractedFields.push('Education'); else missingFields.push('Education');
    if (validated.projects.length > 0) extractedFields.push('Projects');

    const confidence = (extractedFields.length / (extractedFields.length + missingFields.length)) * 100;

    return {
        resume: validated,
        confidence: Math.round(confidence),
        extractedFields,
        missingFields
    };
}

/**
 * Extract structured resume data using Gemini AI
 */
export async function parseResumeWithAI(rawText: string): Promise<ExtractionResult> {
    const cleanedText = cleanPDFText(rawText);

    // Try Groq first (faster), then Gemini, then fallback
    const now = Date.now();

    // Reset availability after cooldown
    if (!groqAvailable && (now - lastGroqError) >= ERROR_COOLDOWN) groqAvailable = true;
    if (!geminiAvailable && (now - lastGeminiError) >= ERROR_COOLDOWN) geminiAvailable = true;

    // Try Groq first (2x faster than Gemini)
    if (groqAvailable) {
        try {
            const result = await parseWithGroq(cleanedText);
            if (result) return result;
        } catch (e) {
            console.log('Groq failed, trying Gemini...');
            groqAvailable = false;
            lastGroqError = Date.now();
        }
    }

    // Fallback to Gemini
    if (!geminiAvailable && (now - lastGeminiError) < ERROR_COOLDOWN) {
        console.log('All APIs unavailable, using fallback');
        return fallbackParse(cleanedText);
    }

    // Reset Gemini after cooldown
    if (!geminiAvailable && (now - lastGeminiError) >= ERROR_COOLDOWN) {
        geminiAvailable = true;
    }

    const prompt = `You are a VERBATIM resume extraction engine. COPY ALL TEXT EXACTLY AS WRITTEN.

RESUME TEXT:
${cleanedText.slice(0, 20000)}

Extract and return JSON. CRITICAL: DO NOT SUMMARIZE OR SHORTEN ANY TEXT.

{
    "name": "Full name",
    "email": "Email address",
    "phone": "Phone number",
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL",
    "profile": "COPY ENTIRE PROFESSIONAL SUMMARY VERBATIM - EVERY SENTENCE, EVERY WORD",
    "skills": [
        {"category": "Category name", "items": ["ALL skills listed"]}
    ],
    "experience": [
        {
            "role": "Job title",
            "company": "Company name",
            "startDate": "MM/YYYY or YYYY",
            "endDate": "MM/YYYY or YYYY or Present",
            "bullets": ["COPY EVERY BULLET EXACTLY - DO NOT SHORTEN OR PARAPHRASE"]
        }
    ],
    "education": [
        {
            "degree": "Degree",
            "institution": "University",
            "year": "Year"
        }
    ],
    "projects": [
        {
            "name": "Name",
            "description": "COPY FULL DESCRIPTION VERBATIM",
            "tech": ["ALL technologies"],
            "startDate": "Date",
            "endDate": "Date"
        }
    ]
}

MANDATORY RULES:
1. VERBATIM EXTRACTION: Copy profile/summary exactly as written - do NOT shorten, summarize, or rephrase
2. ALL BULLETS: Copy every bullet point word-for-word - minimum 3-5 per role
3. NO OMISSIONS: Extract EVERY section, EVERY skill, EVERY detail
4. NO HALLUCINATION: Extract ONLY what exists in the resume
5. DATES: Convert to "MM/YYYY" or "YYYY". Use "Present" for current jobs
6. If summary is 500+ words, KEEP ALL 500+ WORDS - do NOT truncate

Return ONLY valid JSON.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0,
                    maxOutputTokens: 16000,
                }
            })
        });

        if (!response.ok) {
            console.error('Gemini API error:', response.status, await response.text());
            geminiAvailable = false;
            lastGeminiError = Date.now();
            return fallbackParse(cleanedText);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean the response - remove markdown code blocks if present
        let jsonStr = responseText
            .replace(/```json\s*/g, '')
            .replace(/```\s*/g, '')
            .trim();

        // Try to extract JSON from response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No valid JSON in response');
            return fallbackParse(cleanedText);
        }

        const parsed = JSON.parse(jsonMatch[0]) as ParsedResume;

        // Validate and clean the parsed data
        const validated = validateParsedResume(parsed);

        // Determine what was extracted vs missing
        const extractedFields: string[] = [];
        const missingFields: string[] = [];

        if (validated.name) extractedFields.push('Name');
        else missingFields.push('Name');

        if (validated.email) extractedFields.push('Email');
        else missingFields.push('Email');

        if (validated.phone) extractedFields.push('Phone');
        else missingFields.push('Phone');

        if (validated.linkedin) extractedFields.push('LinkedIn');
        if (validated.github) extractedFields.push('GitHub');

        if (validated.profile) extractedFields.push('Profile');

        if (validated.skills.length > 0 && validated.skills.some(s => s.items.length > 0)) {
            extractedFields.push('Skills');
        } else {
            missingFields.push('Skills');
        }

        if (validated.experience.length > 0) extractedFields.push('Experience');
        else missingFields.push('Experience');

        if (validated.education.length > 0) extractedFields.push('Education');
        else missingFields.push('Education');

        if (validated.projects.length > 0) extractedFields.push('Projects');

        const confidence = (extractedFields.length / (extractedFields.length + missingFields.length)) * 100;

        return {
            resume: validated,
            confidence: Math.round(confidence),
            extractedFields,
            missingFields
        };

    } catch (error) {
        console.error('AI parsing error:', error);
        geminiAvailable = false;
        lastGeminiError = Date.now();
        return fallbackParse(cleanedText);
    }
}

/**
 * Validate and clean parsed resume data
 */
function validateParsedResume(parsed: any): ParsedResume {
    const clean = (str: any): string => {
        if (typeof str !== 'string') return '';
        return str.trim();
    };

    const cleanDate = (date: any): string => {
        if (typeof date !== 'string') return '';
        const d = date.trim().toLowerCase();
        if (d.includes('present') || d.includes('current') || d.includes('now') || d.includes('ongoing')) {
            return 'Present';
        }

        // Fix date format - prevent future dates
        // Convert "01/2025" to "2025-01" for proper validation
        const dateMatch = d.match(/(\d{1,2})\/(\d{4})/);
        if (dateMatch) {
            const month = dateMatch[1].padStart(2, '0');
            const year = dateMatch[2];
            const dateObj = new Date(`${year}-${month}-01`);
            const now = new Date();

            // If date is in future, cap to present
            if (dateObj > now) {
                return 'Present';
            }
        }

        return date.trim();
    };

    return {
        name: clean(parsed.name),
        email: clean(parsed.email),
        phone: clean(parsed.phone),
        linkedin: clean(parsed.linkedin),
        github: clean(parsed.github),
        profile: clean(parsed.profile), // NO TRUNCATION - Keep full summary
        skills: Array.isArray(parsed.skills)
            ? parsed.skills.map((s: any) => ({
                category: clean(s.category) || 'General',
                items: Array.isArray(s.items) ? s.items.map((i: any) => clean(i)).filter(Boolean) : []
            })).filter((s: any) => s.items.length > 0)
            : [],
        experience: Array.isArray(parsed.experience)
            ? parsed.experience.map((e: any) => ({
                role: clean(e.role),
                company: clean(e.company),
                startDate: cleanDate(e.startDate),
                endDate: cleanDate(e.endDate),
                bullets: Array.isArray(e.bullets) ? e.bullets.map((b: any) => clean(b)).filter(Boolean) : []
            })).filter((e: any) => e.role || e.company)
            : [],
        education: Array.isArray(parsed.education)
            ? parsed.education.map((e: any) => ({
                degree: clean(e.degree),
                institution: clean(e.institution),
                year: clean(e.year)
            })).filter((e: any) => e.degree || e.institution)
            : [],
        projects: Array.isArray(parsed.projects)
            ? parsed.projects.map((p: any) => ({
                name: clean(p.name),
                description: clean(p.description),
                tech: Array.isArray(p.tech) ? p.tech.map((t: any) => clean(t)).filter(Boolean) : [],
                startDate: cleanDate(p.startDate),
                endDate: cleanDate(p.endDate)
            })).filter((p: any) => p.name || p.description)
            : []
    };
}

/**
 * Fallback parsing using regex patterns (no AI)
 */
function fallbackParse(text: string): ExtractionResult {
    console.log('Using fallback parser...');

    // Email
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const email = emailMatch ? emailMatch[1].toLowerCase() : '';

    // Phone
    const phonePatterns = [
        /(?:\+91[-\s]?)?[6-9]\d{9}/,
        /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
        /\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/
    ];
    let phone = '';
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match) { phone = match[0]; break; }
    }

    // LinkedIn
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '';

    // GitHub
    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    const github = githubMatch ? `github.com/${githubMatch[1]}` : '';

    // Name - first meaningful line
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let name = '';
    for (const line of lines.slice(0, 10)) {
        const cleaned = line.replace(/[^a-zA-Z\s]/g, '').trim();
        const words = cleaned.split(/\s+/).filter(w => w.length > 1);
        if (words.length >= 2 && words.length <= 4 && cleaned.length < 50) {
            const skipWords = ['summary', 'profile', 'experience', 'education', 'skills', 'resume'];
            if (!skipWords.some(k => cleaned.toLowerCase().includes(k))) {
                name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                break;
            }
        }
    }

    // Skills
    const skillPatterns = /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|express|mongodb|sql|postgresql|mysql|aws|azure|docker|kubernetes|git|html|css|c\+\+|c#|ruby|php|swift|kotlin|go|rust|tensorflow|pytorch|django|flask|spring|next\.?js|graphql|redis)\b/gi;
    const skillMatches = text.match(skillPatterns) || [];
    const uniqueSkills = [...new Set(skillMatches.map(s => s.toLowerCase()))];

    const skills = uniqueSkills.length > 0
        ? [{ category: 'Technical Skills', items: uniqueSkills }]
        : [];

    const extractedFields: string[] = [];
    const missingFields: string[] = [];

    if (name) extractedFields.push('Name'); else missingFields.push('Name');
    if (email) extractedFields.push('Email'); else missingFields.push('Email');
    if (phone) extractedFields.push('Phone'); else missingFields.push('Phone');
    if (linkedin) extractedFields.push('LinkedIn');
    if (github) extractedFields.push('GitHub');
    if (skills.length > 0) extractedFields.push('Skills'); else missingFields.push('Skills');

    return {
        resume: {
            name, email, phone, linkedin, github,
            profile: '',
            skills,
            experience: [],
            education: [],
            projects: []
        },
        confidence: 30,
        extractedFields,
        missingFields
    };
}

/**
 * Match resume against Job Description using Groq API
 */
export async function matchResumeToJD(resume: ParsedResume, jdText: string, targetRole?: string): Promise<JDMatchResult> {
    if (!jdText.trim() && !targetRole?.trim()) {
        return {
            matchScore: 0,
            matchedSkills: [],
            missingSkills: [],
            roleAlignment: 0,
            suggestions: []
        };
    }

    const resumeText = [
        resume.profile,
        resume.skills.flatMap(s => s.items).join(', '),
        resume.experience.map(e => `${e.role} at ${e.company}: ${e.bullets.join('. ')}`).join('\n'),
        resume.projects.map(p => `${p.name}: ${p.description}`).join('\n')
    ].join('\n');

    const prompt = `Analyze how well this resume matches the job requirements.

RESUME:
${resumeText.slice(0, 3000)}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}
${jdText ? `JOB DESCRIPTION:\n${jdText.slice(0, 2000)}` : ''}

Return a JSON object:
{
    "matchScore": 0-100,
    "matchedSkills": ["skills from JD that are in resume"],
    "missingSkills": ["skills from JD that are NOT in resume"],
    "roleAlignment": 0-100,
    "suggestions": ["brief improvement suggestions"]
}

Consider semantic matches (e.g., "REST API" matches "RESTful", "AWS" matches "cloud").
Return ONLY valid JSON.`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            console.error('Groq API error:', response.status);
            return fallbackJDMatch(resume, jdText);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return fallbackJDMatch(resume, jdText);
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
            matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
            matchedSkills: Array.isArray(result.matchedSkills) ? result.matchedSkills : [],
            missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
            roleAlignment: Math.min(100, Math.max(0, result.roleAlignment || 0)),
            suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 3) : []
        };

    } catch (error) {
        console.error('JD matching error:', error);
        return fallbackJDMatch(resume, jdText);
    }
}

/**
 * Fallback JD matching using keyword extraction
 */
function fallbackJDMatch(resume: ParsedResume, jdText: string): JDMatchResult {
    const resumeSkills = resume.skills.flatMap(s => s.items.map(i => i.toLowerCase()));
    const resumeText = [
        resume.profile,
        resume.experience.map(e => e.bullets.join(' ')).join(' '),
        resume.projects.map(p => p.description).join(' ')
    ].join(' ').toLowerCase();

    // Extract keywords from JD
    const skillPattern = /\b(python|java|javascript|typescript|react|angular|vue|node|mongodb|sql|aws|azure|docker|kubernetes|git|agile|scrum|ci\/cd|rest|api|microservices|machine learning|data science|tensorflow|pytorch|html|css|devops|linux|graphql|redis|elasticsearch)\b/gi;
    const jdSkills = [...new Set((jdText.match(skillPattern) || []).map(s => s.toLowerCase()))];

    const matched = jdSkills.filter(s => resumeSkills.includes(s) || resumeText.includes(s));
    const missing = jdSkills.filter(s => !matched.includes(s));

    const matchScore = jdSkills.length > 0 ? Math.round((matched.length / jdSkills.length) * 100) : 0;

    return {
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        roleAlignment: matchScore,
        suggestions: missing.length > 0 ? [`Consider adding: ${missing.slice(0, 3).join(', ')}`] : []
    };
}

/**
 * Determine what validation issues are REAL (not just extraction misses)
 */
/**
 * Determine what validation issues are REAL (not just extraction misses)
 */
export function getSmartValidationIssues(result: ExtractionResult): {
    errors: { field: string; message: string }[];
    warnings: { field: string; message: string }[];
} {
    const errors: { field: string; message: string }[] = [];
    const warnings: { field: string; message: string }[] = [];
    const r = result.resume;

    // Critical Fields - Flag as ERROR if missing
    if (!r.name || r.name.trim().length < 2) {
        errors.push({ field: 'name', message: 'Name is missing or too short' });
    }

    if (!r.email || !r.email.trim()) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(r.email)) {
            errors.push({ field: 'email', message: 'Invalid email format' });
        }
    }

    // Phone - Warning if missing or invalid
    if (!r.phone) {
        warnings.push({ field: 'phone', message: 'Phone number is missing' });
    } else {
        const phoneClean = r.phone.replace(/[\s\-\(\)\.+]/g, '');
        if (phoneClean.length < 10 || phoneClean.length > 15) {
            warnings.push({ field: 'phone', message: 'Phone number format may be incorrect' });
        }
    }

    // Experience dates - check for valid ranges
    if (r.experience.length === 0) {
        warnings.push({ field: 'experience', message: 'No experience listed' });
    } else {
        r.experience.forEach((exp, i) => {
            // Check if this is part-time experience
            const isPartTime = /part[-\s]?time|intern|internship|contract|freelance|temporary|seasonal|student|trainee|apprentice/i.test(exp.role + ' ' + exp.company);

            if (!exp.role) errors.push({ field: `exp_${i}_role`, message: `Experience ${i + 1}: Role missing` });
            if (!exp.company) warnings.push({ field: `exp_${i}_company`, message: `Experience ${i + 1}: Company recommended` });

            if (exp.startDate && exp.endDate && exp.endDate.toLowerCase() !== 'present') {
                // Only validate if both dates exist
                const startYear = extractYear(exp.startDate);
                const endYear = extractYear(exp.endDate);
                if (startYear && endYear && startYear > endYear) {
                    errors.push({
                        field: `exp_${i}_date`,
                        message: `${exp.role || 'Experience'}: End date is before start date`
                    });
                }
            } else if (!exp.startDate && !isPartTime) {
                warnings.push({ field: `exp_${i}_start`, message: `${exp.role}: Start date missing` });
            }

            if (exp.role && exp.bullets.length === 0 && !isPartTime) {
                warnings.push({
                    field: `exp_${i}_bullets`,
                    message: `${exp.role}: Consider adding achievements`
                });
            } else if (exp.bullets.length > 0) {
                // Strong Check: Look for metrics
                const hasMetrics = exp.bullets.some(b => /\d+%|\$\d+|\d+x|\d+\+/.test(b));
                if (!hasMetrics && !isPartTime) {
                    warnings.push({
                        field: `exp_${i}_bullets`,
                        message: `${exp.role}: Add metrics (e.g. "Increased by 20%") to strengthen`
                    });
                }

                // Content length check
                if (exp.bullets.some(b => b.length < 15)) {
                    warnings.push({
                        field: `exp_${i}_bullets`,
                        message: `${exp.role}: Some bullet points are too short`
                    });
                }
            }
        });
    }

    // Education
    if (r.education.length === 0) {
        warnings.push({ field: 'education', message: 'No education listed' });
    }

    // Skills
    if (r.skills.length === 0 || r.skills.every(s => s.items.length === 0)) {
        warnings.push({ field: 'skills', message: 'No skills extracted' });
    }

    // Check for profile inconsistencies (e.g., saying "fresher" but having 10 years exp)
    const profileText = r.profile.toLowerCase();
    const totalYears = r.experience.reduce((sum, exp) => {
        const isPartTime = /part[-\s]?time|intern|internship|contract|freelance|temporary|seasonal|student|trainee|apprentice/i.test(exp.role + ' ' + exp.company);
        const startYear = extractYear(exp.startDate);
        const endYear = exp.endDate.toLowerCase() === 'present' ? new Date().getFullYear() : extractYear(exp.endDate);
        if (startYear && endYear) {
            const years = Math.max(0, endYear - startYear);
            return sum + (isPartTime ? years * 0.5 : years);
        }
        return sum;
    }, 0);

    if ((profileText.includes('fresher') || profileText.includes('entry')) && totalYears > 2) {
        warnings.push({
            field: 'profile',
            message: 'Profile says "fresher" but you have significant experience'
        });
    }

    if ((profileText.includes('senior') || profileText.includes('lead')) && totalYears < 5) {
        warnings.push({
            field: 'profile',
            message: 'Profile says "senior" but experience seems limited'
        });
    }

    return { errors, warnings };
}

function extractYear(dateStr: string): number | null {
    const match = dateStr.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : null;
}

/**
 * Detect profile type (fresher/intern/professional/senior)
 */
export function detectProfileType(resume: ParsedResume): { type: string; years: number; reason: string } {
    let totalYears = 0;
    const now = new Date();
    const currentYear = now.getFullYear();

    for (const exp of resume.experience) {
        // Check if this is part-time/internship experience
        const isPartTime = /part[-\s]?time|intern|internship|contract|freelance|temporary|seasonal|student|trainee|apprentice/i.test(exp.role + ' ' + exp.company);

        const startYear = extractYear(exp.startDate);
        let endYear = exp.endDate.toLowerCase() === 'present' ? currentYear : extractYear(exp.endDate);

        if (startYear && endYear) {
            const years = Math.max(0, endYear - startYear);
            // Only count 100% of full-time experience, 50% of part-time
            totalYears += isPartTime ? years * 0.5 : years;
        }
    }

    const expText = resume.experience.map(e => e.role).join(' ').toLowerCase();

    if (totalYears >= 8 || /director|vp|head of|principal|architect/i.test(expText)) {
        return { type: 'senior', years: Math.round(totalYears * 10) / 10, reason: totalYears >= 8 ? `${Math.round(totalYears * 10) / 10} years of experience` : 'Leadership role' };
    }
    if (totalYears >= 3 || /senior|lead|manager/i.test(expText)) {
        return { type: 'professional', years: Math.round(totalYears * 10) / 10, reason: `${Math.round(totalYears * 10) / 10} years of experience` };
    }
    if (/intern|trainee|apprentice/i.test(expText)) {
        return { type: 'intern', years: Math.round(totalYears * 10) / 10, reason: 'Internship or training role' };
    }
    return { type: 'fresher', years: Math.round(totalYears * 10) / 10, reason: totalYears > 0 ? `${Math.round(totalYears * 10) / 10} years experience` : 'Entry-level' };
}

/**
 * Refine resume technical summary using AI
 */
export async function refineResumeSummary(profile: string, jobTitle: string): Promise<string> {
    if (!profile || !profile.trim()) return profile;

    const prompt = `Refine this professional summary to be more impactful and aligned with a ${jobTitle} role. 
    Maintain 100% truthfulness. DO NOT add experience that isn't there. 
    Use strong action verbs. Keep it between 3-4 lines or 50-70 words.
    
    ORIGINAL SUMMARY:
    ${profile}
    
    Return ONLY the refined summary text. No preamble.`;

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 512
            })
        });

        if (!response.ok) throw new Error('API failed');

        const data = await response.json();
        const refined = data.choices?.[0]?.message?.content?.trim() || profile;
        // Clean up any potential markdown or quotes
        return refined.replace(/^["']|["']$/g, '');
    } catch (e) {
        console.error('Refine error:', e);
        return profile;
    }
}
