import { ResumeData } from '../../core/types';

export type TabId = 'target-jd' | 'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements';

export type CompletionState = 'done' | 'partial' | 'empty';

export function getSectionCompletion(data: ResumeData): Record<TabId, CompletionState> {
  const b = data.basics || {};
  const hasName = Boolean(b.fullName?.trim());
  const hasEmail = Boolean(b.email?.trim());
  const hasSummary = Boolean(data.summary?.trim());
  const hasTargetRole = Boolean(b.targetRole?.trim());
  const hasJD = Boolean(data.jobDescription?.trim());
  return {
    'target-jd': hasTargetRole && hasJD ? 'done' : hasTargetRole || hasJD ? 'partial' : 'empty',
    profile: hasName && hasEmail ? 'done' : hasName || hasEmail ? 'partial' : 'empty',
    experience: (data.experience?.length ?? 0) > 0 ? 'done' : 'empty',
    projects: (data.projects?.length ?? 0) > 0 ? 'done' : 'empty',
    skills: (data.skills?.length ?? 0) > 0 ? 'done' : 'empty',
    education: (data.education?.length ?? 0) > 0 ? 'done' : 'empty',
    achievements: (data.achievements?.length ?? 0) > 0 ? 'done' : 'empty',
  };
}

export function getCompletionIcon(state: CompletionState): string {
  if (state === 'done') return '✔';
  if (state === 'partial') return '⚠';
  return '○';
}
