import React from 'react';
import type { NormalizedExperience } from '../../../core/normalizedResume';

interface ExperienceItemBlockProps {
  data: NormalizedExperience;
}

export function ExperienceItemBlock({ data }: ExperienceItemBlockProps) {
  const dateStr = [data.startDate, data.endDate].filter(Boolean).join(' – ');
  return (
    <div className="doc-section experience-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-entry-role">{data.role} — {data.company}</div>
          {data.location ? <div className="doc-entry-company">{data.location}</div> : null}
        </div>
        <div className="doc-entry-date">{dateStr}</div>
      </div>
      {data.bullets.length > 0 ? (
        <ul className="doc-entry-bullets">
          {data.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
