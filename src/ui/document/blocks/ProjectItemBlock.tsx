import React from 'react';
import type { NormalizedProject } from '../../../core/normalizedResume';

interface ProjectItemBlockProps {
  data: NormalizedProject;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ProjectItemBlock({ data }: ProjectItemBlockProps) {
  return (
    <div className="doc-section project-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-entry-role">{escape(data.title || 'Project')}</div>
        </div>
      </div>
      {data.bullets.length > 0 ? (
        <ul className="doc-entry-bullets">
          {data.bullets.map((b, i) => (
            <li key={i}>{escape(b)}</li>
          ))}
        </ul>
      ) : null}
      {data.tech?.length ? (
        <div className="doc-skills-items" style={{ marginTop: 2 }}>{data.tech.map(escape).join(', ')}</div>
      ) : null}
    </div>
  );
}
