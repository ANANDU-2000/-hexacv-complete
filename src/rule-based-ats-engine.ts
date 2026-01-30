/**
 * RULE-BASED ATS ENGINE
 * Offline ATS analysis - NO AI REQUIRED
 * 
 * This module provides:
 * - Keyword matching against role requirements
 * - Skill gap analysis
 * - Resume scoring based on rules
 * - Recommendations without AI
 */

import { 
    ROLE_LIBRARY, 
    RoleKnowledge, 
    findRoleKnowledge 
} from './offline-role-library';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ATSAnalysisResult {
    targetRole: string;
    roleFound: boolean;
    
    // Skill analysis
    skillAnalysis: {
        matchedRequired: string[];
        missingRequired: string[];
        matchedOptional: string[];
        missingOptional: string[];
        extraSkills: string[];
    };
    
    // Tool analysis
    toolAnalysis: {
        matched: string[];
        missing: string[];
        extra: string[];
    };
    
    // Keyword analysis
    keywordAnalysis: {
        matched: string[];
        missing: string[];
        density: number;
    };
    
    // Scores (rule-based, NOT AI)
    scores: {
        skillMatch: number;       // 0-100
        toolMatch: number;        // 0-100
        keywordMatch: number;     // 0-100
        overallMatch: number;     // 0-100
    };
    
    // Recommendations (pre-defined based on rules)
    recommendations: string[];
    
    // Warnings
    warnings: string[];
    
    // Role-specific tips from library
    roleTips: string[];
    
    // Common mistakes to avoid
    commonMistakes: string[];
}

export interface ResumeInput {
    targetRole?: string;
    skills?: string[];
    tools?: string[];
    experienceText?: string;
    summaryText?: string;
    fullText?: string;
}

// ═══════════════════════════════════════════════════════════════
// RULE-BASED ATS ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze resume against target role using RULES ONLY
 * NO AI REQUIRED - Works completely offline
 */
export function analyzeResumeOffline(input: ResumeInput): ATSAnalysisResult {
    const targetRole = input.targetRole || 'General';
    
    // Find role in library
    const roleKnowledge = findRoleKnowledge(targetRole);
    
    // If role not found, provide generic analysis
    if (!roleKnowledge) {
        return analyzeWithGenericRules(input);
    }
    
    // Extract text for analysis
    const resumeText = combineResumeText(input);
    const userSkills = input.skills || extractSkillsFromText(resumeText);
    const userTools = input.tools || extractToolsFromText(resumeText);
    
    // Perform skill analysis
    const skillAnalysis = analyzeSkills(userSkills, roleKnowledge);
    
    // Perform tool analysis
    const toolAnalysis = analyzeTools(userTools, roleKnowledge);
    
    // Perform keyword analysis
    const keywordAnalysis = analyzeKeywords(resumeText, roleKnowledge);
    
    // Calculate scores
    const scores = calculateScores(skillAnalysis, toolAnalysis, keywordAnalysis, roleKnowledge);
    
    // Generate recommendations
    const recommendations = generateRecommendations(
        skillAnalysis, 
        toolAnalysis, 
        keywordAnalysis, 
        roleKnowledge
    );
    
    // Generate warnings
    const warnings = generateWarnings(skillAnalysis, toolAnalysis, scores);
    
    return {
        targetRole,
        roleFound: true,
        skillAnalysis,
        toolAnalysis,
        keywordAnalysis,
        scores,
        recommendations,
        warnings,
        roleTips: roleKnowledge.resumeTips,
        commonMistakes: roleKnowledge.commonMistakes
    };
}

// ═══════════════════════════════════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function combineResumeText(input: ResumeInput): string {
    const parts = [
        input.fullText || '',
        input.summaryText || '',
        input.experienceText || '',
        (input.skills || []).join(' '),
        (input.tools || []).join(' ')
    ];
    return parts.join(' ').toLowerCase();
}

function analyzeSkills(
    userSkills: string[], 
    role: RoleKnowledge
): ATSAnalysisResult['skillAnalysis'] {
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];
    const matchedOptional: string[] = [];
    const missingOptional: string[] = [];
    const extraSkills: string[] = [];
    
    // Check required skills
    for (const skill of role.requiredSkills) {
        if (containsSkill(userSkillsLower, skill)) {
            matchedRequired.push(skill);
        } else {
            missingRequired.push(skill);
        }
    }
    
    // Check optional skills
    for (const skill of role.optionalSkills) {
        if (containsSkill(userSkillsLower, skill)) {
            matchedOptional.push(skill);
        } else {
            missingOptional.push(skill);
        }
    }
    
    // Find extra skills (user has but not in role definition)
    const allRoleSkills = [...role.requiredSkills, ...role.optionalSkills]
        .map(s => s.toLowerCase());
    
    for (const skill of userSkills) {
        const skillLower = skill.toLowerCase();
        if (!allRoleSkills.some(rs => rs.includes(skillLower) || skillLower.includes(rs))) {
            extraSkills.push(skill);
        }
    }
    
    return {
        matchedRequired,
        missingRequired,
        matchedOptional,
        missingOptional,
        extraSkills
    };
}

