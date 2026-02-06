/**
 * ROLE-AWARE GUIDANCE ENGINE
 * Provides industry-specific, experience-level appropriate advice
 * NO generic tips - Every tip is contextual
 */

import { 
    RoleDefinition, 
    IndustryCategory, 
    ExperienceLevel,
    findRole, 
    getIndustryInfo,
    detectIndustry,
    INDUSTRIES
} from './universal-role-database';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RoleGuidance {
    role: string;
    industry: IndustryCategory;
    level: ExperienceLevel;
    
    // Section-specific guidance
    summaryGuidance: SectionGuidance;
    experienceGuidance: SectionGuidance;
    skillsGuidance: SectionGuidance;
    educationGuidance: SectionGuidance;
    projectsGuidance: SectionGuidance;
    
    // Writing style
    toneAdvice: string;
    formatAdvice: string;
    lengthAdvice: string;
    
    // Photo recommendation
    photoAdvice: PhotoAdvice;
    
    // ATS guidance
    atsKeywords: string[];
    atsTips: string[];
    
    // Industry insights
    marketInsights: MarketInsight[];
    
    // Common mistakes for this role
    commonMistakes: string[];
    
    // What recruiters look for
    recruiterFocus: string[];
}

export interface SectionGuidance {
    importance: 'critical' | 'important' | 'optional';
    tips: string[];
    examples: string[];
    avoidList: string[];
    wordCount?: { min: number; max: number };
}

export interface PhotoAdvice {
    recommendation: 'required' | 'recommended' | 'optional' | 'not_recommended';
    reason: string;
    tips: string[];
}

export interface MarketInsight {
    title: string;
    insight: string;
    actionable: string;
}

// ═══════════════════════════════════════════════════════════════
// EXPERIENCE LEVEL SPECIFIC GUIDANCE
// ═══════════════════════════════════════════════════════════════

const LEVEL_GUIDANCE: Record<ExperienceLevel, {
    summaryFocus: string;
    experienceFocus: string;
    projectsImportance: 'critical' | 'important' | 'optional';
    educationImportance: 'critical' | 'important' | 'optional';
    lengthAdvice: string;
}> = {
    intern: {
        summaryFocus: 'Focus on academic achievements, relevant coursework, and career goals.',
        experienceFocus: 'Highlight internships, part-time jobs, and volunteer work. Any work experience counts.',
        projectsImportance: 'critical',
        educationImportance: 'critical',
        lengthAdvice: 'Keep resume to 1 page. Quality over quantity.'
    },
    fresher: {
        summaryFocus: 'Lead with your education and key skills. Show eagerness to learn and contribute.',
        experienceFocus: 'Include internships, projects, and any relevant experience. Describe transferable skills.',
        projectsImportance: 'critical',
        educationImportance: 'critical',
        lengthAdvice: '1 page is ideal. Focus on potential, not just experience.'
    },
    junior: {
        summaryFocus: 'Highlight 1-2 years of relevant experience and key accomplishments.',
        experienceFocus: 'Show progression and learning. Quantify achievements where possible.',
        projectsImportance: 'important',
        educationImportance: 'important',
        lengthAdvice: '1 page preferred. Can extend to 2 if content is strong.'
    },
    mid: {
        summaryFocus: 'Emphasize expertise and track record of results.',
        experienceFocus: 'Focus on impact and achievements. Less on basic responsibilities.',
        projectsImportance: 'optional',
        educationImportance: 'important',
        lengthAdvice: '1-2 pages. Quality achievements matter more than length.'
    },
    senior: {
        summaryFocus: 'Lead with leadership, strategic impact, and domain expertise.',
        experienceFocus: 'Highlight leadership, mentoring, and business impact.',
        projectsImportance: 'optional',
        educationImportance: 'optional',
        lengthAdvice: '2 pages acceptable. Focus on senior-level achievements.'
    },
    lead: {
        summaryFocus: 'Emphasize team leadership, project delivery, and technical direction.',
        experienceFocus: 'Show team size managed, project scope, and organizational impact.',
        projectsImportance: 'optional',
        educationImportance: 'optional',
        lengthAdvice: '2 pages. Include both technical and leadership achievements.'
    },
    manager: {
        summaryFocus: 'Lead with management scope, team development, and business results.',
        experienceFocus: 'Quantify team size, budget managed, and business outcomes.',
        projectsImportance: 'optional',
        educationImportance: 'optional',
        lengthAdvice: '2 pages. Balance management and functional expertise.'
    },
    director: {
        summaryFocus: 'Focus on strategic vision, organizational transformation, and P&L responsibility.',
        experienceFocus: 'Highlight department-level achievements, strategy execution, and cross-functional leadership.',
        projectsImportance: 'optional',
        educationImportance: 'optional',
        lengthAdvice: '2 pages. Executive summary style.'
    },
    executive: {
        summaryFocus: 'Lead with company-wide impact, board-level experience, and industry recognition.',
        experienceFocus: 'Focus on strategic initiatives, M&A, fundraising, and market positioning.',
        projectsImportance: 'optional',
        educationImportance: 'optional',
        lengthAdvice: '2-3 pages acceptable for C-level. Consider executive bio format.'
    }
};

