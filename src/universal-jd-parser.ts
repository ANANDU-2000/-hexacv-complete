/**
 * UNIVERSAL JD PARSER
 * Domain-independent job description analysis
 * Works for ANY industry, ANY role
 */

import { IndustryCategory, detectIndustry, findRole, getIndustryInfo } from './universal-role-database';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ParsedJD {
    // Basic Info
    detectedRole: string | null;
    detectedIndustry: IndustryCategory;
    detectedLevel: string | null;
    
    // Requirements
    hardSkills: ExtractedKeyword[];
    softSkills: ExtractedKeyword[];
    tools: ExtractedKeyword[];
    certifications: ExtractedKeyword[];
    educationRequirements: string[];
    experienceRequirements: string[];
    
    // Responsibilities
    responsibilities: string[];
    
    // Metadata
    isRemote: boolean;
    location: string | null;
    salaryMentioned: boolean;
    urgency: 'high' | 'medium' | 'low';
    
    // Quality
    parseConfidence: number;
    warnings: string[];
}

export interface ExtractedKeyword {
    keyword: string;
    category: string;
    importance: 'required' | 'preferred' | 'nice_to_have';
    context: string; // Original sentence where found
}

// ═══════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC KEYWORD DICTIONARIES
// ═══════════════════════════════════════════════════════════════

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
    // Technology
    technology: [
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'sql', 'nosql',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'agile', 'scrum', 'api',
        'machine learning', 'data science', 'ai', 'cloud', 'microservices', 'devops', 'full stack',
        'backend', 'frontend', 'mobile', 'ios', 'android', 'testing', 'security', 'database'
    ],
    
    // Healthcare
    healthcare: [
        'patient care', 'clinical', 'medical', 'nursing', 'ehr', 'emr', 'hipaa', 'medication',
        'vital signs', 'bls', 'acls', 'cpr', 'triage', 'assessment', 'diagnosis', 'treatment',
        'documentation', 'patient education', 'infection control', 'sterile technique',
        'pharmacy', 'radiology', 'laboratory', 'rehabilitation', 'mental health'
    ],
    
    // Finance
    finance: [
        'accounting', 'gaap', 'ifrs', 'financial analysis', 'budgeting', 'forecasting', 'audit',
        'tax', 'reconciliation', 'financial statements', 'p&l', 'balance sheet', 'cash flow',
        'excel', 'sap', 'oracle', 'quickbooks', 'erp', 'compliance', 'risk management',
        'investment', 'portfolio', 'banking', 'credit', 'underwriting', 'valuation'
    ],
    
    // Education
    education: [
        'teaching', 'curriculum', 'lesson planning', 'classroom management', 'student assessment',
        'differentiated instruction', 'special education', 'iep', 'common core', 'pedagogy',
        'learning management', 'google classroom', 'canvas', 'blackboard', 'educational technology',
        'grading', 'parent communication', 'professional development', 'mentoring students'
    ],
    
    // Sales
    sales: [
        'sales', 'revenue', 'quota', 'pipeline', 'crm', 'salesforce', 'hubspot', 'lead generation',
        'prospecting', 'cold calling', 'closing', 'negotiation', 'account management', 'b2b', 'b2c',
        'territory', 'client relationships', 'presentations', 'demos', 'rfp', 'contracts'
    ],
    
    // Marketing
    marketing: [
        'marketing', 'digital marketing', 'seo', 'sem', 'ppc', 'social media', 'content',
        'branding', 'campaigns', 'analytics', 'google analytics', 'conversion', 'roi',
        'email marketing', 'automation', 'hubspot', 'copywriting', 'brand awareness',
        'market research', 'competitive analysis', 'customer acquisition', 'retention'
    ],
    
    // Construction
    construction: [
        'construction', 'project management', 'autocad', 'civil 3d', 'bim', 'revit',
        'site supervision', 'blueprints', 'building codes', 'osha', 'safety', 'estimating',
        'scheduling', 'subcontractors', 'inspections', 'permits', 'structural', 'concrete',
        'plumbing', 'electrical', 'hvac', 'surveying', 'quantity surveying'
    ],
    
    // Legal
    legal: [
        'legal', 'litigation', 'contracts', 'corporate law', 'compliance', 'due diligence',
        'legal research', 'westlaw', 'lexisnexis', 'drafting', 'negotiations', 'court',
        'depositions', 'discovery', 'intellectual property', 'employment law', 'real estate law',
        'mergers', 'acquisitions', 'regulatory', 'privacy', 'gdpr'
    ],
    
    // Hospitality
    hospitality: [
        'hospitality', 'customer service', 'guest relations', 'front desk', 'reservations',
        'food service', 'culinary', 'menu planning', 'food safety', 'servsafe', 'banquets',
        'events', 'hotel operations', 'housekeeping', 'concierge', 'restaurant management',
        'pos systems', 'inventory', 'scheduling', 'tourism', 'travel'
    ],
    
    // HR
    hr: [
        'human resources', 'recruitment', 'talent acquisition', 'onboarding', 'employee relations',
        'performance management', 'compensation', 'benefits', 'hris', 'workday', 'successfactors',
        'labor law', 'compliance', 'training', 'development', 'engagement', 'retention',
        'diversity', 'inclusion', 'payroll', 'background checks'
    ],
    
    // Logistics
    logistics: [
        'logistics', 'supply chain', 'warehouse', 'inventory', 'distribution', 'transportation',
        'shipping', 'freight', 'wms', 'tms', 'erp', 'sap', 'forecasting', 'demand planning',
        'procurement', 'vendor management', 'customs', 'import', 'export', 'last mile',
        '3pl', 'fulfillment', 'fleet management'
    ],
    
    // Trades
    trades: [
        'electrical', 'plumbing', 'hvac', 'carpentry', 'welding', 'installation', 'repair',
        'maintenance', 'troubleshooting', 'blueprints', 'schematics', 'code compliance',
        'safety', 'osha', 'tools', 'equipment', 'residential', 'commercial', 'industrial',
        'journeyman', 'apprentice', 'licensed'
    ]
};

