/**
 * REAL ATS Comparison Engine
 * NO FAKE SCORES - Only honest matching and actionable guidance
 */

import { ResumeData } from './types';

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface KeywordMatch {
    keyword: string;
    category: 'skill' | 'tool' | 'responsibility' | 'experience' | 'soft_skill';
    status: 'matched' | 'partial' | 'missing';
    context?: string; // Where it was found in resume
    suggestion?: string; // How to add it if missing
}

export interface ATSComparisonResult {
    matched: KeywordMatch[];
    partial: KeywordMatch[];
    missing: KeywordMatch[];
    weakAreas: WeakArea[];
    actionableAdvice: string[];
    resumeStrengths: string[];
    // NO SCORE - Just honest analysis
}

export interface WeakArea {
    area: string;
    issue: string;
    fix: string;
}

// ═══════════════════════════════════════════════════════════════
// KEYWORD EXTRACTION FROM JD
// ═══════════════════════════════════════════════════════════════

interface ExtractedKeywords {
    skills: string[];
    tools: string[];
    responsibilities: string[];
    experienceSignals: string[];
    softSkills: string[];
}

// Common tech skills patterns
const SKILL_PATTERNS = {
    programming: /\b(python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|php|swift|kotlin|scala|r|matlab)\b/gi,
    frameworks: /\b(react|angular|vue|node\.?js|express|django|flask|spring|rails|laravel|next\.?js|nuxt|svelte)\b/gi,
    databases: /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|dynamodb|cassandra|oracle|firebase)\b/gi,
    cloud: /\b(aws|azure|gcp|google cloud|heroku|digitalocean|cloudflare|vercel|netlify)\b/gi,
    devops: /\b(docker|kubernetes|k8s|jenkins|terraform|ansible|ci\/cd|github actions|gitlab)\b/gi,
    data: /\b(machine learning|ml|ai|deep learning|tensorflow|pytorch|pandas|numpy|spark|hadoop|etl)\b/gi,
    tools: /\b(git|jira|confluence|slack|figma|sketch|postman|swagger|graphql|rest api)\b/gi
};

const SOFT_SKILL_PATTERNS = /\b(leadership|communication|collaboration|problem.solving|analytical|creative|teamwork|mentoring|presentation|negotiation)\b/gi;

const RESPONSIBILITY_PATTERNS = /\b(develop|design|implement|maintain|manage|lead|coordinate|analyze|optimize|integrate|deploy|test|review|document)\b/gi;

const EXPERIENCE_PATTERNS = /(\d+)\+?\s*(years?|yrs?)\s*(of)?\s*(experience)?/gi;

export function extractKeywordsFromJD(jd: string): ExtractedKeywords {
    const text = jd.toLowerCase();
    const result: ExtractedKeywords = {
        skills: [],
        tools: [],
        responsibilities: [],
        experienceSignals: [],
        softSkills: []
    };

    // Extract technical skills
    Object.values(SKILL_PATTERNS).forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            result.skills.push(...matches.map(m => m.toLowerCase()));
        }
    });

    // Extract soft skills
    const softMatches = text.match(SOFT_SKILL_PATTERNS);
    if (softMatches) {
        result.softSkills.push(...softMatches.map(m => m.toLowerCase()));
    }

    // Extract responsibilities
    const respMatches = text.match(RESPONSIBILITY_PATTERNS);
    if (respMatches) {
        result.responsibilities.push(...respMatches.map(m => m.toLowerCase()));
    }

    // Extract experience signals
    const expMatches = text.match(EXPERIENCE_PATTERNS);
    if (expMatches) {
        result.experienceSignals.push(...expMatches);
    }

    // Deduplicate
    result.skills = [...new Set(result.skills)];
    result.tools = [...new Set(result.tools)];
    result.responsibilities = [...new Set(result.responsibilities)];
    result.experienceSignals = [...new Set(result.experienceSignals)];
    result.softSkills = [...new Set(result.softSkills)];

    return result;
}

// ═══════════════════════════════════════════════════════════════
// RESUME TEXT EXTRACTION
// ═══════════════════════════════════════════════════════════════

