/**
 * HYBRID AI REWRITING SERVICE
 * 
 * Combines rules-based rewriting (fast, deterministic) with AI API calls (high quality).
 * Routes bullets based on complexity assessment to optimize cost and performance.
 * 
 * Simple bullets (score < 2) → Rules-based (instant, no cost)
 * Complex bullets (score >= 2) → AI API with fallback to rules
 */

type RoleLevel = 'fresher' | 'intern' | 'entry' | 'junior' | 'mid' | 'senior' | 'lead';

import { getApiBaseUrl } from '../utils/api-config';
const API_BASE_URL = getApiBaseUrl();

/**
 * Assess bullet complexity (0-4 score)
 * Higher score = more complex = better suited for AI API
 */
function assessBulletComplexity(bullet: string): number {
  let score = 0;
  
  // Has strong action verb (+1)
  const strongVerbs = /\b(architected|led|drove|spearheaded|orchestrated|engineered|pioneered|established|optimized)\b/i;
  if (strongVerbs.test(bullet)) score += 1;
  
  // Has quantified metrics (+1)
  const metrics = /\d+%|\d+x|\d+\+|₹\d+[KLM]?|\$\d+[KM]?|\d+ (users|customers|hours|days|months)/i;
  if (metrics.test(bullet)) score += 1;
  
  // Length > 60 chars (detailed) (+1)
  if (bullet.length > 60) score += 1;
  
  // Contains technical keywords (+1)
  const techKeywords = /\b(react|angular|vue|node|python|java|aws|docker|kubernetes|api|typescript|javascript|sql|nosql|mongodb|postgresql|redis|microservices|ci\/cd|git|agile|scrum)\b/i;
  if (techKeywords.test(bullet)) score += 1;
  
  return score;
}

/**
 * Call AI API to rewrite bullet (with timeout and error handling)
 */
async function callAIRewriteAPI(bullet: string, roleLevel: RoleLevel): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-rewrite/bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bullet,
        role: roleLevel,
        keywords: []
      }),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('AI API rate limit exceeded, falling back to rules');
        return null;
      }
      console.error(`AI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.rewritten || null;

  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      console.warn('AI API timeout, falling back to rules');
    } else {
      console.error('AI API call failed:', error);
    }
    return null;
  }
}

/**
 * MAIN FUNCTION: Hybrid rewrite with intelligent routing
 * 
 * @param bullet - Original bullet text
 * @param roleLevel - User's role level (fresher to lead)
 * @param ruleBasedRewriter - Function that applies rules-based transformation
 * @returns Enhanced bullet text
 */
export async function hybridRewriteBullet(
  bullet: string,
  roleLevel: RoleLevel,
  ruleBasedRewriter: (bullet: string) => string
): Promise<string> {
  // Assess complexity
  const complexity = assessBulletComplexity(bullet);
  
  console.log(`Bullet complexity: ${complexity}/4 - "${bullet.slice(0, 50)}..."`);
  
  // Simple bullets (score < 2): use rules-based (fast, deterministic)
  if (complexity < 2) {
    console.log('→ Using rules-based rewrite (simple bullet)');
    return ruleBasedRewriter(bullet);
  }
  
  // Complex bullets (score >= 2): try AI API if enabled
  const HYBRID_AI_ENABLED = import.meta.env.VITE_ENABLE_HYBRID_AI === 'true';
  
  if (HYBRID_AI_ENABLED) {
    console.log('→ Attempting AI API rewrite (complex bullet)');
    const aiResult = await callAIRewriteAPI(bullet, roleLevel);
    
    if (aiResult) {
      console.log('✓ AI rewrite successful');
      return aiResult;
    }
    
    console.log('⚠ AI rewrite failed, falling back to rules');
  } else {
    console.log('→ Using rules-based rewrite (hybrid AI disabled)');
  }
  
  // Fallback: use rules-based
  return ruleBasedRewriter(bullet);
}

/**
 * Export for external use (optional, if needed elsewhere)
 */
export { assessBulletComplexity };