// ═══════════════════════════════════════════════════════════════
// INDUSTRY-SPECIFIC GUIDANCE
// ═══════════════════════════════════════════════════════════════

const INDUSTRY_GUIDANCE: Partial<Record<IndustryCategory, {
    keyFocus: string[];
    mustHave: string[];
    recruitersLookFor: string[];
    commonMistakes: string[];
    atsImportance: 'high' | 'medium' | 'low';
    formatPreference: 'formal' | 'professional' | 'creative' | 'technical';
}>> = {
    technology: {
        keyFocus: ['Technical skills', 'Project impact', 'Problem solving', 'Continuous learning'],
        mustHave: ['Technical skills section', 'GitHub/Portfolio link', 'Quantified achievements'],
        recruitersLookFor: ['Relevant tech stack', 'Scale of projects', 'Team collaboration', 'System design thinking'],
        commonMistakes: ['Listing every technology ever used', 'No quantified impact', 'Too focused on responsibilities vs achievements'],
        atsImportance: 'high',
        formatPreference: 'technical'
    },
    healthcare: {
        keyFocus: ['Patient outcomes', 'Clinical skills', 'Compliance', 'Team collaboration'],
        mustHave: ['Licenses and certifications', 'Clinical specialties', 'EMR/EHR systems used'],
        recruitersLookFor: ['Current licensure', 'Patient care experience', 'Specialization', 'Safety record'],
        commonMistakes: ['Missing license numbers', 'Not specifying patient populations', 'Ignoring soft skills'],
        atsImportance: 'medium',
        formatPreference: 'formal'
    },
    finance: {
        keyFocus: ['Accuracy', 'Compliance', 'Financial impact', 'Process improvement'],
        mustHave: ['Certifications (CPA, CFA)', 'Software proficiency', 'Regulatory knowledge'],
        recruitersLookFor: ['Relevant certifications', 'Industry experience', 'Technical skills', 'Attention to detail'],
        commonMistakes: ['Not quantifying financial impact', 'Missing software skills', 'Vague compliance experience'],
        atsImportance: 'high',
        formatPreference: 'formal'
    },
    education: {
        keyFocus: ['Student outcomes', 'Curriculum development', 'Classroom management', 'Parent engagement'],
        mustHave: ['Teaching credentials', 'Grade levels/subjects taught', 'Student achievement data'],
        recruitersLookFor: ['Certification status', 'Student success metrics', 'Technology integration', 'Differentiated instruction'],
        commonMistakes: ['Not showing student outcomes', 'Missing credential details', 'Generic teaching descriptions'],
        atsImportance: 'medium',
        formatPreference: 'professional'
    },
    sales: {
        keyFocus: ['Revenue generated', 'Quota attainment', 'Client relationships', 'Sales methodology'],
        mustHave: ['Quota/target achievements', 'Deal sizes', 'Client retention metrics'],
        recruitersLookFor: ['Numbers, numbers, numbers', 'Consistent performance', 'Industry experience', 'CRM proficiency'],
        commonMistakes: ['No revenue numbers', 'Vague "exceeded targets"', 'Not specifying sales type (B2B/B2C)'],
        atsImportance: 'medium',
        formatPreference: 'professional'
    },
    marketing: {
        keyFocus: ['Campaign results', 'ROI', 'Brand growth', 'Data-driven decisions'],
        mustHave: ['Campaign metrics', 'Tools proficiency', 'Portfolio/work samples'],
        recruitersLookFor: ['Measurable results', 'Creative + analytical balance', 'Channel expertise', 'Brand experience'],
        commonMistakes: ['No metrics on campaigns', 'Too creative, not results-focused', 'Missing tool proficiency'],
        atsImportance: 'medium',
        formatPreference: 'creative'
    },
    legal: {
        keyFocus: ['Case outcomes', 'Legal expertise', 'Client relationships', 'Research skills'],
        mustHave: ['Bar admissions', 'Practice areas', 'Case types/volume'],
        recruitersLookFor: ['Bar status', 'Relevant practice areas', 'Deal/case volume', 'Writing ability'],
        commonMistakes: ['Missing bar admission details', 'Too much jargon', 'Not quantifying case load'],
        atsImportance: 'medium',
        formatPreference: 'formal'
    },
    hospitality: {
        keyFocus: ['Guest satisfaction', 'Revenue/covers', 'Team management', 'Service excellence'],
        mustHave: ['Service certifications', 'Property/venue type experience', 'Guest satisfaction scores'],
        recruitersLookFor: ['Customer service mindset', 'Operational experience', 'Team leadership', 'Revenue awareness'],
        commonMistakes: ['No guest satisfaction metrics', 'Missing service certifications', 'Not specifying venue type'],
        atsImportance: 'low',
        formatPreference: 'professional'
    },
    construction: {
        keyFocus: ['Project delivery', 'Budget management', 'Safety record', 'Team coordination'],
        mustHave: ['Project sizes/values', 'Certifications (PMP, OSHA)', 'Software proficiency'],
        recruitersLookFor: ['Project portfolio', 'On-time/budget delivery', 'Safety compliance', 'Team management'],
        commonMistakes: ['Not quantifying project values', 'Missing safety record', 'Vague project descriptions'],
        atsImportance: 'medium',
        formatPreference: 'technical'
    },
    trades: {
        keyFocus: ['Technical skills', 'Safety compliance', 'Efficiency', 'Problem solving'],
        mustHave: ['Licenses/certifications', 'Tools/equipment proficiency', 'Safety training'],
        recruitersLookFor: ['Valid licenses', 'Specialization', 'Reliability', 'Physical capability'],
        commonMistakes: ['Missing license numbers', 'Not listing specific skills', 'No safety mentions'],
        atsImportance: 'low',
        formatPreference: 'technical'
    }
};

