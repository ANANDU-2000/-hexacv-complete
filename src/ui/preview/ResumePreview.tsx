import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../../core/types';
import { populateTemplate } from '../../core/delivery/templateEngine';

const A4_PX_HEIGHT = 1123;
const DATA_DEBOUNCE_MS = 350;

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  scale?: number;
  className?: string;
  /** Called with content height in px after load (for A4 page navigation). */
  onContentHeight?: (height: number) => void;
  /** When set, wrapper height matches content so parent can scroll by page. */
  contentHeight?: number;
  /** When false, no full-screen loader (e.g. in editor for instant feel). Default true. */
  showLoadingOverlay?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  templateId,
  scale = 1,
  className = '',
  onContentHeight,
  contentHeight: contentHeightProp,
  showLoadingOverlay = true,
}) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [contentHeight, setContentHeight] = useState<number>(A4_PX_HEIGHT);
  const [dataError, setDataError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const templateIdRef = useRef<string>(templateId);
  const hasInitialLoadRef = useRef(false);

  // Initial load or templateId change: show loader, load template with current data
  useEffect(() => {
    let mounted = true;
    templateIdRef.current = templateId;

    const load = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const populated = await populateTemplate(templateId, data);
        if (mounted && templateIdRef.current === templateId) {
          setHtml(populated);
          hasInitialLoadRef.current = true;
        }
      } catch (e) {
        console.error('Failed to load template', e);
        if (mounted) setDataError('Failed to update preview');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [templateId]);

  // Data-only updates: debounced, no loader, keep previous HTML visible (only after initial load)
  useEffect(() => {
    if (!hasInitialLoadRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const populated = await populateTemplate(templateId, data);
        if (templateIdRef.current === templateId) {
          setHtml(populated);
          setDataError(null);
        }
      } catch (e) {
        console.error('Failed to update preview', e);
        setDataError('Failed to update preview');
      }
    }, DATA_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [data, templateId]);

  useEffect(() => {
    if (!html || !iframeRef.current) return;

    const doc = iframeRef.current.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    const style = doc.createElement('style');
    style.textContent = `
      body { margin: 0; padding: 0; transform-origin: top left; }
      .cv-watermark, [data-watermark], .watermark, footer.resume-footer, .resume-footer,
      .page-number, .page-number-footer, .printed-date, .printed-time { display: none !important; }
      @page { size: A4; margin: 0.6in 0.7in; }
    `;
    doc.head.appendChild(style);

    const measure = () => {
      const h = Math.max(A4_PX_HEIGHT, doc.body.scrollHeight);
      setContentHeight(h);
      onContentHeight?.(h);
    };

    measure();
    const t = setTimeout(measure, 100);
    return () => clearTimeout(t);
  }, [html, onContentHeight]);

  const height = contentHeightProp ?? contentHeight;
  const showOverlay = showLoadingOverlay && loading;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: '794px',
        height: `${height}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      {dataError && !showOverlay && (
        <div className="absolute bottom-2 left-2 right-2 py-1.5 px-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 z-10">
          {dataError}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Resume Preview"
        className="w-full h-full border-none bg-white shadow-sm"
        style={{ minHeight: `${A4_PX_HEIGHT}px` }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};