function analyzeTools(
    userTools: string[], 
    role: RoleKnowledge
): ATSAnalysisResult['toolAnalysis'] {
    const userToolsLower = userTools.map(t => t.toLowerCase());
    
    const matched: string[] = [];
    const missing: string[] = [];
    const extra: string[] = [];
    
    // Check expected tools
    for (const tool of role.commonTools) {
        if (containsSkill(userToolsLower, tool)) {
            matched.push(tool);
        } else {
            missing.push(tool);
        }
    }
    
    // Find extra tools
    const roleToolsLower = role.commonTools.map(t => t.toLowerCase());
    for (const tool of userTools) {
        const toolLower = tool.toLowerCase();
        if (!roleToolsLower.some(rt => rt.includes(toolLower) || toolLower.includes(rt))) {
            extra.push(tool);
        }
    }
    
    return { matched, missing, extra };
}

function analyzeKeywords(
    resumeText: string, 
    role: RoleKnowledge
): ATSAnalysisResult['keywordAnalysis'] {
    const textLower = resumeText.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];
    
    // Check expected keywords
    for (const keyword of role.keywordsRecruitersExpect) {
        if (textLower.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    }
    
    // Calculate keyword density
    const totalWords = textLower.split(/\s+/).length;
    const keywordCount = matched.reduce((count, kw) => {
        const regex = new RegExp(kw.toLowerCase(), 'gi');
        return count + (textLower.match(regex) || []).length;
    }, 0);
    
    const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
    
    return { matched, missing, density };
}

// ═══════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function calculateScores(
    skillAnalysis: ATSAnalysisResult['skillAnalysis'],
    toolAnalysis: ATSAnalysisResult['toolAnalysis'],
    keywordAnalysis: ATSAnalysisResult['keywordAnalysis'],
    role: RoleKnowledge
): ATSAnalysisResult['scores'] {
    // Skill match score
    const requiredCount = role.requiredSkills.length;
    const matchedRequiredCount = skillAnalysis.matchedRequired.length;
    const optionalCount = role.optionalSkills.length;
    const matchedOptionalCount = skillAnalysis.matchedOptional.length;
    
    const skillMatch = requiredCount > 0
        ? Math.round(((matchedRequiredCount / requiredCount) * 70) + 
                     ((matchedOptionalCount / Math.max(optionalCount, 1)) * 30))
        : 50;
    
    // Tool match score
    const toolCount = role.commonTools.length;
    const matchedToolCount = toolAnalysis.matched.length;
    const toolMatch = toolCount > 0
        ? Math.round((matchedToolCount / toolCount) * 100)
        : 50;
    
    // Keyword match score
    const keywordCount = role.keywordsRecruitersExpect.length;
    const matchedKeywordCount = keywordAnalysis.matched.length;
    const keywordMatch = keywordCount > 0
        ? Math.round((matchedKeywordCount / keywordCount) * 100)
        : 50;
    
    // Overall match (weighted average)
    const overallMatch = Math.round(
        (skillMatch * 0.4) + 
        (toolMatch * 0.25) + 
        (keywordMatch * 0.35)
    );
    
    return {
        skillMatch: Math.min(100, skillMatch),
        toolMatch: Math.min(100, toolMatch),
        keywordMatch: Math.min(100, keywordMatch),
        overallMatch: Math.min(100, overallMatch)
    };
}

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION GENERATION (RULE-BASED)
// ═══════════════════════════════════════════════════════════════

function generateRecommendations(
    skillAnalysis: ATSAnalysisResult['skillAnalysis'],
    toolAnalysis: ATSAnalysisResult['toolAnalysis'],
    keywordAnalysis: ATSAnalysisResult['keywordAnalysis'],
    role: RoleKnowledge
): string[] {
    const recommendations: string[] = [];
    
    // Missing required skills
    if (skillAnalysis.missingRequired.length > 0) {
        const top3 = skillAnalysis.missingRequired.slice(0, 3);
        recommendations.push(
            `Add these required skills if you have them: ${top3.join(', ')}`
        );
    }
    
    // Missing tools
    if (toolAnalysis.missing.length > 0) {
        const top3 = toolAnalysis.missing.slice(0, 3);
        recommendations.push(
            `Consider mentioning these tools if you've used them: ${top3.join(', ')}`
        );
    }
    
    // Missing keywords
    if (keywordAnalysis.missing.length > 0) {
        const top3 = keywordAnalysis.missing.slice(0, 3);
        recommendations.push(
            `Include these keywords in your experience bullets: ${top3.join(', ')}`
        );
    }
    
    // Good matches
    if (skillAnalysis.matchedRequired.length > 5) {
        recommendations.push(
            'Good skill coverage. Focus on quantifying achievements for each skill.'
        );
    }
    
    // Action verbs recommendation
    if (role.actionVerbs.length > 0) {
        recommendations.push(
            `Start bullets with strong action verbs like: ${role.actionVerbs.slice(0, 5).join(', ')}`
        );
    }
    
    // Metrics recommendation
    if (role.metricsToHighlight.length > 0) {
        recommendations.push(
            `Include metrics such as: ${role.metricsToHighlight.slice(0, 3).join(', ')}`
        );
    }
    
    // Formatting recommendation
    recommendations.push(
        `Recommended length: ${role.formattingNorms.preferredLength}`
    );
    
    return recommendations;
}

