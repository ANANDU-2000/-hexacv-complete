/**
 * HONEST AI REWRITE SERVICE
 * 
 * Implements STEP 4 from CORRECT CORE LOGIC:
 * - Split AI into 3 actions: Grammar, Rewrite with constraints, Skill gap suggestions
 * - NEVER invents leadership/senior claims
 * - Validates against experience level
 * - User approves every change
 * 
 * This replaces broken AI rewrite logic with constrained, honest rewriting.
 */

import { getRoleMarketIntelligence, RoleMarketIntelligence } from './roleMarketIntelligenceService';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export interface RewriteOptions {
  mode: 'grammar' | 'rewrite' | 'suggest-skills';
  role: string;
  market: 'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote';
  experienceLevel: 'fresher' | '1-3' | '3-5' | '5-8' | '8+';
  jdKeywords?: string[];
  originalText: string;
}

export interface RewriteResult {
  original: string;
  rewritten: string;
  changes: string[];
  warnings: string[];
  confidence: number;
}

/**
 * A) Grammar fix only - no meaning change
 */
export async function fixGrammarOnly(
  text: string,
  context: { role: string; experienceLevel: string }
): Promise<RewriteResult> {
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
    return {
      original: text,
      rewritten: text,
      changes: [],
      warnings: ['OpenAI not configured - grammar check skipped'],
      confidence: 0
    };
  }
  
  const systemPrompt = `You are a grammar and style editor for resumes.

Your ONLY task:
- Fix grammar errors
- Fix punctuation
- Fix capitalization
- Fix verb tense consistency

DO NOT:
- Change meaning
- Add content
- Remove content
- Rewrite for "impact"
- Add metrics
- Change action verbs

Preserve the user's exact meaning and voice.`;

  const userPrompt = `Fix grammar ONLY in this resume text. Do not change meaning.

TEXT:
"${text}"

Return JSON:
{
  "rewritten": "Grammar-corrected text",
  "changes": ["List of grammar fixes made"],
  "confidence": 0.95
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Very low for grammar-only
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content);
    
    return {
      original: text,
      rewritten: parsed.rewritten || text,
      changes: parsed.changes || [],
      warnings: [],
      confidence: parsed.confidence || 0.8
    };
    
  } catch (error) {
    console.error('Grammar fix error:', error);
    return {
      original: text,
      rewritten: text,
      changes: [],
      warnings: ['Grammar check failed'],
      confidence: 0
    };
  }
}

/**
 * B) Rewrite with constraints - role-aware, experience-appropriate
 */
export async function rewriteWithConstraints(
  options: RewriteOptions
): Promise<RewriteResult> {
  
  // Get role market intelligence
  const intelligence = await getRoleMarketIntelligence(
    options.role,
    options.market,
    options.experienceLevel
  );
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_key_here') {
    return rewriteWithRules(options, intelligence);
  }
  
  const systemPrompt = `You are a resume optimizer who helps candidates write honest, interview-safe resumes.

CRITICAL RULES:
1. NEVER invent leadership claims for junior candidates
2. NEVER add metrics that aren't logically implied
3. NEVER add tools/technologies not mentioned in original
4. Use language appropriate for experience level
5. Match JD keywords ONLY if relevant to original content
6. Preserve factual accuracy strictly

Your goal: Make the resume recruiter-friendly while staying 100% honest.`;

  const userPrompt = `Rewrite this resume bullet point with constraints.

ORIGINAL:
"${options.originalText}"

CONTEXT:
- Role: ${options.role}
- Market: ${options.market}
- Experience Level: ${options.experienceLevel}
- Core Skills Expected: ${intelligence.coreSkills.join(', ')}
- Appropriate Action Verbs: ${intelligence.bulletLanguage.actionVerbs.join(', ')}
- DO NOT Claim: ${intelligence.avoidClaims.join(', ')}
${options.jdKeywords?.length ? `- JD Keywords (only if relevant): ${options.jdKeywords.join(', ')}` : ''}

INSTRUCTIONS:
1. Start with an appropriate action verb from the list
2. Keep core achievement/responsibility intact
3. Add metric ONLY if logically implied (e.g., "team of 5" if original mentions team)
4. Use JD keywords ONLY if they fit naturally
5. Keep it concise (max 25 words)
6. Sound human-written, not AI-generated
7. NEVER use: ${intelligence.avoidClaims.join(', ')}

