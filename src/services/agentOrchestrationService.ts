// Agent Orchestration Service
// Main entry point for UI components to interact with the agent system

import { 
  AgentContext, 
  AgentOutput,
  WorkflowResult, 
  UserProfile, 
  JDAnalysis, 
  SectionPriority,
  MarketReality,
  TruthValidation,
  RewriteOutput,
  CostBudget,
  FREE_USER_BUDGET,
  PAID_USER_BUDGET,
  TargetMarket
} from '../agents/shared/types';
import { RealityAnalysis } from '../reality-matching-types';
import { OrchestratorAgent, createOrchestrator } from '../agents/orchestrator/OrchestratorAgent';
import { UserProfilerAgent } from '../agents/profiling/UserProfilerAgent';
import { JDIntelligenceAgent } from '../agents/jd/JDIntelligenceAgent';
import { SectionPriorityAgent } from '../agents/priority/SectionPriorityAgent';
import { ATSRealityMatcherAgent } from '../agents/ats/ATSRealityMatcherAgent';
import { ResumeParserAgent } from '../agents/parsing/ResumeParserAgent';
import { RewriteEngineFree } from '../agents/rewrite/RewriteEngineFree';
import { RewriteEnginePaid } from '../agents/rewrite/RewriteEnginePaid';
import { TruthValidatorAgent } from '../agents/validation/TruthValidatorAgent';
import { MarketRealityAgent } from '../agents/market/MarketRealityAgent';
import { EducationAgent } from '../agents/education/EducationAgent';

// Session storage for caching
const sessionCache = new Map<string, { data: unknown; expires: number }>();

/**
 * Create agent context with session tracking
 */
function createContext(
  sessionId: string,
  isPaidUser: boolean,
  options: Partial<AgentContext> = {}
): AgentContext {
  const budget = isPaidUser ? { ...PAID_USER_BUDGET } : { ...FREE_USER_BUDGET };
  
  return {
    sessionId,
    isPaidUser,
    targetMarket: options.targetMarket || 'india',
    jdProvided: options.jdProvided || false,
    costBudget: budget,
    ...options
  };
}

/**
 * Get or create orchestrator with all agents registered
 */
function getOrchestrator(isPaidUser: boolean): OrchestratorAgent {
  const orchestrator = createOrchestrator(isPaidUser);
  
  // Register all agents
  orchestrator.registerAgent(new UserProfilerAgent());
  orchestrator.registerAgent(new JDIntelligenceAgent());
  orchestrator.registerAgent(new SectionPriorityAgent());
  orchestrator.registerAgent(new ATSRealityMatcherAgent());
  orchestrator.registerAgent(new ResumeParserAgent());
  orchestrator.registerAgent(new RewriteEngineFree());
  orchestrator.registerAgent(new RewriteEnginePaid());
  orchestrator.registerAgent(new TruthValidatorAgent());
  orchestrator.registerAgent(new MarketRealityAgent());
  orchestrator.registerAgent(new EducationAgent());
  
  return orchestrator;
}

/**
 * Cache helper
 */
function getCached<T>(key: string): T | null {
  const cached = sessionCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }
  sessionCache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number = 3600000): void {
  sessionCache.set(key, { data, expires: Date.now() + ttlMs });
}

// ============== PUBLIC API ==============

/**
 * Parse resume text and return structured data
 */
export async function parseResume(
  resumeText: string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{ success: boolean; data: Record<string, unknown>; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const context = createContext(sessionId, options.isPaidUser || false);
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const parser = orchestrator.getAgent('resume_parser');
  
  if (!parser) {
    return { success: false, data: {}, error: 'Parser agent not available' };
  }
  
  const result = await parser.execute({
    type: 'resume_parser',
    data: { resumeText },
    context
  });
  
  return {
    success: result.success,
    data: result.data as Record<string, unknown>,
    error: result.error
  };
}

/**
 * Classify user profile from parsed resume
 */
export async function classifyUserProfile(
  parsedResume: Record<string, unknown>,
  targetRole: string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
    targetMarket?: TargetMarket;
  } = {}
): Promise<{ success: boolean; profile: UserProfile | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const cacheKey = `profile-${sessionId}`;
  
  // Check cache
  const cached = getCached<UserProfile>(cacheKey);
  if (cached) {
    return { success: true, profile: cached };
  }
  
  const context = createContext(sessionId, options.isPaidUser || false, {
    targetMarket: options.targetMarket
  });
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const profiler = orchestrator.getAgent('user_profiler');
  
  if (!profiler) {
    return { success: false, profile: null, error: 'Profiler agent not available' };
  }
  
  const result = await profiler.execute({
    type: 'user_profiler',
    data: { parsedResume, targetRole },
    context
  });
  
  if (result.success && result.data) {
    const profile = result.data as UserProfile;
    setCache(cacheKey, profile, 3600000); // 1 hour
    return { success: true, profile };
  }
  
  return { success: false, profile: null, error: result.error };
}

