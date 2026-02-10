import React from 'react';

interface SummaryBlockProps {
  text: string;
}

export function SummaryBlock({ text }: SummaryBlockProps) {
  if (!text?.trim()) return null;
  return (
    <div className="doc-section">
      <div className="doc-section-title">PROFESSIONAL SUMMARY</div>
      <div className="doc-summary-text">{text}</div>
    </div>
  );
}