// Universal soft skills applicable to all industries
const UNIVERSAL_SOFT_SKILLS = [
    'communication', 'teamwork', 'leadership', 'problem solving', 'time management',
    'attention to detail', 'organization', 'adaptability', 'flexibility', 'initiative',
    'interpersonal', 'collaboration', 'critical thinking', 'decision making', 'multitasking',
    'customer service', 'presentation', 'analytical', 'creative', 'self-motivated',
    'deadline-driven', 'results-oriented', 'proactive', 'reliable', 'punctual'
];

// Experience level indicators
const EXPERIENCE_PATTERNS = {
    intern: /\b(intern|internship|trainee|student)\b/i,
    entry: /\b(entry.?level|junior|graduate|fresher|0-1.?year|no.?experience)\b/i,
    mid: /\b(mid.?level|2-5.?years?|3-5.?years?|2-4.?years?|some.?experience)\b/i,
    senior: /\b(senior|5\+.?years?|6-10.?years?|experienced|lead)\b/i,
    executive: /\b(director|vp|vice.?president|c-level|cto|cfo|ceo|head.?of|executive)\b/i
};

// ═══════════════════════════════════════════════════════════════
// MAIN PARSER FUNCTION
// ═══════════════════════════════════════════════════════════════

export function parseJobDescription(jdText: string): ParsedJD {
    const text = jdText.toLowerCase();
    const originalText = jdText;
    const sentences = jdText.split(/[.!?\n]+/).filter(s => s.trim().length > 10);
    
    const warnings: string[] = [];
    
    // Detect basic info
    const detectedIndustry = detectIndustryFromJD(text);
    const detectedRole = extractJobTitle(originalText);
    const detectedLevel = detectExperienceLevel(text);
    
    // Get industry-specific keywords
    const industryKeywords = INDUSTRY_KEYWORDS[detectedIndustry] || [];
    
    // Extract all categories
    const hardSkills = extractKeywords(text, sentences, industryKeywords, 'hard_skill');
    const softSkills = extractKeywords(text, sentences, UNIVERSAL_SOFT_SKILLS, 'soft_skill');
    const tools = extractTools(text, sentences);
    const certifications = extractCertifications(text, sentences);
    const educationRequirements = extractEducation(text);
    const experienceRequirements = extractExperienceRequirements(text);
    const responsibilities = extractResponsibilities(sentences);
    
    // Extract metadata
    const isRemote = /\b(remote|work.?from.?home|wfh|hybrid|virtual)\b/i.test(text);
    const location = extractLocation(originalText);
    const salaryMentioned = /\$[\d,]+|\b(salary|compensation|pay|ctc|lpa)\b/i.test(text);
    const urgency = detectUrgency(text);
    
    // Calculate confidence
    const parseConfidence = calculateConfidence(hardSkills, responsibilities, detectedRole);
    
    // Generate warnings
    if (hardSkills.length < 3) {
        warnings.push('Few specific skills detected. Consider adding more detail to the job description.');
    }
    if (responsibilities.length < 2) {
        warnings.push('Limited responsibilities found. JD may be incomplete.');
    }
    if (!detectedRole) {
        warnings.push('Could not detect specific job title.');
    }
    
    return {
        detectedRole,
        detectedIndustry,
        detectedLevel,
        hardSkills,
        softSkills,
        tools,
        certifications,
        educationRequirements,
        experienceRequirements,
        responsibilities,
        isRemote,
        location,
        salaryMentioned,
        urgency,
        parseConfidence,
        warnings
    };
}

