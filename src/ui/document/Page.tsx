import React, { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed A4 page. No inner scroll; content must fit or be paginated by layout engine.
 * Shared by preview and PDF (same DOM).
 */
export function Page({ children, className = '' }: PageProps) {
  return (
    <div className={`page ${className}`.trim()} data-a4-page>
      {children}
    </div>
  );
}
