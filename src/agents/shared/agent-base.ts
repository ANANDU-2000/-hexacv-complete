// Base Agent Class
// Abstract class that all specialized agents extend

import {
  AgentType,
  AgentInput,
  AgentOutput,
  AgentContext,
  LLMProvider,
  CostBudget
} from './types';

export abstract class BaseAgent {
  protected agentType: AgentType;
  protected systemPrompt: string;
  protected defaultProvider: LLMProvider;

  constructor(agentType: AgentType, systemPrompt: string, defaultProvider: LLMProvider = 'groq') {
    this.agentType = agentType;
    this.systemPrompt = systemPrompt;
    this.defaultProvider = defaultProvider;
  }

  /**
   * Main execution method - must be implemented by each agent
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * Get the agent type
   */
  getAgentType(): AgentType {
    return this.agentType;
  }

  /**
   * Get the system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Get the default LLM provider
   */
  getDefaultProvider(): LLMProvider {
    return this.defaultProvider;
  }

  /**
   * Check if we have budget for a call to the specified provider
   */
  protected checkBudget(budget: CostBudget, provider: LLMProvider): boolean {
    switch (provider) {
      case 'groq':
        return budget.usedGroqCalls < budget.maxGroqCalls;
      case 'gemini':
        return budget.usedGeminiCalls < budget.maxGeminiCalls;
      case 'openai':
        return budget.usedOpenAICalls < budget.maxOpenAICalls;
      default:
        return false;
    }
  }

  /**
   * Increment the usage counter for a provider
   */
  protected incrementUsage(budget: CostBudget, provider: LLMProvider): void {
    switch (provider) {
      case 'groq':
        budget.usedGroqCalls++;
        break;
      case 'gemini':
        budget.usedGeminiCalls++;
        break;
      case 'openai':
        budget.usedOpenAICalls++;
        break;
    }
  }

  /**
   * Select the best available provider based on budget and task
   */
  protected selectProvider(context: AgentContext, preferred: LLMProvider): LLMProvider {
    const { costBudget, isPaidUser } = context;

    // If preferred provider has budget, use it
    if (this.checkBudget(costBudget, preferred)) {
      return preferred;
    }

    // Fallback chain: Groq -> Gemini -> OpenAI (if paid)
    const fallbackOrder: LLMProvider[] = isPaidUser 
      ? ['groq', 'gemini', 'openai']
      : ['groq', 'gemini'];

    for (const provider of fallbackOrder) {
      if (this.checkBudget(costBudget, provider)) {
        return provider;
      }
    }

    // No budget available
    throw new Error('LLM budget exhausted. No providers available.');
  }

  /**
   * Create a standardized error output
   */
  protected createErrorOutput(error: string, durationMs: number = 0): AgentOutput {
    return {
      success: false,
      data: {},
      error,
      tokensUsed: 0,
      provider: this.defaultProvider,
      durationMs
    };
  }

  /**
   * Create a standardized success output
   */
  protected createSuccessOutput(
    data: Record<string, unknown>,
    tokensUsed: number,
    provider: LLMProvider,
    durationMs: number
  ): AgentOutput {
    return {
      success: true,
      data,
      tokensUsed,
      provider,
      durationMs
    };
  }

  /**
   * Log agent activity (for debugging)
   */
  protected log(message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.agentType}] ${message}`, data || '');
  }

  /**
   * Validate required input fields
   */
  protected validateInput(input: AgentInput, requiredFields: string[]): string[] {
    const missing: string[] = [];
    for (const field of requiredFields) {
      if (!(field in input.data) || input.data[field] === undefined || input.data[field] === null) {
        missing.push(field);
      }
    }
    return missing;
  }

  /**
   * Parse JSON response from LLM safely
   */
  protected parseJsonResponse<T>(response: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim()) as T;
      }
      // Try direct parse
      return JSON.parse(response) as T;
    } catch (e) {
      this.log('Failed to parse JSON response', { response: response.substring(0, 200), error: e });
      return null;
    }
  }

  /**
   * Measure execution time
   */
  protected async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
    const start = Date.now();
    const result = await fn();
    const durationMs = Date.now() - start;
    return { result, durationMs };
  }
}

/**
 * Rule-based agent that doesn't use LLM
 * For deterministic operations like section priority
 */
export abstract class RuleBasedAgent extends BaseAgent {
  constructor(agentType: AgentType) {
    super(agentType, '', 'groq'); // No system prompt needed
  }

  /**
   * Rule-based agents don't need budget checks
   */
  protected checkBudget(): boolean {
    return true;
  }

  /**
   * Rule-based agents don't increment usage
   */
  protected incrementUsage(): void {
    // No-op
  }
}