// ═══════════════════════════════════════════════════════════════
// MAIN GUIDANCE GENERATOR
// ═══════════════════════════════════════════════════════════════

export function generateRoleGuidance(
    targetRole: string,
    experienceLevel: ExperienceLevel = 'mid',
    region: string = 'GLOBAL'
): RoleGuidance {
    // Find role in database
    const roleData = findRole(targetRole);
    const industry = roleData?.industry || detectIndustry(targetRole);
    const industryInfo = getIndustryInfo(industry);
    const levelGuidance = LEVEL_GUIDANCE[experienceLevel];
    const industryGuidance = INDUSTRY_GUIDANCE[industry];
    
    // Generate photo advice based on role and region
    const photoAdvice = generatePhotoAdvice(roleData, industry, region);
    
    // Generate section-specific guidance
    const summaryGuidance = generateSummaryGuidance(roleData, industry, experienceLevel, levelGuidance);
    const experienceGuidance = generateExperienceGuidance(roleData, industry, experienceLevel, levelGuidance);
    const skillsGuidance = generateSkillsGuidance(roleData, industry);
    const educationGuidance = generateEducationGuidance(roleData, industry, experienceLevel, levelGuidance);
    const projectsGuidance = generateProjectsGuidance(roleData, industry, experienceLevel, levelGuidance);
    
    // Generate market insights
    const marketInsights = generateMarketInsights(roleData, industry);
    
    return {
        role: targetRole,
        industry,
        level: experienceLevel,
        summaryGuidance,
        experienceGuidance,
        skillsGuidance,
        educationGuidance,
        projectsGuidance,
        toneAdvice: getToneAdvice(industry, roleData),
        formatAdvice: getFormatAdvice(industry, experienceLevel),
        lengthAdvice: levelGuidance.lengthAdvice,
        photoAdvice,
        atsKeywords: roleData?.atsKeywords || industryInfo?.keySkillCategories || [],
        atsTips: generateATSTips(industry, roleData),
        marketInsights,
        commonMistakes: industryGuidance?.commonMistakes || getGenericMistakes(),
        recruiterFocus: industryGuidance?.recruitersLookFor || getGenericRecruiterFocus()
    };
}

