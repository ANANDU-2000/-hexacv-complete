/**
 * Resume Analysis Engine (Rule-Based)
 * No LLM — pure rules. LLM agents layer on top later.
 *
 * Takes resume + role context → returns classified skills, risk flags, and UI alerts.
 */

import type { ResumeData } from '../types';
import { extractKeywordsFromJD } from '../ats/extractKeywords';
import { extractSkillEvidence } from './skillEvidence';
import type {
  RoleContext,
  ClassifiedSkill,
  SkillStatus,
  RiskFlag,
  ResumeAlert,
  AnalysisResult,
} from './types';

// ===== ADVANCED SKILL KEYWORDS BY SENIORITY =====
// Skills that need proof if claimed at certain levels

const ADVANCED_SKILLS = new Set([
  'kubernetes', 'k8s', 'mlops', 'distributed systems', 'system design',
  'microservices', 'terraform', 'ci/cd', 'devops', 'kafka',
  'redis', 'elasticsearch', 'graphql', 'grpc',
]);

const SENIOR_ONLY_PHRASES = [
  'led team', 'managed team', 'architected', 'enterprise',
  'production scale', 'scaled to', 'million users',
  'revenue', 'p&l', 'budget', 'head of', 'director',
];

const BUZZWORD_PHRASES = [
  'passionate about', 'result-oriented', 'self-motivated',
  'team player', 'hard worker', 'detail-oriented',
  'go-getter', 'synergy', 'leverage', 'paradigm',
];

const VAGUE_VERBS = [
  'helped', 'assisted', 'worked on', 'involved in',
  'responsible for', 'participated in', 'contributed to',
];

// ===== SKILL CLASSIFICATION =====

function classifySkills(
  data: ResumeData,
  roleContext: RoleContext,
  jdKeywords: string[]
): ClassifiedSkill[] {
  const evidenceMap = extractSkillEvidence(data);
  const results: ClassifiedSkill[] = [];

  for (const ev of evidenceMap) {
    let status: SkillStatus;

    if (ev.locations.length > 1 && ev.sentences.length > 0) {
      // Skill appears in skills section AND in experience/projects with evidence
      status = 'verified';
    } else if (ev.locations.length > 1) {
      // Appears in multiple places but no strong evidence sentence
      status = 'partial';
    } else {
      // Only in skills section, nowhere else
      status = 'unverified';
    }

    // Check if it's an advanced skill claimed by a fresher
    const isAdvanced = ADVANCED_SKILLS.has(ev.skill.toLowerCase().trim());
    const isFresher = roleContext.experienceLevel === 'fresher' || roleContext.experienceLevel === '1-3';
    if (isAdvanced && isFresher && status !== 'verified') {
      status = 'unverified'; // Force unverified for advanced skills without proof at junior level
    }

    results.push({
      skill: ev.skill,
      status,
      locations: ev.locations,
      evidence: ev.sentences,
    });
  }

  // Add missing-for-JD skills (in JD but not in resume at all)
  const resumeSkillsLower = new Set(
    (data.skills || []).map((s) => s.toLowerCase().trim())
  );
  for (const kw of jdKeywords) {
    if (!resumeSkillsLower.has(kw.toLowerCase().trim())) {
      // Check if any existing skill partially matches
      const partial = [...resumeSkillsLower].some(
        (s) => s.includes(kw.toLowerCase()) || kw.toLowerCase().includes(s)
      );
      if (!partial) {
        results.push({
          skill: kw,
          status: 'missing_for_jd',
          locations: [],
          evidence: [],
          reason: `Required by job description but not found in your resume.`,
        });
      }
    }
  }

  return results;
}

// ===== RISK DETECTION =====

