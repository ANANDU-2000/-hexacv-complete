
/**
 * Resume Parser Core
 * Handles AI-based and fallback extraction of resume data from text
 */

import { ResumeData } from '../../types';

// API Configuration - FREE TIER APIs
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// API Status tracking
let geminiAvailable = true;
let groqAvailable = true;
let lastGeminiError = 0;
let lastGroqError = 0;
const ERROR_COOLDOWN = 60000;

export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    profile: string;
    skills: { category: string; items: string[] }[];
    experience: {
        role: string;
        company: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        year: string;
    }[];
    projects: {
        name: string;
        description: string;
        tech: string[];
        startDate?: string;
        endDate?: string;
    }[];
}

export interface ExtractionResult {
    resume: ParsedResume;
    confidence: number;
    extractedFields: string[];
    missingFields: string[];
}

function cleanPDFText(text: string): string {
    return text
        .replace(/\s+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/(\d)([A-Za-z])/g, '$1 $2')
        .replace(/([A-Za-z])(\d)/g, '$1 $2')
        .replace(/  +/g, ' ')
        .trim();
}

async function parseWithGroq(cleanedText: string): Promise<ExtractionResult | null> {
    if (!GROQ_API_KEY) return null;
    const prompt = `Extract resume data as JSON. CRITICAL: COPY 100% OF TEXT VERBATIM - NEVER SUMMARIZE.

RESUME:
${cleanedText.slice(0, 12000)}

Return JSON:
{"name":"","email":"","phone":"","linkedin":"","github":"","profile":"COPY COMPLETE SUMMARY - EVERY SINGLE SENTENCE","skills":[{"category":"","items":[]}],"experience":[{"role":"","company":"","startDate":"","endDate":"","bullets":["COPY ALL BULLETS EXACTLY - MINIMUM 5 PER JOB"]}],"education":[{"degree":"","institution":"","year":""}],"projects":[{"name":"","description":"","tech":[]}]}

MANDATORY RULES:
1. COPY every word of summary - if 100 words, output 100 words
2. COPY ALL bullet points - if 8 bullets, output 8 bullets
3. NEVER shorten, summarize, or paraphrase
4. Use "Present" for current jobs
5. Return valid JSON only.`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            max_tokens: 8000
        })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = validateParsedResume(parsed);

    const extractedFields: string[] = [];
    const missingFields: string[] = [];
    if (validated.name) extractedFields.push('Name'); else missingFields.push('Name');
    if (validated.email) extractedFields.push('Email'); else missingFields.push('Email');
    if (validated.phone) extractedFields.push('Phone'); else missingFields.push('Phone');
    if (validated.skills.length > 0) extractedFields.push('Skills'); else missingFields.push('Skills');
    if (validated.experience.length > 0) extractedFields.push('Experience'); else missingFields.push('Experience');
    if (validated.education.length > 0) extractedFields.push('Education'); else missingFields.push('Education');

    const confidence = (extractedFields.length / (extractedFields.length + missingFields.length)) * 100;
    return {
        resume: validated,
        confidence: Math.round(confidence),
        extractedFields,
        missingFields
    };
}

export async function parseResumeWithAI(rawText: string): Promise<ExtractionResult> {
    const cleanedText = cleanPDFText(rawText);
    const now = Date.now();

    if (!groqAvailable && (now - lastGroqError) >= ERROR_COOLDOWN) groqAvailable = true;
    if (!geminiAvailable && (now - lastGeminiError) >= ERROR_COOLDOWN) geminiAvailable = true;

    if (groqAvailable) {
        try {
            const result = await parseWithGroq(cleanedText);
            if (result) return result;
        } catch (e) {
            groqAvailable = false;
            lastGroqError = now;
        }
    }

    if (!geminiAvailable && (now - lastGeminiError) < ERROR_COOLDOWN) {
        return fallbackParse(cleanedText);
    }

    const prompt = `You are a VERBATIM resume extraction engine. COPY ALL TEXT EXACTLY AS WRITTEN.
RESUME TEXT:
${cleanedText.slice(0, 20000)}

Extract and return JSON. { "name":"", "email":"", "phone":"", "linkedin":"", "github":"", "profile":"", "skills":[], "experience":[], "education":[], "projects":[] }

MANDATORY: COPY profile/summary and bullets exactly as written. Return ONLY valid JSON.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0, maxOutputTokens: 16000 }
            })
        });

        if (!response.ok) {
            geminiAvailable = false;
            lastGeminiError = now;
            return fallbackParse(cleanedText);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return fallbackParse(cleanedText);

        const validated = validateParsedResume(JSON.parse(jsonMatch[0]));
        return {
            resume: validated,
            confidence: 80, // Approximate
            extractedFields: ['Name', 'Email', 'Experience', 'Education', 'Skills'],
            missingFields: []
        };
    } catch (e) {
        geminiAvailable = false;
        lastGeminiError = now;
        return fallbackParse(cleanedText);
    }
}

function validateParsedResume(parsed: any): ParsedResume {
    const clean = (s: any) => typeof s === 'string' ? s.trim() : '';
    return {
        name: clean(parsed.name),
        email: clean(parsed.email),
        phone: clean(parsed.phone),
        linkedin: clean(parsed.linkedin),
        github: clean(parsed.github),
        profile: clean(parsed.profile),
        skills: Array.isArray(parsed.skills) ? parsed.skills.map((s: any) => ({
            category: clean(s.category) || 'General',
            items: Array.isArray(s.items) ? s.items.map(clean).filter(Boolean) : []
        })) : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience.map((e: any) => ({
            role: clean(e.role),
            company: clean(e.company),
            startDate: clean(e.startDate),
            endDate: clean(e.endDate),
            bullets: Array.isArray(e.bullets) ? e.bullets.map(clean).filter(Boolean) : []
        })) : [],
        education: Array.isArray(parsed.education) ? parsed.education.map((e: any) => ({
            degree: clean(e.degree),
            institution: clean(e.institution),
            year: clean(e.year)
        })) : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects.map((p: any) => ({
            name: clean(p.name),
            description: clean(p.description),
            tech: Array.isArray(p.tech) ? p.tech.map(clean).filter(Boolean) : []
        })) : []
    };
}

function fallbackParse(text: string): ExtractionResult {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    const email = emailMatch ? emailMatch[1].toLowerCase() : '';
    const phoneMatch = text.match(/(?:\+91[-.\s]?)?\d{10}/);
    const phone = phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, '') : '';

    return {
        resume: {
            name: text.split('\n')[0].trim().slice(0, 50),
            email,
            phone,
            linkedin: '',
            github: '',
            profile: '',
            skills: [],
            experience: [],
            education: [],
            projects: []
        },
        confidence: 30,
        extractedFields: email ? ['Email'] : [],
        missingFields: email ? ['Name', 'Phone', 'Experience'] : ['Email', 'Name', 'Phone']
    };
}
