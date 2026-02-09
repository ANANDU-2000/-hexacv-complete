import type {
  NormalizedResume,
  NormalizedHeader,
  NormalizedSkillCategory,
  NormalizedExperience,
  NormalizedProject,
  NormalizedEducation,
} from '../../../core/normalizedResume';

/** Block types for measure-and-paginate. Each is one atomic unit (no mid-block break). */
export type DocumentBlock =
  | { type: 'header'; data: NormalizedHeader }
  | { type: 'summary'; text: string }
  | { type: 'sectionTitle'; title: string }
  | { type: 'skillsCategory'; data: NormalizedSkillCategory }
  | { type: 'experience'; data: NormalizedExperience }
  | { type: 'project'; data: NormalizedProject }
  | { type: 'education'; data: NormalizedEducation };

/** Build ordered list of blocks from normalized resume (for measurement and render). */
export function resumeToBlocks(resume: NormalizedResume): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];

  blocks.push({ type: 'header', data: resume.header });
  if (resume.summary.trim()) blocks.push({ type: 'summary', text: resume.summary });

  if (resume.skills.length > 0) {
    blocks.push({ type: 'sectionTitle', title: 'SKILLS' });
    resume.skills.forEach((s) => blocks.push({ type: 'skillsCategory', data: s }));
  }

  if (resume.experience.length > 0) {
    blocks.push({ type: 'sectionTitle', title: 'EXPERIENCE' });
    resume.experience.forEach((e) => blocks.push({ type: 'experience', data: e }));
  }

  if (resume.projects.length > 0) {
    blocks.push({ type: 'sectionTitle', title: 'PROJECTS' });
    resume.projects.forEach((p) => blocks.push({ type: 'project', data: p }));
  }

  if (resume.education.length > 0) {
    blocks.push({ type: 'sectionTitle', title: 'EDUCATION' });
    resume.education.forEach((e) => blocks.push({ type: 'education', data: e }));
  }

  return blocks;
}
