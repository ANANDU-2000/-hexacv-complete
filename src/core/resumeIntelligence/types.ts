/**
 * Resume Intelligence — Types
 * Core data models for the market-aware resume analysis brain.
 */

// ===== Role Context (collected on homepage before anything else) =====

export type ExperienceLevel = 'fresher' | '1-3' | '3-5' | '5-8' | '8+';
export type TargetMarket = 'india' | 'us' | 'gulf' | 'global';

export interface RoleContext {
  roleTitle: string;
  experienceLevel: ExperienceLevel;
  market: TargetMarket;
  jdText: string;
  year: number; // e.g. 2026
}

// ===== Skill Classification =====

export type SkillStatus = 'verified' | 'partial' | 'unverified' | 'missing_for_jd';

export interface ClassifiedSkill {
  skill: string;
  status: SkillStatus;
  /** Where this skill appears in the resume */
  locations: SkillLocation[];
  /** Evidence sentences from resume */
  evidence: string[];
  /** If status is missing_for_jd, why it's expected */
  reason?: string;
}

export type SkillLocation =
  | 'skills_section'
  | `experience:${string}` // e.g. "experience:HexaCV"
  | `project:${string}`
  | 'summary'
  | 'education'
  | 'certifications';

// ===== Risk Flags =====

export type RiskType =
  | 'overclaim'        // claims beyond what resume proves
  | 'generic_bullet'   // vague, no specifics
  | 'role_mismatch'    // title vs actual experience
  | 'level_mismatch'   // seniority vs proof
  | 'missing_dates'    // no start/end dates
  | 'unsupported_skill'// skill listed, no evidence
  | 'fake_metric'      // invented numbers
  | 'buzzword_only';   // keyword without context

export interface RiskFlag {
  type: RiskType;
  section: string;      // e.g. "experience[0]", "skills", "summary"
  message: string;
  detail?: string;      // the offending text
}

// ===== Alerts (what UI renders) =====

export type AlertSeverity = 'red' | 'yellow' | 'green';

export interface AlertAction {
  label: string;
  actionId: string; // e.g. 'remove_skill', 'add_proof', 'accept_fix', 'edit_manually', 'skip'
  payload?: Record<string, unknown>;
}

export interface ResumeAlert {
  id: string;
  severity: AlertSeverity;
  section: string;         // which part of the resume
  title: string;
  message: string;
  /** Original text (if applicable) */
  originalText?: string;
  /** Suggested replacement (if applicable) */
  suggestedText?: string;
  /** Actions user can take */
  actions: AlertAction[];
}

// ===== Analysis Result =====

export interface AnalysisResult {
  /** All skills classified */
  classifiedSkills: ClassifiedSkill[];
  /** Risk flags detected */
  riskFlags: RiskFlag[];
  /** UI-ready alerts */
  alerts: ResumeAlert[];
  /** ATS keyword match info */
  atsMatch: {
    score: number;          // 0-100
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  /** Summary stats */
  stats: {
    totalSkills: number;
    verifiedSkills: number;
    unverifiedSkills: number;
    partialSkills: number;
    missingForJd: number;
    totalRisks: number;
    redAlerts: number;
    yellowAlerts: number;
  };
}

// ===== User Decision (stored per session) =====

export interface UserDecision {
  alertId: string;
  actionTaken: string; // matches AlertAction.actionId
  timestamp: number;
}
