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
      <div className="summary-text" style={{ fontSize: '10.5pt', lineHeight: 1.35 }}>{escape(text)}</div>
    </div>
  );
}
