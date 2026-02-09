import React from 'react';
import type { NormalizedExperience } from '../../../core/normalizedResume';

interface ExperienceItemBlockProps {
  data: NormalizedExperience;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ExperienceItemBlock({ data }: ExperienceItemBlockProps) {
  const dateStr = [data.startDate, data.endDate].filter(Boolean).join(' – ');
  return (
    <div className="doc-section experience-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-entry-role">{escape(data.role)} — {escape(data.company)}</div>
          {data.location ? <div className="doc-entry-company">{escape(data.location)}</div> : null}
        </div>
        <div className="doc-entry-date">{escape(dateStr)}</div>
      </div>
      {data.bullets.length > 0 ? (
        <ul className="doc-entry-bullets">
          {data.bullets.map((b, i) => (
            <li key={i}>{escape(b)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