// ═══════════════════════════════════════════════════════════════
// SECTION GUIDANCE GENERATORS
// ═══════════════════════════════════════════════════════════════

function generateSummaryGuidance(
    roleData: RoleDefinition | null,
    industry: IndustryCategory,
    level: ExperienceLevel,
    levelGuidance: typeof LEVEL_GUIDANCE[ExperienceLevel]
): SectionGuidance {
    const examples = roleData?.summaryTemplate 
        ? [roleData.summaryTemplate]
        : getSummaryExamplesByIndustry(industry, level);
    
    return {
        importance: level === 'intern' || level === 'fresher' ? 'important' : 'critical',
        tips: [
            levelGuidance.summaryFocus,
            'Keep it to 2-4 sentences maximum.',
            'Lead with your strongest qualification.',
            `For ${industry} roles, mention relevant ${getIndustryFocusPoint(industry)}.`
        ],
        examples,
        avoidList: [
            'Generic phrases like "hard-working professional"',
            'First person pronouns (I, me, my)',
            'Objective statements (outdated format)',
            'Irrelevant personal information'
        ],
        wordCount: { min: 40, max: 100 }
    };
}

function generateExperienceGuidance(
    roleData: RoleDefinition | null,
    industry: IndustryCategory,
    level: ExperienceLevel,
    levelGuidance: typeof LEVEL_GUIDANCE[ExperienceLevel]
): SectionGuidance {
    const actionVerbs = roleData?.actionVerbs || getIndustryActionVerbs(industry);
    const metricExamples = roleData?.metricExamples || getIndustryMetrics(industry);
    
    return {
        importance: 'critical',
        tips: [
            levelGuidance.experienceFocus,
            `Start each bullet with action verbs: ${actionVerbs.slice(0, 5).join(', ')}`,
            'Quantify achievements wherever possible.',
            `For ${industry}: Focus on ${getIndustryBulletFocus(industry)}.`
        ],
        examples: roleData?.bulletTemplates || getIndustryBulletExamples(industry),
        avoidList: [
            '"Responsible for..." (use action verbs instead)',
            'Job descriptions (focus on achievements)',
            'Bullets longer than 2 lines',
            'Technical jargon without context'
        ],
        wordCount: { min: 10, max: 150 }
    };
}

