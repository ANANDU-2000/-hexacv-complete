import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { NormalizedResume } from '../../core/normalizedResume';
import type { RenderOptions } from '../../core/normalizedResume';
import { resumeToBlocks, renderBlock } from './blocks';
import { Page } from './Page';
import { assignBlocksToPages, PAGE_CONTENT_WIDTH_PX } from './pageLayoutEngine';

interface DocumentPreviewProps {
  resume: NormalizedResume;
  options?: RenderOptions;
  /** Scale for on-screen (e.g. 0.8 on mobile). PDF uses 1. */
  scale?: number;
  className?: string;
  /** Ref attached to the page stack container (for PDF: snapshot this DOM). */
  contentRef?: React.RefObject<HTMLDivElement | null>;
  /** Called when page layout is computed (for fit-to-view height). */
  onPagesRendered?: (pageCount: number) => void;
}

/**
 * A4 page-based resume preview. Application-level pagination; no iframe, no @media print.
 * Scroll only between pages. Same DOM used for PDF export.
 */
export function DocumentPreview({
  resume,
  options = { tier: 'free' },
  // Scale is applied by the outer page-stack wrapper; keep for API compatibility but unused here.
  scale = 1,
  className = '',
  contentRef,
  onPagesRendered,
}: DocumentPreviewProps) {
  const blocks = useMemo(() => resumeToBlocks(resume), [resume]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[] | null>(null);

  useLayoutEffect(() => {
    if (blocks.length === 0) {
      setHeights([]);
      onPagesRendered?.(0);
      return;
    }
    const refs = blockRefs.current;
    if (refs.length !== blocks.length) {
      setHeights(null);
      return;
    }
    const measured = refs.map((el) => (el ? el.offsetHeight : 0));
    setHeights(measured);
  }, [blocks.length, blocks, onPagesRendered]);

  const pageAssignments = useMemo(() => {
    if (blocks.length === 0) return [];
    if (heights === null || heights.length !== blocks.length) return [blocks];
    return assignBlocksToPages(blocks, heights);
  }, [blocks, heights]);

  useLayoutEffect(() => {
    onPagesRendered?.(pageAssignments.length);
  }, [pageAssignments.length, onPagesRendered]);

  const tier = options.tier ?? 'free';
  const isMeasuring = blocks.length > 0 && heights === null;

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ fontFamily: 'Inter, Calibri, Arial, sans-serif', minHeight: 200 }}>
        <p className="text-gray-500 text-sm">Add content to see preview</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, Calibri, Arial, sans-serif', minHeight: isMeasuring ? 300 : undefined }} className="relative">
      {isMeasuring && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 text-gray-500 text-sm z-10 min-h-[300px]" aria-live="polite">
          Rendering…
        </div>
      )}
      {/* Hidden measure container: same width as page content so layout is accurate */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          width: PAGE_CONTENT_WIDTH_PX,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {blocks.map((block, i) => (
          <div
            key={i}
            ref={(el) => {
              if (blockRefs.current.length <= i) blockRefs.current.length = i + 1;
              blockRefs.current[i] = el;
            }}
            className="page-measure-block"
            style={{ width: PAGE_CONTENT_WIDTH_PX }}
          >
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Page stack: scroll only between pages */}
      <div
        ref={contentRef}
        className={`document-preview-pages ${className}`.trim()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
        }}
      >
        {pageAssignments.map((pageBlocks, pageIndex) => (
          <Page key={pageIndex} isLast={pageIndex === pageAssignments.length - 1}>
            {pageBlocks.map((block, i) => (
              <React.Fragment key={i}>{renderBlock(block)}</React.Fragment>
            ))}
            {tier === 'paid' && pageIndex === pageAssignments.length - 1 ? (
              <div className="doc-footer" style={{ marginTop: 'auto', paddingTop: 8, fontSize: 8, color: '#888' }} />
            ) : null}
          </Page>
        ))}
      </div>
    </div>
  );
}
