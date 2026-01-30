/**
 * Template Renderer Component
 * Renders HTML templates with strict A4 enforcement for preview-PDF consistency
 * 
 * DOCUMENT-FIRST ARCHITECTURE:
 * - This component renders ONLY the document, no UI chrome
 * - Loading/error states should be handled by parent components
 * - Use onLoadingChange and onError callbacks for state updates
 */

import { useEffect, useRef, useState } from 'react';
import { populateTemplate } from './template-engine';
import { type ResumeData } from './types';
import { A4_DIMENSIONS } from './a4-page-system';

interface TemplateRendererProps {
    templateId: string;
    resumeData: ResumeData;
    onLoad?: () => void;
    onPageCountChange?: (count: number) => void;
    onLoadingChange?: (loading: boolean) => void;
    onError?: (error: string) => void;
    className?: string;
    currentPage?: number; // For multi-page navigation
}

/**
 * Pure document renderer - renders ONLY the A4 iframe
 * Parent components handle loading/error UI states
 */
export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
    templateId,
    resumeData,
    onLoad,
    onPageCountChange,
    onLoadingChange,
    onError,
    className = '',
    currentPage = 1
}) => {
    const [html, setHtml] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Notify parent of loading state changes
    useEffect(() => {
        onLoadingChange?.(loading);
    }, [loading, onLoadingChange]);

    // Notify parent of errors
    useEffect(() => {
        if (error) {
            onError?.(error);
        }
    }, [error, onError]);

    useEffect(() => {
        // Load and populate template
        const loadTemplate = async () => {
            setLoading(true);
            setError('');
            try {
                console.log('🔍 TemplateRenderer: Loading template', { templateId, resumeData });

                // Map template IDs to HTML files
                const templateMap: Record<string, string> = {
                    'classic': 'classic',
                    'minimal': 'minimal',
                    'professional': 'professional',
                    'modern': 'modern',
                    'executive': 'executive',
                    'template1free': 'template1free',
                    'template2': 'template2',
                    'template3': 'template3'
                };

                const templateFile = templateMap[templateId] || 'template1free';
                console.log('📄 Fetching template file:', `/templates/${templateFile}.html`);

                const populatedHtml = await populateTemplate(templateFile, resumeData);
                console.log('✅ Template populated successfully, HTML length:', populatedHtml.length);
                setHtml(populatedHtml);
                setLoading(false);
            } catch (error) {
                console.error('❌ Failed to load template:', error);
                setError(error instanceof Error ? error.message : 'Unknown error');
                setLoading(false);
            }
        };

        loadTemplate();
    }, [templateId, resumeData]);

    // Apply page transform - called after iframe is ready
    const applyPageTransform = (iframeDoc: Document, pageNum: number) => {
        if (!iframeDoc || !iframeDoc.body) return;
        const scrollX = (pageNum - 1) * A4_DIMENSIONS.WIDTH;
        iframeDoc.body.style.transform = `translateX(-${scrollX}px)`;
        iframeDoc.body.style.transition = 'none'; // No animation for page changes
        console.log(`📜 Applied transform for page ${pageNum}: -${scrollX}px`);
    };

    useEffect(() => {
        // Force immediate scroll position or transform on page change
        if (iframeRef.current && html) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc && iframeDoc.body) {
                applyPageTransform(iframeDoc, currentPage);
            } else {
                // If body not ready, wait for iframe load
                const handleLoad = () => {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc && doc.body) {
                        applyPageTransform(doc, currentPage);
                    }
                };
                iframe.addEventListener('load', handleLoad, { once: true });
            }
        }
    }, [currentPage, html]);

    useEffect(() => {
        // Inject HTML into iframe for isolated rendering
        if (html && iframeRef.current) {
            console.log('🖼️ Injecting HTML into iframe, length:', html.length);
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();
                console.log('✅ HTML injected into iframe successfully');

                // Enforce A4 dimensions and column flow
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        overflow-wrap: break-word;
                        word-break: break-word;
                        /* Security: Prevent text selection and copying */
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }
                    html { 
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: hidden !important;
                        height: ${A4_DIMENSIONS.HEIGHT}px !important;
                        width: ${A4_DIMENSIONS.WIDTH}px !important;
                        background: white;
                        /* Security: Prevent drag and context menu */
                        -webkit-user-drag: none !important;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: ${A4_DIMENSIONS.HEIGHT}px !important;
                        width: max-content !important;
                        min-width: ${A4_DIMENSIONS.WIDTH}px !important;
                        position: relative;
                        
                        /* Column-based pagination */
                        -webkit-column-width: ${A4_DIMENSIONS.WIDTH}px !important;
                        -moz-column-width: ${A4_DIMENSIONS.WIDTH}px !important;
                        column-width: ${A4_DIMENSIONS.WIDTH}px !important;
                        
                        -webkit-column-gap: 0 !important;
                        -moz-column-gap: 0 !important;
                        column-gap: 0 !important;
                        
                        -webkit-column-fill: auto !important;
                        -moz-column-fill: auto !important;
                        column-fill: auto !important;
                        
                        overflow: visible !important;
                        transform-origin: top left;
                        transition: none;
                        background: white;
                        
                        /* Allow breaking anywhere to fill pages properly */
                        orphans: 1 !important;
                        widows: 1 !important;
                    }
                    
                    /* Ensure containers occupy full column width */
                    .resume-container, .main-container, .page-content, .page, body > div {
                        width: ${A4_DIMENSIONS.WIDTH}px !important;
                        max-width: ${A4_DIMENSIONS.WIDTH}px !important;
                        margin: 0 !important;
                        min-height: 100% !important;
                        height: auto !important; /* Allow dynamic height across columns */
                        box-sizing: border-box !important;
                        -webkit-box-decoration-break: clone !important;
                        box-decoration-break: clone !important;
                    }
                    
                    /* Force items to be breakable to prevent gaps at bottom of pages */
                    .section, 
                    .entry,
                    .experience-entry, 
                    .project-entry, 
                    .edu-entry,
                    .education-entry,
                    .certification-entry,
                    .achievement-entry,
                    .skill-category,
                    .resume-container > div,
                    .main-container > section,
                    .main-container > div,
                    section,
                    article {
                        -webkit-column-break-inside: auto !important;
                        column-break-inside: auto !important;
                        break-inside: auto !important;
                        page-break-inside: auto !important;
                        display: block !important;
                    }
                    
                    /* Prevent lonely headings at page bottoms */
                    h1, h2, h3, h4, 
                    .section-title, 
                    .job-title, 
                    .project-title, 
                    .degree,
                    .company-name,
                    .role-header {
                        -webkit-column-break-after: avoid !important;
                        column-break-after: avoid !important;
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                    }

                    /* Allow lists to break naturally */
                    ul, ol, li, p {
                        -webkit-column-break-inside: auto !important;
                        column-break-inside: auto !important;
                        break-inside: auto !important;
                        page-break-inside: auto !important;
                    }
                `;
                iframeDoc.head.appendChild(style);

                // Apply initial transform immediately after styles
                applyPageTransform(iframeDoc, currentPage);

                // Calculate page count based on scroll width after content is fully rendered
                // Use multiple delays to ensure fonts and images are loaded
                const calculatePagesAndNotify = () => {
                    if (iframeDoc.body) {
                        // Re-apply transform to ensure it persists after layout
                        applyPageTransform(iframeDoc, currentPage);

                        // Using scrollWidth for column-based flow
                        const contentWidth = iframeDoc.body.scrollWidth;
                        // Use ceil to ensure we catch even a small overflow into a new column
                        const pageCount = Math.max(1, Math.ceil(contentWidth / A4_DIMENSIONS.WIDTH));

                        console.log('📊 Content width:', contentWidth, 'Pages:', pageCount, 'Template:', templateId, 'CurrentPage:', currentPage);

                        if (onPageCountChange) {
                            onPageCountChange(pageCount);
                        }
                        if (onLoad) {
                            onLoad();
                        }
                    }
                };

                iframe.onload = () => {
                    // First check after initial load
                    requestAnimationFrame(() => {
                        // Wait for fonts to load
                        if (iframeDoc.fonts && iframeDoc.fonts.ready) {
                            iframeDoc.fonts.ready.then(() => {
                                setTimeout(calculatePagesAndNotify, 100);
                            });
                        } else {
                            // Fallback for browsers without font loading API
                            setTimeout(calculatePagesAndNotify, 300);
                        }
                    });
                };
            }
        }
    }, [html, onLoad, onPageCountChange, templateId]); // Removed currentPage from here, handled in separate effect

    return (
        <iframe
            ref={iframeRef}
            className={`template-iframe a4-document-frame ${className}`}
            style={{
                width: `${A4_DIMENSIONS.WIDTH}px`,
                height: `${A4_DIMENSIONS.HEIGHT}px`,
                border: 'none',
                background: 'white',
                display: 'block',
                position: 'relative',
                margin: '0 auto',
                overflow: 'hidden', // Clip content to page boundaries
                pointerEvents: 'none', // Prevent interaction with iframe content
                userSelect: 'none' // Prevent text selection
            }}
            title="Resume Preview"
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
        />
    );
    // NOTE: Loading and error states removed from TemplateRenderer
    // Parent components should handle these UI states
};

/**
 * Generate PDF from HTML template using browser print API
 * Enforces A4 dimensions for consistency with preview
 */
export const generatePDFFromHTMLTemplate = async (
    templateId: string,
    resumeData: ResumeData,
    filename: string = 'resume.pdf'
): Promise<void> => {
    return new Promise(async (resolve) => {
        // Map template IDs to HTML files
        const templateMap: Record<string, string> = {
            'classic': 'classic',
            'minimal': 'minimal',
            'professional': 'professional',
            'modern': 'modern',
            'executive': 'executive',
            'template1free': 'template1free',
            'template2': 'template2',
            'template3': 'template3'
        };

        const templateFile = templateMap[templateId] || 'template1free';
        const html = await populateTemplate(templateFile, resumeData);

        // Check if running in Electron
        if ((window as any).electronAPI?.downloadPDF) {
            console.log('🚀 Electron detected, using direct PDF download');
            (window as any).electronAPI.downloadPDF(html);
            resolve();
            return;
        }

        // Create invisible iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = `${A4_DIMENSIONS.WIDTH}px`;
        iframe.style.height = `${A4_DIMENSIONS.HEIGHT}px`;
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';

        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(html);

            // Set title so browser print dialog uses it as filename
            iframeDoc.title = filename.replace(/\.pdf$/i, '');

            const style = iframeDoc.createElement('style');
            style.textContent = `
                @page {
                    size: A4;
                    margin: 0;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    width: ${A4_DIMENSIONS.WIDTH}px !important;
                }
                body {
                    background: white;
                }
                /* Ensure all templates take full width */
                .resume-container, .main-container, body > div {
                    width: ${A4_DIMENSIONS.WIDTH}px !important;
                }
                /* Page break support */
                .page, .resume-page, .section {
                    page-break-inside: avoid;
                }
                h1, h2, h3, .section-title {
                    page-break-after: avoid;
                }
            `;
            iframeDoc.head.appendChild(style);

            iframeDoc.close();

            // Wait for fonts and images to load
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();

                    // Cleanup after print
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        resolve();
                    }, 1000);
                }, 500); // Increased delay for proper rendering
            };
        }
    });
};

/**
 * Hook to get populated HTML for advanced use cases
 */
export const useTemplateHTML = (templateId: string, resumeData: ResumeData) => {
    const [html, setHtml] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadTemplate = async () => {
            setLoading(true);
            setError(null);

            try {
                const templateMap: Record<string, string> = {
                    'classic': 'classic',
                    'minimal': 'minimal',
                    'professional': 'professional',
                    'modern': 'modern',
                    'executive': 'executive',
                    'template1free': 'template1free',
                    'template2': 'template2',
                    'template3': 'template3'
                };

                const templateFile = templateMap[templateId] || 'template1free';
                const populatedHtml = await populateTemplate(templateFile, resumeData);
                setHtml(populatedHtml);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [templateId, resumeData]);

    return { html, loading, error };
};

export default TemplateRenderer;
