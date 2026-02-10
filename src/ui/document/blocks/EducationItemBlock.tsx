import React from 'react';
import type { NormalizedEducation } from '../../../core/normalizedResume';

interface EducationItemBlockProps {
  data: NormalizedEducation;
}

export function EducationItemBlock({ data }: EducationItemBlockProps) {
  return (
    <div className="doc-section education-entry">
      <div className="doc-entry-header">
        <div className="doc-entry-left">
          <div className="doc-edu-degree">{data.degree}</div>
          <div className="doc-edu-institute">{data.institute}</div>
        </div>
        <div className="doc-edu-year">{data.year}</div>
      </div>
    </div>
  );
}
