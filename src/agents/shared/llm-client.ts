// Unified LLM Client
// Single interface to call Gemini (primary) and Groq (fallback) - FREE TIER ONLY

import { LLMProvider, LLMConfig, LLM_CONFIGS, CostBudget } from './types';

// API Configuration - FREE PROVIDERS ONLY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Provider availability tracking
interface ProviderStatus {
  available: boolean;
  lastError: number;
  errorCount: number;
}

const providerStatus: Record<LLMProvider, ProviderStatus> = {
  gemini: { available: true, lastError: 0, errorCount: 0 },
  groq: { available: true, lastError: 0, errorCount: 0 }
};

const ERROR_COOLDOWN = 60000; // 1 minute cooldown after error
const MAX_RETRIES = 2;

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  provider: LLMProvider;
  model: string;
  durationMs: number;
}

/**
 * Check if a provider is currently available
 */
function isProviderAvailable(provider: LLMProvider): boolean {
  const status = providerStatus[provider];
  const now = Date.now();
  
  // Reset availability after cooldown
  if (!status.available && (now - status.lastError) >= ERROR_COOLDOWN) {
    status.available = true;
    status.errorCount = 0;
  }
  
  // Check if API key exists
  switch (provider) {
    case 'gemini':
      return status.available && !!GEMINI_API_KEY;
    case 'groq':
      return status.available && !!GROQ_API_KEY;
  }
}

/**
 * Mark a provider as temporarily unavailable
 */
function markProviderError(provider: LLMProvider): void {
  const status = providerStatus[provider];
  status.errorCount++;
  if (status.errorCount >= MAX_RETRIES) {
    status.available = false;
    status.lastError = Date.now();
  }
}

/**
 * Call Groq API (Llama 3.3 70B)
 */
async function callGroq(request: LLMRequest, config: LLMConfig): Promise<LLMResponse> {
  const start = Date.now();
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      messages: request.messages,
      temperature: request.temperature ?? config.temperature,
      max_tokens: request.maxTokens ?? config.maxTokens,
      response_format: request.jsonMode ? { type: 'json_object' } : undefined
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage?.total_tokens || 0;
  
  return {
    content,
    tokensUsed,
    provider: 'groq',
    model: config.model,
    durationMs: Date.now() - start
  };
}

/**
 * Call Gemini API
 */
async function callGemini(request: LLMRequest, config: LLMConfig): Promise<LLMResponse> {
  const start = Date.now();
  
  // Convert messages to Gemini format
  const systemInstruction = request.messages.find(m => m.role === 'system')?.content || '';
  const userMessages = request.messages.filter(m => m.role !== 'system');
  
  const contents = userMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        temperature: request.temperature ?? config.temperature,
        maxOutputTokens: request.maxTokens ?? config.maxTokens,
        responseMimeType: request.jsonMode ? 'application/json' : 'text/plain'
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
  
  return {
    content,
    tokensUsed,
    provider: 'gemini',
    model: config.model,
    durationMs: Date.now() - start
  };
}

/**
 * Call provider-specific API
 */
async function callProvider(provider: LLMProvider, request: LLMRequest): Promise<LLMResponse> {
  const config = LLM_CONFIGS[provider];
  
  switch (provider) {
    case 'gemini':
      return callGemini(request, config);
    case 'groq':
      return callGroq(request, config);
  }
}

/**
 * Unified LLM Client
 * Calls specified provider with automatic fallback
 * FREE TIER ONLY: Gemini (primary) -> Groq (fallback)
 */
export class LLMClient {
  private budget: CostBudget;

  constructor(budget: CostBudget) {
    this.budget = budget;
  }

  /**
   * Check if we have budget for the specified provider
   */
  hasBudget(provider: LLMProvider): boolean {
    switch (provider) {
      case 'gemini':
        return this.budget.usedGeminiCalls < this.budget.maxGeminiCalls;
      case 'groq':
        return this.budget.usedGroqCalls < this.budget.maxGroqCalls;
    }
  }

  /**
   * Increment usage counter
   */
  private incrementUsage(provider: LLMProvider): void {
    switch (provider) {
      case 'gemini':
        this.budget.usedGeminiCalls++;
        break;
      case 'groq':
        this.budget.usedGroqCalls++;
        break;
    }
  }

  /**
   * Get the best available provider from fallback chain
   * Priority: Gemini (60 req/min) -> Groq (30 req/min)
   */
  private getAvailableProvider(preferred: LLMProvider): LLMProvider | null {
    const fallbackChain: LLMProvider[] = ['gemini', 'groq'];

    // Try preferred first
    if (isProviderAvailable(preferred) && this.hasBudget(preferred)) {
      return preferred;
    }

    // Try fallbacks
    for (const provider of fallbackChain) {
      if (isProviderAvailable(provider) && this.hasBudget(provider)) {
        return provider;
      }
    }

    return null;
  }

  /**
   * Make an LLM request with automatic fallback
   */
  async call(
    request: LLMRequest,
    options: {
      preferred?: LLMProvider;
    } = {}
  ): Promise<LLMResponse> {
    const { preferred = 'gemini' } = options;

    const provider = this.getAvailableProvider(preferred);
    if (!provider) {
      throw new Error('Free AI limit reached. All providers are temporarily unavailable. Please try again in a few minutes.');
    }

    try {
      const response = await callProvider(provider, request);
      this.incrementUsage(provider);
      
      // Reset error count on success
      providerStatus[provider].errorCount = 0;
      
      return response;
    } catch (error) {
      console.error(`LLM call failed for ${provider}:`, error);
      markProviderError(provider);
      
      // Try fallback
      const fallback = this.getAvailableProvider(
        provider === 'gemini' ? 'groq' : 'gemini'
      );
      
      if (fallback && fallback !== provider) {
        console.log(`Falling back to ${fallback}...`);
        const response = await callProvider(fallback, request);
        this.incrementUsage(fallback);
        return response;
      }
      
      throw new Error('Free AI limit reached. Please try again later.');
    }
  }

  /**
   * Simple text completion (convenience method)
   */
  async complete(
    prompt: string,
    options: {
      systemPrompt?: string;
      preferred?: LLMProvider;
      maxTokens?: number;
      temperature?: number;
      jsonMode?: boolean;
    } = {}
  ): Promise<LLMResponse> {
    const messages: LLMMessage[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    return this.call(
      {
        messages,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        jsonMode: options.jsonMode
      },
      {
        preferred: options.preferred
      }
    );
  }

  /**
   * Get current budget status
   */
  getBudgetStatus(): CostBudget {
    return { ...this.budget };
  }

  /**
   * Get provider availability status
   */
  getProviderStatus(): Record<LLMProvider, boolean> {
    return {
      gemini: isProviderAvailable('gemini'),
      groq: isProviderAvailable('groq')
    };
  }
}

/**
 * Create a new LLM client with the given budget
 */
export function createLLMClient(budget: CostBudget): LLMClient {
  return new LLMClient(budget);
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJsonFromLLM<T>(response: string): T | null {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim()) as T;
    }
    
    // Try to find raw JSON object
    const rawMatch = response.match(/\{[\s\S]*\}/);
    if (rawMatch) {
      return JSON.parse(rawMatch[0]) as T;
    }
    
    // Try direct parse
    return JSON.parse(response) as T;
  } catch {
    return null;
  }
}
