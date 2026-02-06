/**
 * ROLE + MARKET INTELLIGENCE SERVICE (REAL)
 */

import { TargetMarket, ExperienceLevel } from '../agents/shared/types';

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

import { getApiBaseUrl } from '../utils/api-config';
const BACKEND_API_URL = getApiBaseUrl();

export interface RoleMarketIntelligence {
  role: string;
  market: TargetMarket;
  experienceLevel: ExperienceLevel;

  // Core skills recruiters expect
  coreSkills: string[];

  // Common tools
  commonTools: string[];

  // Typical bullet language patterns
  bulletLanguage: {
    actionVerbs: string[];
    impactPhrases: string[];
    metricsPatterns: string[];
  };

  // What NOT to claim at this level
  avoidClaims: string[];

  // Seniority-appropriate titles
  appropriateTitles: string[];

  // Market-specific insights
  marketInsights: {
    salaryRange?: string;
    competitionLevel: 'low' | 'medium' | 'high';
    keyDifferentiators: string[];
  };

  // Cached timestamp
  cachedAt: number;
  expiresAt: number;
}

const CACHE_KEY_PREFIX = 'role-market-intel';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get role market intelligence (cached)
 */
export async function getRoleMarketIntelligence(
  role: string,
  market: TargetMarket,
  experienceLevel: ExperienceLevel
): Promise<RoleMarketIntelligence> {
  const cacheKey = `${CACHE_KEY_PREFIX}:${role.toLowerCase()}:${market}:${experienceLevel}`;

  // Check localStorage cache first
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const data: RoleMarketIntelligence = JSON.parse(cached);
      if (data.expiresAt > Date.now()) {
        console.log('✅ Using cached role market intelligence');
        return data;
      }
    } catch (e) {
      console.warn('Cache parse error, fetching fresh', e);
    }
  }

  // Check backend cache
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/intelligence/role-market?role=${encodeURIComponent(role)}&market=${market}&experience=${experienceLevel}`);
    if (response.ok) {
      const data = await response.json();
      if (data.intelligence && data.intelligence.expiresAt > Date.now()) {
        // Cache in localStorage
        localStorage.setItem(cacheKey, JSON.stringify(data.intelligence));
        return data.intelligence;
      }
    }
  } catch (e) {
    console.warn('Backend cache check failed', e);
  }

  // Generate fresh intelligence using LLM (ONCE per role+market+exp)
  console.log('🔄 Generating fresh role market intelligence (AI call)');
  const intelligence = await generateRoleMarketIntelligence(role, market, experienceLevel);

  // Cache in localStorage
  localStorage.setItem(cacheKey, JSON.stringify(intelligence));

  // Cache in backend (async, don't wait)
  fetch(`${BACKEND_API_URL}/api/intelligence/role-market`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, market, experienceLevel, intelligence })
  }).catch(e => console.warn('Backend cache save failed', e));

  return intelligence;
}

/**
 * Generate role market intelligence using OpenAI or Groq
 * This is called ONCE per role+market+exp combination
 */
async function generateRoleMarketIntelligence(
  role: string,
  market: TargetMarket,
  experienceLevel: ExperienceLevel
): Promise<RoleMarketIntelligence> {

  const config = getLLMConfig();

  if (!config) {
    // Fallback to rule-based intelligence
    return getFallbackIntelligence(role, market, experienceLevel);
  }

  const systemPrompt = `You are a senior technical recruiter with deep market knowledge.

Your task:
Analyze the job market for a specific role, market, and experience level.
Provide HONEST, REALISTIC intelligence that helps candidates understand:
1. What skills recruiters actually expect
2. What tools are commonly used
3. What language is appropriate for their level
4. What they should NOT claim (to avoid interview risk)

Be specific. Be honest. No fluff.`;

  const userPrompt = `You are a recruiter analyzing the job market.

Role: ${role}
Market: ${market}
Experience Level: ${experienceLevel}

Return structured JSON with:
1. coreSkills: Array of 5-8 core technical skills recruiters expect at this level
2. commonTools: Array of 5-8 tools/technologies commonly used
3. bulletLanguage: Object with:
   - actionVerbs: Array of 3-5 appropriate action verbs for this level
   - impactPhrases: Array of 3-5 impact phrases that sound realistic
   - metricsPatterns: Array of 2-3 metric patterns appropriate for this level
