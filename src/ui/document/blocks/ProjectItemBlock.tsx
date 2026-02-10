import React from 'react';
import type { NormalizedProject } from '../../../core/normalizedResume';
import { cleanResumeText } from '../../../utils/autoCorrector';

interface ProjectItemBlockProps {
  data: NormalizedProject;
}

export function ProjectItemBlock({ data }: ProjectItemBlockProps) {
  return (
    <div className="doc-section project-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-entry-role">{data.title || 'Project'}</div>
        </div>
      </div>
      {data.bullets.length > 0 ? (
        <ul className="doc-entry-bullets">
          {data.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
      {data.tech?.length ? (
        <div className="doc-skills-items" style={{ marginTop: 2 }}>{data.tech.map(cleanResumeText).join(', ')}</div>
      ) : null}
    </div>
  );
}
