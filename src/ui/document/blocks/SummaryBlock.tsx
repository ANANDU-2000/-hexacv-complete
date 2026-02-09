import React from 'react';

interface SummaryBlockProps {
  text: string;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function SummaryBlock({ text }: SummaryBlockProps) {
  if (!text?.trim()) return null;
  return (
    <div className="doc-section">
      <div className="doc-section-title">PROFESSIONAL SUMMARY</div>
      <div className="doc-summary-text">{escape(text)}</div>
    </div>
  );
}