// ═══════════════════════════════════════════════════════════════
// EXTRACTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function detectIndustryFromJD(text: string): IndustryCategory {
    let maxMatches = 0;
    let detectedIndustry: IndustryCategory = 'other';
    
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        const matches = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedIndustry = industry as IndustryCategory;
        }
    }
    
    return detectedIndustry;
}

function extractJobTitle(text: string): string | null {
    // Common patterns for job titles
    const patterns = [
        /^([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Analyst|Designer|Specialist|Coordinator|Director|Lead|Executive|Administrator|Officer|Consultant|Technician|Nurse|Teacher|Accountant|Lawyer|Chef))/m,
        /job\s*title[:\s]+([A-Za-z\s]+)/i,
        /position[:\s]+([A-Za-z\s]+)/i,
        /role[:\s]+([A-Za-z\s]+)/i,
        /hiring[:\s]+([A-Za-z\s]+)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const title = match[1].trim();
            if (title.length > 3 && title.length < 60) {
                return title;
            }
        }
    }
    
    return null;
}

function detectExperienceLevel(text: string): string | null {
    for (const [level, pattern] of Object.entries(EXPERIENCE_PATTERNS)) {
        if (pattern.test(text)) {
            return level;
        }
    }
    return null;
}

function extractKeywords(
    text: string, 
    sentences: string[], 
    keywordList: string[], 
    category: string
): ExtractedKeyword[] {
    const found: ExtractedKeyword[] = [];
    
    for (const keyword of keywordList) {
        if (text.includes(keyword.toLowerCase())) {
            // Find context
            const contextSentence = sentences.find(s => 
                s.toLowerCase().includes(keyword.toLowerCase())
            ) || '';
            
            // Determine importance
            let importance: 'required' | 'preferred' | 'nice_to_have' = 'preferred';
            const lowerContext = contextSentence.toLowerCase();
            
            if (/required|must|essential|mandatory|necessary/i.test(lowerContext)) {
                importance = 'required';
            } else if (/preferred|nice|bonus|plus|ideal/i.test(lowerContext)) {
                importance = 'nice_to_have';
            }
            
            found.push({
                keyword: keyword,
                category,
                importance,
                context: contextSentence.slice(0, 150)
            });
        }
    }
    
    return found;
}

