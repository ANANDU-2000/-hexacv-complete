// Reality Matching Types
// Types for the Reality Dashboard that replaces fake ATS scores

export type PanelStatus = 'strong' | 'warning' | 'blocker';
export type ItemStatus = 'ok' | 'warning' | 'blocker';
export type ItemImpact = 'pass_filter' | 'hurts_shortlist' | 'blocks_interview';

/**
 * Single item within a reality panel
 */
export interface RealityItem {
  status: ItemStatus;
  label: string;
  explanation: string;
  impact: ItemImpact;
  fixSuggestion?: string;
}

/**
 * A single reality panel (one of 5)
 */
export interface RealityPanel {
  panelId: string;
  title: string;
  status: PanelStatus;
  items: RealityItem[];
  educationNote: string; // "Why this matters to recruiters"
}

/**
 * Overall assessment summary
 */
export interface OverallAssessment {
  likelyToPassATS: boolean;
  likelyToGetShortlisted: boolean;
  shortlistChance: 'high' | 'medium' | 'low';
  majorBlockers: string[];
  quickWins: string[];
  honestFeedback: string;
  realisticRoles: string[]; // Roles user is actually qualified for
}

/**
 * Complete reality analysis result
 */
export interface RealityAnalysis {
  panels: {
    roleAlignment: RealityPanel;
    skillCoverage: RealityPanel;
    contextQuality: RealityPanel;
    experienceWeight: RealityPanel;
    structureReadability: RealityPanel;
  };
  overallAssessment: OverallAssessment;
  timestamp: Date;
  analysisVersion: string;
}

/**
 * Input for reality analysis
 */
export interface RealityAnalysisInput {
  resume: {
    basics: {
      fullName?: string;
      targetRole?: string;
      email?: string;
      phone?: string;
      location?: string;
    };
    summary?: string;
    experience?: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      highlights: string[];
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field?: string;
      graduationDate?: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
    }>;
    skills?: string[];
  };
  jdAnalysis?: {
    atsKeywords: string[];
    technicalSkills: string[];
    softSkills: string[];
    requirements: {
      mustHave: string[];
      preferred: string[];
      experience: string;
    };
    seniorityLevel: string;
  };
  targetRole?: string;
}

/**
 * Fix recommendation
 */
export interface Fix {
  id: string;
  category: 'keywords' | 'metrics' | 'structure' | 'brevity' | 'section_order';
  priority: 'high' | 'medium' | 'low';
  before: string;
  after: string;
  reasoning: string;
  impact: string; // "Increases shortlist chance by ~15%"
}

/**
 * Complete fixes analysis
 */
export interface FixesAnalysis {
  fixes: Fix[];
  totalImpactEstimate: string;
  canAutoApply: boolean;
}

// Education notes for each panel
export const PANEL_EDUCATION_NOTES = {
  roleAlignment: "Recruiters spend 2-3 seconds checking if your title matches the role. A mismatch means instant rejection in most ATS systems.",
  skillCoverage: "ATS filters scan for exact keyword matches. If the JD says 'React.js' and you write 'React framework', you might be filtered out automatically.",
  contextQuality: "Hiring managers skip resumes that just list skills. They want to see skills USED in real work with measurable outcomes.",
  experienceWeight: "Recent, relevant experience gets 3x more attention than old roles. A 2-year-old project matters more than a 5-year-old job.",
  structureReadability: "Recruiters scan resumes for 6-8 seconds. Dense text, wrong section order, or poor formatting = instant skip."
};
