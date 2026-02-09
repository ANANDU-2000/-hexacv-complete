import React from 'react';

interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return <div className="doc-section-title">{title}</div>;
}
