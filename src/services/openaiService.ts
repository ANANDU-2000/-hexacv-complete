/**
 * OPENAI SERVICE FOR PAID TEMPLATE AI REWRITE
 * 
 * Uses OpenAI GPT-4o-mini for high-quality resume rewriting
 * This is ONLY for paid users (₹49 template)
 * 
 * MASTER PROMPT PHILOSOPHY:
 * - No buzzwords
 * - No fake achievements  
 * - Recruiter-friendly language
 * - Preserve factual accuracy
 * - Add metrics only if logically implied
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Configuration helper
const getLLMConfig = () => {
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_key_here') {
        return {
            apiKey: OPENAI_API_KEY,
            apiUrl: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-4o-mini'
        };
    } else if (GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here') {
        return {
            apiKey: GROQ_API_KEY,
            apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
            model: 'llama-3.3-70b-versatile'
        };
    }
    return null;
};

/**
 * MASTER SYSTEM PROMPT - The core of authentic AI rewriting
 * Based on recruiter and ATS optimization expertise
 */
const MASTER_SYSTEM_PROMPT = `You are a senior technical recruiter and ATS optimization expert.

Your task:
- Rewrite resume content to improve recruiter scan success.
- Preserve factual accuracy strictly.
- Do NOT add fake experience, tools, or achievements.
- Use concise, recruiter-friendly language.
- Add metrics ONLY if logically implied (time saved, efficiency, scale).
- Optimize for the target job description provided.

Rules:
- Avoid buzzwords like "leveraged", "synergized", "revolutionized".
- Avoid generic AI phrases like "spearheaded initiatives", "drove excellence".
- Each bullet must answer: What was done? How? What impact?
- Keep the user's authentic voice - don't over-polish.
- Use past tense for previous roles, present for current.
- Start with strong action verbs: Built, Developed, Led, Created, Implemented.

Output:
- Clean ATS-compatible bullet points.
- Natural language that sounds human-written.
- Highlight JD-matched keywords naturally (don't force them).`;

export interface OpenAIRewriteResult {
    original: string;
    rewritten: string;
    keywordsMatched: string[];
    improvement: string;
}

/**
 * Rewrite a single bullet point using OpenAI (or Groq fallback)
 */
export async function rewriteBulletWithOpenAI(
    bullet: string,
    context: {
        role: string;
        company?: string;
        targetRole?: string;
        jdKeywords?: string[];
        isProject?: boolean;
    }
): Promise<OpenAIRewriteResult> {
    const config = getLLMConfig();

    if (!config) {
        console.warn('AI API key (OpenAI/Groq) not configured');
        return {
            original: bullet,
            rewritten: bullet,
            keywordsMatched: [],
            improvement: 'AI services not configured'
        };
    }

    const userPrompt = `Rewrite this resume bullet point for maximum recruiter impact.

ORIGINAL BULLET:
"${bullet}"

CONTEXT:
- Role: ${context.role}
${context.company ? `- Company: ${context.company}` : ''}
${context.targetRole ? `- Target Role: ${context.targetRole}` : ''}
${context.isProject ? '- This is a project description' : '- This is work experience'}
${context.jdKeywords?.length ? `- JD Keywords to consider (only if relevant): ${context.jdKeywords.join(', ')}` : ''}

INSTRUCTIONS:
1. Keep the core achievement/responsibility intact
2. Start with a strong action verb
3. Add a metric ONLY if it can be logically inferred (e.g., "team of X", "X% improvement")
4. Keep it concise (max 25 words)
5. Don't add tools/technologies not implied by the original
6. Don't use markdown formatting (no bold/italics)

Return JSON format:
{
  "rewritten": "The improved bullet",
  "keywordsMatched": ["keyword1", "keyword2"],
  "improvement": "Brief explanation of what was improved"
}`;

    try {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: MASTER_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 300,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                original: bullet,
                rewritten: parsed.rewritten || bullet,
                keywordsMatched: parsed.keywordsMatched || [],
                improvement: parsed.improvement || ''
            };
        }

        return {
            original: bullet,
            rewritten: bullet,
            keywordsMatched: [],
            improvement: 'Could not parse response'
        };

    } catch (error) {
        console.error('AI rewrite error:', error);
        return {
            original: bullet,
            rewritten: bullet,
            keywordsMatched: [],
            improvement: 'Rewrite failed - using original'
        };
    }
}

/**
 * Rewrite professional summary using OpenAI (or Groq fallback)
 */