function detectRisks(data: ResumeData, roleContext: RoleContext): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const isFresher = roleContext.experienceLevel === 'fresher' || roleContext.experienceLevel === '1-3';

  // Check summary for buzzwords
  if (data.summary) {
    for (const buzz of BUZZWORD_PHRASES) {
      if (data.summary.toLowerCase().includes(buzz)) {
        flags.push({
          type: 'buzzword_only',
          section: 'summary',
          message: `Summary contains generic phrase "${buzz}" — recruiters skip these.`,
          detail: buzz,
        });
      }
    }
  }

  // Check experience
  (data.experience || []).forEach((exp, i) => {
    const sec = `experience[${i}]`;

    // Missing dates
    if (!exp.startDate?.trim() || !exp.endDate?.trim()) {
      flags.push({
        type: 'missing_dates',
        section: sec,
        message: `"${exp.position || 'Position'}" at "${exp.company || 'Company'}" is missing dates.`,
      });
    }

    // Check each bullet
    for (const bullet of exp.highlights || []) {
      const lower = bullet.toLowerCase();

      // Vague verbs
      for (const vague of VAGUE_VERBS) {
        if (lower.startsWith(vague) || lower.includes(` ${vague} `)) {
          flags.push({
            type: 'generic_bullet',
            section: sec,
            message: `Bullet starts with weak verb "${vague}" — use a strong action verb instead.`,
            detail: bullet,
          });
          break;
        }
      }

      // Senior claims by fresher
      if (isFresher) {
        for (const phrase of SENIOR_ONLY_PHRASES) {
          if (lower.includes(phrase)) {
            flags.push({
              type: 'overclaim',
              section: sec,
              message: `"${phrase}" is a senior-level claim that may not be credible at your experience level.`,
              detail: bullet,
            });
            break;
          }
        }
      }
    }
  });

  // Check if target role title overstates experience
  const titleLower = roleContext.roleTitle.toLowerCase();
  if (isFresher) {
    const seniorTitles = ['senior', 'lead', 'principal', 'staff', 'head', 'director', 'architect'];
    for (const st of seniorTitles) {
      if (titleLower.includes(st)) {
        flags.push({
          type: 'level_mismatch',
          section: 'header',
          message: `Target role "${roleContext.roleTitle}" implies senior level, but your experience level is "${roleContext.experienceLevel}".`,
        });
        break;
      }
    }
  }

  return flags;
}

// ===== BUILD ALERTS FROM CLASSIFICATIONS + RISKS =====

function buildAlerts(
  skills: ClassifiedSkill[],
  risks: RiskFlag[]
): ResumeAlert[] {
  const alerts: ResumeAlert[] = [];
  let id = 0;

  // Unverified skills → RED (blocking)
  for (const sk of skills.filter((s) => s.status === 'unverified')) {
    alerts.push({
      id: `alert-${++id}`,
      severity: 'red',
      section: 'skills',
      title: 'Skill needs proof',
      message: `You listed "${sk.skill}" but we can't find where you used it in your experience or projects.`,
      actions: [
        { label: 'Add proof', actionId: 'add_proof', payload: { skill: sk.skill } },
        { label: 'Remove skill', actionId: 'remove_skill', payload: { skill: sk.skill } },
      ],
    });
  }

  // Partial skills → YELLOW
  for (const sk of skills.filter((s) => s.status === 'partial')) {
    alerts.push({
      id: `alert-${++id}`,
      severity: 'yellow',
      section: 'skills',
      title: 'Skill needs clarification',
      message: `"${sk.skill}" is mentioned but usage depth is unclear. Add details or keep as basic.`,
      actions: [
        { label: 'Add details', actionId: 'add_proof', payload: { skill: sk.skill } },
        { label: 'Keep as basic', actionId: 'skip' },
      ],
    });
  }

  // Missing for JD → YELLOW (informational, not blocking)
  for (const sk of skills.filter((s) => s.status === 'missing_for_jd')) {
    alerts.push({
      id: `alert-${++id}`,
      severity: 'yellow',
      section: 'skills',
      title: 'Skill expected by job description',
      message: `"${sk.skill}" is in the job description but missing from your resume. Only add if you have real experience.`,
      actions: [
        { label: 'Add skill', actionId: 'add_skill', payload: { skill: sk.skill } },
        { label: 'Skip', actionId: 'skip' },
      ],
    });
  }

  // Verified skills → GREEN (info)
  const verifiedCount = skills.filter((s) => s.status === 'verified').length;
  if (verifiedCount > 0) {
    alerts.push({
      id: `alert-${++id}`,
      severity: 'green',
      section: 'skills',
      title: 'Skills well-supported',
      message: `${verifiedCount} skill${verifiedCount > 1 ? 's' : ''} are backed by your experience. Good.`,
      actions: [],
    });
  }

  // Risk flags → alerts
  for (const risk of risks) {
    const severity = risk.type === 'overclaim' || risk.type === 'level_mismatch' ? 'red' as const : 'yellow' as const;
    alerts.push({
      id: `alert-${++id}`,
      severity,
      section: risk.section,
      title: riskTitle(risk.type),
      message: risk.message,
      originalText: risk.detail,
      actions: [
        { label: 'Fix', actionId: 'edit_manually', payload: { section: risk.section } },
        { label: 'Skip', actionId: 'skip' },
      ],
    });
  }

  // Sort: red first, yellow, green last
  const order = { red: 0, yellow: 1, green: 2 };
  alerts.sort((a, b) => order[a.severity] - order[b.severity]);

  return alerts;
}

