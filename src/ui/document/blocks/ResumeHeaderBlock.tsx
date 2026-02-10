import React from 'react';
import type { NormalizedHeader } from '../../../core/normalizedResume';

interface ResumeHeaderBlockProps {
  data: NormalizedHeader;
}


/** Strip protocol and optional trailing slash for display; e.g. https://linkedin.com/in/foo -> linkedin.com/in/foo */
function linkLabel(href: string): string {
  const u = href.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  return u || href;
}

function link(href: string, displayLabel?: string): React.ReactNode {
  if (!href?.trim()) return null;
  const url = href.startsWith('http') ? href : `https://${href.replace(/^https?:\/\//, '')}`;
  const label = displayLabel ?? linkLabel(href);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function ResumeHeaderBlock({ data }: ResumeHeaderBlockProps) {
  const parts: React.ReactNode[] = [];
  if (data.email) parts.push(<a key="email" href={`mailto:${data.email}`}>{data.email}</a>);
  if (data.phone) parts.push(<span key="phone">{data.phone}</span>);
  if (data.linkedin) parts.push(link(data.linkedin));
  if (data.github) parts.push(link(data.github));

  const targetRole = (data.title || '').trim();
  return (
    <header className="doc-section doc-header doc-header-with-photo">
      <div className="doc-header-main">
        <div className="doc-header-name">{data.name || 'Your Name'}</div>
        {targetRole ? (
          <div className="doc-header-target-role">
            <span className="doc-header-target-role-value">{targetRole}</span>
          </div>
        ) : null}
        <div className="doc-header-contact">
          {parts.reduce<React.ReactNode[]>((acc, p, i) => (acc.length ? [...acc, <span key={`s-${i}`}> · </span>, p] : [p]), [])}
        </div>
      </div>
      {data.photoUrl && (
        <div className="doc-header-photo-wrap">
          <img src={data.photoUrl} alt="" className="doc-header-photo" />
        </div>
      )}
    </header>
  );
}