function generateSkillsGuidance(
    roleData: RoleDefinition | null,
    industry: IndustryCategory
): SectionGuidance {
    const coreSkills = roleData?.coreSkills || [];
    const tools = roleData?.tools || [];
    
    return {
        importance: 'critical',
        tips: [
            'List skills in order of relevance to the target role.',
            'Include both technical and soft skills.',
            'Use exact keywords from job descriptions.',
            `For ${industry}: Prioritize ${getIndustrySkillPriority(industry)}.`
        ],
        examples: [
            ...coreSkills.slice(0, 5),
            ...tools.slice(0, 5)
        ],
        avoidList: [
            'Obvious skills (Microsoft Word, Email)',
            'Outdated technologies',
            'Skills you cannot demonstrate',
            'Too many soft skills without evidence'
        ]
    };
}

function generateEducationGuidance(
    roleData: RoleDefinition | null,
    industry: IndustryCategory,
    level: ExperienceLevel,
    levelGuidance: typeof LEVEL_GUIDANCE[ExperienceLevel]
): SectionGuidance {
    return {
        importance: levelGuidance.educationImportance,
        tips: [
            level === 'fresher' || level === 'intern' 
                ? 'Education is crucial at your level. Include GPA if above 3.5.'
                : 'List highest degree first. Omit GPA if graduated more than 3 years ago.',
            'Include relevant coursework for entry-level positions.',
            roleData?.educationRequirements?.[0] || 'Match education to role requirements.',
            'Include certifications in this section or a separate one.'
        ],
        examples: roleData?.educationRequirements || getIndustryEducation(industry),
        avoidList: [
            'High school (if you have higher education)',
            'Graduation dates more than 15 years old',
            'Irrelevant courses',
            'Incomplete degrees without explanation'
        ]
    };
}

function generateProjectsGuidance(
    roleData: RoleDefinition | null,
    industry: IndustryCategory,
    level: ExperienceLevel,
    levelGuidance: typeof LEVEL_GUIDANCE[ExperienceLevel]
): SectionGuidance {
    return {
        importance: levelGuidance.projectsImportance,
        tips: [
            levelGuidance.projectsImportance === 'critical'
                ? 'Projects are essential to demonstrate skills without extensive work experience.'
                : 'Include only if projects are impressive or relevant to the role.',
            'Describe your specific contribution, not just the project.',
            'Include technologies/methods used.',
            'Show measurable outcomes when possible.'
        ],
        examples: getIndustryProjectExamples(industry),
        avoidList: [
            'Group projects without clarifying your role',
            'School assignments unless exceptional',
            'Incomplete or abandoned projects',
            'Projects without clear outcomes'
        ]
    };
}

// ═══════════════════════════════════════════════════════════════
// PHOTO ADVICE
// ═══════════════════════════════════════════════════════════════

function generatePhotoAdvice(
    roleData: RoleDefinition | null,
    industry: IndustryCategory,
    region: string
): PhotoAdvice {
    // Regional preferences
    const photoByRegion: Record<string, 'recommended' | 'optional' | 'not_recommended'> = {
        'US': 'not_recommended',
        'UK': 'not_recommended',
        'EU': 'recommended', // Germany, France commonly use photos
        'IN': 'optional',
        'ME': 'recommended',
        'APAC': 'optional',
        'LATAM': 'recommended',
        'AFRICA': 'optional',
        'GLOBAL': 'optional'
    };
    
    // Industry preferences
    const photoByIndustry: Partial<Record<IndustryCategory, 'recommended' | 'optional' | 'not_recommended'>> = {
        hospitality: 'recommended',
        aviation: 'recommended',
        sales: 'recommended',
        beauty: 'recommended',
        media: 'optional',
        technology: 'not_recommended',
        legal: 'not_recommended',
        finance: 'optional'
    };
    
    // Use role-specific if available
    if (roleData?.photoRecommendation) {
        return {
            recommendation: roleData.photoRecommendation,
            reason: getPhotoReason(roleData.photoRecommendation, industry),
            tips: getPhotoTips(roleData.photoRecommendation)
        };
    }
    
    // Fall back to industry/region
    const industryPref = photoByIndustry[industry];
    const regionPref = photoByRegion[region] || 'optional';
    
    // Combine preferences (region takes priority for US/UK)
    let recommendation: 'required' | 'recommended' | 'optional' | 'not_recommended';
    if (region === 'US' || region === 'UK') {
        recommendation = 'not_recommended';
    } else {
        recommendation = industryPref || regionPref;
    }
    
    return {
        recommendation,
        reason: getPhotoReason(recommendation, industry),
        tips: getPhotoTips(recommendation)
    };
}

