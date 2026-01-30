import express from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db/index.js';

const router = express.Router();

// Environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Determine which LLM to use: OpenAI for paid template (better quality), Groq as fallback
const USE_OPENAI_FOR_PAID = Boolean(OPENAI_API_KEY); // Use OpenAI if key is configured

// Rate limiting: 10 requests per minute per IP
const aiRewriteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many AI rewrite requests. Please try again in a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input sanitization
function sanitizeInput(text: string): string {
    if (!text) return '';
    // Remove control characters, limit length
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .slice(0, 5000);
}

// Validate AI rewrite request
function validateRewriteRequest(body: any): { valid: boolean; error?: string } {
    if (!body.bullet || typeof body.bullet !== 'string') {
        return { valid: false, error: 'Bullet text is required' };
    }
    if (!body.role || typeof body.role !== 'string') {
        return { valid: false, error: 'Role is required' };
    }
    if (body.bullet.length > 2000) {
        return { valid: false, error: 'Bullet text too long (max 2000 chars)' };
    }
    if (body.role.length > 200) {
        return { valid: false, error: 'Role too long (max 200 chars)' };
    }
    return { valid: true };
}

// POST /api/ai-rewrite/bullet
router.post('/bullet', aiRewriteLimiter, async (req, res) => {
    try {
        // Validate request
        const validation = validateRewriteRequest(req.body);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Check API keys - prefer OpenAI for paid template quality
        const useOpenAI = USE_OPENAI_FOR_PAID;
        if (!useOpenAI && !GROQ_API_KEY) {
            return res.status(503).json({ error: 'AI service not configured' });
        }
        if (useOpenAI && !OPENAI_API_KEY) {
            return res.status(503).json({ error: 'OpenAI API key not configured' });
        }

        // Sanitize inputs
        const bullet = sanitizeInput(req.body.bullet);
        const role = sanitizeInput(req.body.role);
        const company = sanitizeInput(req.body.company || '');
        const keywords = (req.body.keywords || [])
            .map((k: string) => sanitizeInput(k))
            .slice(0, 10);
        const isProject = Boolean(req.body.isProject);

        // Build prompt
        const keywordHint = keywords.length > 0 
            ? `Naturally include these keywords if relevant: ${keywords.join(', ')}`
            : '';

        const prompt = `You are an expert resume writer for ATS (Applicant Tracking Systems) and recruiter shortlisting.

Rewrite this ${isProject ? 'project' : 'experience'} bullet so it passes ATS keyword matching and impresses recruiters.

ORIGINAL BULLET:
${bullet}

CONTEXT:
Role: ${role}
${company ? `Company: ${company}` : ''}
${keywordHint}

ATS & SHORTLIST RULES (ADVANCED ATS OPTIMIZATION):
1. Structure: ACTION → TOOL/SKILL → IMPACT or ACTION → PROBLEM → SOLUTION → RESULT.
2. Start with a strong action verb (e.g. Engineered, Designed, Led, Optimized, Implemented, Built, Created, Architected, Delivered).
3. If the original has numbers: make them clearer. If NO numbers: use safe impact framing only (e.g. "improving efficiency", "reducing manual effort") — NEVER invent fake metrics.
4. Weave in JD/keywords NATURALLY - match JD requirements for real ATS optimization. Include JD keywords when they fit the actual work context.
5. Keep 1–2 lines, recruiter-skimmable (max ~25–30 words).
6. Keep core truth 100% — no invented experience or tools.
7. Optimize for ATS keyword matching - this is critical for passing ATS filters.
8. Match JD requirements naturally - if JD mentions specific technologies/skills and they're relevant, include them.

Return ONLY the rewritten bullet. No preamble or explanation.`;

        // Call AI API - Use OpenAI for paid template (better quality), Groq as fallback
        const apiUrl = useOpenAI ? OPENAI_API_URL : GROQ_API_URL;
        const apiKey = useOpenAI ? OPENAI_API_KEY : GROQ_API_KEY;
        const model = useOpenAI ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
        const provider = useOpenAI ? 'openai' : 'groq';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: useOpenAI ? 0.3 : 0.4,
                max_tokens: 256
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`${provider.toUpperCase()} API error:`, response.status, errorText);
            
            // Fallback to Groq if OpenAI fails
            if (useOpenAI && GROQ_API_KEY) {
                console.log('OpenAI failed, falling back to Groq...');
                const groqResponse = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.4,
                        max_tokens: 256
                    })
                });
                
                if (groqResponse.ok) {
                    const groqData = await groqResponse.json();
                    const rewritten = groqData.choices?.[0]?.message?.content?.trim() || bullet;
                    return res.json({
                        original: bullet,
                        rewritten: rewritten.replace(/^["'\-•]\s*|["']$/g, '').trim(),
                        improvement: 'Impact-driven language with clearer value proposition (using fallback)'
                    });
                }
            }
            
            return res.status(502).json({ error: 'AI service temporarily unavailable' });
        }

        const data = await response.json();
        const rewritten = data.choices?.[0]?.message?.content?.trim() || bullet;
        const usage = data.usage || {};
        const tokensUsed = (usage.total_tokens || usage.completion_tokens || 0) + (usage.prompt_tokens || 0) || 256;
        
        // Cost calculation: OpenAI ~$0.15/1M tokens, Groq free
        const costUsd = useOpenAI 
            ? Math.max(0, (tokensUsed / 1e6) * 0.15) 
            : Math.max(0, (tokensUsed / 1e6) * 0.2);

        try {
            await query(
                `INSERT INTO ai_usage_logs (operation_type, provider, tokens_used, cost_usd, session_id) VALUES ($1, $2, $3, $4, $5)`,
                ['rewrite_bullet', provider, tokensUsed, costUsd, req.body.sessionId || null]
            );
        } catch (_) { /* optional: table may not exist yet */ }

        res.json({
            original: bullet,
            rewritten: rewritten.replace(/^["'\-•]\s*|["']$/g, '').trim(),
            improvement: 'Impact-driven language with clearer value proposition'
        });

    } catch (error: any) {
        console.error('AI rewrite error:', error);
        res.status(500).json({ 
            error: 'Failed to process AI rewrite',
            fallback: req.body.bullet
        });
    }
});

