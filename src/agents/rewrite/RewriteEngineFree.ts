// Rewrite Engine (Free) - Grammar fixes ONLY
// Uses Groq for cost-effective grammar correction

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, RewriteOutput } from '../shared/types';
import { createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const REWRITE_FREE_SYSTEM_PROMPT = `You are a grammar and clarity fixer ONLY.

Your job:
- Fix grammar, spelling, and punctuation
- Fix capitalization (proper nouns, sentence starts)
- Fix tech name formatting (node → Node.js, react → React, aws → AWS)
- Standardize date formats

STRICT RULES - DO NOT:
- Change the meaning or content
- Add metrics or numbers
- Add tools or technologies not mentioned
- Make it "more impressive"
- Add buzzwords
- Rewrite the bullet entirely

If the bullet is already grammatically correct → return UNCHANGED.

Output JSON:
{
  "rewritten": "The corrected text",
  "changes": ["Fixed capitalization of React", "Added period at end"],
  "unchanged": true/false
}`;

export class RewriteEngineFree extends BaseAgent {
  constructor() {
    super('rewrite_free', REWRITE_FREE_SYSTEM_PROMPT, 'groq');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const text = input.data.text as string || input.data.bullet as string || '';
    const context = input.data.context as string || 'bullet';

    if (!text || text.length < 5) {
      return this.createErrorOutput('No text provided for rewrite');
    }

    // First, try rule-based fixes (faster, no API call needed)
    const ruleBased = this.applyRuleBasedFixes(text);
    
    // If rule-based made significant changes or text is short, use that
    if (ruleBased.changes.length > 0 || text.length < 50) {
      return this.createSuccessOutput(
        {
          original: text,
          rewritten: ruleBased.text,
          changes: ruleBased.changes,
          keywordsAdded: [],
          metricsAdded: false,
          truthCheck: 'passed'
        } as RewriteOutput,
        0,
        'groq',
        Date.now() - start
      );
    }

    // For longer or more complex text, use LLM
    const prompt = `Fix grammar and formatting only. Do NOT change meaning or add content.

ORIGINAL TEXT (${context}):
"${text}"

Return JSON with corrected text and list of changes made.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'groq',
        isPaid: false,
        maxTokens: 500,
        temperature: 0.1
      });

      const parsed = parseJsonFromLLM<{ rewritten: string; changes: string[]; unchanged?: boolean }>(response.content);

      if (!parsed || !parsed.rewritten) {
        // Fallback to rule-based
        return this.createSuccessOutput(
          {
            original: text,
            rewritten: ruleBased.text,
            changes: ruleBased.changes,
            keywordsAdded: [],
            metricsAdded: false,
            truthCheck: 'passed'
          } as RewriteOutput,
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      return this.createSuccessOutput(
        {
          original: text,
          rewritten: parsed.unchanged ? text : parsed.rewritten,
          changes: parsed.changes || [],
          keywordsAdded: [],
          metricsAdded: false,
          truthCheck: 'passed'
        } as RewriteOutput,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      // Fallback to rule-based on error
      return this.createSuccessOutput(
        {
          original: text,
          rewritten: ruleBased.text,
          changes: ruleBased.changes,
          keywordsAdded: [],
          metricsAdded: false,
          truthCheck: 'passed'
        } as RewriteOutput,
        0,
        'groq',
        Date.now() - start
      );
    }
  }

  /**
   * Apply rule-based grammar and formatting fixes
   */
  private applyRuleBasedFixes(text: string): { text: string; changes: string[] } {
    let result = text;
    const changes: string[] = [];

    // Fix tech name capitalization
    const techFixes: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'node.js': 'Node.js',
      'nodejs': 'Node.js',
      'react': 'React',
      'reactjs': 'React',
      'angular': 'Angular',
      'vue': 'Vue',
      'vuejs': 'Vue.js',
      'python': 'Python',
      'java': 'Java',
      'aws': 'AWS',
      'gcp': 'GCP',
      'azure': 'Azure',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'redis': 'Redis',
      'graphql': 'GraphQL',
      'restful': 'RESTful',
      'rest api': 'REST API',
      'api': 'API',
      'apis': 'APIs',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
      'nosql': 'NoSQL',
      'git': 'Git',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'jenkins': 'Jenkins',
      'ci/cd': 'CI/CD',
      'devops': 'DevOps',
      'tensorflow': 'TensorFlow',
      'pytorch': 'PyTorch',
      'pandas': 'Pandas',
      'numpy': 'NumPy',
      'scikit-learn': 'scikit-learn',
      'kafka': 'Kafka',
      'rabbitmq': 'RabbitMQ',
      'elasticsearch': 'Elasticsearch',
      'linux': 'Linux',
      'macos': 'macOS',
      'ios': 'iOS',
      'android': 'Android'
    };

    for (const [wrong, correct] of Object.entries(techFixes)) {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      if (regex.test(result) && !result.includes(correct)) {
        result = result.replace(regex, correct);
        changes.push(`Fixed capitalization: ${wrong} → ${correct}`);
      }
    }

    // Capitalize first letter of sentence
    if (result[0] && result[0] !== result[0].toUpperCase()) {
      result = result[0].toUpperCase() + result.slice(1);
      changes.push('Capitalized first letter');
    }

    // Add period at end if missing
    if (result.length > 10 && !/[.!?]$/.test(result.trim())) {
      result = result.trim() + '.';
      changes.push('Added period at end');
    }

    // Fix double spaces
    if (/  +/.test(result)) {
      result = result.replace(/  +/g, ' ');
      changes.push('Removed double spaces');
    }

    // Fix common typos
    const typoFixes: Record<string, string> = {
      'teh': 'the',
      'recieve': 'receive',
      'occurence': 'occurrence',
      'seperate': 'separate',
      'definately': 'definitely',
      'occured': 'occurred',
      'succesful': 'successful',
      'neccessary': 'necessary'
    };

    for (const [typo, correct] of Object.entries(typoFixes)) {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      if (regex.test(result)) {
        result = result.replace(regex, correct);
        changes.push(`Fixed typo: ${typo} → ${correct}`);
      }
    }

    return { text: result, changes };
  }
}