function extractTools(text: string, sentences: string[]): ExtractedKeyword[] {
    // Universal tool patterns
    const toolPatterns = [
        // Software & Platforms
        /\b(excel|word|powerpoint|outlook|google\s*suite|slack|zoom|teams|asana|trello|jira|notion|monday|salesforce|hubspot|sap|oracle|workday)\b/gi,
        // Design tools
        /\b(figma|sketch|photoshop|illustrator|indesign|canva|adobe\s*\w+)\b/gi,
        // Data tools
        /\b(tableau|power\s*bi|looker|google\s*analytics|mixpanel|amplitude)\b/gi,
        // Industry-specific
        /\b(autocad|revit|solidworks|matlab|spss|stata|quickbooks|xero)\b/gi
    ];
    
    const tools: ExtractedKeyword[] = [];
    const foundTools = new Set<string>();
    
    for (const pattern of toolPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                const normalized = match.toLowerCase().trim();
                if (!foundTools.has(normalized)) {
                    foundTools.add(normalized);
                    
                    const contextSentence = sentences.find(s => 
                        s.toLowerCase().includes(normalized)
                    ) || '';
                    
                    tools.push({
                        keyword: match,
                        category: 'tool',
                        importance: 'preferred',
                        context: contextSentence.slice(0, 150)
                    });
                }
            }
        }
    }
    
    return tools;
}

function extractCertifications(text: string, sentences: string[]): ExtractedKeyword[] {
    const certPatterns = [
        // General certification patterns
        /\b(certified|certification|certificate|licensed|license)\s+\w+/gi,
        // Specific certifications
        /\b(cpa|cfa|pmp|scrum\s*master|aws\s*certified|google\s*certified|six\s*sigma|ccna|cissp|ceh|comptia|prince2|itil)\b/gi,
        // Healthcare
        /\b(rn|lpn|bls|acls|cpr|registered\s*nurse|licensed\s*practical\s*nurse)\b/gi,
        // Trade licenses
        /\b(journeyman|master\s*electrician|licensed\s*contractor|osha\s*\d+)\b/gi
    ];
    
    const certs: ExtractedKeyword[] = [];
    const foundCerts = new Set<string>();
    
    for (const pattern of certPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            for (const match of matches) {
                const normalized = match.toLowerCase().trim();
                if (!foundCerts.has(normalized)) {
                    foundCerts.add(normalized);
                    
                    let importance: 'required' | 'preferred' | 'nice_to_have' = 'preferred';
                    const context = sentences.find(s => s.toLowerCase().includes(normalized)) || '';
                    
                    if (/required|must|essential/i.test(context)) {
                        importance = 'required';
                    }
                    
                    certs.push({
                        keyword: match,
                        category: 'certification',
                        importance,
                        context: context.slice(0, 150)
                    });
                }
            }
        }
    }
    
    return certs;
}

function extractEducation(text: string): string[] {
    const eduPatterns = [
        /\b(bachelor'?s?|master'?s?|phd|doctorate|associate'?s?|diploma)\s*(degree|of)?\s*(in)?\s*\w+/gi,
        /\b(bs|ba|ms|ma|mba|bsc|msc|btech|mtech|bcom|mcom|llb|llm|md|rn)\b/gi,
        /\b(degree|graduate|post.?graduate|undergraduate)\s*(in|from)?\s*\w+/gi,
        /\b(high\s*school|ged|equivalent)\b/gi
    ];
    
    const education: string[] = [];
    
    for (const pattern of eduPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            education.push(...matches.map(m => m.trim()));
        }
    }
    
    return [...new Set(education)];
}

function extractExperienceRequirements(text: string): string[] {
    const expPatterns = [
        /(\d+)\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)?/gi,
        /experience\s*(of|with)?\s*(\d+)\+?\s*(years?|yrs?)/gi,
        /(\d+)\s*(-|to)\s*(\d+)\s*(years?|yrs?)/gi
    ];
    
    const requirements: string[] = [];
    
    for (const pattern of expPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            requirements.push(...matches.map(m => m.trim()));
        }
    }
    
    return [...new Set(requirements)];
}

