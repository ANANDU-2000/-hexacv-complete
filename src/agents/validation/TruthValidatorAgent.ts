// Truth Validator Agent
// Detects exaggeration and blocks fake metrics

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, TruthValidation, TruthIssue, TruthAction } from '../shared/types';
import { createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const TRUTH_VALIDATOR_SYSTEM_PROMPT = `You detect resume exaggeration and BLOCK fake metrics.

Red flags to detect:
1. Impossible metrics: "Increased revenue by 500%" (fresher role)
2. Vague superlatives: "Revolutionized", "Pioneered" (without proof)
3. Inconsistent claims: "Led team of 20" (6 months experience)
4. Buzzword stuffing: "Synergized cross-functional stakeholders to leverage..."
5. Unrealistic impact: "Saved company $10M" (junior developer)
6. Technology overclaiming: Listing 30+ technologies as "expert"

For each issue found, provide:
- The problematic text
- Why it's likely false/exaggerated
- A more honest alternative

Output JSON:
{
  "issues": [
    {
      "text": "specific problematic phrase",
      "reason": "why it's likely false",
      "suggestion": "honest alternative",
      "severity": "low|medium|high"
    }
  ],
  "overallTruthScore": "high|medium|low",
  "action": "approve|flag|block",
  "blockedPhrases": ["phrase1", "phrase2"],
  "flaggedPhrases": ["phrase3"]
}

Actions:
- approve: Content looks honest, proceed
- flag: Some concerns, show warning to user
- block: Serious issues, don't allow export until fixed`;

export class TruthValidatorAgent extends BaseAgent {
  constructor() {
    super('truth_validator', TRUTH_VALIDATOR_SYSTEM_PROMPT, 'gemini');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const resume = input.data.parsedResume || input.data.resume || input.data;
    const text = input.data.text as string;

    // If single text provided, validate just that
    if (text) {
      return this.validateText(text, input);
    }

    // Otherwise validate full resume
    return this.validateResume(resume as Record<string, unknown>, input);
  }

  /**
   * Validate a single piece of text
   */
  private async validateText(text: string, input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    
    // Quick rule-based check first
    const quickCheck = this.quickTruthCheck(text);
    if (quickCheck.issues.length > 0) {
      return this.createSuccessOutput(quickCheck, 0, 'groq', Date.now() - start);
    }

    // For longer text, use LLM
    if (text.length > 100) {
      try {
        const client = createLLMClient(input.context.costBudget);
        
        const response = await client.complete(
          `Analyze this resume text for exaggeration or fake claims:\n\n"${text}"`,
          {
            systemPrompt: this.systemPrompt,
            preferred: 'gemini',
            isPaid: input.context.isPaidUser,
            maxTokens: 500,
            jsonMode: true
          }
        );

        const parsed = parseJsonFromLLM<TruthValidation>(response.content);
        if (parsed) {
          return this.createSuccessOutput(parsed, response.tokensUsed, response.provider, Date.now() - start);
        }
      } catch (error) {
        this.log('LLM validation failed, using rules', error);
      }
    }

    // Default: approve if no issues found
    return this.createSuccessOutput(
      {
        issues: [],
        overallTruthScore: 'high',
        action: 'approve',
        blockedPhrases: [],
        flaggedPhrases: []
      } as TruthValidation,
      0,
      'groq',
      Date.now() - start
    );
  }

  /**
   * Validate full resume
   */
  private async validateResume(
    resume: Record<string, unknown>,
    input: AgentInput
  ): Promise<AgentOutput> {
    const start = Date.now();
    const allIssues: TruthIssue[] = [];
    const blockedPhrases: string[] = [];
    const flaggedPhrases: string[] = [];

    // Extract all text content
    const summary = resume.summary as string || '';
    const experience = resume.experience as any[] || [];
    const projects = resume.projects as any[] || [];

    // Validate summary
    const summaryCheck = this.quickTruthCheck(summary);
    allIssues.push(...summaryCheck.issues);

    // Validate experience bullets
    for (const exp of experience) {
      const bullets = exp.highlights || exp.bullets || [];
      for (const bullet of bullets) {
        const check = this.quickTruthCheck(bullet, exp);
        allIssues.push(...check.issues);
      }
    }

    // Validate project descriptions
    for (const proj of projects) {
      const check = this.quickTruthCheck(proj.description || '');
      allIssues.push(...check.issues);
    }

    // Categorize issues
    for (const issue of allIssues) {
      if (issue.severity === 'high') {
        blockedPhrases.push(issue.text);
      } else if (issue.severity === 'medium') {
        flaggedPhrases.push(issue.text);
      }
    }

    // Determine action
    let action: TruthAction = 'approve';
    let overallTruthScore: 'high' | 'medium' | 'low' = 'high';

    if (blockedPhrases.length > 0) {
      action = 'block';
      overallTruthScore = 'low';
    } else if (flaggedPhrases.length >= 3) {
      action = 'flag';
      overallTruthScore = 'medium';
    } else if (flaggedPhrases.length > 0) {
      action = 'flag';
      overallTruthScore = 'medium';
    }

    return this.createSuccessOutput(
      {
        issues: allIssues,
        overallTruthScore,
        action,
        blockedPhrases,
        flaggedPhrases
      } as TruthValidation,
      0,
      'groq',
      Date.now() - start
    );
  }

  /**
   * Quick rule-based truth check
   */
  private quickTruthCheck(text: string, context?: any): TruthValidation {
    const issues: TruthIssue[] = [];
    const blockedPhrases: string[] = [];
    const flaggedPhrases: string[] = [];

    if (!text) {
      return {
        issues: [],
        overallTruthScore: 'high',
        action: 'approve',
        blockedPhrases: [],
        flaggedPhrases: []
      };
    }

    const textL = text.toLowerCase();

    // Check for buzzword stuffing
    const buzzwords = [
      'synergized', 'leveraged', 'revolutionized', 'spearheaded',
      'paradigm shift', 'thought leader', 'game-changer', 'disruptive',
      'cutting-edge', 'best-in-class', 'world-class', 'industry-leading'
    ];

    for (const word of buzzwords) {
      if (textL.includes(word)) {
        issues.push({
          text: word,
          reason: 'Buzzword that adds no value - recruiters see through this',
          suggestion: 'Use specific, concrete language instead',
          severity: 'medium'
        });
        flaggedPhrases.push(word);
      }
    }

    // Check for unrealistic metrics
    const unrealisticPatterns = [
      { pattern: /(\d{3,})%\s*(increase|improvement|growth)/i, reason: 'Percentage seems unrealistically high' },
      { pattern: /\$\s*\d{7,}/, reason: 'Dollar amount seems unrealistic for this role level' },
      { pattern: /\d{2,}\s*million/i, reason: 'Million-dollar claims need strong context' },
      { pattern: /100%\s*(of|improvement|increase)/i, reason: '100% claims are often exaggerated' }
    ];

    for (const { pattern, reason } of unrealisticPatterns) {
      const match = text.match(pattern);
      if (match) {
        issues.push({
          text: match[0],
          reason,
          suggestion: 'Use more conservative, verifiable numbers or add "approximately"',
          severity: 'high'
        });
        blockedPhrases.push(match[0]);
      }
    }

    // Check for vague superlatives
    const vagueSuperlatives = [
      'best', 'top', 'leading', 'premier', 'unparalleled', 'unmatched',
      'pioneered', 'invented', 'created from scratch', 'single-handedly'
    ];

    for (const word of vagueSuperlatives) {
      if (textL.includes(word) && !textL.includes('among') && !textL.includes('one of')) {
        issues.push({
          text: word,
          reason: 'Superlative claim without evidence',
          suggestion: `Replace with specific achievement or add context`,
          severity: 'low'
        });
      }
    }

    // Check for inconsistent experience claims
    if (context) {
      // If context provides experience info, check for mismatches
      const roleTitle = (context.position || '').toLowerCase();
      const isJunior = /intern|junior|associate|fresher|trainee/i.test(roleTitle);

      if (isJunior) {
        if (/led\s*(a\s*)?team\s*of\s*\d{2,}/i.test(text)) {
          issues.push({
            text: text.match(/led\s*(a\s*)?team\s*of\s*\d{2,}/i)?.[0] || '',
            reason: 'Junior role claiming to lead large team - seems inconsistent',
            suggestion: 'Clarify your actual role - perhaps "collaborated with" or "contributed to"',
            severity: 'medium'
          });
        }
      }
    }

    // Determine overall score and action
    let action: TruthAction = 'approve';
    let overallTruthScore: 'high' | 'medium' | 'low' = 'high';

    if (blockedPhrases.length > 0) {
      action = 'block';
      overallTruthScore = 'low';
    } else if (flaggedPhrases.length >= 2) {
      action = 'flag';
      overallTruthScore = 'medium';
    } else if (issues.length > 0) {
      action = 'flag';
      overallTruthScore = 'medium';
    }

    return {
      issues,
      overallTruthScore,
      action,
      blockedPhrases,
      flaggedPhrases
    };
  }
}
