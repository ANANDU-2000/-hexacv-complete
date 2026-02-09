import React from 'react';
import type { NormalizedSkillCategory } from '../../../core/normalizedResume';

interface SkillsCategoryBlockProps {
  data: NormalizedSkillCategory;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function SkillsCategoryBlock({ data }: SkillsCategoryBlockProps) {
  const items = (data.items || []).filter(Boolean);
  if (items.length === 0) return null;
  const text = items.map(escape).join(', ');
  return (
    <div className="doc-skills-category">
      <span className="doc-skills-label">{escape(data.category || 'Skills')}: </span>
      <span className="doc-skills-items">{text}</span>
    </div>
  );
}