export async function rewriteSummaryWithOpenAI(
    summary: string,
    context: {
        targetRole: string;
        experienceYears?: string;
        jdKeywords?: string[];
    }
): Promise<OpenAIRewriteResult> {
    const config = getLLMConfig();

    if (!config) {
        return {
            original: summary,
            rewritten: summary,
            keywordsMatched: [],
            improvement: 'AI services not configured'
        };
    }

    const userPrompt = `Rewrite this professional summary for ATS optimization and recruiter impact.

ORIGINAL SUMMARY:
"${summary}"

CONTEXT:
- Target Role: ${context.targetRole}
${context.experienceYears ? `- Experience: ${context.experienceYears}` : ''}
${context.jdKeywords?.length ? `- JD Keywords: ${context.jdKeywords.join(', ')}` : ''}

INSTRUCTIONS:
1. Keep it 2-3 sentences max (40-60 words total - NOT more)
2. Lead with years of experience and core expertise
3. Include 2-3 key technologies/skills naturally
4. End with what the candidate brings to the role
5. Don't use "I" - keep it professional third person implied
6. Avoid cliches like "passionate", "driven", "results-oriented"
7. Be concise - recruiters scan quickly, don't overwhelm with words

Return JSON format:
{
  "rewritten": "The improved summary",
  "keywordsMatched": ["keyword1", "keyword2"],
  "improvement": "Brief explanation"
}`;

    try {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: MASTER_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 400,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                original: summary,
                rewritten: parsed.rewritten || summary,
                keywordsMatched: parsed.keywordsMatched || [],
                improvement: parsed.improvement || ''
            };
        }

        return {
            original: summary,
            rewritten: summary,
            keywordsMatched: [],
            improvement: 'Could not parse response'
        };

    } catch (error) {
        console.error('AI summary rewrite error:', error);
        return {
            original: summary,
            rewritten: summary,
            keywordsMatched: [],
            improvement: 'Rewrite failed - using original'
        };
    }
}

/**
 * Extract keywords from job description
 */
export function extractJDKeywords(jobDescription: string): string[] {
    if (!jobDescription) return [];

    const keywords: string[] = [];

    // First: Extract comma/newline separated explicit keywords (user typed)
    const explicitKeywords = jobDescription
        .split(/[,\n;|]+/)
        .map(k => k.trim())
        .filter(k => k.length >= 2 && k.length <= 30);

    keywords.push(...explicitKeywords);

    // Technical skills regex (enhanced with AI/ML terms)
    const techPattern = /\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|azure|gcp|docker|kubernetes|git|machine learning|deep learning|artificial intelligence|ai|ml|dl|llm|llms|large language model|rag|retrieval augmented generation|nlp|natural language processing|gpt|chatgpt|openai|langchain|vector database|embeddings|transformers|bert|hugging face|data science|data engineering|data analytics|agile|scrum|rest|rest api|restful|api|apis|graphql|microservices|ci\/cd|cicd|tensorflow|pytorch|keras|pandas|numpy|scikit-learn|sklearn|opencv|mongodb|postgresql|mysql|redis|kafka|spark|hadoop|tableau|power bi|excel|figma|sketch|photoshop|jira|confluence|slack|teams|linux|bash|powershell|c\+\+|c#|csharp|\.net|dotnet|asp\.net|go|golang|rust|ruby|php|swift|kotlin|flutter|react native|next\.?js|express|django|flask|fastapi|spring|laravel|vue\.?js|svelte|tailwind|bootstrap|sass|webpack|vite|jest|cypress|selenium|jenkins|github actions|terraform|ansible|prometheus|grafana|elasticsearch|nginx|computer vision|neural network|cnn|rnn|lstm|gan|reinforcement learning|mlops|devops|sre|backend|frontend|fullstack|full stack|full-stack)\b/gi;

    const techMatches = jobDescription.match(techPattern) || [];
    keywords.push(...techMatches);

    // Soft skills and business terms
    const softPattern = /\b(leadership|communication|problem.solving|analytical|collaboration|teamwork|project management|stakeholder|cross.functional|strategic|optimization|automation|scalability|performance|security|compliance|documentation|mentoring|training|presentation|negotiation|client.facing|customer.success|product|design|architecture|development|testing|deployment|maintenance|support|research|innovation|agile methodology)\b/gi;

    const softMatches = jobDescription.match(softPattern) || [];
    keywords.push(...softMatches);


    // Dedupe, normalize, and limit
    const normalized = [...new Set(keywords.map(k => k.toLowerCase().trim()))];
    const filtered = normalized.filter(k => k.length >= 2);
    return filtered.slice(0, 30);
}

/**
 * Calculate keyword match score
 */
export function calculateKeywordMatch(
    resumeText: string,
    jdKeywords: string[]
): { score: number; matched: string[]; missing: string[] } {
    if (!jdKeywords.length) {
        return { score: 0, matched: [], missing: [] };
    }

    const resumeLower = resumeText.toLowerCase();
    const matched: string[] = [];
    const missing: string[] = [];

    jdKeywords.forEach(keyword => {
        // Check for exact word match or as part of compound word
        const keywordLower = keyword.toLowerCase();
        const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(resumeLower) || resumeLower.includes(keywordLower)) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = Math.round((matched.length / jdKeywords.length) * 100);

    return { score, matched, missing };
}

export function isOpenAIAvailable(): boolean {
    const config = getLLMConfig();
    return !!config;
}
