// Orchestrator Agent
// Master controller that routes tasks to specialized agents

import { BaseAgent } from '../shared/agent-base';
import {
  AgentType,
  AgentInput,
  AgentOutput,
  AgentContext,
  WorkflowType,
  WorkflowStep,
  WorkflowResult,
  LLMProvider,
  UserProfile,
  JDAnalysis,
  CostBudget,
  FREE_USER_BUDGET,
  PAID_USER_BUDGET
} from '../shared/types';
import { LLMClient, createLLMClient } from '../shared/llm-client';

// Workflow definitions
const WORKFLOWS: Record<WorkflowType, WorkflowStep[]> = {
  full_processing: [
    { agent: 'resume_parser', requiredInputs: ['resumeText'], outputKey: 'parsedResume', llmProvider: 'groq' },
    { agent: 'user_profiler', requiredInputs: ['parsedResume'], outputKey: 'userProfile', llmProvider: 'gemini' },
    { agent: 'jd_intelligence', requiredInputs: ['jdText', 'userProfile'], outputKey: 'jdAnalysis', llmProvider: 'gemini' },
    { agent: 'market_reality', requiredInputs: ['targetRole', 'userProfile'], outputKey: 'marketReality', llmProvider: 'gemini' },
    { agent: 'ats_reality_matcher', requiredInputs: ['parsedResume', 'jdAnalysis'], outputKey: 'realityAnalysis', llmProvider: 'groq' },
    { agent: 'section_priority', requiredInputs: ['userProfile'], outputKey: 'sectionPriority', llmProvider: 'groq' },
    { agent: 'truth_validator', requiredInputs: ['parsedResume'], outputKey: 'truthValidation', llmProvider: 'gemini', optional: true }
  ],
  jd_analysis: [
    { agent: 'jd_intelligence', requiredInputs: ['jdText'], outputKey: 'jdAnalysis', llmProvider: 'gemini' }
  ],
  ats_comparison: [
    { agent: 'ats_reality_matcher', requiredInputs: ['parsedResume', 'jdAnalysis'], outputKey: 'realityAnalysis', llmProvider: 'groq' }
  ],
  rewrite_free: [
    { agent: 'rewrite_free', requiredInputs: ['text', 'context'], outputKey: 'rewriteResult', llmProvider: 'groq' }
  ],
  rewrite_paid: [
    { agent: 'rewrite_paid', requiredInputs: ['text', 'context', 'jdKeywords'], outputKey: 'rewriteResult', llmProvider: 'openai' }
  ],
  validation: [
    { agent: 'truth_validator', requiredInputs: ['text'], outputKey: 'truthValidation', llmProvider: 'gemini' }
  ],
  profile_classification: [
    { agent: 'user_profiler', requiredInputs: ['parsedResume'], outputKey: 'userProfile', llmProvider: 'gemini' }
  ]
};

// Task routing rules - which LLM provider to use for each agent
const AGENT_PROVIDER_RULES: Record<AgentType, { default: LLMProvider; paid?: LLMProvider }> = {
  orchestrator: { default: 'groq' },
  user_profiler: { default: 'gemini' },
  market_reality: { default: 'gemini' },
  jd_intelligence: { default: 'gemini' },
  resume_parser: { default: 'groq' },
  ats_reality_matcher: { default: 'groq' },
  section_priority: { default: 'groq' }, // Rule-based, no LLM needed
  rewrite_free: { default: 'groq' },
  rewrite_paid: { default: 'openai', paid: 'openai' },
  truth_validator: { default: 'gemini' },
  education: { default: 'groq' } // Rule-based, no LLM needed
};

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Orchestrator for a hiring-reality resume system.
Your role is to analyze user requests and determine which specialized agents to invoke.

Available agents:
- user_profiler: Classifies user as Fresher/1-3yrs/3-5yrs/Switcher
- market_reality: Analyzes Indian job market for target role
- jd_intelligence: Extracts from JD or generates market-realistic JD
- resume_parser: VERBATIM extraction from resume text
- ats_reality_matcher: Honest reality panels (NO fake ATS scores)
- section_priority: Determines section order by user type
- rewrite_free: Grammar fixes only
- rewrite_paid: Full AI rewrite with JD alignment
- truth_validator: Detects exaggeration, blocks fake metrics
- education: Generates "why this matters" explanations

Rules:
1. Never predict ATS scores - we provide honest feedback panels
2. Route simple tasks to free models (Groq/Gemini)
3. Only route to OpenAI for paid users requesting quality rewrite
4. Block any request that might generate fake achievements
5. Ensure truth validation runs before any content is exported

