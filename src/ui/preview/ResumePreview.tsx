import React, { useEffect, useRef, useState } from 'react';
import { ResumeData, TemplateConfig } from '../../core/types';
import { populateTemplate } from '../../core/delivery/templateEngine';

interface ResumePreviewProps {
    data: ResumeData;
    templateId: string;
    scale?: number;
    className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
    data,
    templateId,
    scale = 1,
    className = ''
}) => {
    const [html, setHtml] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
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
                console.error("Failed to load template", e);
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => { mounted = false; };
    }, [templateId, data]);

    useEffect(() => {
        if (html && iframeRef.current) {
            const doc = iframeRef.current.contentWindow?.document;
            if (doc) {
                doc.open();
                doc.write(html);
                doc.close();

                // Add styles to ensure it fits nicely
                const style = doc.createElement('style');
                // 794px = 210mm (A4 width at 96dpi)
                style.textContent = `
                    body { 
                        margin: 0; 
                        padding: 0; 
                        overflow: hidden; 
                        transform-origin: top left;
                    }
                    /* Force A4 size */
                 `;
                doc.head.appendChild(style);
            }
        }
    }, [html]);

    return (
        <div className={`relative ${className}`} style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            <iframe
                ref={iframeRef}
                title="Resume Preview"
                className="w-full h-full border-none bg-white shadow-sm"
                sandbox="allow-same-origin allow-scripts" // Allow scripts if needed for template logic, but be careful
            />
        </div>
    );
};
