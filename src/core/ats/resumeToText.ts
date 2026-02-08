/**
 * Serialize ResumeData to plain text for ATS score and structure check.
 */
import { ResumeData } from '../types';

export function resumeToText(data: ResumeData): string {
  const parts: string[] = [];
  const b = data.basics || {};
  parts.push([b.fullName, b.email, b.phone, b.location, b.targetRole].filter(Boolean).join(' '));
  if (data.summary) parts.push('Summary', data.summary);
  if (data.experience?.length) {
    parts.push('Experience');
    data.experience.forEach((e) => {
      parts.push([e.company, e.position, e.startDate, e.endDate].filter(Boolean).join(' '));
      (e.highlights || []).forEach((h) => parts.push(h));
    });
  }
  if (data.education?.length) {
    parts.push('Education');
    data.education.forEach((e) => {
      parts.push([e.institution, e.degree, e.field, e.graduationDate].filter(Boolean).join(' '));
    });
  }
  if (data.projects?.length) {
    parts.push('Projects');
    data.projects.forEach((p) => {
      parts.push(p.name || '', p.description || '');
      (p.highlights || []).forEach((h) => parts.push(h));
    });
  }
  if (data.skills?.length) parts.push('Skills', data.skills.join(' '));
  if (data.achievements?.length) {
    data.achievements.forEach((a) => parts.push(typeof a === 'string' ? a : (a as { description?: string }).description || ''));
  }
  return parts.join('\n');
}