Output your routing decision as JSON:
{
  "workflow": "workflow_type",
  "agents": ["agent1", "agent2"],
  "llmProvider": "groq|gemini|openai"
}`;

export class OrchestratorAgent extends BaseAgent {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private llmClient: LLMClient;
  private outputs: Record<string, unknown> = {};

  constructor(isPaidUser: boolean = false) {
    super('orchestrator', ORCHESTRATOR_SYSTEM_PROMPT, 'groq');
    const budget = isPaidUser ? { ...PAID_USER_BUDGET } : { ...FREE_USER_BUDGET };
    this.llmClient = createLLMClient(budget);
  }

  /**
   * Register a specialized agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getAgentType(), agent);
  }

  /**
   * Get a registered agent
   */
  getAgent(type: AgentType): BaseAgent | undefined {
    return this.agents.get(type);
  }

  /**
   * Execute a specific workflow
   */
  async executeWorkflow(
    workflowType: WorkflowType,
    inputs: Record<string, unknown>,
    context: AgentContext
  ): Promise<WorkflowResult> {
    const start = Date.now();
    const workflow = WORKFLOWS[workflowType];
    
    if (!workflow) {
      return {
        success: false,
        outputs: {},
        errors: [`Unknown workflow type: ${workflowType}`],
        totalTokens: 0,
        totalDurationMs: 0,
        stepsCompleted: []
      };
    }

    this.outputs = { ...inputs };
    const errors: string[] = [];
    const stepsCompleted: string[] = [];
    let totalTokens = 0;

    for (const step of workflow) {
      // Check if all required inputs are available
      const missingInputs = step.requiredInputs.filter(
        input => !(input in this.outputs) || this.outputs[input] === undefined
      );

      if (missingInputs.length > 0) {
        if (step.optional) {
          this.log(`Skipping optional step ${step.agent}: missing ${missingInputs.join(', ')}`);
          continue;
        }
        errors.push(`Step ${step.agent} missing inputs: ${missingInputs.join(', ')}`);
        continue;
      }

      // Get the agent
      const agent = this.agents.get(step.agent);
      if (!agent) {
        errors.push(`Agent not registered: ${step.agent}`);
        continue;
      }

      // Determine LLM provider
      const providerRules = AGENT_PROVIDER_RULES[step.agent];
      const provider = context.isPaidUser && providerRules.paid 
        ? providerRules.paid 
        : providerRules.default;

      // Execute the agent
      try {
        const agentInput: AgentInput = {
          type: step.agent,
          data: this.outputs,
          context: { ...context, costBudget: this.llmClient.getBudgetStatus() }
        };

        this.log(`Executing ${step.agent} with provider ${provider}`);
        const result = await agent.execute(agentInput);

        if (result.success) {
          this.outputs[step.outputKey] = result.data;
          totalTokens += result.tokensUsed;
          stepsCompleted.push(step.agent);
        } else {
          errors.push(`${step.agent}: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${step.agent} exception: ${errorMessage}`);
        if (!step.optional) {
          break;
        }
      }
    }

    return {
      success: errors.length === 0,
      outputs: this.outputs,
      errors,
      totalTokens,
      totalDurationMs: Date.now() - start,
      stepsCompleted
    };
  }

  /**
   * Execute a single agent
   */
  async executeAgent(
    agentType: AgentType,
    data: Record<string, unknown>,
    context: AgentContext
  ): Promise<AgentOutput> {
    const agent = this.agents.get(agentType);
    if (!agent) {
      return this.createErrorOutput(`Agent not registered: ${agentType}`);
    }

    const input: AgentInput = {
      type: agentType,
      data,
      context
    };

    return agent.execute(input);
  }

  /**
   * Route a request to appropriate workflow/agents
   */
  async route(
    request: {
      action: 'parse_resume' | 'analyze_jd' | 'compare_ats' | 'rewrite' | 'validate' | 'full_analysis';
      data: Record<string, unknown>;
    },
    context: AgentContext
  ): Promise<WorkflowResult> {
    let workflowType: WorkflowType;

    switch (request.action) {
      case 'parse_resume':
        // For parse, we do full processing to get all analysis
        workflowType = 'full_processing';
        break;
      case 'analyze_jd':
        workflowType = 'jd_analysis';
        break;
      case 'compare_ats':
        workflowType = 'ats_comparison';
        break;
      case 'rewrite':
        workflowType = context.isPaidUser ? 'rewrite_paid' : 'rewrite_free';
        break;
      case 'validate':
        workflowType = 'validation';
        break;
      case 'full_analysis':
      default:
        workflowType = 'full_processing';
    }

    return this.executeWorkflow(workflowType, request.data, context);
  }

  /**
   * Get LLM client for direct use by agents
   */
  getLLMClient(): LLMClient {
    return this.llmClient;
  }

  /**
   * Get current budget status
   */
  getBudgetStatus(): CostBudget {
    return this.llmClient.getBudgetStatus();
  }

  /**
   * Main execute method (required by BaseAgent)
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    // Orchestrator's execute routes to appropriate workflow
    const action = input.data.action as string || 'full_analysis';
    const result = await this.route(
      { action: action as any, data: input.data },
      input.context
    );

    return {
      success: result.success,
      data: result.outputs,
      error: result.errors.join('; '),
      tokensUsed: result.totalTokens,
      provider: 'groq',
      durationMs: Date.now() - start
    };
  }
}

/**
 * Create a pre-configured orchestrator with all agents registered
 */
export function createOrchestrator(isPaidUser: boolean = false): OrchestratorAgent {
  const orchestrator = new OrchestratorAgent(isPaidUser);
  
  // Agents will be registered when they are created
  // This allows lazy loading of agents
  
  return orchestrator;
}