/**
 * Analyze job description or generate market-realistic JD
 */
export async function analyzeJD(
  jdText: string | null,
  targetRole: string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
    userProfile?: UserProfile;
  } = {}
): Promise<{ success: boolean; analysis: JDAnalysis | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const context = createContext(sessionId, options.isPaidUser || false, {
    jdProvided: !!jdText,
    userProfile: options.userProfile
  });
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const jdAgent = orchestrator.getAgent('jd_intelligence');
  
  if (!jdAgent) {
    return { success: false, analysis: null, error: 'JD agent not available' };
  }
  
  const result = await jdAgent.execute({
    type: 'jd_intelligence',
    data: { jdText: jdText || '', targetRole, userProfile: options.userProfile },
    context
  });
  
  if (result.success && result.data) {
    return { success: true, analysis: result.data as JDAnalysis };
  }
  
  return { success: false, analysis: null, error: result.error };
}

/**
 * Get reality analysis (replaces fake ATS scores)
 */
export async function getRealityAnalysis(
  parsedResume: Record<string, unknown>,
  jdAnalysis: JDAnalysis | null,
  targetRole: string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{ success: boolean; analysis: RealityAnalysis | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const context = createContext(sessionId, options.isPaidUser || false, {
    jdProvided: !!jdAnalysis
  });
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const atsAgent = orchestrator.getAgent('ats_reality_matcher');
  
  if (!atsAgent) {
    return { success: false, analysis: null, error: 'ATS agent not available' };
  }
  
  const result = await atsAgent.execute({
    type: 'ats_reality_matcher',
    data: { parsedResume, jdAnalysis, targetRole },
    context
  });
  
  if (result.success && result.data) {
    return { success: true, analysis: result.data as RealityAnalysis };
  }
  
  return { success: false, analysis: null, error: result.error };
}

/**
 * Get section priority based on user type
 */
export async function getSectionPriority(
  userProfile: UserProfile,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{ success: boolean; priority: SectionPriority | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const context = createContext(sessionId, options.isPaidUser || false);
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const priorityAgent = orchestrator.getAgent('section_priority');
  
  if (!priorityAgent) {
    return { success: false, priority: null, error: 'Priority agent not available' };
  }
  
  const result = await priorityAgent.execute({
    type: 'section_priority',
    data: { userProfile },
    context
  });
  
  if (result.success && result.data) {
    return { success: true, priority: result.data as SectionPriority };
  }
  
  return { success: false, priority: null, error: result.error };
}

/**
 * Get market reality for target role
 */
export async function getMarketReality(
  targetRole: string,
  userProfile: UserProfile | null,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{ success: boolean; market: MarketReality | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const cacheKey = `market-${targetRole.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Check cache (market data valid for 24 hours)
  const cached = getCached<MarketReality>(cacheKey);
  if (cached) {
    return { success: true, market: cached };
  }
  
  const context = createContext(sessionId, options.isPaidUser || false);
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const marketAgent = orchestrator.getAgent('market_reality');
  
  if (!marketAgent) {
    return { success: false, market: null, error: 'Market agent not available' };
  }
  
  const result = await marketAgent.execute({
    type: 'market_reality',
    data: { targetRole, userProfile },
    context
  });
  
  if (result.success && result.data) {
    const market = result.data as MarketReality;
    setCache(cacheKey, market, 86400000); // 24 hours
    return { success: true, market };
  }
  
  return { success: false, market: null, error: result.error };
}

/**
 * Rewrite text (free or paid based on user status)
 */
export async function rewriteText(
  text: string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
    context?: 'bullet' | 'summary' | 'project';
    jdKeywords?: string[];
    targetRole?: string;
    role?: string;
  } = {}
): Promise<{ success: boolean; result: RewriteOutput | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const agentContext = createContext(sessionId, options.isPaidUser || false);
  
  const orchestrator = getOrchestrator(agentContext.isPaidUser);
  const agentType = options.isPaidUser ? 'rewrite_paid' : 'rewrite_free';
  const rewriteAgent = orchestrator.getAgent(agentType);
  
  if (!rewriteAgent) {
    return { success: false, result: null, error: 'Rewrite agent not available' };
  }
  
  const result = await rewriteAgent.execute({
    type: agentType,
    data: {
      text,
      context: options.context || 'bullet',
      jdKeywords: options.jdKeywords || [],
      targetRole: options.targetRole || '',
      role: options.role || ''
    },
    context: agentContext
  });
  
  if (result.success && result.data) {
    return { success: true, result: result.data as RewriteOutput };
  }
  
  return { success: false, result: null, error: result.error };
}

/**
 * Validate truth of resume content
 */
export async function validateTruth(
  content: Record<string, unknown> | string,
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{ success: boolean; validation: TruthValidation | null; error?: string }> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const context = createContext(sessionId, options.isPaidUser || false);
  
  const orchestrator = getOrchestrator(context.isPaidUser);
  const validatorAgent = orchestrator.getAgent('truth_validator');
  
  if (!validatorAgent) {
    return { success: false, validation: null, error: 'Validator agent not available' };
  }
  
  const data = typeof content === 'string' 
    ? { text: content }
    : { parsedResume: content };
  
  const result = await validatorAgent.execute({
    type: 'truth_validator',
    data,
    context
  });
  
  if (result.success && result.data) {
    return { success: true, validation: result.data as TruthValidation };
  }
  
  return { success: false, validation: null, error: result.error };
}

/**
 * Get education content for a step
 */
export async function getEducationContent(
  stepId: string | string[],
  userContext?: { userType?: string }
): Promise<Record<string, unknown>> {
  const agent = new EducationAgent();
  
  const result = await agent.execute({
    type: 'education',
    data: {
      stepId: typeof stepId === 'string' ? stepId : undefined,
      stepIds: Array.isArray(stepId) ? stepId : undefined,
      context: userContext
    },
    context: createContext('edu-session', false)
  });
  
  return result.data;
}

/**
 * Run full analysis workflow
 */
export async function runFullAnalysis(
  resumeText: string,
  targetRole: string,
  jdText: string | null,
  targetMarket: TargetMarket = 'india',
  options: {
    sessionId?: string;
    isPaidUser?: boolean;
  } = {}
): Promise<{
  success: boolean;
  parsedResume: Record<string, unknown> | null;
  userProfile: UserProfile | null;
  jdAnalysis: JDAnalysis | null;
  realityAnalysis: RealityAnalysis | null;
  sectionPriority: SectionPriority | null;
  marketReality: MarketReality | null;
  errors: string[];
}> {
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const errors: string[] = [];
  
  // Step 1: Parse resume
  const parseResult = await parseResume(resumeText, { sessionId, isPaidUser: options.isPaidUser });
  if (!parseResult.success) {
    errors.push(`Parse failed: ${parseResult.error}`);
    return {
      success: false,
      parsedResume: null,
      userProfile: null,
      jdAnalysis: null,
      realityAnalysis: null,
      sectionPriority: null,
      marketReality: null,
      errors
    };
  }
  const parsedResume = parseResult.data;
  
  // Step 2: Classify user profile
  const profileResult = await classifyUserProfile(parsedResume, targetRole, {
    sessionId,
    isPaidUser: options.isPaidUser,
    targetMarket
  });
  const userProfile = profileResult.profile;
  if (!userProfile) {
    errors.push(`Profile classification failed: ${profileResult.error}`);
  }
  
  // Step 3: Analyze JD (or generate one)
  const jdResult = await analyzeJD(jdText, targetRole, {
    sessionId,
    isPaidUser: options.isPaidUser,
    userProfile: userProfile || undefined
  });
  const jdAnalysis = jdResult.analysis;
  if (!jdAnalysis) {
    errors.push(`JD analysis failed: ${jdResult.error}`);
  }
  
  // Step 4: Get reality analysis
  const realityResult = await getRealityAnalysis(parsedResume, jdAnalysis, targetRole, {
    sessionId,
    isPaidUser: options.isPaidUser
  });
  const realityAnalysis = realityResult.analysis;
  if (!realityAnalysis) {
    errors.push(`Reality analysis failed: ${realityResult.error}`);
  }
  
  // Step 5: Get section priority
  let sectionPriority: SectionPriority | null = null;
  if (userProfile) {
    const priorityResult = await getSectionPriority(userProfile, {
      sessionId,
      isPaidUser: options.isPaidUser
    });
    sectionPriority = priorityResult.priority;
  }
  
  // Step 6: Get market reality
  const marketResult = await getMarketReality(targetRole, userProfile, {
    sessionId,
    isPaidUser: options.isPaidUser
  });
  const marketReality = marketResult.market;
  
  return {
    success: errors.length === 0,
    parsedResume,
    userProfile,
    jdAnalysis,
    realityAnalysis,
    sectionPriority,
    marketReality,
    errors
  };
}

// Export types for consumers
export type {
  UserProfile,
  JDAnalysis,
  SectionPriority,
  MarketReality,
  TruthValidation,
  RewriteOutput,
  RealityAnalysis
};
