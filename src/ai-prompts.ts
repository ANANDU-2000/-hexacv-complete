/**
 * ADVANCED AI PROMPTING SYSTEM
 * Multi-model support: Gemini Pro, Groq, Hugging Face
 * Role-based, context-aware, high-quality ATS output
 */

// ============== SYSTEM PROMPTS ==============

export const SYSTEM_PROMPTS = {
    /**
     * MASTER EXTRACTION PROMPT
     * CRITICAL: Never invent, never guess, only extract real data
     */
    extraction: `You are a STRICT resume data extraction engine. Your ONLY task is to extract existing information with 100% accuracy.

ABSOLUTE RULES (NEVER VIOLATE):
1. NEVER invent experience, roles, companies, dates, or skills
2. NEVER guess seniority levels or career progression
3. NEVER add achievements or bullets that don't exist
4. NEVER change dates or employment periods
5. ONLY extract what explicitly appears in the text
6. If information is unclear or missing → leave empty, DON'T guess
7. Preserve EXACT wording for role titles and company names
8. Keep date formats as they appear (MM/YYYY, YYYY, etc.)
9. Extract bullets word-for-word, no paraphrasing during extraction
10. If you're uncertain → mark as missing, DON'T fabricate

OUTPUT FORMAT: Valid JSON only. No explanations. No assumptions.

EXTRACTION SCHEMA:
{
  "name": "Exact name from resume",
  "email": "Exact email",
  "phone": "Exact phone with country code if present",
  "linkedin": "Full LinkedIn URL if present",
  "github": "Full GitHub URL if present",
  "profile": "Professional summary EXACTLY as written",
  "skills": [
    {"category": "Category name from resume", "items": ["skill1", "skill2"]}
  ],
  "experience": [
    {
      "role": "EXACT job title",
      "company": "EXACT company name",
      "startDate": "EXACT start date format",
      "endDate": "EXACT end date or 'Present'",
      "bullets": ["EXACT achievement 1", "EXACT achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "EXACT degree name",
      "institution": "EXACT institution name",
      "year": "EXACT year or year range"
    }
  ],
  "projects": [
    {
      "name": "EXACT project name",
      "description": "EXACT description",
      "tech": ["tech1", "tech2"]
    }
  ]
}

CRITICAL: If ANY field is not explicitly present in the resume, use empty string or empty array. NEVER guess.`,

    /**
     * ATS OPTIMIZATION PROMPT (Context-Aware)
     * MASTER PROMPT - Authentic, recruiter-friendly rewriting
     * NO buzzwords, NO fake achievements, NO over-polished language
     */
    atsOptimization: (targetRole: string, jd: string, userContent: any) => `You are a senior technical recruiter and ATS optimization expert.

TARGET ROLE: ${targetRole || 'Not specified'}
JD KEYWORDS TO CONSIDER: ${jd ? extractKeywords(jd).join(', ') : 'None provided'}

USER'S ACTUAL CONTENT:
${JSON.stringify(userContent, null, 2)}

YOUR TASK:
- Rewrite resume content to improve recruiter scan success.
- Preserve factual accuracy STRICTLY.
- Do NOT add fake experience, tools, or achievements.
- Use concise, recruiter-friendly language.
- Add metrics ONLY if logically implied (time saved, efficiency, scale).

CRITICAL RULES - NEVER VIOLATE:
1. AVOID buzzwords: "leveraged", "synergized", "revolutionized", "spearheaded", "drove excellence"
2. AVOID generic AI phrases: "dynamic professional", "results-driven individual", "passionate about"
3. Keep user's original meaning - don't over-polish
4. Each bullet must answer: What was done? How? What impact?
5. Start with strong action verbs: Built, Developed, Led, Created, Implemented, Designed, Managed
6. If JD keywords don't match user's REAL experience → DON'T force them
7. Add numbers ONLY if logically implied (team size, percentage improvements, scale)
8. Past tense for previous roles, present for current

GOOD EXAMPLES:
✓ "Built REST API serving 10K+ daily requests using Node.js and PostgreSQL"
✓ "Led 4-member team to deliver payment integration 2 weeks ahead of schedule"
✓ "Reduced page load time by 40% through image optimization and lazy loading"

BAD EXAMPLES (AVOID):
✗ "Spearheaded revolutionary initiatives to drive excellence"
✗ "Leveraged cutting-edge technologies to synergize workflows"
✗ "Passionate professional with proven track record"

OUTPUT: Return optimized JSON in same schema. Be authentic, not impressive-sounding.`,

    /**
     * GRAMMAR & CONTEXT CHECK
     * Ensures professional, error-free output
     */
    grammarCheck: `You are a professional resume editor specializing in grammar, clarity, and ATS compliance.

REVIEW FOCUS:
1. Grammar: Subject-verb agreement, tense consistency, punctuation
2. Action verbs: Strong, specific, achievement-oriented
3. Quantification: Metrics, percentages, scale indicators
4. Clarity: Clear, concise, no jargon unless industry-standard
5. ATS compatibility: Simple formatting, no special characters
6. Professional tone: Confident but not arrogant
7. Consistency: Formatting, style, voice across all sections

BULLET QUALITY CRITERIA:
✓ Starts with action verb (Led, Developed, Managed, etc.)
✓ Contains specific achievement or responsibility
✓ Includes quantifiable impact when possible
✓ 10-20 words optimal length
✓ No personal pronouns (I, me, my)
✓ Past tense for previous roles, present for current

RETURN: JSON with corrections and suggestions, not automatic changes.`,

    /**
     * ROLE-BASED SECTION OPTIMIZER
     * Recommends optimal section order and emphasis
     */
    roleAnalysis: (targetRole: string) => `Analyze this target role and provide optimal resume structure.

TARGET ROLE: ${targetRole}

ANALYSIS REQUIREMENTS:
1. Identify role type: Technical, Executive, Creative, Academic, Entry-Level
2. Recommend section order (e.g., Skills-first for tech, Experience-first for exec)
3. Suggest key competencies to highlight
4. Identify must-have keywords for ATS
5. Recommend emphasis areas (leadership vs technical vs creative)
6. Suggest ideal bullet count per experience (3-5)
7. Determine if certifications/projects should be prominent

OUTPUT JSON FORMAT:
{
  "roleType": "technical|executive|creative|academic|entry",
  "sectionOrder": ["experience", "skills", "education", "projects"],
  "keyCompetencies": ["competency1", "competency2"],
  "mustHaveKeywords": ["keyword1", "keyword2"],
  "emphasisAreas": ["area1", "area2"],
  "bulletRecommendation": {
    "countPerRole": 4,
    "style": "achievement-focused|responsibility-focused"
  },
  "specialSections": ["certifications", "publications"]
}`
};