4. avoidClaims: Array of 3-5 things they should NOT claim (e.g., "Led team of 10" for fresher)
5. appropriateTitles: Array of 3-5 job titles appropriate for this experience level
6. marketInsights: Object with:
   - competitionLevel: "low" | "medium" | "high"
   - keyDifferentiators: Array of 2-3 things that make candidates stand out

Rules:
- For fresher: Focus on learning, projects, basic skills. NO leadership claims.
- For 1-3 years: Individual contributor achievements. NO team management.
- For 3-5 years: Can mention mentoring, small team collaboration. NO strategic leadership.
- For 5-8 years: Can mention leading initiatives. NO org-wide impact claims unless justified.
- For 8+: Can mention strategic impact, team leadership, business outcomes.

Be HONEST. If the market is competitive, say so. If certain skills are overhyped, mention it.

Return ONLY valid JSON, no markdown.`;

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
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const parsed = JSON.parse(content);

    const now = Date.now();
    return {
      role,
      market,
      experienceLevel,
      coreSkills: parsed.coreSkills || [],
      commonTools: parsed.commonTools || [],
      bulletLanguage: parsed.bulletLanguage || {
        actionVerbs: [],
        impactPhrases: [],
        metricsPatterns: []
      },
      avoidClaims: parsed.avoidClaims || [],
      appropriateTitles: parsed.appropriateTitles || [],
      marketInsights: parsed.marketInsights || {
        competitionLevel: 'medium',
        keyDifferentiators: []
      },
      cachedAt: now,
      expiresAt: now + CACHE_DURATION
    };

  } catch (error) {
    console.error('AI role market intelligence error:', error);
    return getFallbackIntelligence(role, market, experienceLevel);
  }
}


/**
 * Fallback rule-based intelligence when OpenAI is unavailable
 */
function getFallbackIntelligence(
  role: string,
  market: TargetMarket,
  experienceLevel: ExperienceLevel
): RoleMarketIntelligence {

  const roleLower = role.toLowerCase();
  const isTech = /engineer|developer|programmer|scientist|analyst|architect/i.test(role);

  const baseIntelligence: RoleMarketIntelligence = {
    role,
    market,
    experienceLevel,
    coreSkills: isTech ? ['Problem Solving', 'Programming', 'Version Control'] : ['Communication', 'Analysis', 'Documentation'],
    commonTools: isTech ? ['Git', 'IDE', 'Command Line'] : ['MS Office', 'Email', 'Documentation Tools'],
    bulletLanguage: {
      actionVerbs: experienceLevel === 'fresher'
        ? ['Developed', 'Built', 'Created', 'Learned', 'Applied']
        : experienceLevel === '1-3'
          ? ['Developed', 'Implemented', 'Delivered', 'Optimized', 'Collaborated']
          : ['Led', 'Architected', 'Designed', 'Drove', 'Mentored'],
      impactPhrases: experienceLevel === 'fresher'
        ? ['improved functionality', 'learned new technologies', 'contributed to team']
        : ['improved performance', 'reduced errors', 'delivered on time'],
      metricsPatterns: experienceLevel === 'fresher'
        ? ['X% improvement', 'X features delivered']
        : ['X% performance gain', 'reduced costs by X', 'served X+ users']
    },
    avoidClaims: experienceLevel === 'fresher'
      ? ['Led team', 'Managed budget', 'Strategic planning', 'Executive decisions']
      : experienceLevel === '1-3'
        ? ['Led large teams', 'Strategic initiatives', 'Org-wide impact']
        : [],
    appropriateTitles: experienceLevel === 'fresher'
      ? ['Junior Developer', 'Associate', 'Entry Level']
      : experienceLevel === '1-3'
        ? ['Software Engineer', 'Developer', 'Analyst']
        : ['Senior Engineer', 'Lead Developer', 'Technical Lead'],
    marketInsights: {
      competitionLevel: market === 'india' ? 'high' : 'medium',
      keyDifferentiators: ['Strong projects', 'Clear communication', 'Problem-solving skills']
    },
    cachedAt: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  };

  return baseIntelligence;
}

/**
 * Clear cache for a specific role+market+exp (for testing)
 */
export function clearRoleMarketCache(
  role: string,
  market: string,
  experienceLevel: string
): void {
  const cacheKey = `${CACHE_KEY_PREFIX}:${role.toLowerCase()}:${market}:${experienceLevel}`;
  localStorage.removeItem(cacheKey);
}
