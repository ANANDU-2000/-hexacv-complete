import React from 'react';
import type { NormalizedEducation } from '../../../core/normalizedResume';

interface EducationItemBlockProps {
  data: NormalizedEducation;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function EducationItemBlock({ data }: EducationItemBlockProps) {
  return (
    <div className="doc-section education-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-edu-degree">{escape(data.degree)}</div>
          <div className="doc-edu-institute">{escape(data.institute)}</div>
        </div>
        <div className="doc-edu-year">{escape(data.year)}</div>
      </div>
    </div>
  );
}