function riskTitle(type: string): string {
  switch (type) {
    case 'overclaim': return 'Overclaim detected';
    case 'generic_bullet': return 'Weak bullet point';
    case 'role_mismatch': return 'Role mismatch';
    case 'level_mismatch': return 'Level mismatch';
    case 'missing_dates': return 'Missing dates';
    case 'unsupported_skill': return 'Unsupported skill';
    case 'fake_metric': return 'Unverifiable metric';
    case 'buzzword_only': return 'Generic phrase';
    default: return 'Issue detected';
  }
}

// ===== MAIN ANALYSIS FUNCTION =====

export function analyzeResume(
  data: ResumeData,
  roleContext: RoleContext,
  jdText?: string
): AnalysisResult {
  // Extract JD keywords
  const jdKeywords = jdText?.trim()
    ? extractKeywordsFromJD(jdText).allKeywords
    : [];

  // Classify skills
  const classifiedSkills = classifySkills(data, roleContext, jdKeywords);

  // Detect risks
  const riskFlags = detectRisks(data, roleContext);

  // Build UI alerts
  const alerts = buildAlerts(classifiedSkills, riskFlags);

  // ATS keyword match
  const resumeText = [
    data.summary || '',
    ...(data.skills || []),
    ...(data.experience || []).flatMap((e) => [e.position, e.company, ...(e.highlights || [])]),
    ...(data.projects || []).flatMap((p) => [p.name, p.description, ...(p.tech || [])]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matchedKeywords = jdKeywords.filter((k) => resumeText.includes(k.toLowerCase()));
  const missingKeywords = jdKeywords.filter((k) => !resumeText.includes(k.toLowerCase()));
  const score = jdKeywords.length > 0 ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) : 0;

  // Stats
  const stats = {
    totalSkills: classifiedSkills.length,
    verifiedSkills: classifiedSkills.filter((s) => s.status === 'verified').length,
    unverifiedSkills: classifiedSkills.filter((s) => s.status === 'unverified').length,
    partialSkills: classifiedSkills.filter((s) => s.status === 'partial').length,
    missingForJd: classifiedSkills.filter((s) => s.status === 'missing_for_jd').length,
    totalRisks: riskFlags.length,
    redAlerts: alerts.filter((a) => a.severity === 'red').length,
    yellowAlerts: alerts.filter((a) => a.severity === 'yellow').length,
  };

  return {
    classifiedSkills,
    riskFlags,
    alerts,
    atsMatch: { score, matchedKeywords, missingKeywords },
    stats,
  };
}