function generateWarnings(
    skillAnalysis: ATSAnalysisResult['skillAnalysis'],
    toolAnalysis: ATSAnalysisResult['toolAnalysis'],
    scores: ATSAnalysisResult['scores']
): string[] {
    const warnings: string[] = [];
    
    // Critical skill gaps
    if (skillAnalysis.missingRequired.length > skillAnalysis.matchedRequired.length) {
        warnings.push(
            'Major skill gap detected. You are missing more required skills than you have.'
        );
    }
    
    // Low overall match
    if (scores.overallMatch < 40) {
        warnings.push(
            'Low match score. Consider if this role is a good fit for your current experience.'
        );
    }
    
    // No tools matched
    if (toolAnalysis.matched.length === 0 && toolAnalysis.missing.length > 0) {
        warnings.push(
            'No matching tools found. Add relevant tools/software to your skills section.'
        );
    }
    
    return warnings;
}

// ═══════════════════════════════════════════════════════════════
// GENERIC ANALYSIS (WHEN ROLE NOT FOUND)
// ═══════════════════════════════════════════════════════════════

function analyzeWithGenericRules(input: ResumeInput): ATSAnalysisResult {
    const resumeText = combineResumeText(input);
    const userSkills = input.skills || extractSkillsFromText(resumeText);
    const userTools = input.tools || extractToolsFromText(resumeText);
    
    // Generic keywords that work for most roles
    const genericKeywords = [
        'achieved', 'improved', 'led', 'managed', 'developed',
        'increased', 'reduced', 'created', 'implemented', 'delivered'
    ];
    
    const matchedKeywords = genericKeywords.filter(kw => 
        resumeText.toLowerCase().includes(kw)
    );
    
    const missingKeywords = genericKeywords.filter(kw => 
        !resumeText.toLowerCase().includes(kw)
    );
    
    return {
        targetRole: input.targetRole || 'General',
        roleFound: false,
        skillAnalysis: {
            matchedRequired: [],
            missingRequired: [],
            matchedOptional: [],
            missingOptional: [],
            extraSkills: userSkills
        },
        toolAnalysis: {
            matched: [],
            missing: [],
            extra: userTools
        },
        keywordAnalysis: {
            matched: matchedKeywords,
            missing: missingKeywords,
            density: 0
        },
        scores: {
            skillMatch: 50,
            toolMatch: 50,
            keywordMatch: Math.round((matchedKeywords.length / genericKeywords.length) * 100),
            overallMatch: 50
        },
        recommendations: [
            'Role not found in our database. Using generic analysis.',
            'Consider specifying a more common job title.',
            'Focus on quantifiable achievements in your bullets.',
            'Use strong action verbs to start each bullet point.',
            'Include relevant tools and technologies you\'ve used.'
        ],
        warnings: [
            'Your target role was not found in our database. Analysis is limited.'
        ],
        roleTips: [
            'Quantify your achievements with numbers',
            'Use action verbs at the start of each bullet',
            'Tailor your resume to the job description',
            'Keep formatting clean and ATS-friendly',
            'Include relevant keywords from the job posting'
        ],
        commonMistakes: [
            'Vague descriptions without metrics',
            'Using "responsible for" instead of action verbs',
            'Including irrelevant experience',
            'Too long or too short resume',
            'Inconsistent formatting'
        ]
    };
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if user skills contain a required skill (fuzzy match)
 */
function containsSkill(userSkills: string[], targetSkill: string): boolean {
    const target = targetSkill.toLowerCase();
    
    return userSkills.some(skill => {
        const skillLower = skill.toLowerCase();
        // Exact match
        if (skillLower === target) return true;
        // Contains match
        if (skillLower.includes(target) || target.includes(skillLower)) return true;
        // Word boundary match
        const skillWords = skillLower.split(/\s+/);
        const targetWords = target.split(/\s+/);
        return targetWords.some(tw => skillWords.some(sw => sw === tw || sw.includes(tw)));
    });
}

/**
 * Extract skills from text using pattern matching
 */
function extractSkillsFromText(text: string): string[] {
    const skills: string[] = [];
    
    // Common skill patterns
    const skillPatterns = [
        // Programming languages
        /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|go|rust|swift|kotlin)\b/gi,
        // Frameworks
        /\b(react|angular|vue|node|express|django|flask|spring|rails)\b/gi,
        // Databases
        /\b(sql|mysql|postgresql|mongodb|redis|oracle|dynamodb)\b/gi,
        // Tools
        /\b(git|docker|kubernetes|jenkins|aws|azure|gcp)\b/gi,
        // Soft skills
        /\b(leadership|communication|teamwork|problem.?solving|analytical)\b/gi,
        // Business skills
        /\b(excel|powerpoint|word|salesforce|sap|oracle|quickbooks)\b/gi
    ];
    
    for (const pattern of skillPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            skills.push(...matches.map(m => m.toLowerCase()));
        }
    }
    
    return [...new Set(skills)];
}

