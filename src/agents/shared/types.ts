// Agent System Type Definitions
// Multi-agent architecture for Hiring Reality System

// ============== LLM PROVIDERS ==============
export type LLMProvider = 'groq' | 'gemini' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export const LLM_CONFIGS: Record<LLMProvider, LLMConfig> = {
  groq: {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 4096,
    temperature: 0.3
  },
  gemini: {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    maxTokens: 4096,
    temperature: 0.3
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0.3
  }
};

// ============== WORKFLOW TYPES ==============
export type WorkflowType =
  | 'full_processing'      // Complete resume analysis pipeline
  | 'jd_analysis'          // JD extraction or generation
  | 'ats_comparison'       // Reality panel analysis
  | 'rewrite_free'         // Grammar-only rewrite
  | 'rewrite_paid'         // Full AI rewrite
  | 'validation'           // Truth validation
  | 'profile_classification'; // User type detection

// ============== AGENT TYPES ==============
export type AgentType =
  | 'orchestrator'
  | 'user_profiler'
  | 'market_reality'
  | 'jd_intelligence'
  | 'resume_parser'
  | 'ats_reality_matcher'
  | 'section_priority'
  | 'rewrite_free'
  | 'rewrite_paid'
  | 'truth_validator'
  | 'education';

// ============== USER CLASSIFICATION ==============
export type UserType = 'fresher' | '1-3yrs' | '3-5yrs' | 'switcher';

export type ExperienceLevel = 'fresher' | '1-3' | '3-5' | '5-8' | '8+';

export type TargetMarket = 'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote';

export interface UserProfile {
  userType: UserType;
  experienceYears: number;
  currentRole?: string;
  targetRole: string;
  targetMarket: TargetMarket;
  confidence: number; // 0-1
  signals: string[];
  marketChallenges: string[];
  strengths: string[];
  isSwitcher: boolean;
  switcherContext?: {
    fromDomain: string;
    toDomain: string;
    transferableSkills: string[];
  };
}

// ============== JD ANALYSIS ==============
export type JDMode = 'extracted' | 'generated';

export interface JDRequirements {
  mustHave: string[];
  preferred: string[];
  experience: string; // "2-4 years"
  education: string[];
}

export interface JDAnalysis {
  mode: JDMode;
  rawJD?: string;
  requirements: JDRequirements;
  atsKeywords: string[];
  technicalSkills: string[];
  softSkills: string[];
  redFlags: string[];
  fresherChance: 'high' | 'low' | 'none';
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead';
  culturalSignals: string[];
}

// ============== MARKET REALITY ==============
export interface MarketReality {
  roleTitle: string;
  demandLevel: 'high' | 'medium' | 'low';
  saturation: 'oversaturated' | 'balanced' | 'undersupplied';
  typicalRequirements: {
    yearsExperience: string;
    education: string[];
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
  };
  fresherReality: {
    isHiring: boolean;
    competitionLevel: 'brutal' | 'high' | 'medium' | 'low';
    alternativeTitles: string[];
    expectedSalary: string;
  };
  switcherChallenges: string[];
  honestAdvice: string;
  realisticRoles: string[]; // Roles user is actually qualified for
}

// ============== SECTION PRIORITY ==============
export interface SectionPriority {
  userType: UserType;
  scanOrder: string[]; // ["Summary", "Skills", "Experience", "Education", "Projects"]
  reasoning: string;
  locked: boolean; // Free users cannot change order
}

export const SECTION_ORDER_BY_TYPE: Record<UserType, string[]> = {
  'fresher': ['Education', 'Projects', 'Skills', 'Experience', 'Achievements'],
  '1-3yrs': ['Skills', 'Experience', 'Projects', 'Education', 'Achievements'],
  '3-5yrs': ['Experience', 'Skills', 'Projects', 'Education', 'Achievements'],
  'switcher': ['Summary', 'Transferable Skills', 'Experience', 'Education', 'Projects']
};

// ============== TRUTH VALIDATION ==============
export type TruthAction = 'approve' | 'flag' | 'block';

export interface TruthIssue {
  text: string;
  reason: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TruthValidation {
  issues: TruthIssue[];
  overallTruthScore: 'high' | 'medium' | 'low';
  action: TruthAction;
  blockedPhrases: string[];
  flaggedPhrases: string[];
}

// ============== REWRITE TYPES ==============
export interface RewriteInput {
  original: string;
  context: 'bullet' | 'summary' | 'project';
  jdKeywords?: string[];
  targetRole?: string;
}

export interface RewriteOutput {
  rewritten: string;
  changes: string[];
  keywordsAdded: string[];
  metricsAdded: boolean;
  truthCheck: 'passed' | 'flagged';
}

// ============== AGENT INPUT/OUTPUT ==============
export interface AgentInput {
  type: AgentType;
  data: Record<string, unknown>;
  context: AgentContext;
}

export interface AgentContext {
  sessionId: string;
  isPaidUser: boolean;
  targetRole?: string;
  targetMarket: TargetMarket;
  jdProvided: boolean;
  userProfile?: UserProfile;
  jdAnalysis?: JDAnalysis;
  costBudget: CostBudget;
}

export interface AgentOutput {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
  tokensUsed: number;
  provider: LLMProvider;
  durationMs: number;
}

// ============== COST MANAGEMENT ==============
export interface CostBudget {
  maxGroqCalls: number;
  maxGeminiCalls: number;
  maxOpenAICalls: number;
  usedGroqCalls: number;
  usedGeminiCalls: number;
  usedOpenAICalls: number;
}

export const FREE_USER_BUDGET: CostBudget = {
  maxGroqCalls: 20,
  maxGeminiCalls: 10,
  maxOpenAICalls: 0,
  usedGroqCalls: 0,
  usedGeminiCalls: 0,
  usedOpenAICalls: 0
};

export const PAID_USER_BUDGET: CostBudget = {
  maxGroqCalls: 50,
  maxGeminiCalls: 20,
  maxOpenAICalls: 30,
  usedGroqCalls: 0,
  usedGeminiCalls: 0,
  usedOpenAICalls: 0
};

// ============== WORKFLOW ORCHESTRATION ==============
export interface WorkflowStep {
  agent: AgentType;
  requiredInputs: string[];
  outputKey: string;
  llmProvider: LLMProvider;
  optional?: boolean;
}

export interface WorkflowDefinition {
  type: WorkflowType;
  steps: WorkflowStep[];
  description: string;
}

export interface WorkflowResult {
  success: boolean;
  outputs: Record<string, unknown>;
  errors: string[];
  totalTokens: number;
  totalDurationMs: number;
  stepsCompleted: string[];
}

// ============== EDUCATION CONTENT ==============
export interface EducationContent {
  stepId: string;
  whyAsked: string;
  recruiterBehavior: string;
  impact: string;
  tip: string;
}

// ============== CACHE KEYS ==============
export const CACHE_KEYS = {
  userProfile: (sessionId: string) => `profile:${sessionId}`,
  jdAnalysis: (jdHash: string) => `jd:${jdHash}`,
  marketData: (role: string) => `market:${role.toLowerCase().replace(/\s+/g, '-')}`,
  realityAnalysis: (sessionId: string) => `reality:${sessionId}`
};

export const CACHE_TTL = {
  userProfile: 3600,    // 1 hour
  jdAnalysis: 7200,     // 2 hours
  marketData: 86400,    // 24 hours
  realityAnalysis: 1800 // 30 minutes
};
