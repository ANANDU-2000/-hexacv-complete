/**
 * TEMPLATE INTELLIGENCE ENGINE
 * Role-based, industry-aware, experience-level appropriate template recommendations
 * NO fake recommendations - All based on actual template capabilities
 */

import { IndustryCategory, ExperienceLevel, findRole, detectIndustry } from './universal-role-database';
import { RegionCode, getRegionalFormat } from './regional-resume-formats';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type TemplateId = 'template1free' | 'template2';

export interface TemplateCharacteristics {
    id: TemplateId;
    name: string;
    
    // Suitability scores (0-100)
    suitability: {
        atsCompatibility: number;
        visualAppeal: number;
        contentDensity: number;
        formalityLevel: number;
    };
    
    // What this template is good for
    strengths: string[];
    
    // What this template is NOT good for
    limitations: string[];
    
    // Industry fit scores
    industryFit: Partial<Record<IndustryCategory, number>>;
    
    // Experience level fit
    levelFit: Partial<Record<ExperienceLevel, number>>;
    
    // Regional considerations
    regionalConsiderations: Partial<Record<RegionCode, string>>;
    
    // Features
    features: {
        hasAIRewriting: boolean;
        supportsPhoto: boolean;
        columnsCount: 1 | 2;
        hasSidebar: boolean;
        hasColorAccent: boolean;
        isPremium: boolean;
    };
}

export interface TemplateRecommendation {
    templateId: TemplateId;
    templateName: string;
    matchScore: number;
    isPremium: boolean;
    reasoning: string[];
    warnings: string[];
    suggestions: string[];
}