function getPhotoReason(
    recommendation: 'required' | 'recommended' | 'optional' | 'not_recommended',
    industry: IndustryCategory
): string {
    switch (recommendation) {
        case 'required':
            return `Photos are standard practice in ${industry} roles. Recruiters expect to see a professional headshot.`;
        case 'recommended':
            return `Photos are common in ${industry}. A professional headshot can make your application more personal.`;
        case 'optional':
            return 'Photos are optional. Include one only if you have a professional headshot.';
        case 'not_recommended':
            return 'Photos are not expected and may introduce bias. Focus on your qualifications instead.';
    }
}

function getPhotoTips(recommendation: 'required' | 'recommended' | 'optional' | 'not_recommended'): string[] {
    if (recommendation === 'not_recommended') {
        return ['Omit photo to focus attention on qualifications.'];
    }
    
    return [
        'Use a recent, professional headshot.',
        'Dress appropriately for your industry.',
        'Ensure good lighting and a neutral background.',
        'Smile naturally and make eye contact.',
        'Avoid selfies, group photos, or casual images.'
    ];
}

// ═══════════════════════════════════════════════════════════════
// MARKET INSIGHTS
// ═══════════════════════════════════════════════════════════════

function generateMarketInsights(
    roleData: RoleDefinition | null,
    industry: IndustryCategory
): MarketInsight[] {
    const insights: MarketInsight[] = [];
    
    if (roleData) {
        // Demand insight
        if (roleData.demandLevel === 'high') {
            insights.push({
                title: 'High Demand Role',
                insight: `${roleData.name} positions are in high demand. Competition is strong but opportunities are plentiful.`,
                actionable: 'Tailor your resume for each application to stand out.'
            });
        }
        
        // Growth trend
        if (roleData.growthTrend === 'growing') {
            insights.push({
                title: 'Growing Field',
                insight: `The ${roleData.name} field is experiencing growth. New positions are being created.`,
                actionable: 'Highlight relevant emerging skills and willingness to learn.'
            });
        }
        
        // Fresher friendliness
        if (roleData.fresherFriendly) {
            insights.push({
                title: 'Entry-Level Opportunities',
                insight: 'This role commonly hires freshers and entry-level candidates.',
                actionable: `Emphasize: ${roleData.fresherAlternatives.slice(0, 3).join(', ')}.`
            });
        }
    }
    
    // Industry insight
    const industryInfo = INDUSTRIES[industry];
    if (industryInfo) {
        insights.push({
            title: `${industryInfo.name} Industry`,
            insight: industryInfo.description,
            actionable: `Key skills: ${industryInfo.keySkillCategories.slice(0, 3).join(', ')}.`
        });
    }
    
    return insights;
}

// ═══════════════════════════════════════════════════════════════
// ATS TIPS
// ═══════════════════════════════════════════════════════════════

