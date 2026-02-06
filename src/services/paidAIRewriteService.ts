/**
 * AI REWRITE ENGINE FOR PAID ₹49 TEMPLATE
 * 
 * This service transforms user resume content from descriptive to impact-driven.
 * Used exclusively for paid template content optimization.
 * 
 * Core principle: Better thinking, not better design.
 * 
 * SECURITY: All API calls proxied through backend /api/ai-rewrite
 */

import { ResumeData } from '../types';

import { getApiBaseUrl } from '../utils/api-config';
const API_BASE_URL = getApiBaseUrl();

export interface RewriteResult {
    original: string;
    rewritten: string;
    improvement: string;
}

export interface AIRewriteOutput {
    summary: RewriteResult | null;
    experience: { [key: string]: RewriteResult[] };
    projects: { [key: string]: RewriteResult[] };
}

/**
 * Extract keywords from job description for natural alignment (ENHANCED for ATS)
 */
function extractKeywords(jd: string): string[] {
    if (!jd) return [];
    
    // Enhanced keyword extraction - prioritize technical terms, skills, tools
    const techPattern = /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|azure|gcp|docker|kubernetes|git|machine learning|ai|ml|data science|agile|scrum|rest api|graphql|microservices|ci\/cd|\.net|dotnet|asp\.net|asp\.net core|\.net core|entity framework|linq|mvc|web api|wcf|wpf|blazor|c#|csharp|c\+\+|go|rust|ruby|php|swift|kotlin|flutter|mongodb|postgresql|redis|kafka|spark|tensorflow|pytorch|pandas|numpy|tableau|power bi|excel|figma|jira|confluence|terraform|ansible|prometheus|grafana|elasticsearch|nginx|apache|jenkins|github actions|selenium|cypress|jest|webpack|vite|tailwind|bootstrap|sass|less|next\.?js|express|django|flask|spring|laravel|svelte|react native)\b/gi;
    const techMatches = jd.match(techPattern) || [];
    
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'have', 'has', 'had', 'been', 'being', 'are', 'is', 'was', 'were']);
    const words = jd.toLowerCase()
        .replace(/[^\w\s\.#]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !commonWords.has(w));
    
    const frequency = new Map<string, number>();
    // Prioritize tech keywords
    techMatches.forEach(w => frequency.set(w.toLowerCase(), (frequency.get(w.toLowerCase()) || 0) + 3));
    words.forEach(w => frequency.set(w, (frequency.get(w) || 0) + 1));
    
    return Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 25)
        .map(([word]) => word);
}

/**
 * Rewrite a single bullet using backend API
 */
async function rewriteBullet(
    bullet: string,
    context: {
        role: string;
        company?: string;
        keywords: string[];
        isProject?: boolean;
    }
): Promise<RewriteResult> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai-rewrite/bullet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bullet,
                role: context.role,
                company: context.company,
                keywords: context.keywords,
                isProject: context.isProject
            }),
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a minute and try again.');
            }
            const error = await response.json();
            throw new Error(error.error || 'AI service error');
        }

        const data = await response.json();
        return {
            original: data.original,
            rewritten: data.rewritten,
            improvement: data.improvement
        };

    } catch (error: any) {
        console.error('Rewrite bullet error:', error);
        
        // Network error
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            throw new Error('Request timeout. Please try again.');
        }
        
        // Return fallback with original content
        return {
            original: bullet,
            rewritten: bullet,
            improvement: 'Original content (rewrite unavailable)'
        };
    }
}

/**
 * Rewrite professional summary via backend API
 */
async function rewriteSummary(
    summary: string,
    role: string,
    keywords: string[]
): Promise<RewriteResult> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai-rewrite/summary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summary,
                role,
                keywords
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a minute and try again.');
            }
            const error = await response.json();
            throw new Error(error.error || 'AI service error');
        }

        const data = await response.json();
        return {
            original: data.original,
            rewritten: data.rewritten,
            improvement: data.improvement
        };

    } catch (error: any) {
        console.error('Summary rewrite error:', error);
        
        if (error.name === 'AbortError' || error.message?.includes('timeout')) {
            throw new Error('Request timeout. Please try again.');
        }
        
        return {
            original: summary,
            rewritten: summary,
            improvement: 'Original content (rewrite unavailable)'
        };
    }
}

/**
 * MAIN FUNCTION: Apply AI rewrite to entire resume for paid template
 */
export async function applyPaidAIRewrite(
    resumeData: ResumeData,
    jobDescription?: string
): Promise<AIRewriteOutput> {
    const keywords = jobDescription ? extractKeywords(jobDescription) : [];
    const targetRole = resumeData.basics.targetRole || 'Professional';

    const result: AIRewriteOutput = {
        summary: null,
        experience: {},
        projects: {}
    };

    // Rewrite summary (use root summary or basics.professionalSummary)
    const summaryText = (resumeData.summary || (resumeData.basics as any)?.professionalSummary || '').trim();
    if (summaryText) {
        result.summary = await rewriteSummary(summaryText, targetRole, keywords);
    }

    // Rewrite experience bullets
    for (const exp of resumeData.experience || []) {
        const expKey = `${exp.company}-${exp.role}`;
        const bulletRewrites: RewriteResult[] = [];

        for (const bullet of exp.highlights || []) {
            if (bullet.trim()) {
                const rewrite = await rewriteBullet(bullet, {
                    role: exp.role,
                    company: exp.company,
                    keywords,
                    isProject: false
                });
                bulletRewrites.push(rewrite);
            }
        }

        if (bulletRewrites.length > 0) {
            result.experience[expKey] = bulletRewrites;
        }
    }

    // Rewrite project bullets
    for (const project of resumeData.projects || []) {
        const projectKey = project.name;
        const bulletRewrites: RewriteResult[] = [];

        // Split project description into bullets if needed
        const projectBullets = project.description.includes('\n')
            ? project.description.split('\n').filter(b => b.trim())
            : [project.description];

        for (const bullet of projectBullets) {
            if (bullet.trim()) {
                const rewrite = await rewriteBullet(bullet, {
                    role: targetRole,
                    keywords,
                    isProject: true
                });
                bulletRewrites.push(rewrite);
            }
        }

        if (bulletRewrites.length > 0) {
            result.projects[projectKey] = bulletRewrites;
        }
    }

    return result;
}

/**
 * Apply rewrite results back to resume data
 */
export function applyRewriteToResumeData(
    resumeData: ResumeData,
    rewriteOutput: AIRewriteOutput
): ResumeData {
    const updated = { ...resumeData };

    // Apply summary rewrite (PDF uses data.summary, so set both)
    if (rewriteOutput.summary) {
        updated.summary = rewriteOutput.summary.rewritten;
        updated.basics = {
            ...updated.basics,
            professionalSummary: rewriteOutput.summary.rewritten
        };
    }

    // Apply experience rewrites
    updated.experience = (updated.experience || []).map(exp => {
        const expKey = `${exp.company}-${exp.role}`;
        const rewrites = rewriteOutput.experience[expKey];
        
        if (rewrites && rewrites.length > 0) {
            return {
                ...exp,
                highlights: rewrites.map(r => r.rewritten)
            };
        }
        
        return exp;
    });

    // Apply project rewrites
    updated.projects = (updated.projects || []).map(project => {
        const rewrites = rewriteOutput.projects[project.name];
        
        if (rewrites && rewrites.length > 0) {
            return {
                ...project,
                description: rewrites.map(r => r.rewritten).join('\n')
            };
        }
        
        return project;
    });

    return updated;
}