// ============== KEYWORD EXTRACTION HELPER ==============
function extractKeywords(text: string): string[] {
    const techSkills = text.match(/\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|azure|docker|kubernetes|git|machine learning|ai|ml|data science|agile|scrum|rest api|microservices|ci\/cd|tensorflow|pytorch|c\+\+|c#|go|rust|ruby|php|swift|kotlin)\b/gi);
    const actionVerbs = text.match(/\b(led|managed|developed|designed|implemented|created|improved|optimized|increased|reduced|collaborated|delivered|built|architected|mentored|analyzed)\b/gi);
    const keywords = [...(techSkills || []), ...(actionVerbs || [])];
    return [...new Set(keywords.map(k => k.toLowerCase()))].slice(0, 20);
}

// ============== AI SERVICE ROUTER ==============
export interface AIRequest {
    prompt: string;
    systemPrompt: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIResponse {
    content: string;
    model: 'gemini' | 'groq' | 'huggingface';
    confidence: number;
}

/**
 * SMART AI ROUTING
 * Gemini Pro → Groq → Hugging Face fallback
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
    const { prompt, systemPrompt, maxTokens = 4096, temperature = 0.1 } = request;
    
    // Try Gemini Pro first (best for complex reasoning)
    try {
        const response = await callGemini(systemPrompt + '\n\n' + prompt, temperature, maxTokens);
        return {
            content: response,
            model: 'gemini',
            confidence: 0.95
        };
    } catch (e) {
        console.log('Gemini failed, trying Groq...');
    }
    
    // Fallback to Groq (fastest)
    try {
        const response = await callGroq(systemPrompt + '\n\n' + prompt, temperature, maxTokens);
        return {
            content: response,
            model: 'groq',
            confidence: 0.90
        };
    } catch (e) {
        console.log('Groq failed, trying Hugging Face...');
    }
    
    // Final fallback to Hugging Face
    try {
        const response = await callHuggingFace(systemPrompt + '\n\n' + prompt, maxTokens);
        return {
            content: response,
            model: 'huggingface',
            confidence: 0.80
        };
    } catch (e) {
        throw new Error('All AI services failed');
    }
}

// ============== API IMPLEMENTATIONS ==============

async function callGemini(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP: 0.8,
                    topK: 10
                }
            })
        }
    );
    
    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callGroq(prompt: string, temperature: number, maxTokens: number): Promise<string> {
    const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: maxTokens
        })
    });
    
    if (!response.ok) throw new Error(`Groq error: ${response.status}`);
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callHuggingFace(prompt: string, maxTokens: number): Promise<string> {
    const apiKey = (import.meta as any).env.VITE_HUGGINGFACE_API_KEY;
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-70B-Instruct', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: maxTokens,
                temperature: 0.1,
                return_full_text: false
            }
        })
    });
    
    if (!response.ok) throw new Error(`Hugging Face error: ${response.status}`);
    
    const data = await response.json();
    return data[0]?.generated_text || data.generated_text || '';
}

// ============== HIGH-LEVEL AI FUNCTIONS ==============

/**
 * Extract resume with AI safety
 */
export async function extractResumeAI(rawText: string): Promise<any> {
    const response = await callAI({
        prompt: `RESUME TEXT:\n${rawText.slice(0, 12000)}`,
        systemPrompt: SYSTEM_PROMPTS.extraction,
        temperature: 0.05, // Very low for extraction accuracy
        maxTokens: 4096
    });
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response');
    
    return JSON.parse(jsonMatch[0]);
}

/**
 * Optimize for ATS with context
 */
export async function optimizeForATSAI(resume: any, targetRole: string, jd: string): Promise<any> {
    const response = await callAI({
        prompt: '',
        systemPrompt: SYSTEM_PROMPTS.atsOptimization(targetRole, jd, resume),
        temperature: 0.2,
        maxTokens: 3000
    });
    
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return resume; // Return original if optimization fails
    
    return JSON.parse(jsonMatch[0]);
}

/**
 * Grammar and quality check
 */
export async function checkGrammarAI(resumeText: string): Promise<any> {
    const response = await callAI({
        prompt: `RESUME CONTENT:\n${resumeText}`,
        systemPrompt: SYSTEM_PROMPTS.grammarCheck,
        temperature: 0.1,
        maxTokens: 2000
    });
    
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { suggestions: [] };
    
    return JSON.parse(jsonMatch[0]);
}

/**
 * Role-based analysis
 */
export async function analyzeRoleAI(targetRole: string): Promise<any> {
    const response = await callAI({
        prompt: '',
        systemPrompt: SYSTEM_PROMPTS.roleAnalysis(targetRole),
        temperature: 0.3,
        maxTokens: 1000
    });
    
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Role analysis failed');
    
    return JSON.parse(jsonMatch[0]);
}
