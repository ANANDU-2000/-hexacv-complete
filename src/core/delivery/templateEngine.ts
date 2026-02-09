/**
 * LEGACY: HTML template renderer for iframe-based resumes.
 *
 * New preview + PDF use the React A4 document engine instead:
 * - src/ui/document/DocumentPreview.tsx
 * - src/core/delivery/generatePDFFromDocument.ts
 *
 * This module is kept only for backwards compatibility (e.g. old admin tools).
 * Do not call it from new user-facing flows.
 */
import { ResumeData } from '../types';
import { extractKeywordsFromJD } from '../ats/extractKeywords';

function escapeHTML(str: string | undefined | null): string {
  if (str == null || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function boldKeywords(text: string, keywords: string[]): string {
  if (!text || !keywords?.length) return escapeHTML(text);
  let result = escapeHTML(text);
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  sorted.forEach((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    result = result.replace(regex, '<strong>$1</strong>');
  });
  return result;
}

function buildContactLine(data: ResumeData): string {
  const b = data.basics || {};
  const parts = [b.email, b.phone, b.location].filter(Boolean);
  return escapeHTML(parts.join(' • ')) || escapeHTML('Email • Phone • Location');
}

function buildExperienceEntries(data: ResumeData): string {
  const list = data.experience || [];
  if (!list.length) return '';
  const jobDescription = data.jobDescription || '';
  const keywords = jobDescription ? extractKeywordsFromJD(jobDescription).allKeywords : [];
  return list
    .map((exp) => {
      const company = escapeHTML(exp.company || 'Company');
      const position = escapeHTML(exp.position || 'Role');
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
      const bullets = (exp.highlights || [])
        .filter(Boolean)
        .map((b) => `<li>${boldKeywords(b, keywords)}</li>`)
        .join('');
      const ul = bullets ? `<ul>${bullets}</ul>` : '';
      return `<div class="experience-entry"><div class="entry-header"><span class="left-col"><span class="job-title">${position}</span><span class="company-info">${company}</span></span><span class="right-col date-range">${escapeHTML(dates)}</span></div><div class="entry-content">${ul}</div></div>`;
    })
    .join('');
}

function buildProjectsEntries(data: ResumeData): string {
  const list = data.projects || [];
  if (!list.length) return '';
  return list
    .map((p) => {
      const name = escapeHTML(p.name || 'Project');
      const desc = escapeHTML(p.description || '');
      const dates = [p.startDate, p.endDate].filter(Boolean).join(' – ');
      const bullets = (p.highlights || []).filter(Boolean).map((b) => `<li>${escapeHTML(b)}</li>`).join('');
      const ul = bullets ? `<ul>${bullets}</ul>` : '';
      return `<div class="project-entry"><div class="entry-header"><span class="left-col"><span class="project-title">${name}</span></span><span class="right-col project-date">${escapeHTML(dates)}</span></div><div class="entry-content">${desc}${ul}</div></div>`;
    })
    .join('');
}

function buildEducationEntries(data: ResumeData): string {
  const list = data.education || [];
  if (!list.length) return '';
  return list
    .map((e) => {
      const institution = escapeHTML(e.institution || '');
      const degree = escapeHTML(e.degree || '');
      const field = escapeHTML(e.field || '');
      const date = escapeHTML(e.graduationDate || '');
      const degreeLine = field ? `${degree}, ${field}` : degree;
      return `<div class="education-entry"><div class="entry-header"><span class="left-col"><span class="degree">${degreeLine}</span><span class="institution">${institution}</span></span><span class="right-col date">${date}</span></div></div>`;
    })
    .join('');
}

function buildAchievementsEntries(data: ResumeData): string {
  const list = data.achievements || [];
  if (!list.length) return '';
  return list
    .map((a) => {
      const desc = typeof a === 'string' ? a : (a as { description?: string }).description || '';
      return `<li class="achievement-item">${escapeHTML(desc)}</li>`;
    })
    .join('');
}

export async function populateTemplate(templateName: string, data: ResumeData): Promise<string> {
  const templateUrl = `/templates/${templateName}.html?t=${Date.now()}`;
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error(`Failed to fetch template: ${response.status}`);
  let html = await response.text();

  const jobDescription = data.jobDescription || '';
  const extracted = extractKeywordsFromJD(jobDescription);
  const keywords = extracted.allKeywords;

  const b = (data.basics || {}) as Record<string, unknown>;
  const fullName = escapeHTML(String(b.fullName || 'Your Name'));
  const jobTitle = escapeHTML(String(b.targetRole || ''));
  const photoUrl = data.basics?.photoUrl || data.photoUrl || '';

  const PROFILE = boldKeywords(data.summary || '', keywords);
  const skillsList = data.skills || [];
  const SKILLS_TEXT = skillsList.length ? escapeHTML(skillsList.join(', ')) : '';
  const SKILLS_LIST = skillsList.length ? 'yes' : '';
  const SKILLS_ITEMS = skillsList.map((s) => `<li>${escapeHTML(s)}</li>`).join('');
  const EXPERIENCE_ENTRIES = buildExperienceEntries(data);
  const PROJECTS_ENTRIES = buildProjectsEntries(data);
  const EDUCATION_ENTRIES = buildEducationEntries(data);
  const ACHIEVEMENTS_ENTRIES = buildAchievementsEntries(data);
  const CONTACT_LINE = buildContactLine(data);
  const REFERENCES = '';

  // Blob for template2: all sections in one block
  const TEMPLATE2_CONTENT = [
    data.summary?.trim() ? `<div class="section"><div class="section-title">PROFESSIONAL SUMMARY</div><div class="summary-text">${PROFILE}</div></div>` : '',
    skillsList.length ? `<div class="section"><div class="section-title">SKILLS</div><div class="skills-content">${SKILLS_TEXT}</div></div>` : '',
    EXPERIENCE_ENTRIES ? `<div class="section"><div class="section-title">EXPERIENCE</div>${EXPERIENCE_ENTRIES}</div>` : '',
    PROJECTS_ENTRIES ? `<div class="section"><div class="section-title">PROJECTS</div>${PROJECTS_ENTRIES}</div>` : '',
    EDUCATION_ENTRIES ? `<div class="section"><div class="section-title">EDUCATION</div>${EDUCATION_ENTRIES}</div>` : '',
    ACHIEVEMENTS_ENTRIES ? `<div class="section"><div class="section-title">ACHIEVEMENTS & CERTIFICATIONS</div><ul>${ACHIEVEMENTS_ENTRIES}</ul></div>` : '',
  ].filter(Boolean).join('\n');

  const replacements: Record<string, string> = {
    '{{FULL_NAME}}': fullName,
    '{{JOB_TITLE}}': jobTitle,
    '{{EMAIL}}': escapeHTML(String(b.email || '')),
    '{{PHONE}}': escapeHTML(String(b.phone || '')),
    '{{SUMMARY}}': PROFILE,
    '{{CONTACT_LINE}}': CONTACT_LINE,
    '{{PHOTO_URL}}': escapeHTML(photoUrl),
    '{{PROFILE}}': PROFILE,
    '{{SKILLS_LIST}}': SKILLS_LIST,
    '{{SKILLS_TEXT}}': SKILLS_TEXT,
    '{{SKILLS_ITEMS}}': SKILLS_ITEMS,
    '{{EXPERIENCE_ENTRIES}}': EXPERIENCE_ENTRIES,
    '{{PROJECTS_ENTRIES}}': PROJECTS_ENTRIES,
    '{{EDUCATION_ENTRIES}}': EDUCATION_ENTRIES,
    '{{ACHIEVEMENTS_ENTRIES}}': ACHIEVEMENTS_ENTRIES,
    '{{TEMPLATE2_CONTENT}}': TEMPLATE2_CONTENT,
    '{{REFERENCES}}': REFERENCES,
  };

  // First resolve {{#if VAR}}...{{/if}} so blocks are kept or removed (placeholders still inside)
  html = replaceConditionalBlocks(html, {
    PHOTO_URL: !!photoUrl,
    JOB_TITLE: !!jobTitle,
    PROFILE: !!data.summary?.trim(),
    SKILLS_LIST: !!skillsList.length,
    EXPERIENCE_ENTRIES: !!EXPERIENCE_ENTRIES,
    PROJECTS_ENTRIES: !!PROJECTS_ENTRIES,
    EDUCATION_ENTRIES: !!EDUCATION_ENTRIES,
    ACHIEVEMENTS_ENTRIES: !!ACHIEVEMENTS_ENTRIES,
    REFERENCES: false,
  });

  for (const [placeholder, value] of Object.entries(replacements)) {
    const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escaped, 'g'), value);
  }

  // Strip any remaining {{...}} so preview never shows raw tokens
  html = html.replace(/\{\{[^}]*\}\}/g, '');

  return html;
}

function replaceConditionalBlocks(html: string, vars: Record<string, boolean>): string {
  let out = html;
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  let m;
  while ((m = ifRegex.exec(html)) !== null) {
    const varName = m[1];
    const inner = m[2];
    const show = vars[varName] === true;
    out = out.replace(m[0], show ? inner : '');
  }
  return out;
}
