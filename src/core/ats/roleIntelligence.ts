import { TargetMarket, ExperienceLevel } from '../types';

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

export interface RoleMarketIntelligence {
    role: string;
    market: TargetMarket;
    experienceLevel: ExperienceLevel;
    coreSkills: string[];
    commonTools: string[];
    bulletLanguage: {
        actionVerbs: string[];
        impactPhrases: string[];
        metricsPatterns: string[];
    };
    avoidClaims: string[];
    appropriateTitles: string[];
    marketInsights: {
        competitionLevel: 'low' | 'medium' | 'high';
        keyDifferentiators: string[];
    };
    cachedAt: number;
    expiresAt: number;
}

const CACHE_KEY_PREFIX = 'role-market-intel';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getRoleMarketIntelligence(
    role: string,
    market: TargetMarket,
    experienceLevel: ExperienceLevel
): Promise<RoleMarketIntelligence> {
    const cacheKey = `${CACHE_KEY_PREFIX}:${role.toLowerCase()}:${market}:${experienceLevel}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        try {
            const data: RoleMarketIntelligence = JSON.parse(cached);
            if (data.expiresAt > Date.now()) return data;
        } catch (e) {
            console.warn('Cache parse error', e);
        }
    }

    const intelligence = await generateRoleMarketIntelligence(role, market, experienceLevel);
    localStorage.setItem(cacheKey, JSON.stringify(intelligence));
    return intelligence;
}

async function generateRoleMarketIntelligence(
    role: string,
    market: TargetMarket,
    experienceLevel: ExperienceLevel
): Promise<RoleMarketIntelligence> {
    const config = getLLMConfig();
    if (!config) return getFallbackIntelligence(role, market, experienceLevel);

    const systemPrompt = `You are a senior technical recruiter.
Analyze the job market for: Role: ${role}, Market: ${market}, Level: ${experienceLevel}.
Provide HONEST intelligence on expected skills, tools, and typically allowed claims.
Return ONLY JSON.`;

    const userPrompt = `Return structured JSON:
{
  "coreSkills": ["skill1", "skill2"],
  "commonTools": ["tool1", "tool2"],
  "bulletLanguage": {
    "actionVerbs": ["verb1", "verb2"],
    "impactPhrases": ["phrase1"],
    "metricsPatterns": ["pattern1"]
  },
  "avoidClaims": ["claim1"],
  "appropriateTitles": ["title1"],
  "marketInsights": {
    "competitionLevel": "medium",
    "keyDifferentiators": ["diff1"]
  }
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
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) throw new Error('AI API error');
        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        return {
            role, market, experienceLevel,
            coreSkills: content.coreSkills || [],
            commonTools: content.commonTools || [],
            bulletLanguage: content.bulletLanguage || { actionVerbs: [], impactPhrases: [], metricsPatterns: [] },
            avoidClaims: content.avoidClaims || [],
            appropriateTitles: content.appropriateTitles || [],
            marketInsights: content.marketInsights || { competitionLevel: 'medium', keyDifferentiators: [] },
            cachedAt: Date.now(),
            expiresAt: Date.now() + CACHE_DURATION
        };
    } catch (error) {
        console.warn('AI error, using fallback', error);
        return getFallbackIntelligence(role, market, experienceLevel);
    }
}

function getFallbackIntelligence(role: string, market: TargetMarket, experienceLevel: ExperienceLevel): RoleMarketIntelligence {
    const isTech = /engineer|developer/i.test(role);
    return {
        role, market, experienceLevel,
        coreSkills: isTech ? ['Problem Solving', 'Tech Stack'] : ['Communication', 'Analysis'],
        commonTools: [],
        bulletLanguage: { actionVerbs: ['Worked', 'Helped'], impactPhrases: [], metricsPatterns: [] },
        avoidClaims: ['Led team (if junior)'],
        appropriateTitles: ['Associate', 'Staff'],
        marketInsights: { competitionLevel: 'medium', keyDifferentiators: [] },
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
    };
}
