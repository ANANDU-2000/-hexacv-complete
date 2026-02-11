/**
 * Skill Evidence Extractor
 * Scans resume data and builds an evidence map for each skill.
 * Pure rules — no LLM.
 */

import type { ResumeData } from '../types';
import type { SkillLocation } from './types';

export interface SkillEvidence {
  skill: string;
  locations: SkillLocation[];
  sentences: string[];
}

/** Normalize skill name for matching (lowercase, trim, remove special chars) */
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9+#. ]/g, '');
}

/** Check if text contains a skill (word-boundary-ish match) */
function textContainsSkill(text: string, skill: string): boolean {
  const t = norm(text);
  const s = norm(skill);
  if (!s || s.length < 2) return false;
  // Direct substring match (good enough for skills like "Python", "React", "AWS")
  if (t.includes(s)) return true;

  // Handle common variations
  // 1. "React.js" -> match "React"
  if ((s.endsWith('.js') || s.endsWith('js')) && s.length > 4) {
    const base = s.replace(/\.?js$/, '');
    if (t.includes(base)) return true;
  }

  // 2. "Node.js" -> "Node" (risky common word, but in resume context likely fine? check boundaries?)
  // Better: check for "Node" followed by space or punctuation if possible, but norm removes punctuation.
  // Let's stick to safe ones or just rely on the user to fix their skill name if strict.

  return false;
}

/** Extract the sentence containing the skill from a block of text */
function extractSentence(text: string, skill: string): string | null {
  const lower = text.toLowerCase();
  const sLower = norm(skill);
  const idx = lower.indexOf(sLower);
  if (idx === -1) return null;
  // Find sentence boundaries (rough: split on . or newline)
  const before = text.lastIndexOf('.', idx);
  const after = text.indexOf('.', idx + sLower.length);
  const start = before >= 0 ? before + 1 : 0;
  const end = after >= 0 ? after + 1 : text.length;
  return text.slice(start, end).trim();
}

/**
 * Build evidence map: for each skill in the skills array,
 * scan summary, experience, projects, education for usage.
 */
export function extractSkillEvidence(data: ResumeData): SkillEvidence[] {
  const skillStrings = (data.skills || []).filter(Boolean).map(String);
  if (skillStrings.length === 0) return [];

  const results: SkillEvidence[] = [];

  for (const skill of skillStrings) {
    const locations: SkillLocation[] = ['skills_section']; // always in skills section
    const sentences: string[] = [];

    // Check summary
    if (data.summary && textContainsSkill(data.summary, skill)) {
      locations.push('summary');
      const s = extractSentence(data.summary, skill);
      if (s) sentences.push(s);
    }

    // Check experience
    for (const exp of data.experience || []) {
      const bullets = (exp.highlights || []).join(' ');
      const fullText = `${exp.position || ''} ${exp.company || ''} ${bullets}`;
      if (textContainsSkill(fullText, skill)) {
        locations.push(`experience:${exp.company || exp.position || 'unknown'}`);
        // Find the specific bullet
        for (const bullet of exp.highlights || []) {
          if (textContainsSkill(bullet, skill)) {
            sentences.push(bullet.trim());
          }
        }
      }
    }

    // Check projects
    for (const proj of data.projects || []) {
      const techStr = (proj.tech || []).join(' ');
      const fullText = `${proj.name || ''} ${proj.description || ''} ${techStr}`;
      if (textContainsSkill(fullText, skill)) {
        locations.push(`project:${proj.name || 'unknown'}`);
        if (proj.description && textContainsSkill(proj.description, skill)) {
          sentences.push(proj.description.trim());
        }
      }
    }

    // Check education
    for (const edu of data.education || []) {
      const fullText = `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''}`;
      if (textContainsSkill(fullText, skill)) {
        locations.push('education');
      }
    }

    results.push({ skill, locations, sentences });
  }

  return results;
}
