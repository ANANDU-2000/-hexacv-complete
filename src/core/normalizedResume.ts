/**
 * ATS-safe normalized resume schema.
 * Editor and renderer use this; legacy ResumeData is mapped to/from it.
 */
import type { ResumeData, Experience, Education, Project } from './types';

export interface NormalizedHeader {
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  /** Optional profile photo URL (data URL or https). Rendered when includePhoto is true. */
  photoUrl?: string;
}

export interface NormalizedSkillCategory {
  category: string;
  items: string[];
}

export interface NormalizedExperience {
  id?: string;
  role: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface NormalizedProject {
  id?: string;
  title: string;
  bullets: string[];
  tech?: string[];
}

export interface NormalizedEducation {
  id?: string;
  degree: string;
  institute: string;
  year: string;
}

export interface NormalizedResume {
  header: NormalizedHeader;
  summary: string;
  skills: NormalizedSkillCategory[];
  experience: NormalizedExperience[];
  projects: NormalizedProject[];
  education: NormalizedEducation[];
}

export type RenderTier = 'free' | 'paid';

export interface RenderOptions {
  tier: RenderTier;
}

const defaultHeader: NormalizedHeader = {
  name: '',
  title: '',
  email: '',
  phone: '',
};

export function emptyNormalizedResume(): NormalizedResume {
  return {
    header: { ...defaultHeader },
    summary: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
  };
}

// ---------------------------------------------------------------------------
// ATS-friendly skill categorization: group flat list into bold categories
// ---------------------------------------------------------------------------

const SKILL_CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Programming Languages': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust', 'kotlin', 'swift', 'r ', 'sql', 'scala', 'php', 'html', 'css'],
  'ML & AI': ['machine learning', 'ml', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'scikit', 'openai', 'langchain', 'rag', 'llm', 'computer vision', 'neural', 'transformers', 'hugging face', 'gen ai', 'generative ai'],
  'Frameworks & Libraries': ['react', 'node', 'django', 'flask', 'fastapi', 'spring', 'angular', 'vue', 'next', 'express', 'nest', 'jquery', 'bootstrap', 'tailwind'],
  'Tools & Platforms': ['git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'linux', 'jira', 'confluence', 'tableau', 'power bi', 'figma', 'postman', 'vs code', 'pandas', 'numpy'],
  'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase'],
};

function categorizeSkill(s: string): string {
  const lower = s.toLowerCase().trim();
  for (const [category, keywords] of Object.entries(SKILL_CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k) || k.includes(lower))) return category;
  }
  return 'Other Skills';
}

function groupSkillsIntoCategories(skillStrings: string[]): NormalizedSkillCategory[] {
  const raw = skillStrings.filter(Boolean).map((s) => String(s).trim());
  if (raw.length === 0) return [];
  const byCategory = new Map<string, string[]>();
  for (const s of raw) {
    const cat = categorizeSkill(s);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    const list = byCategory.get(cat)!;
    if (!list.includes(s)) list.push(s);
  }
  const order = ['Programming Languages', 'ML & AI', 'Frameworks & Libraries', 'Tools & Platforms', 'Databases', 'Other Skills'];
  const result: NormalizedSkillCategory[] = [];
  for (const cat of order) {
    const items = byCategory.get(cat);
    if (items && items.length > 0) result.push({ category: cat, items });
  }
  const rest = [...byCategory.keys()].filter((c) => !order.includes(c));
  for (const cat of rest) {
    const items = byCategory.get(cat);
    if (items && items.length > 0) result.push({ category: cat, items });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Mappers: ResumeData <-> NormalizedResume (editor can stay on ResumeData;
// renderer and ATS use NormalizedResume)
// ---------------------------------------------------------------------------

export function resumeDataToNormalized(data: ResumeData): NormalizedResume {
  const b = (data.basics ?? {}) as Record<string, unknown>;
  const includePhoto = b.includePhoto !== false;
  const photoUrl = (data.photoUrl ?? b.photoUrl) as string | undefined;
  const header: NormalizedHeader = {
    name: String(b.fullName ?? ''),
    title: String(b.targetRole ?? ''),
    email: String(b.email ?? ''),
    phone: String(b.phone ?? ''),
    linkedin: b.linkedin as string | undefined,
    github: b.github as string | undefined,
    photoUrl: includePhoto && photoUrl ? photoUrl : undefined,
  };

  const skills: NormalizedSkillCategory[] = Array.isArray(data.skills) && data.skills.length > 0
    ? groupSkillsIntoCategories(data.skills.filter(Boolean).map(String))
    : [];

  const experience: NormalizedExperience[] = (data.experience ?? []).map((e: Experience) => ({
    id: e.id,
    role: e.position ?? '',
    company: e.company ?? '',
    startDate: e.startDate ?? '',
    endDate: e.endDate ?? '',
    bullets: (e.highlights ?? []).filter(Boolean),
  }));

  const projects: NormalizedProject[] = (data.projects ?? []).map((p: Project) => ({
    id: p.id,
    title: p.name ?? '',
    bullets: [
      ...(p.description ? [p.description] : []),
      ...(p.highlights ?? []),
    ].filter(Boolean),
    tech: p.tech,
  }));

  const education: NormalizedEducation[] = (data.education ?? []).map((e: Education) => ({
    id: e.id,
    degree: [e.degree, e.field].filter(Boolean).join(', ') || '',
    institute: e.institution ?? '',
    year: e.graduationDate ?? '',
  }));

  return {
    header,
    summary: data.summary ?? '',
    skills,
    experience,
    projects,
    education,
  };
}

/** Merge normalized resume into ResumeData; pass existing to keep id, jobDescription, etc. */
export function normalizedToResumeData(
  n: NormalizedResume,
  existing: Partial<ResumeData> = {}
): ResumeData {
  const prev = existing as ResumeData;
  const prevBasics = (prev?.basics ?? {}) as Record<string, unknown>;
  return {
    id: prev?.id ?? '',
    basics: {
      ...(prev?.basics ?? {}),
      fullName: n.header.name,
      targetRole: n.header.title,
      email: n.header.email,
      phone: n.header.phone,
      location: String(prevBasics.location ?? ''),
      linkedin: n.header.linkedin,
      github: n.header.github,
    },
    summary: n.summary,
    skills: n.skills.flatMap((s) => s.items),
    experience: n.experience.map((e, i) => ({
      id: e.id ?? (prev?.experience?.[i] as Experience)?.id ?? `exp-${i}`,
      position: e.role,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      highlights: e.bullets,
    })),
    projects: n.projects.map((p, i) => ({
      id: p.id ?? (prev?.projects?.[i] as Project)?.id ?? `proj-${i}`,
      name: p.title,
      description: p.bullets[0] ?? '',
      highlights: p.bullets.slice(1),
      tech: p.tech,
    })),
    education: n.education.map((e, i) => ({
      id: e.id ?? (prev?.education?.[i] as Education)?.id ?? `edu-${i}`,
      degree: e.degree,
      institution: e.institute,
      field: '',
      graduationDate: e.year,
    })),
    achievements: prev?.achievements ?? [],
    jobDescription: prev?.jobDescription,
    atsMetrics: prev?.atsMetrics,
    lastUpdated: prev?.lastUpdated,
  };
}
