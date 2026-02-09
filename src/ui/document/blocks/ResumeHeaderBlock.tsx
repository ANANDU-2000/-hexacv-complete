import React from 'react';
import type { NormalizedHeader } from '../../../core/normalizedResume';

interface ResumeHeaderBlockProps {
  data: NormalizedHeader;
}

function escape(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function link(href: string, label: string): React.ReactNode {
  if (!href?.trim()) return null;
  return (
    <a href={href.startsWith('http') ? href : `https://${href.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">
      {escape(label || href)}
    </a>
  );
}

export function ResumeHeaderBlock({ data }: ResumeHeaderBlockProps) {
  const parts: React.ReactNode[] = [];
  if (data.email) parts.push(<a key="email" href={`mailto:${data.email}`}>{escape(data.email)}</a>);
  if (data.phone) parts.push(<span key="phone">{escape(data.phone)}</span>);
  if (data.linkedin) parts.push(link(data.linkedin, 'LinkedIn'));
  if (data.github) parts.push(link(data.github, 'GitHub'));

  return (
    <header className="doc-section doc-header">
      <div className="doc-header-name">{escape(data.name || 'Your Name')}</div>
      {data.title ? <div className="doc-header-title">{escape(data.title)}</div> : null}
      <div className="doc-header-contact">
        {parts.reduce<React.ReactNode[]>((acc, p, i) => (acc.length ? [...acc, <span key={`s-${i}`}> · </span>, p] : [p]), [])}
      </div>
    </header>
  );
}
