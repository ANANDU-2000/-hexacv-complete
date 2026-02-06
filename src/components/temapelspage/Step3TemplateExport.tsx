import React, { useEffect, useState } from 'react';
import { ResumeData, TemplateConfig } from '../../types';
import { TEMPLATES } from '../../constants';
import { TemplateRenderer } from '../../template-renderer';
import { initiatePayment } from '../../payment-service';
import { generatePDFFromTemplate } from '../../template-engine';
import FeedbackPopup from '../FeedbackPopup';
import PaymentSuccessPopup from '../PaymentSuccessPopup';

interface Step3TemplateExportProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    templates?: TemplateConfig[];
    onSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onNext: () => void;
    onGoToHomepage?: () => void; // New: navigate to homepage after feedback
}

const Step3TemplateExport: React.FC<Step3TemplateExportProps> = ({ data, selectedTemplate, templates = TEMPLATES, onSelect, onBack, onGoToHomepage }) => {
    // Check if resume has minimum required content
    const isResumeIncomplete = !data.basics.fullName?.trim() || !data.basics.email?.trim() || !data.summary?.trim();

    // Preview state
    const [zoom, setZoom] = useState(0.55); // Right panel default zoom (55%)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fullscreen modal state
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenZoom, setFullscreenZoom] = useState(0.8);
    const [fullscreenTotalPages, setFullscreenTotalPages] = useState(1);

    // Payment state
    const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    const [purchasedTemplate, setPurchasedTemplate] = useState<TemplateConfig | null>(null);

    // Generate unique user session ID
    const [sessionId] = useState(() => {
        const existingId = localStorage.getItem('user_session_id');
        if (existingId) {
            return existingId;
        }
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_session_id', newId);
        return newId;
    });

    // Check unlocked templates from localStorage (per-user session)
    useEffect(() => {
        const unlocked = localStorage.getItem(`unlocked_templates_${sessionId}`);
        if (unlocked) {
            setUnlockedTemplates(JSON.parse(unlocked));
        }
    }, [sessionId]);

    // Handle page count updates from TemplateRenderer
    const handlePageCountChange = (count: number) => {
        setTotalPages(count);
    };

    const handleFullscreenPageCountChange = (count: number) => {
        setFullscreenTotalPages(count);
    };

    // Check if template is unlocked
    const isTemplateUnlocked = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        return template && ((template as any).finalPrice === 0 || unlockedTemplates.includes(templateId));
    };

    // Handle payment for paid templates
    const handlePurchase = async (template: TemplateConfig) => {
        if (processing) return;

        setProcessing(true);
        try {
            const result = await initiatePayment(
                template.id,
                template.name,
                data.basics.email,
                data.basics.phone
            );

            if (result.success && result.templateId) {
                // Unlock template locally (per-user session)
                const updated = [...unlockedTemplates, result.templateId];
                setUnlockedTemplates(updated);
                localStorage.setItem(`unlocked_templates_${sessionId}`, JSON.stringify(updated));

                // Show PaymentSuccessPopup instead of alert
                setPurchasedTemplate(template);
                setShowPaymentSuccess(true);
            }
        } catch (error: any) {
            alert(error.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle download with feedback popup
    const handleDownload = async (template: TemplateConfig) => {
        // Validate resume quality before allowing download
        const validation = validateResumeQuality();
        if (!validation.valid) {
            alert('Cannot download. Please fix these issues:\n\n' + validation.errors.join('\n\n'));
            return;
        }

        if (!isTemplateUnlocked(template.id)) {
            // Trigger payment flow
            await handlePurchase(template);
            return;
        }

        // Generate and download PDF
        try {
            setProcessing(true);

            // For paid template (template2), apply AI rewrite before generating PDF
            let finalData = data;
            if (template.id === 'template2') {
                const { applyPaidAIRewrite, applyRewriteToResumeData } = await import('../../services/paidAIRewriteService');
                const rewriteOutput = await applyPaidAIRewrite(data, data.jobDescription);
                finalData = applyRewriteToResumeData(data, rewriteOutput);
            }

            await generatePDFFromTemplate(template.id, finalData);

            // Show feedback popup instead of alert
            setShowFeedbackPopup(true);

            // Also log the download event
            console.log('PDF downloaded successfully:', template.id);

        } catch (error) {
            alert('Download failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle redirect to homepage
    const handleRedirectToHomepage = () => {
        if (onGoToHomepage) {
            onGoToHomepage(); // Use the provided callback
        } else {
            // Fallback to hash routing if not provided
            window.location.hash = '#/feedback-success';
        }
    };

    // Handle feedback submission
    const handleFeedbackSubmit = async (feedback: { rating: number; message: string; userName: string }) => {
        try {
            console.log('Feedback submitted:', feedback, 'Template:', selectedTemplate.id);

            // Send feedback to backend API
            await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...feedback,
                    templateId: selectedTemplate.id,
                    sessionId
                })
            });

            // Close feedback popup and redirect to homepage after delay
            setShowFeedbackPopup(false);

            // Auto-redirect to homepage after successful download and feedback
            setTimeout(() => {
                window.location.hash = '#/feedback-success'; // Navigate to homepage with success flag
            }, 1000);

        } catch (error) {
            console.error('Failed to save feedback:', error);
            // Still redirect even if feedback failed
            setShowFeedbackPopup(false);
            setTimeout(() => {
                window.location.hash = '#/feedback-success';
            }, 1000);
        }
    };

    // Mouse wheel zoom handler
    const handleWheelZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setZoom(z => Math.min(1.5, z + 0.05));
        } else {
            setZoom(z => Math.max(0.3, z - 0.05));
        }
    };

    const handleFullscreenWheelZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setFullscreenZoom(z => Math.min(2.0, z + 0.05));
        } else {
            setFullscreenZoom(z => Math.max(0.3, z - 0.05));
        }
    };

    // Quality validation function - blocks download if errors found
    const validateResumeQuality = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        // 1. Check required fields
        if (!data.basics?.fullName?.trim()) {
            errors.push('Full name is required');
        }
        if (!data.basics?.email?.trim()) {
            errors.push('Email is required');
        }
        
        // 2. Check resume not empty
        if (!data.summary?.trim() && (!data.experience || data.experience.length === 0)) {
            errors.push('Resume must have a summary or at least one experience entry');
        }
        
        // 3. Check page count (warn if too long)
        if (totalPages > 3) {
            errors.push(`Resume is ${totalPages} pages. Consider condensing to 2-3 pages max for better ATS compatibility.`);
        }
        
        // 4. Check dates are present in experience
        const expWithoutDates = data.experience?.filter(exp => !exp.startDate);
        if (expWithoutDates && expWithoutDates.length > 0) {
            errors.push('All experience entries must have start dates for ATS parsing');
        }
        
        return { valid: errors.length === 0, errors };
    };

    return (
        <div className="fixed inset-0 top-0 flex flex-col overflow-hidden" style={{ background: '#f3f4f6' }}>
            {/* TOP NAVIGATION BAR */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        ← Back to Editor
                    </button>
                    <div className="border-l border-slate-300 pl-4">
                        <h2 className="text-sm font-black text-slate-950">Resume Preview</h2>
                        <span className="text-[10px] text-slate-500">{totalPages} {totalPages === 1 ? 'page' : 'pages'} - {selectedTemplate.name}</span>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
                        <button
                            onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
                            className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-lg font-bold transition-all shadow-sm"
                        >
                            −
                        </button>
                        <span className="text-[11px] font-bold text-slate-600 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                            className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-lg font-bold transition-all shadow-sm"
                        >
                            +
                        </button>
                        <button
                            onClick={() => setZoom(0.5)}
                            className="ml-1 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all"
                        >
                            Fit
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            if (selectedTemplate) {
                                handleDownload(selectedTemplate);
                            }
                        }}
                        disabled={!selectedTemplate || processing || isResumeIncomplete}
                        className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isTemplateUnlocked(selectedTemplate.id)
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                    >
                        {processing ? 'Processing...' : isResumeIncomplete ? 'Fill Resume First' : isTemplateUnlocked(selectedTemplate.id) ? 'Download PDF' : `Pay ${(selectedTemplate as any).priceLabel ?? '₹0'}`}
                    </button>
                </div>
            </div>

            {/* FULL-WIDTH HORIZONTAL DOCUMENT VIEWER */}
            <div
                className="flex-1 overflow-x-auto overflow-y-auto"
                style={{
                    background: '#f3f4f6',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#94a3b8 #e2e8f0'
                }}
                onWheel={handleWheelZoom}
            >
                <style>{`
                    .document-viewer::-webkit-scrollbar { height: 14px; width: 14px; }
                    .document-viewer::-webkit-scrollbar-track { background: #e2e8f0; }
                    .document-viewer::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 7px; border: 3px solid #e2e8f0; }
                    .document-viewer::-webkit-scrollbar-thumb:hover { background: #64748b; }
                    .document-viewer::-webkit-scrollbar-corner { background: #e2e8f0; }
                `}</style>
                
                {/* Centered container for zoomed content */}
                <div
                    className="document-viewer min-h-full flex items-start justify-center p-8"
                >
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        {/* All A4 Pages Side-by-Side - Horizontal Layout */}
                        <div className="flex flex-row gap-10">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <div key={pageNum} className="flex flex-col items-center">
                                    {/* Page Label */}
                                    <div className="mb-3">
                                        <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                                            Page {pageNum}
                                        </span>
                                    </div>
                                    
                                    {/* A4 Page - Clean, no card frame */}
                                    <div
                                        style={{
                                            background: 'white',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                                            flexShrink: 0
                                        }}
                                    >
                                        <TemplateRenderer
                                            templateId={selectedTemplate.id}
                                            resumeData={data}
                                            currentPage={pageNum}
                                            onPageCountChange={pageNum === 1 ? handlePageCountChange : undefined}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK POPUP AFTER DOWNLOAD */}
            {showFeedbackPopup && (
                <FeedbackPopup
                    isOpen={showFeedbackPopup}
                    onClose={() => setShowFeedbackPopup(false)}
                    onSubmit={handleFeedbackSubmit}
                    templateName={selectedTemplate.name}
                    onRedirect={handleRedirectToHomepage}
                />
            )}

            {/* PAYMENT SUCCESS POPUP */}
            {showPaymentSuccess && purchasedTemplate && (
                <PaymentSuccessPopup
                    isOpen={showPaymentSuccess}
                    onClose={() => setShowPaymentSuccess(false)}
                    onDownload={() => handleDownload(purchasedTemplate)}
                    templateName={purchasedTemplate.name}
                    amount={purchasedTemplate.price ?? 0}
                />
            )}
        </div>
    );
};

export default Step3TemplateExport;
