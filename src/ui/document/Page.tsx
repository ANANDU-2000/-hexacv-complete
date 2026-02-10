import React, { ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  className?: string;
  /** When true, page does not use min-height so no gap at bottom (last page). */
  isLast?: boolean;
}

/**
 * Fixed A4 page. No inner scroll; content must fit or be paginated by layout engine.
 * Shared by preview and PDF (same DOM). Last page uses page-last to avoid bottom gap.
 */
export function Page({ children, className = '', isLast = false }: PageProps) {
  return (
    <div className={`page ${isLast ? 'page-last' : ''} ${className}`.trim()} data-a4-page>
      {children}
    </div>
  );
}
