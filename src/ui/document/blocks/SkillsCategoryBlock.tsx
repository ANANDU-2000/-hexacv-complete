import React from 'react';
import type { NormalizedSkillCategory } from '../../../core/normalizedResume';
import { cleanResumeText } from '../../../utils/autoCorrector';

interface SkillsCategoryBlockProps {
  data: NormalizedSkillCategory;
}

const CATEGORY_MAP: Record<string, string> = {
  'Other Skills': 'Key Competencies',
  'Interpersonal Skills': 'Professional Skills',
  'Soft Skills': 'Professional Skills',
  'Languages': 'Languages',
  'Tools & Frameworks': 'Tools & Technologies',
};

function formatCategory(cat: string): string {
  if (!cat) return 'Skills';
  const clean = cleanResumeText(cat);
  return CATEGORY_MAP[clean] || clean;
}

export function SkillsCategoryBlock({ data }: SkillsCategoryBlockProps) {
  const items = (data.items || []).filter(Boolean);
  if (items.length === 0) return null;

  const text = items.map(cleanResumeText).join(', ');

  return (
    <div className="doc-skills-category">
      <span className="doc-skills-label">{formatCategory(data.category)}: </span>
      <span className="doc-skills-items">{text}</span>
    </div>
  );
}