function generateATSTips(industry: IndustryCategory, roleData: RoleDefinition | null): string[] {
    const tips: string[] = [
        'Use standard section headers (Experience, Education, Skills).',
        'Avoid tables, graphics, and complex formatting.',
        'Include keywords from the job description naturally.'
    ];
    
    const industryGuidance = INDUSTRY_GUIDANCE[industry];
    if (industryGuidance?.atsImportance === 'high') {
        tips.push(
            'ATS screening is common in this industry. Keyword matching is crucial.',
            'Use exact terminology from job postings.'
        );
    }
    
    if (roleData?.atsKeywords) {
        tips.push(`Include these keywords if relevant: ${roleData.atsKeywords.slice(0, 5).join(', ')}`);
    }
    
    return tips;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getToneAdvice(industry: IndustryCategory, roleData: RoleDefinition | null): string {
    const toneStyle = roleData?.toneStyle || INDUSTRIES[industry]?.resumeStyle || 'professional';
    
    switch (toneStyle) {
        case 'formal':
            return 'Use formal, professional language. Avoid contractions and casual expressions.';
        case 'technical':
            return 'Technical precision is valued. Use industry-specific terminology accurately.';
        case 'creative':
            return 'Some creativity is acceptable, but keep it professional. Let your work speak.';
        case 'conversational':
            return 'A slightly warmer tone is acceptable, but remain professional.';
        default:
            return 'Use clear, professional language throughout.';
    }
}

function getFormatAdvice(industry: IndustryCategory, level: ExperienceLevel): string {
    const format = INDUSTRY_GUIDANCE[industry]?.formatPreference || 'professional';
    
    if (level === 'executive' || level === 'director') {
        return 'Consider an executive format with a prominent summary section. Leadership and strategic impact should be immediately visible.';
    }
    
    switch (format) {
        case 'formal':
            return 'Use a traditional, conservative format. Clean lines, standard fonts, minimal decoration.';
        case 'technical':
            return 'Technical clarity is key. Clear sections, consistent formatting, easy to scan.';
        case 'creative':
            return 'Subtle design elements are acceptable, but readability comes first.';
        default:
            return 'Use a clean, professional format with clear sections.';
    }
}

function getIndustryFocusPoint(industry: IndustryCategory): string {
    const focusPoints: Partial<Record<IndustryCategory, string>> = {
        technology: 'technologies and scale of work',
        healthcare: 'patient care focus and certifications',
        finance: 'financial impact and compliance expertise',
        education: 'student outcomes and teaching methodology',
        sales: 'revenue numbers and quota achievement',
        marketing: 'campaign results and ROI'
    };
    return focusPoints[industry] || 'relevant industry experience';
}

function getIndustryActionVerbs(industry: IndustryCategory): string[] {
    const verbs: Partial<Record<IndustryCategory, string[]>> = {
        technology: ['Developed', 'Engineered', 'Implemented', 'Optimized', 'Architected', 'Deployed'],
        healthcare: ['Administered', 'Assessed', 'Coordinated', 'Monitored', 'Treated', 'Documented'],
        finance: ['Analyzed', 'Audited', 'Reconciled', 'Forecasted', 'Budgeted', 'Reported'],
        education: ['Taught', 'Developed', 'Assessed', 'Mentored', 'Facilitated', 'Implemented'],
        sales: ['Generated', 'Closed', 'Exceeded', 'Negotiated', 'Cultivated', 'Acquired'],
        marketing: ['Launched', 'Created', 'Drove', 'Increased', 'Optimized', 'Managed']
    };
    return verbs[industry] || ['Managed', 'Led', 'Developed', 'Improved', 'Created', 'Delivered'];
}

function getIndustryMetrics(industry: IndustryCategory): string[] {
    const metrics: Partial<Record<IndustryCategory, string[]>> = {
        technology: ['Reduced latency by X%', 'Handled X daily users', 'Improved performance by X%'],
        healthcare: ['Cared for X patients daily', 'Achieved X% satisfaction', 'Reduced errors by X%'],
        finance: ['Managed $X budget', 'Reduced costs by X%', 'Improved accuracy to X%'],
        education: ['Improved scores by X%', 'Taught X students', 'Achieved X% pass rate'],
        sales: ['Achieved X% of quota', 'Generated $X revenue', 'Closed X deals'],
        marketing: ['Increased traffic by X%', 'Achieved Xx ROI', 'Grew audience by X%']
    };
    return metrics[industry] || ['Improved X by Y%', 'Managed team of X', 'Delivered $X in value'];
}

function getIndustryBulletFocus(industry: IndustryCategory): string {
    const focus: Partial<Record<IndustryCategory, string>> = {
        technology: 'technical impact and scale',
        healthcare: 'patient outcomes and safety',
        finance: 'financial accuracy and compliance',
        education: 'student success and engagement',
        sales: 'revenue and relationship building',
        marketing: 'measurable campaign results'
    };
    return focus[industry] || 'achievements and impact';
}

function getIndustryBulletExamples(industry: IndustryCategory): string[] {
    const examples: Partial<Record<IndustryCategory, string[]>> = {
        technology: [
            'Developed microservices architecture reducing system latency by 40%',
            'Led migration to cloud infrastructure, cutting costs by $200K annually'
        ],
        healthcare: [
            'Provided comprehensive care to 8-10 patients daily in cardiac unit',
            'Implemented new triage protocol reducing wait times by 25%'
        ],
        finance: [
            'Managed month-end close for 5 entities, reducing close time from 10 to 6 days',
            'Identified $500K in cost savings through detailed variance analysis'
        ],
        sales: [
            'Exceeded annual quota by 130%, generating $2.5M in new revenue',
            'Built pipeline of 50+ qualified accounts worth $5M'
        ]
    };
    return examples[industry] || ['Achieved [outcome] by [action], resulting in [metric]'];
}

function getIndustrySkillPriority(industry: IndustryCategory): string {
    const priority: Partial<Record<IndustryCategory, string>> = {
        technology: 'programming languages and frameworks first',
        healthcare: 'clinical skills and certifications first',
        finance: 'financial software and certifications first',
        education: 'teaching credentials and methodologies first',
        sales: 'CRM tools and sales methodologies first',
        marketing: 'digital marketing tools and analytics first'
    };
    return priority[industry] || 'most relevant skills first';
}

function getIndustryEducation(industry: IndustryCategory): string[] {
    const education: Partial<Record<IndustryCategory, string[]>> = {
        technology: ['BS Computer Science', 'Coding Bootcamp', 'MS Data Science'],
        healthcare: ['BSN Nursing', 'MD', 'RN License'],
        finance: ['BS Accounting', 'MBA', 'CPA'],
        education: ['BS Education', 'Teaching Credential', 'MA Education'],
        legal: ['JD', 'LLB', 'Bar Admission']
    };
    return education[industry] || ['Relevant degree', 'Professional certification'];
}

function getIndustryProjectExamples(industry: IndustryCategory): string[] {
    const examples: Partial<Record<IndustryCategory, string[]>> = {
        technology: ['Built full-stack web application using React/Node', 'Developed ML model for prediction'],
        marketing: ['Created social media campaign reaching 100K users', 'Designed brand identity for startup'],
        education: ['Developed curriculum module for AP course', 'Created online learning resources'],
        finance: ['Built financial model for startup valuation', 'Created automated reporting dashboard']
    };
    return examples[industry] || ['Project demonstrating relevant skills'];
}

function getSummaryExamplesByIndustry(industry: IndustryCategory, level: ExperienceLevel): string[] {
    // Simplified examples - in production, would have more
    if (level === 'fresher') {
        return [`Recent ${industry} graduate with strong foundation in core skills. Eager to apply knowledge in professional setting.`];
    }
    return [`Experienced ${industry} professional with proven track record of delivering results.`];
}

function getGenericMistakes(): string[] {
    return [
        'Using the same resume for every application',
        'Not quantifying achievements',
        'Typos and grammatical errors',
        'Including irrelevant information',
        'Making it too long'
    ];
}

function getGenericRecruiterFocus(): string[] {
    return [
        'Relevant experience',
        'Measurable achievements',
        'Required skills match',
        'Career progression',
        'Professional presentation'
    ];
}

export default generateRoleGuidance;