export interface RecommendationContext {
    targetRole?: string;
    industry?: IndustryCategory;
    experienceLevel?: ExperienceLevel;
    region?: RegionCode;
    hasPhoto?: boolean;
    jobDescriptionKeywords?: string[];
    careerChanging?: boolean;
    fresher?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const TEMPLATE_CHARACTERISTICS: Record<TemplateId, TemplateCharacteristics> = {
    template1free: {
        id: 'template1free',
        name: 'Free ATS Template',
        
        suitability: {
            atsCompatibility: 95,
            visualAppeal: 70,
            contentDensity: 85,
            formalityLevel: 80
        },
        
        strengths: [
            'Highest ATS compatibility - parsed correctly by all major ATS systems',
            'Clean, distraction-free layout focuses recruiters on content',
            'Single-column format ensures proper reading order',
            'Standard section headings recognized by keyword scanners',
            'No complex formatting that could confuse ATS',
            'Works well for content-heavy resumes',
            'Professional appearance suitable for most industries'
        ],
        
        limitations: [
            'Less visually distinctive than premium templates',
            'No AI bullet rewriting included',
            'May appear too basic for creative roles',
            'Limited customization options',
            'No sidebar for skills visualization'
        ],
        
        industryFit: {
            technology: 85,
            healthcare: 90,
            finance: 90,
            education: 85,
            manufacturing: 90,
            government: 95,
            consulting: 85,
            legal: 90,
            logistics: 90,
            trades: 85,
            retail: 80,
            hospitality: 75,
            marketing: 65,
            media: 60,
            arts: 55
        },
        
        levelFit: {
            intern: 85,
            fresher: 90,
            junior: 90,
            mid: 85,
            senior: 80,
            lead: 75,
            manager: 75,
            director: 70,
            executive: 65
        },
        
        regionalConsiderations: {
            US: 'Excellent choice - US employers heavily use ATS',
            UK: 'Good fit - clean CV format appreciated',
            DE: 'Suitable but consider adding photo section',
            AE: 'Add photo and personal details manually',
            IN: 'Strong choice - ATS common in Indian tech hiring',
            AU: 'Good fit - similar to US/UK standards',
            JP: 'May need adaptation for Rirekisho format'
        },
        
        features: {
            hasAIRewriting: false,
            supportsPhoto: false,
            columnsCount: 1,
            hasSidebar: false,
            hasColorAccent: true,
            isPremium: false
        }
    },
    
    template2: {
        id: 'template2',
        name: 'AI-Enhanced Template',
        
        suitability: {
            atsCompatibility: 90,
            visualAppeal: 85,
            contentDensity: 80,
            formalityLevel: 85
        },
        
        strengths: [
            'AI-powered bullet rewriting transforms generic descriptions into impact statements',
            'Professional design with subtle color accents',
            'Optimized for both ATS parsing and human readability',
            'Better visual hierarchy guides recruiter attention',
            'Enhanced typography for improved scannability',
            'Suitable for competitive job markets',
            'Shows investment in professional presentation'
        ],
        
        limitations: [
            'Requires payment ($49)',
            'AI rewriting depends on quality of input',
            'Slightly less ATS-safe than pure text template',
            'Not suitable for extremely traditional industries'
        ],
        
        industryFit: {
            technology: 95,
            healthcare: 85,
            finance: 90,
            education: 80,
            manufacturing: 80,
            government: 75,
            consulting: 95,
            legal: 85,
            logistics: 80,
            trades: 70,
            retail: 75,
            hospitality: 70,
            marketing: 90,
            media: 85,
            arts: 75,
            sales: 90
        },
        
        levelFit: {
            intern: 70,
            fresher: 75,
            junior: 85,
            mid: 95,
            senior: 95,
            lead: 90,
            manager: 90,
            director: 85,
            executive: 80
        },
        
        regionalConsiderations: {
            US: 'Excellent - AI optimization valuable in competitive market',
            UK: 'Good fit - professional presentation appreciated',
            DE: 'Acceptable - formal design suits German expectations',
            AE: 'Good - professional look valued in Gulf region',
            IN: 'Strong choice - tech roles benefit from AI optimization',
            AU: 'Good fit - achievement-focused content works well',
            JP: 'Consider traditional format instead'
        },
        
        features: {
            hasAIRewriting: true,
            supportsPhoto: false,
            columnsCount: 1,
            hasSidebar: false,
            hasColorAccent: true,
            isPremium: true
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// RECOMMENDATION ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Get template recommendations based on context
 * Returns ranked recommendations with honest reasoning
 */
export function getTemplateRecommendations(
    context: RecommendationContext
): TemplateRecommendation[] {
    const recommendations: TemplateRecommendation[] = [];
    
    // Detect industry if only role provided
    let industry = context.industry;
    if (!industry && context.targetRole) {
        industry = detectIndustry(context.targetRole);
    }
    
    // Get role definition if available
    const role = context.targetRole ? findRole(context.targetRole) : null;
    
    // Determine effective experience level
    let level = context.experienceLevel || 'mid';
    if (context.fresher) {
        level = 'fresher';
    }
    
    // Score each template
    for (const [templateId, template] of Object.entries(TEMPLATE_CHARACTERISTICS)) {
        const recommendation = scoreTemplate(
            template,
            {
                ...context,
                industry,
                experienceLevel: level
            },
            role
        );
        recommendations.push(recommendation);
    }
    
    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    return recommendations;
}

/**
 * Score a single template against context
 */
function scoreTemplate(
    template: TemplateCharacteristics,
    context: RecommendationContext,
    role: ReturnType<typeof findRole>
): TemplateRecommendation {
    let score = 50; // Base score
    const reasoning: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // ─────────────────────────────────────────────────────────────
    // Industry Scoring
    // ─────────────────────────────────────────────────────────────
    if (context.industry && template.industryFit[context.industry]) {
        const industryScore = template.industryFit[context.industry]!;
        score += (industryScore - 50) * 0.3; // Weight: 30%
        
        if (industryScore >= 85) {
            reasoning.push(`Well-suited for ${context.industry} industry`);
        } else if (industryScore <= 65) {
            warnings.push(`May not be ideal for ${context.industry} roles`);
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Experience Level Scoring
    // ─────────────────────────────────────────────────────────────
    if (context.experienceLevel && template.levelFit[context.experienceLevel]) {
        const levelScore = template.levelFit[context.experienceLevel]!;
        score += (levelScore - 50) * 0.25; // Weight: 25%
        
        if (levelScore >= 85) {
            reasoning.push(`Optimized for ${context.experienceLevel}-level candidates`);
        } else if (levelScore <= 65) {
            suggestions.push(`Consider alternatives for ${context.experienceLevel}-level positions`);
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Fresher/Career Change Considerations
    // ─────────────────────────────────────────────────────────────
    if (context.fresher || context.careerChanging) {
        // Freshers benefit from high ATS compatibility
        if (template.suitability.atsCompatibility >= 90) {
            score += 8;
            reasoning.push('High ATS compatibility important for entry-level/career change');
        }
        
        // Premium features may not be worth it for freshers
        if (template.features.isPremium && context.fresher) {
            warnings.push('Consider free template first - build strong content before investing');
        }
        
        // AI rewriting can help career changers frame transferable skills
        if (template.features.hasAIRewriting && context.careerChanging) {
            score += 10;
            reasoning.push('AI rewriting helps translate experience to new field');
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Regional Scoring
    // ─────────────────────────────────────────────────────────────
    if (context.region) {
        const regionalNote = template.regionalConsiderations[context.region];
        if (regionalNote) {
            reasoning.push(regionalNote);
        }
        
        const regionalFormat = getRegionalFormat(context.region);
        
        // Check photo requirements vs template support
        if (regionalFormat.photo.requirement === 'required' || regionalFormat.photo.requirement === 'expected') {
            if (!template.features.supportsPhoto) {
                warnings.push(`${context.region} typically expects photos - add manually`);
            }
        }
        
        // ATS prevalence affects template choice
        if (regionalFormat.ats.prevalence === 'very_high') {
            score += template.suitability.atsCompatibility * 0.1;
            reasoning.push('ATS compatibility critical in this region');
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Role-Specific Scoring
    // ─────────────────────────────────────────────────────────────
    if (role) {
        // Technical roles benefit from clean, content-focused templates
        if (role.industry === 'technology') {
            if (template.suitability.contentDensity >= 80) {
                score += 5;
                reasoning.push('Good content density for detailed technical experience');
            }
        }
        
        // Executive roles may prefer premium presentation
        if (['director', 'executive'].includes(context.experienceLevel || '')) {
            if (template.suitability.visualAppeal >= 80) {
                score += 5;
            }
        }
        
        // Creative roles need visual appeal
        if (['marketing', 'media', 'arts'].includes(role.industry)) {
            score += template.suitability.visualAppeal * 0.15;
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Feature-Based Scoring
    // ─────────────────────────────────────────────────────────────
    
    // AI rewriting value depends on context
    if (template.features.hasAIRewriting) {
        if (context.jobDescriptionKeywords && context.jobDescriptionKeywords.length > 0) {
            score += 10;
            reasoning.push('AI rewriting can optimize bullets for job description keywords');
        }
        
        // Mid-senior levels benefit most from AI optimization
        if (['mid', 'senior', 'lead'].includes(context.experienceLevel || '')) {
            score += 5;
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // Normalize Score
    // ─────────────────────────────────────────────────────────────
    score = Math.max(0, Math.min(100, score));
    
    // Add template-specific strengths to reasoning
    if (score >= 70) {
        reasoning.push(...template.strengths.slice(0, 2));
    }
    
    // Add template-specific limitations to warnings if score is borderline
    if (score < 70 && score >= 50) {
        warnings.push(...template.limitations.slice(0, 1));
    }
    
    return {
        templateId: template.id,
        templateName: template.name,
        matchScore: Math.round(score),
        isPremium: template.features.isPremium,
        reasoning,
        warnings,
        suggestions
    };
}

// ═══════════════════════════════════════════════════════════════
// QUICK RECOMMENDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the best template for a specific role
 */
export function getBestTemplateForRole(targetRole: string): TemplateRecommendation {
    const recommendations = getTemplateRecommendations({ targetRole });
    return recommendations[0];
}

/**
 * Get the best free template for a context
 */
export function getBestFreeTemplate(context: RecommendationContext): TemplateRecommendation | null {
    const recommendations = getTemplateRecommendations(context);
    return recommendations.find(r => !r.isPremium) || null;
}

/**
 * Check if premium template is worth it for context
 */
export function isPremiumWorthIt(context: RecommendationContext): {
    worthIt: boolean;
    reasoning: string[];
} {
    const recommendations = getTemplateRecommendations(context);
    const freeRec = recommendations.find(r => !r.isPremium);
    const premiumRec = recommendations.find(r => r.isPremium);
    
    if (!freeRec || !premiumRec) {
        return { worthIt: false, reasoning: ['Unable to compare templates'] };
    }
    
    const scoreDiff = premiumRec.matchScore - freeRec.matchScore;
    const reasoning: string[] = [];
    
    // Premium worth it if significant score improvement
    if (scoreDiff >= 15) {
        reasoning.push(`Premium template scores ${scoreDiff} points higher for your profile`);
    }
    
    // Consider experience level
    if (['mid', 'senior', 'lead', 'manager'].includes(context.experienceLevel || '')) {
        reasoning.push('Career level justifies investment in professional presentation');
    }
    
    // Consider industry competitiveness
    if (context.industry && ['technology', 'consulting', 'finance'].includes(context.industry)) {
        reasoning.push('Competitive industry benefits from AI-optimized content');
    }
    
    // Freshers should prioritize content over template
    if (context.fresher) {
        reasoning.push('Focus on building strong content first - free template sufficient');
        return { worthIt: false, reasoning };
    }
    
    const worthIt = scoreDiff >= 10 || 
        (context.experienceLevel && ['senior', 'lead', 'manager', 'director'].includes(context.experienceLevel));
    
    return { worthIt, reasoning };
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE COMPARISON
// ═══════════════════════════════════════════════════════════════

/**
 * Compare two templates side by side
 */
export function compareTemplates(
    templateId1: TemplateId,
    templateId2: TemplateId,
    context?: RecommendationContext
): {
    comparison: {
        aspect: string;
        template1: string;
        template2: string;
        winner?: TemplateId;
    }[];
    recommendation: TemplateId;
    reasoning: string;
} {
    const t1 = TEMPLATE_CHARACTERISTICS[templateId1];
    const t2 = TEMPLATE_CHARACTERISTICS[templateId2];
    
    const comparison = [
        {
            aspect: 'ATS Compatibility',
            template1: `${t1.suitability.atsCompatibility}%`,
            template2: `${t2.suitability.atsCompatibility}%`,
            winner: t1.suitability.atsCompatibility > t2.suitability.atsCompatibility ? templateId1 : 
                    t2.suitability.atsCompatibility > t1.suitability.atsCompatibility ? templateId2 : undefined
        },
        {
            aspect: 'Visual Appeal',
            template1: `${t1.suitability.visualAppeal}%`,
            template2: `${t2.suitability.visualAppeal}%`,
            winner: t1.suitability.visualAppeal > t2.suitability.visualAppeal ? templateId1 :
                    t2.suitability.visualAppeal > t1.suitability.visualAppeal ? templateId2 : undefined
        },
        {
            aspect: 'AI Features',
            template1: t1.features.hasAIRewriting ? 'Yes' : 'No',
            template2: t2.features.hasAIRewriting ? 'Yes' : 'No',
            winner: t2.features.hasAIRewriting && !t1.features.hasAIRewriting ? templateId2 :
                    t1.features.hasAIRewriting && !t2.features.hasAIRewriting ? templateId1 : undefined
        },
        {
            aspect: 'Price',
            template1: t1.features.isPremium ? '$49' : 'Free',
            template2: t2.features.isPremium ? '$49' : 'Free',
            winner: !t1.features.isPremium && t2.features.isPremium ? templateId1 :
                    !t2.features.isPremium && t1.features.isPremium ? templateId2 : undefined
        }
    ];
    
    // Get contextual recommendation
    let recommendation: TemplateId;
    let reasoning: string;
    
    if (context) {
        const recs = getTemplateRecommendations(context);
        const rec1 = recs.find(r => r.templateId === templateId1);
        const rec2 = recs.find(r => r.templateId === templateId2);
        
        if (rec1 && rec2) {
            recommendation = rec1.matchScore >= rec2.matchScore ? templateId1 : templateId2;
            reasoning = rec1.matchScore >= rec2.matchScore ? 
                rec1.reasoning[0] || 'Better overall fit' :
                rec2.reasoning[0] || 'Better overall fit';
        } else {
            recommendation = templateId1;
            reasoning = 'Default recommendation';
        }
    } else {
        // Without context, recommend free template
        recommendation = t1.features.isPremium ? templateId2 : templateId1;
        reasoning = 'Free template recommended without specific context';
    }
    
    return { comparison, recommendation, reasoning };
}

// ═══════════════════════════════════════════════════════════════
// ROLE-SPECIFIC GUIDANCE
// ═══════════════════════════════════════════════════════════════

/**
 * Get template-specific tips for a role
 */
export function getTemplateTipsForRole(
    templateId: TemplateId,
    targetRole: string
): string[] {
    const template = TEMPLATE_CHARACTERISTICS[templateId];
    const role = findRole(targetRole);
    const tips: string[] = [];
    
    // General template tips
    if (template.features.hasAIRewriting) {
        tips.push('Use specific, measurable achievements as input - AI works best with concrete data');
        tips.push('Include numbers and percentages in your bullet points for better AI optimization');
    }
    
    if (!template.features.hasAIRewriting) {
        tips.push('Write achievement-focused bullets manually using the "Action + Result + Impact" formula');
        tips.push('Include metrics wherever possible - numbers catch recruiter attention');
    }
    
    // Role-specific tips
    if (role) {
        if (role.industry === 'technology') {
            tips.push('List specific technologies and versions in your skills section');
            tips.push('Quantify technical impact: latency improvements, user growth, code coverage');
        }
        
        if (role.industry === 'healthcare') {
            tips.push('Include certifications prominently - they are often required');
            tips.push('Emphasize patient care outcomes and compliance metrics');
        }
        
        if (role.industry === 'finance') {
            tips.push('Highlight regulatory compliance and risk management experience');
            tips.push('Quantify financial impact: revenue, cost savings, AUM');
        }
        
        if (role.industry === 'sales') {
            tips.push('Lead with quota attainment and revenue numbers');
            tips.push('Include deal sizes, client counts, and growth percentages');
        }
        
        if (role.industry === 'marketing') {
            tips.push('Include campaign metrics: ROI, conversion rates, engagement');
            tips.push('List marketing tools and platforms you\'ve mastered');
        }
    }
    
    return tips;
}

/**
 * Get section order recommendation for template + role combination
 */
export function getRecommendedSectionOrder(
    templateId: TemplateId,
    context: RecommendationContext
): string[] {
    const defaultOrder = ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'];
    
    // Freshers should lead with education
    if (context.fresher || context.experienceLevel === 'intern') {
        return ['summary', 'education', 'projects', 'skills', 'experience', 'certifications'];
    }
    
    // Career changers should emphasize skills
    if (context.careerChanging) {
        return ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];
    }
    
    // Healthcare/legal should emphasize certifications
    if (context.industry && ['healthcare', 'legal'].includes(context.industry)) {
        return ['summary', 'certifications', 'experience', 'skills', 'education', 'projects'];
    }
    
    // Tech roles may benefit from projects section
    if (context.industry === 'technology') {
        return ['summary', 'experience', 'projects', 'skills', 'education', 'certifications'];
    }
    
    // Executive level should lead with summary
    if (['director', 'executive'].includes(context.experienceLevel || '')) {
        return ['summary', 'experience', 'skills', 'education', 'certifications'];
    }
    
    return defaultOrder;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    TEMPLATE_CHARACTERISTICS,
    getTemplateRecommendations,
    getBestTemplateForRole,
    getBestFreeTemplate,
    isPremiumWorthIt,
    compareTemplates,
    getTemplateTipsForRole,
    getRecommendedSectionOrder
};
