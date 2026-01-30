import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validateSession } from '../middleware/session.js';

const router = express.Router();

// Rate limiters
const parseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many parse requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).sessionId || req.ip || 'anonymous';
  },
  skip: (req) => !req.ip
});

const improveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many improvement requests. Please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).sessionId || req.ip || 'anonymous';
  },
  skip: (req) => !req.ip
});

// LLM API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Call Gemini API with timeout
 */
async function callGemini(prompt: string, maxTokens: number = 2000): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 10
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Gemini API timeout');
    }
    throw error;
  }
}

/**
 * Call Groq API with timeout
 */
async function callGroq(prompt: string, maxTokens: number = 2000): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} ${error}`);
    }

    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Groq API timeout');
    }
    throw error;
  }
}

/**
 * Call LLM with fallback strategy: Gemini → Groq
 */
async function callLLM(prompt: string, maxTokens: number = 2000): Promise<{ content: string; provider: string }> {
  // Try Gemini first
  try {
    console.log('🤖 Trying Gemini API...');
    const content = await callGemini(prompt, maxTokens);
    console.log('✅ Gemini API succeeded');
    return { content, provider: 'gemini' };
  } catch (error: any) {
    console.warn('⚠️ Gemini API failed:', error.message);
  }

  // Fallback to Groq
  try {
    console.log('🤖 Trying Groq API...');
    const content = await callGroq(prompt, maxTokens);
    console.log('✅ Groq API succeeded');
    return { content, provider: 'groq' };
  } catch (error: any) {
    console.error('❌ Groq API failed:', error.message);
    throw new Error('All LLM providers failed');
  }
}

/**
 * POST /api/llm/parse - Parse resume text into structured data
 */
router.post('/parse', validateSession, parseLimiter, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const sessionId = (req as any).sessionId;

  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Resume text is required'
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        error: 'TEXT_TOO_LONG',
        message: 'Resume text exceeds 10000 characters'
      });
    }

    // Sanitize input (remove excessive whitespace)
    const sanitizedText = text.replace(/\s+/g, ' ').trim();

    // Build parsing prompt
    const prompt = `You are a resume parser. Extract structured information from this resume text and return ONLY valid JSON (no markdown, no explanation).

Resume Text:
${sanitizedText}

Return JSON in this exact format:
{
  "personal": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or empty",
    "github": "string or empty"
  },
  "summary": "string or empty",
  "experience": [
    {
      "id": "exp-1",
      "company": "string",
      "position": "string",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "YYYY or YYYY-MM"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "string",
      "description": "string"
    }
  ],
  "skills": ["string"],
  "achievements": [
    {
      "id": "ach-1",
      "description": "string"
    }
  ]
}

If a field is not found, use empty string or empty array. Generate unique IDs for each item.`;

    // Call LLM
    const { content, provider } = await callLLM(prompt, 3000);

    // Parse JSON response
    let parsedData;
    try {
      // Extract JSON from response (in case LLM adds markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      parsedData = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse LLM response:', content);
      throw new Error('Invalid JSON response from LLM');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Resume parsed successfully (${duration}ms, ${provider})`);

    res.json({
      success: true,
      data: parsedData,
      confidence: 0.85,
      provider,
      duration
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Parse failed (${duration}ms):`, error.message);

    res.status(500).json({
      success: false,
      error: 'PARSE_FAILED',
      message: 'Failed to parse resume. Please try again or start from scratch.',
      duration
    });
  }
});

/**
 * POST /api/llm/improve - Improve text with grammar/clarity suggestions
 */
router.post('/improve', validateSession, improveLimiter, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const sessionId = (req as any).sessionId;

  try {
    const { text, context, targetRole, jobDescription } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Text is required'
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        error: 'TEXT_TOO_LONG',
        message: 'Text exceeds 500 characters'
      });
    }

    const validContexts = ['summary', 'experience', 'project'];
    if (context && !validContexts.includes(context)) {
      return res.status(400).json({
        error: 'INVALID_CONTEXT',
        message: 'Context must be one of: summary, experience, project'
      });
    }

    // Build improvement prompt
    let prompt = `You are a professional resume editor. Improve this text for grammar, clarity, and professionalism.

IMPORTANT RULES:
- ONLY fix grammar and improve clarity
- DO NOT add new information or achievements
- DO NOT make claims not in original text
- Keep the meaning exactly the same
- Return ONLY the improved text (no explanations)

Context: ${context || 'general'}
${targetRole ? `Target Role: ${targetRole}` : ''}
${jobDescription ? `Job Description Keywords: ${jobDescription.substring(0, 200)}` : ''}

Original Text:
${text}

Improved Text:`;

    // Call LLM
    const { content, provider } = await callLLM(prompt, 600);

    const improvedText = content.trim();

    // Check similarity (if > 80% same, return original)
    const similarity = calculateSimilarity(text, improvedText);
    const finalText = similarity > 0.95 ? text : improvedText;

    const duration = Date.now() - startTime;
    console.log(`✅ Text improved (${duration}ms, ${provider}, similarity: ${similarity.toFixed(2)})`);

    res.json({
      success: true,
      original: text,
      improved: finalText,
      changes: finalText === text ? [] : ['Grammar and clarity improvements'],
      provider,
      duration
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Improve failed (${duration}ms):`, error.message);

    res.status(500).json({
      success: false,
      error: 'IMPROVE_FAILED',
      message: 'Failed to improve text. Please try again.',
      duration
    });
  }
});

/**
 * Calculate text similarity (simple character overlap)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const len1 = text1.length;
  const len2 = text2.length;
  const maxLen = Math.max(len1, len2);
  
  if (maxLen === 0) return 1;
  
  let matches = 0;
  const minLen = Math.min(len1, len2);
  
  for (let i = 0; i < minLen; i++) {
    if (text1[i] === text2[i]) matches++;
  }
  
  return matches / maxLen;
}

export default router;