Return JSON:
{
  "rewritten": "Improved bullet",
  "changes": ["What was changed and why"],
  "warnings": ["Any concerns about claims"],
  "confidence": 0.85
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content);
    
    // Validate against experience level
    const warnings = validateRewrite(parsed.rewritten, options.experienceLevel, intelligence);
    
    return {
      original: options.originalText,
      rewritten: parsed.rewritten || options.originalText,
      changes: parsed.changes || [],
      warnings: [...(parsed.warnings || []), ...warnings],
      confidence: parsed.confidence || 0.7
    };
    
  } catch (error) {
    console.error('Rewrite error:', error);
    return rewriteWithRules(options, intelligence);
  }
}

/**
 * C) Skill gap suggestions - NOT auto-add
 */
export async function suggestSkillGaps(
  resumeText: string,
  jdKeywords: string[],
  intelligence: RoleMarketIntelligence
): Promise<{
  missingSkills: string[];
  suggestions: string[];
  learningResources?: string[];
}> {
  
  const resumeLower = resumeText.toLowerCase();
  const missingSkills: string[] = [];
  
  // Check core skills
  for (const skill of intelligence.coreSkills) {
    if (!resumeLower.includes(skill.toLowerCase())) {
      missingSkills.push(skill);
    }
  }
  
  // Check JD keywords
  const missingJDKeywords = jdKeywords.filter(kw => 
    !resumeLower.includes(kw.toLowerCase())
  );
  
  const suggestions: string[] = [];
  
  // Prioritize: core skills > JD keywords
  if (missingSkills.length > 0) {
    suggestions.push(...missingSkills.slice(0, 3));
  }
  
  if (missingJDKeywords.length > 0 && suggestions.length < 5) {
    suggestions.push(...missingJDKeywords.slice(0, 5 - suggestions.length));
  }
  
  return {
    missingSkills,
    suggestions: suggestions.slice(0, 5),
    learningResources: suggestions.length > 0 
      ? [`Learn ${suggestions[0]} through hands-on projects`, `Practice ${suggestions[1] || 'these skills'} in real scenarios`]
      : []
  };
}

/**
 * Rule-based rewrite fallback
 */
function rewriteWithRules(
  options: RewriteOptions,
  intelligence: RoleMarketIntelligence
): RewriteResult {
  
  const original = options.originalText;
  let rewritten = original;
  const changes: string[] = [];
  const warnings: string[] = [];
  
  // Use appropriate action verb
  const verbs = intelligence.bulletLanguage.actionVerbs;
  if (verbs.length > 0) {
    const firstVerb = verbs[0];
    const lower = original.toLowerCase();
    
    // Replace weak verbs
    if (/^(built|created|made|worked on|helped|did)/i.test(original)) {
      rewritten = original.replace(/^[^ ]+/, firstVerb);
      changes.push(`Replaced weak verb with "${firstVerb}"`);
    }
  }
  
  // Check for inappropriate claims
  for (const avoid of intelligence.avoidClaims) {
    if (rewritten.toLowerCase().includes(avoid.toLowerCase())) {
      warnings.push(`Contains "${avoid}" - may raise questions at ${options.experienceLevel} level`);
    }
  }
  
  return {
    original,
    rewritten,
    changes,
    warnings,
    confidence: 0.6
  };
}

/**
 * Validate rewrite against experience level
 */
function validateRewrite(
  rewritten: string,
  experienceLevel: string,
  intelligence: RoleMarketIntelligence
): string[] {
  const warnings: string[] = [];
  const lower = rewritten.toLowerCase();
  
  // Check for avoided claims
  for (const avoid of intelligence.avoidClaims) {
    if (lower.includes(avoid.toLowerCase())) {
      warnings.push(`⚠️ Contains "${avoid}" - may be questioned in interviews`);
    }
  }
  
  // Check for leadership claims at junior levels
  if (experienceLevel === 'fresher' || experienceLevel === '1-3') {
    const leadershipTerms = ['led team', 'managed', 'spearheaded', 'drove strategy', 'orchestrated'];
    for (const term of leadershipTerms) {
      if (lower.includes(term)) {
        warnings.push(`⚠️ Leadership claim "${term}" may not match ${experienceLevel} experience level`);
      }
    }
  }
  
  return warnings;
}