function extractResponsibilities(sentences: string[]): string[] {
    const responsibilityIndicators = [
        /^(you\s*will|responsibilities|duties|tasks|requirements|what\s*you|role\s*includes)/i,
        /\b(responsible\s*for|manage|develop|create|lead|coordinate|ensure|maintain|analyze|design|implement|support|collaborate|communicate)\b/i
    ];
    
    const responsibilities: string[] = [];
    
    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length < 20 || trimmed.length > 300) continue;
        
        // Check if sentence looks like a responsibility
        if (responsibilityIndicators.some(pattern => pattern.test(trimmed))) {
            // Clean up bullet points and numbering
            const cleaned = trimmed
                .replace(/^[\s\-\•\*\d\.]+/, '')
                .trim();
            
            if (cleaned.length > 15) {
                responsibilities.push(cleaned);
            }
        }
    }
    
    return responsibilities.slice(0, 15); // Limit to 15 responsibilities
}

function extractLocation(text: string): string | null {
    const locationPatterns = [
        /location[:\s]+([A-Za-z\s,]+)/i,
        /based\s*in[:\s]+([A-Za-z\s,]+)/i,
        /\b([A-Z][a-z]+,?\s*[A-Z]{2})\b/, // City, State format
        /\b(new\s*york|san\s*francisco|los\s*angeles|chicago|boston|seattle|austin|denver|atlanta|dallas|houston|miami|bangalore|mumbai|delhi|hyderabad|london|berlin|singapore|dubai)\b/i
    ];
    
    for (const pattern of locationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

function detectUrgency(text: string): 'high' | 'medium' | 'low' {
    if (/\b(immediate|urgent|asap|right\s*away|start\s*immediately)\b/i.test(text)) {
        return 'high';
    }
    if (/\b(soon|quickly|fast.?track)\b/i.test(text)) {
        return 'medium';
    }
    return 'low';
}

function calculateConfidence(
    hardSkills: ExtractedKeyword[], 
    responsibilities: string[], 
    detectedRole: string | null
): number {
    let score = 50; // Base score
    
    if (hardSkills.length >= 5) score += 15;
    else if (hardSkills.length >= 3) score += 10;
    
    if (responsibilities.length >= 5) score += 15;
    else if (responsibilities.length >= 3) score += 10;
    
    if (detectedRole) score += 10;
    
    const hasRequired = hardSkills.some(s => s.importance === 'required');
    if (hasRequired) score += 10;
    
    return Math.min(score, 100);
}

// ═══════════════════════════════════════════════════════════════
// COMPARISON WITH RESUME
// ═══════════════════════════════════════════════════════════════

export interface JDResumeComparison {
    matchedSkills: string[];
    partiallyMatchedSkills: { jdSkill: string; resumeSkill: string }[];
    missingSkills: { skill: string; importance: string }[];
    matchedCertifications: string[];
    missingCertifications: string[];
    experienceMatch: boolean;
    educationMatch: boolean;
    overallAlignment: 'strong' | 'moderate' | 'weak';
    actionableAdvice: string[];
}

export function compareJDToResume(
    parsedJD: ParsedJD, 
    resumeSkills: string[], 
    resumeText: string
): JDResumeComparison {
    const resumeTextLower = resumeText.toLowerCase();
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    
    const matched: string[] = [];
    const partial: { jdSkill: string; resumeSkill: string }[] = [];
    const missing: { skill: string; importance: string }[] = [];
    
    // Check hard skills
    for (const skill of parsedJD.hardSkills) {
        const skillLower = skill.keyword.toLowerCase();
        
        if (resumeSkillsLower.some(rs => rs.includes(skillLower) || skillLower.includes(rs))) {
            matched.push(skill.keyword);
        } else if (resumeTextLower.includes(skillLower)) {
            matched.push(skill.keyword);
        } else {
            // Check for partial matches
            const partialMatch = findPartialSkillMatch(skillLower, resumeSkillsLower);
            if (partialMatch) {
                partial.push({ jdSkill: skill.keyword, resumeSkill: partialMatch });
            } else {
                missing.push({ skill: skill.keyword, importance: skill.importance });
            }
        }
    }
    
    // Check certifications
    const matchedCerts = parsedJD.certifications
        .filter(cert => resumeTextLower.includes(cert.keyword.toLowerCase()))
        .map(cert => cert.keyword);
    
    const missingCerts = parsedJD.certifications
        .filter(cert => !resumeTextLower.includes(cert.keyword.toLowerCase()))
        .map(cert => cert.keyword);
    
    // Calculate alignment
    const totalSkills = parsedJD.hardSkills.length;
    const matchRate = totalSkills > 0 ? (matched.length + partial.length * 0.5) / totalSkills : 0;
    
    let overallAlignment: 'strong' | 'moderate' | 'weak';
    if (matchRate >= 0.7) overallAlignment = 'strong';
    else if (matchRate >= 0.4) overallAlignment = 'moderate';
    else overallAlignment = 'weak';
    
    // Generate advice
    const actionableAdvice = generateComparisonAdvice(matched, missing, partial, parsedJD);
    
    return {
        matchedSkills: matched,
        partiallyMatchedSkills: partial,
        missingSkills: missing,
        matchedCertifications: matchedCerts,
        missingCertifications: missingCerts,
        experienceMatch: checkExperienceMatch(parsedJD, resumeText),
        educationMatch: checkEducationMatch(parsedJD, resumeText),
        overallAlignment,
        actionableAdvice
    };
}

function findPartialSkillMatch(jdSkill: string, resumeSkills: string[]): string | null {
    // Define skill variations
    const variations: Record<string, string[]> = {
        'javascript': ['js', 'es6', 'ecmascript'],
        'typescript': ['ts'],
        'python': ['py', 'python3'],
        'machine learning': ['ml', 'deep learning'],
        'project management': ['pm', 'project manager'],
        'customer service': ['client service', 'customer support'],
        'data analysis': ['data analytics', 'analytics']
    };
    
    // Check variations
    for (const [base, variants] of Object.entries(variations)) {
        if (jdSkill.includes(base) || variants.some(v => jdSkill.includes(v))) {
            for (const resumeSkill of resumeSkills) {
                if (resumeSkill.includes(base) || variants.some(v => resumeSkill.includes(v))) {
                    return resumeSkill;
                }
            }
        }
    }
    
    return null;
}

function checkExperienceMatch(parsedJD: ParsedJD, resumeText: string): boolean {
    // If no experience requirement, assume match
    if (parsedJD.experienceRequirements.length === 0) return true;
    
    // Check for experience mentions in resume
    const yearsPattern = /(\d+)\+?\s*(years?|yrs?)/gi;
    const resumeYears = resumeText.match(yearsPattern);
    
    return resumeYears !== null && resumeYears.length > 0;
}

function checkEducationMatch(parsedJD: ParsedJD, resumeText: string): boolean {
    if (parsedJD.educationRequirements.length === 0) return true;
    
    const eduKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'university', 'college'];
    return eduKeywords.some(kw => resumeText.toLowerCase().includes(kw));
}

function generateComparisonAdvice(
    matched: string[],
    missing: { skill: string; importance: string }[],
    partial: { jdSkill: string; resumeSkill: string }[],
    parsedJD: ParsedJD
): string[] {
    const advice: string[] = [];
    
    // Positive feedback first
    if (matched.length > 0) {
        advice.push(`Your resume matches ${matched.length} key skills from this job description.`);
    }
    
    // Required missing skills
    const requiredMissing = missing.filter(m => m.importance === 'required');
    if (requiredMissing.length > 0 && requiredMissing.length <= 3) {
        advice.push(`Add these required skills if you have them: ${requiredMissing.map(m => m.skill).join(', ')}`);
    } else if (requiredMissing.length > 3) {
        advice.push(`${requiredMissing.length} required skills are missing. Consider if this role is a good fit.`);
    }
    
    // Partial matches
    if (partial.length > 0) {
        advice.push(`Consider using exact terminology: "${partial[0].jdSkill}" instead of "${partial[0].resumeSkill}"`);
    }
    
    // Industry-specific advice
    const industryInfo = getIndustryInfo(parsedJD.detectedIndustry);
    if (industryInfo && industryInfo.certificationBodies.length > 0) {
        const hasCert = parsedJD.certifications.length > 0;
        if (hasCert) {
            advice.push(`This role values certifications. Highlight any ${industryInfo.name} certifications prominently.`);
        }
    }
    
    return advice.slice(0, 5); // Limit to 5 pieces of advice
}

export default parseJobDescription;