/**
 * Extract tools from text using pattern matching
 */
function extractToolsFromText(text: string): string[] {
    const tools: string[] = [];
    
    const toolPatterns = [
        /\b(microsoft\s+\w+|google\s+\w+|adobe\s+\w+)\b/gi,
        /\b(jira|confluence|slack|zoom|teams|asana|trello|notion)\b/gi,
        /\b(figma|sketch|photoshop|illustrator|xd)\b/gi,
        /\b(vs\s*code|intellij|eclipse|xcode|android\s*studio)\b/gi,
        /\b(github|gitlab|bitbucket|jenkins|circleci)\b/gi
    ];
    
    for (const pattern of toolPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            tools.push(...matches.map(m => m.toLowerCase()));
        }
    }
    
    return [...new Set(tools)];
}

// ═══════════════════════════════════════════════════════════════
// QUICK ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Quick skill gap check - returns just missing skills
 */
export function quickSkillGapCheck(
    targetRole: string, 
    userSkills: string[]
): { missing: string[]; matched: string[] } {
    const role = findRoleKnowledge(targetRole);
    
    if (!role) {
        return { missing: [], matched: userSkills };
    }
    
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const matched: string[] = [];
    const missing: string[] = [];
    
    for (const skill of role.requiredSkills) {
        if (containsSkill(userSkillsLower, skill)) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    }
    
    return { missing, matched };
}

/**
 * Get keywords for a role (offline)
 */
export function getRoleKeywords(targetRole: string): string[] {
    const role = findRoleKnowledge(targetRole);
    return role ? role.keywordsRecruitersExpect : [];
}

/**
 * Get action verbs for a role (offline)
 */
export function getRoleActionVerbs(targetRole: string): string[] {
    const role = findRoleKnowledge(targetRole);
    return role ? role.actionVerbs : [
        'Achieved', 'Built', 'Created', 'Delivered', 'Developed',
        'Drove', 'Established', 'Executed', 'Generated', 'Implemented'
    ];
}

/**
 * Get metrics to highlight for a role (offline)
 */
export function getRoleMetrics(targetRole: string): string[] {
    const role = findRoleKnowledge(targetRole);
    return role ? role.metricsToHighlight : [];
}

/**
 * Check if resume has enough metrics
 */
export function checkMetricDensity(text: string): {
    hasMetrics: boolean;
    count: number;
    recommendation: string;
} {
    // Pattern to find numbers/metrics
    const metricPatterns = [
        /\d+%/g,                           // Percentages
        /\$[\d,]+/g,                       // Dollar amounts
        /\d+[kKmMbB]/g,                    // Abbreviations (5K, 2M)
        /\d+\+?\s*(users|customers|clients|projects|teams?)/gi,  // Counts
        /\d+x\s/g,                         // Multipliers (2x, 10x)
        /\d{1,2}\/\d{1,2}/g,              // Fractions
        /#\d+/g,                           // Rankings
    ];
    
    let count = 0;
    for (const pattern of metricPatterns) {
        const matches = text.match(pattern);
        if (matches) {
            count += matches.length;
        }
    }
    
    let recommendation = '';
    if (count === 0) {
        recommendation = 'No metrics found. Add numbers to quantify your achievements.';
    } else if (count < 3) {
        recommendation = 'Few metrics found. Try to add 1-2 metrics per role.';
    } else {
        recommendation = 'Good metric density. Ensure each metric shows meaningful impact.';
    }
    
    return {
        hasMetrics: count > 0,
        count,
        recommendation
    };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    analyzeResumeOffline,
    quickSkillGapCheck,
    getRoleKeywords,
    getRoleActionVerbs,
    getRoleMetrics,
    checkMetricDensity
};
