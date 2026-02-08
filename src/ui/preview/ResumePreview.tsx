import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../../core/types';
import { populateTemplate } from '../../core/delivery/templateEngine';

const A4_PX_HEIGHT = 1123;

interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  scale?: number;
  className?: string;
  /** Called with content height in px after load (for A4 page navigation). */
  onContentHeight?: (height: number) => void;
  /** When set, wrapper height matches content so parent can scroll by page. */
  contentHeight?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  templateId,
  scale = 1,
  className = '',
  onContentHeight,
  contentHeight: contentHeightProp,
}) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [contentHeight, setContentHeight] = useState<number>(A4_PX_HEIGHT);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const populated = await populateTemplate(templateId, data);
        if (mounted) {
          setHtml(populated);
          setLoading(false);
        }
      } catch (e) {
        console.error('Failed to load template', e);
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [templateId, data]);

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
      /* Free ATS: no watermark, footer, date, or page number in preview */
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
    const timer = setTimeout(measure, 100);
    return () => clearTimeout(timer);
  }, [html, onContentHeight]);

  const height = contentHeightProp ?? contentHeight;

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
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
