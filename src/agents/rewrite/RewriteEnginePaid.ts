// Rewrite Engine (Paid) - Full AI Rewrite with JD Alignment
// Uses OpenAI GPT-4o-mini for quality rewrites

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, RewriteOutput } from '../shared/types';
import { createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const REWRITE_PAID_SYSTEM_PROMPT = `You are a professional resume writer for the Indian job market.

Your job: Transform resume bullets into recruiter-optimized content.

Transform using STAR format:
- Situation/Task: What was the challenge
- Action: What you did (with tools/methods)
- Result: Impact (quantified if possible, inferred if not)

RULES:
1. Keep core truth 100% - never invent experience
2. Add implied metrics ONLY if logical:
   - "Built API" → "Built API handling ~1000 daily requests" (reasonable inference)
   - "Led team" → "Led team of 3-4 developers" (fresher likely has small team)
3. Use JD keywords naturally - don't force them
4. Start with strong action verbs: Built, Developed, Led, Created, Implemented, Designed, Optimized
5. Prefix inferred metrics with "~" or "approximately" for honesty

AVOID:
- Buzzwords: leveraged, synergized, revolutionized, spearheaded
- Generic phrases: results-driven, dynamic professional, passionate
- Fake achievements
- Technologies not implied by original

Output JSON:
{
  "rewritten": "The improved bullet",
  "changes": ["Added metric inference", "Added JD keyword: React"],
  "keywordsAdded": ["React", "Node.js"],
  "metricsAdded": true,
  "improvement": "Brief explanation of what was improved"
}`;

export class RewriteEnginePaid extends BaseAgent {
  constructor() {
    super('rewrite_paid', REWRITE_PAID_SYSTEM_PROMPT, 'openai');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const text = input.data.text as string || input.data.bullet as string || '';
    const context = input.data.context as string || 'bullet';
    const jdKeywords = input.data.jdKeywords as string[] || [];
    const targetRole = input.data.targetRole as string || '';
    const role = input.data.role as string || ''; // Current role

    if (!text || text.length < 5) {
      return this.createErrorOutput('No text provided for rewrite');
    }

    // Check if user is paid
    if (!input.context.isPaidUser) {
      return this.createErrorOutput('Paid rewrite requires premium subscription');
    }

    const prompt = `Rewrite this resume ${context} for maximum recruiter impact.

ORIGINAL:
"${text}"

CONTEXT:
- Current Role: ${role || 'Not specified'}
- Target Role: ${targetRole || 'Not specified'}
- JD Keywords to incorporate (only if relevant): ${jdKeywords.length > 0 ? jdKeywords.join(', ') : 'None provided'}

INSTRUCTIONS:
1. Keep the core achievement/responsibility intact
2. Start with a strong action verb
3. Add a metric ONLY if it can be logically inferred
4. Keep it concise (max 25-30 words)
5. Don't add tools/technologies not implied by the original
6. If JD keywords match the original context, weave them in naturally

Return JSON with the improved bullet and explanation.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'openai',
        isPaid: true,
        maxTokens: 500,
        temperature: 0.4,
        jsonMode: true
      });

      const parsed = parseJsonFromLLM<{
        rewritten: string;
        changes: string[];
        keywordsAdded: string[];
        metricsAdded: boolean;
        improvement: string;
      }>(response.content);

      if (!parsed || !parsed.rewritten) {
        // Return original if parsing fails
        return this.createSuccessOutput(
          {
            original: text,
            rewritten: text,
            changes: ['Rewrite parsing failed - keeping original'],
            keywordsAdded: [],
            metricsAdded: false,
            truthCheck: 'passed'
          } as RewriteOutput,
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      // Validate the rewrite isn't too different (truth check)
      const truthCheck = this.validateTruth(text, parsed.rewritten);

      return this.createSuccessOutput(
        {
          original: text,
          rewritten: parsed.rewritten,
          changes: parsed.changes || [],
          keywordsAdded: parsed.keywordsAdded || [],
          metricsAdded: parsed.metricsAdded || false,
          truthCheck
        } as RewriteOutput,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('Paid rewrite failed', error);
      return this.createErrorOutput(
        error instanceof Error ? error.message : 'Rewrite failed'
      );
    }
  }

  /**
   * Basic truth validation - check if rewrite strays too far from original
   */
  private validateTruth(original: string, rewritten: string): 'passed' | 'flagged' {
    const originalWords = new Set(original.toLowerCase().split(/\s+/));
    const rewrittenWords = rewritten.toLowerCase().split(/\s+/);
    
    // Count how many original words are preserved
    const preserved = rewrittenWords.filter(w => originalWords.has(w)).length;
    const preservedRatio = preserved / rewrittenWords.length;
    
    // Check for suspicious additions
    const suspiciousPatterns = [
      /\d{3,}%/, // Unrealistic percentages like 500%
      /\$\d{6,}/, // Millions of dollars
      /\d{2,}\s*million/, // Millions
      /revolutionized|pioneered|transformed the industry/i
    ];
    
    const hasSuspicious = suspiciousPatterns.some(p => p.test(rewritten));
    
    // Flag if too many new words or suspicious content
    if (preservedRatio < 0.2 || hasSuspicious) {
      return 'flagged';
    }
    
    return 'passed';
  }
}