// POST /api/ai-rewrite/summary
router.post('/summary', aiRewriteLimiter, async (req, res) => {
    try {
        // Validate
        if (!req.body.summary || typeof req.body.summary !== 'string') {
            return res.status(400).json({ error: 'Summary text is required' });
        }
        if (!req.body.role || typeof req.body.role !== 'string') {
            return res.status(400).json({ error: 'Role is required' });
        }
        if (req.body.summary.length > 2000) {
            return res.status(400).json({ error: 'Summary too long' });
        }

        // Check API keys - prefer OpenAI for paid template quality
        const useOpenAI = USE_OPENAI_FOR_PAID;
        if (!useOpenAI && !GROQ_API_KEY) {
            return res.status(503).json({ error: 'AI service not configured' });
        }
        if (useOpenAI && !OPENAI_API_KEY) {
            return res.status(503).json({ error: 'OpenAI API key not configured' });
        }

        // Sanitize
        const summary = sanitizeInput(req.body.summary);
        const role = sanitizeInput(req.body.role);
        const keywords = (req.body.keywords || [])
            .map((k: string) => sanitizeInput(k))
            .slice(0, 10);

        const keywordHint = keywords.length > 0 
            ? `Naturally include: ${keywords.join(', ')}`
            : '';

        const prompt = `Rewrite this professional summary to be role-specific and impact-oriented.

ORIGINAL SUMMARY:
${summary}

TARGET ROLE: ${role}
${keywordHint}

RULES:
1. 2-3 sentences MAX, 40-60 words total (NOT more - recruiters scan quickly)
2. Start with role/years if clear
3. Highlight impact and value
4. Use strong, confident language
5. Natural keyword inclusion
6. NO fabrication - maintain truthfulness
7. Be concise - don't ask for more words

Return ONLY the rewritten summary. No preamble.`;

        // Call AI API - Use OpenAI for paid template (better quality), Groq as fallback
        const apiUrl = useOpenAI ? OPENAI_API_URL : GROQ_API_URL;
        const apiKey = useOpenAI ? OPENAI_API_KEY : GROQ_API_KEY;
        const model = useOpenAI ? 'gpt-4o-mini' : 'llama-3.3-70b-versatile';
        const provider = useOpenAI ? 'openai' : 'groq';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                temperature: useOpenAI ? 0.3 : 0.5,
                max_tokens: 256
            })
        });

        if (!response.ok) {
            console.error(`${provider.toUpperCase()} API error:`, response.status);
            
            // Fallback to Groq if OpenAI fails
            if (useOpenAI && GROQ_API_KEY) {
                console.log('OpenAI failed, falling back to Groq...');
                const groqResponse = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.5,
                        max_tokens: 256
                    })
                });
                
                if (groqResponse.ok) {
                    const groqData = await groqResponse.json();
                    const rewritten = groqData.choices?.[0]?.message?.content?.trim() || summary;
                    return res.json({
                        original: summary,
                        rewritten: rewritten.replace(/^["']|["']$/g, '').trim(),
                        improvement: 'Sharper, role-aligned summary (using fallback)'
                    });
                }
            }
            
            return res.status(502).json({ error: 'AI service temporarily unavailable' });
        }

        const data = await response.json();
        const rewritten = data.choices?.[0]?.message?.content?.trim() || summary;
        const usage = data.usage || {};
        const tokensUsed = (usage.total_tokens || usage.completion_tokens || 0) + (usage.prompt_tokens || 0) || 256;
        
        // Cost calculation: OpenAI ~$0.15/1M tokens, Groq free
        const costUsd = useOpenAI 
            ? Math.max(0, (tokensUsed / 1e6) * 0.15) 
            : Math.max(0, (tokensUsed / 1e6) * 0.2);

        try {
            await query(
                `INSERT INTO ai_usage_logs (operation_type, provider, tokens_used, cost_usd, session_id) VALUES ($1, $2, $3, $4, $5)`,
                ['rewrite_summary', provider, tokensUsed, costUsd, req.body.sessionId || null]
            );
        } catch (_) { /* optional */ }

        res.json({
            original: summary,
            rewritten: rewritten.replace(/^["']|["']$/g, '').trim(),
            improvement: 'Sharper, role-aligned summary'
        });

    } catch (error: any) {
        console.error('Summary rewrite error:', error);
        res.status(500).json({ 
            error: 'Failed to process summary rewrite',
            fallback: req.body.summary
        });
    }
});

export default router;