function extractResumeText(resume: ResumeData): string {
    const parts: string[] = [];

    // Summary
    if (resume.summary) {
        parts.push(resume.summary);
    }

    // Experience
    resume.experience?.forEach(exp => {
        parts.push(exp.position);
        parts.push(exp.company);
        exp.highlights?.forEach(h => parts.push(h));
    });

    // Projects
    resume.projects?.forEach(proj => {
        parts.push(proj.name);
        parts.push(proj.description);
    });

    // Skills
    parts.push(...(resume.skills || []));

    return parts.join(' ').toLowerCase();
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPARISON ENGINE
// ═══════════════════════════════════════════════════════════════

export function compareResumeToJD(resume: ResumeData, jd: string): ATSComparisonResult {
    const jdKeywords = extractKeywordsFromJD(jd);
    const resumeText = extractResumeText(resume);

    const matched: KeywordMatch[] = [];
    const partial: KeywordMatch[] = [];
    const missing: KeywordMatch[] = [];
    const weakAreas: WeakArea[] = [];
    const actionableAdvice: string[] = [];
    const resumeStrengths: string[] = [];

    // Compare skills
    jdKeywords.skills.forEach(skill => {
        if (resumeText.includes(skill)) {
            matched.push({
                keyword: skill,
                category: 'skill',
                status: 'matched',
                context: findContext(resumeText, skill)
            });
        } else {
            // Check for partial matches (e.g., "react" vs "react.js")
            const partialMatch = findPartialMatch(resumeText, skill);
            if (partialMatch) {
                partial.push({
                    keyword: skill,
                    category: 'skill',
                    status: 'partial',
                    context: partialMatch,
                    suggestion: `You mention "${partialMatch}" but JD asks for "${skill}". Consider using exact terminology.`
                });
            } else {
                missing.push({
                    keyword: skill,
                    category: 'skill',
                    status: 'missing',
                    suggestion: `Add "${skill}" to your skills section if you have experience with it.`
                });
            }
        }
    });

    // Compare soft skills
    jdKeywords.softSkills.forEach(skill => {
        if (resumeText.includes(skill)) {
            matched.push({
                keyword: skill,
                category: 'soft_skill',
                status: 'matched'
            });
        } else {
            missing.push({
                keyword: skill,
                category: 'soft_skill',
                status: 'missing',
                suggestion: `Demonstrate "${skill}" through specific examples in your experience bullets.`
            });
        }
    });

    // Analyze weak areas
    analyzeWeakAreas(resume, weakAreas);

    // Generate actionable advice
    generateAdvice(matched, missing, weakAreas, actionableAdvice);

    // Identify strengths
    identifyStrengths(resume, matched, resumeStrengths);

    return {
        matched,
        partial,
        missing,
        weakAreas,
        actionableAdvice,
        resumeStrengths
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function findContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + keyword.length + 30);
    return '...' + text.slice(start, end) + '...';
}

function findPartialMatch(text: string, keyword: string): string | null {
    // Common variations
    const variations: Record<string, string[]> = {
        'javascript': ['js', 'node.js', 'nodejs'],
        'typescript': ['ts'],
        'python': ['py', 'python3'],
        'kubernetes': ['k8s'],
        'react': ['react.js', 'reactjs'],
        'vue': ['vue.js', 'vuejs'],
        'node': ['node.js', 'nodejs'],
        'machine learning': ['ml'],
        'artificial intelligence': ['ai']
    };

    const keywordVariations = variations[keyword] || [];
    for (const variant of keywordVariations) {
        if (text.includes(variant)) {
            return variant;
        }
    }
    return null;
}

function analyzeWeakAreas(resume: ResumeData, weakAreas: WeakArea[]): void {
    // Check for unquantified bullets
    let unquantifiedBullets = 0;
    let totalBullets = 0;

    resume.experience?.forEach(exp => {
        exp.highlights?.forEach(bullet => {
            totalBullets++;
            if (!/\d/.test(bullet)) {
                unquantifiedBullets++;
            }
        });
    });

    if (totalBullets > 0 && unquantifiedBullets / totalBullets > 0.5) {
        weakAreas.push({
            area: 'Quantification',
            issue: `${unquantifiedBullets} of ${totalBullets} bullets lack numbers or metrics.`,
            fix: 'Add specific numbers like "Improved performance by 30%" or "Managed team of 5".'
        });
    }

    // Check for generic bullets
    const genericPhrases = ['responsible for', 'helped with', 'worked on', 'assisted'];
    let genericCount = 0;

    resume.experience?.forEach(exp => {
        exp.highlights?.forEach(bullet => {
            if (genericPhrases.some(phrase => bullet.toLowerCase().includes(phrase))) {
                genericCount++;
            }
        });
    });

    if (genericCount > 0) {
        weakAreas.push({
            area: 'Generic Language',
            issue: `${genericCount} bullets use generic phrases like "responsible for" or "helped with".`,
            fix: 'Replace with specific action verbs and outcomes. Example: "Developed" instead of "Worked on".'
        });
    }

    // Check skills count
    if ((resume.skills?.length || 0) < 8) {
        weakAreas.push({
            area: 'Skills Section',
            issue: 'Skills section has fewer than 8 items.',
            fix: 'Add relevant technical skills, tools, and methodologies you use regularly.'
        });
    }

    // Check summary
    if (!resume.summary || resume.summary.length < 50) {
        weakAreas.push({
            area: 'Summary Missing',
            issue: 'No professional summary or it is too short.',
            fix: 'Add 2-3 sentences highlighting your experience, key skills, and what you bring to the role.'
        });
    }
}

function generateAdvice(
    matched: KeywordMatch[],
    missing: KeywordMatch[],
    weakAreas: WeakArea[],
    advice: string[]
): void {
    // Priority-based advice
    if (missing.length > 5) {
        const topMissing = missing.slice(0, 3).map(m => m.keyword).join(', ');
        advice.push(`Add these high-priority keywords: ${topMissing}`);
    }

    if (weakAreas.length > 0) {
        advice.push(`Fix ${weakAreas.length} weak area(s) to improve readability.`);
    }

    if (matched.length > 0) {
        advice.push(`Your resume already matches ${matched.length} keywords from the job description.`);
    }

    // Specific actionable items
    const missingSkills = missing.filter(m => m.category === 'skill');
    if (missingSkills.length > 0 && missingSkills.length <= 5) {
        advice.push(`Consider adding these skills if applicable: ${missingSkills.map(m => m.keyword).join(', ')}`);
    }
}

function identifyStrengths(
    resume: ResumeData,
    matched: KeywordMatch[],
    strengths: string[]
): void {
    // Keyword match strength
    if (matched.length >= 10) {
        strengths.push('Strong keyword alignment with job description.');
    } else if (matched.length >= 5) {
        strengths.push('Good keyword coverage in key areas.');
    }

    // Experience depth
    const totalBullets = resume.experience?.reduce((sum, exp) => sum + (exp.highlights?.length || 0), 0) || 0;
    if (totalBullets >= 12) {
        strengths.push('Detailed experience section with good depth.');
    }

    // Quantified achievements
    let quantified = 0;
    resume.experience?.forEach(exp => {
        exp.highlights?.forEach(b => {
            if (/\d+%|\d+x|\$\d+|\d+\s*(users|customers)/i.test(b)) {
                quantified++;
            }
        });
    });

    if (quantified >= 3) {
        strengths.push(`${quantified} achievements with measurable impact.`);
    }

    // Skills breadth
    if ((resume.skills?.length || 0) >= 15) {
        strengths.push('Comprehensive skills section covering multiple areas.');
    }
}

// ═══════════════════════════════════════════════════════════════
// FORMAT COMPARISON RESULT FOR DISPLAY
// ═══════════════════════════════════════════════════════════════

export interface FormattedATSResult {
    matchedKeywords: string[];
    partialKeywords: { keyword: string; suggestion: string }[];
    missingKeywords: { keyword: string; suggestion: string }[];
    weakAreas: { area: string; issue: string; fix: string }[];
    topAdvice: string[];
    strengths: string[];
    hasJD: boolean;
}

export function formatATSResult(result: ATSComparisonResult, hasJD: boolean): FormattedATSResult {
    return {
        matchedKeywords: result.matched.map(m => m.keyword),
        partialKeywords: result.partial.map(p => ({
            keyword: p.keyword,
            suggestion: p.suggestion || ''
        })),
        missingKeywords: result.missing.slice(0, 10).map(m => ({
            keyword: m.keyword,
            suggestion: m.suggestion || ''
        })),
        weakAreas: result.weakAreas,
        topAdvice: result.actionableAdvice.slice(0, 5),
        strengths: result.resumeStrengths,
        hasJD
    };
}

// ═══════════════════════════════════════════════════════════════
// MARKET COMPARISON - Role-based expectations
// ═══════════════════════════════════════════════════════════════

interface RoleExpectation {
    commonSkills: string[];
    commonTools: string[];
    typicalBullets: string[];
}

const ROLE_EXPECTATIONS: Record<string, RoleExpectation> = {
    'software engineer': {
        commonSkills: ['programming', 'algorithms', 'data structures', 'system design', 'debugging'],
        commonTools: ['git', 'docker', 'ci/cd', 'jira', 'sql'],
        typicalBullets: ['developed', 'implemented', 'optimized', 'designed', 'debugged']
    },
    'data scientist': {
        commonSkills: ['machine learning', 'statistics', 'python', 'sql', 'data visualization'],
        commonTools: ['pandas', 'numpy', 'tensorflow', 'pytorch', 'jupyter'],
        typicalBullets: ['analyzed', 'modeled', 'predicted', 'visualized', 'extracted']
    },
    'product manager': {
        commonSkills: ['product strategy', 'roadmap', 'stakeholder management', 'analytics', 'user research'],
        commonTools: ['jira', 'figma', 'amplitude', 'mixpanel', 'confluence'],
        typicalBullets: ['launched', 'drove', 'prioritized', 'collaborated', 'defined']
    },
    'frontend developer': {
        commonSkills: ['javascript', 'react', 'css', 'html', 'responsive design'],
        commonTools: ['webpack', 'npm', 'git', 'figma', 'chrome devtools'],
        typicalBullets: ['built', 'implemented', 'optimized', 'designed', 'integrated']
    },
    'backend developer': {
        commonSkills: ['api design', 'databases', 'server architecture', 'caching', 'security'],
        commonTools: ['docker', 'kubernetes', 'redis', 'postgresql', 'aws'],
        typicalBullets: ['architected', 'scaled', 'optimized', 'secured', 'deployed']
    }
};

export function getMarketComparison(targetRole: string, resume: ResumeData): {
    expectedSkills: string[];
    yourSkills: string[];
    missingFromMarket: string[];
    aboveMarket: string[];
} {
    const normalizedRole = targetRole.toLowerCase();
    let expectations: RoleExpectation | null = null;

    // Find matching role
    for (const [role, exp] of Object.entries(ROLE_EXPECTATIONS)) {
        if (normalizedRole.includes(role) || role.includes(normalizedRole)) {
            expectations = exp;
            break;
        }
    }

    if (!expectations) {
        // Default expectations
        expectations = {
            commonSkills: ['communication', 'problem solving', 'teamwork'],
            commonTools: ['git', 'jira', 'slack'],
            typicalBullets: ['managed', 'developed', 'improved']
        };
    }

    const yourSkills = (resume.skills || []).map(s => s.toLowerCase());
    const expectedSkills = [...expectations.commonSkills, ...expectations.commonTools];

    const missingFromMarket = expectedSkills.filter(s => 
        !yourSkills.some(ys => ys.includes(s) || s.includes(ys))
    );

    const aboveMarket = yourSkills.filter(s =>
        !expectedSkills.some(es => es.includes(s) || s.includes(es))
    );

    return {
        expectedSkills,
        yourSkills,
        missingFromMarket,
        aboveMarket: aboveMarket.slice(0, 5) // Top 5 unique skills
    };
}
