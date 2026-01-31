import React, { useEffect, useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { TEMPLATES } from '../constants';
import { TemplateRenderer } from '../template-renderer';
import { initiatePayment } from '../payment-service';
import { generatePDFFromTemplate } from '../template-engine';
import FeedbackPopup from './FeedbackPopup';
import PaymentSuccessPopup from './PaymentSuccessPopup';
import { FileText, Sparkles, Award, CheckCircle } from 'lucide-react';

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
            // Improved error handling with user-friendly messages
            const errorMessage = error.message || 'Payment failed. Please try again.';
            console.error('Payment error:', error);
            
            // Show more helpful error messages
            if (errorMessage.includes('timeout') || errorMessage.includes('Network')) {
                alert('Connection timeout. Please check your internet connection and try again.');
            } else if (errorMessage.includes('cancelled')) {
                // User cancelled - no need to show error
                console.log('Payment cancelled by user');
            } else {
                alert(errorMessage);
            }
        } finally {
            setProcessing(false);
        }
    };

    // Handle download with feedback popup
    const handleDownload = async (template: TemplateConfig) => {
        const templatePrice = (template as any).finalPrice ?? template.price;
        const isFree = templatePrice === 0;

        // For free templates, skip payment and go directly to download
        if (isFree || isTemplateUnlocked(template.id)) {
            // Generate and download PDF
            try {
                setProcessing(true);

                // For paid template (template2), apply AI rewrite before generating PDF
                let finalData = data;
                if (template.id === 'template2') {
                    const { applyPaidAIRewrite, applyRewriteToResumeData } = await import('../services/paidAIRewriteService');
                    const rewriteOutput = await applyPaidAIRewrite(data, data.jobDescription);
                    finalData = applyRewriteToResumeData(data, rewriteOutput);
                }

                await generatePDFFromTemplate(template.id, finalData);

                // Show feedback popup instead of alert
                setShowFeedbackPopup(true);

                // Also log the download event
                console.log('✅ PDF downloaded successfully:', template.id);

            } catch (error) {
                alert('Download failed. Please try again.');
            } finally {
                setProcessing(false);
            }
        } else {
            // For paid templates, trigger payment flow
            await handlePurchase(template);
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
            const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://api.hexacv.online');
            await fetch(`${apiBase}/api/feedback`, {
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
            setZoom(z => Math.min(1.2, z + 0.05));
        } else {
            setZoom(z => Math.max(0.4, z - 0.05));
        }
    };

    const handleFullscreenWheelZoom = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setFullscreenZoom(z => Math.min(2.0, z + 0.05));
        } else {
            setFullscreenZoom(z => Math.max(0.4, z - 0.05));
        }
    };

    return (
        <div className="fixed inset-0 top-0 flex flex-col bg-white overflow-hidden">
            {/* TOP NAVIGATION - Clean Mobile Design */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                    <div className="border-l border-gray-200 pl-3">
                        <div className="inline-flex bg-gray-900 text-white px-2 py-1 rounded text-xs font-medium">Step 3</div>
                        <h2 className="text-sm font-semibold text-gray-900 inline ml-2">Choose Template</h2>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (selectedTemplate) {
                            handleDownload(selectedTemplate);
                        }
                    }}
                    disabled={!selectedTemplate || processing || isResumeIncomplete}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isTemplateUnlocked(selectedTemplate.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {processing ? 'Processing...' : isResumeIncomplete ? 'Complete Form First' : isTemplateUnlocked(selectedTemplate.id) ? 'Download PDF' : `Unlock ${(selectedTemplate as any).priceLabel ?? '₹0'}`}
                </button>
            </div>

            {/* RESPONSIVE SPLIT LAYOUT */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* LEFT SIDE: Template Cards Grid */}
                <div
                    className="w-full md:w-[55%] bg-gray-50 p-4 md:p-6 flex-1 md:flex-none overflow-y-auto md:overflow-y-scroll"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <style>{`
                        .w-full.md\\:w-\\[55\\%\\]::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {/* Template Grid */}
                    <div className="grid grid-cols-1 gap-6 md:gap-5 max-w-md mx-auto md:max-w-none md:grid-cols-2 pb-6">
                        {templates.filter(t => t.enabled).map((tpl, idx) => {
                            const templatePrice = (tpl as any).finalPrice ?? tpl.price;
                            const isFree = templatePrice === 0;
                            const isUnlocked = isTemplateUnlocked(tpl.id);
                            const isSelected = selectedTemplate.id === tpl.id;

                            // Colorful icons for each template
                            const iconColor = idx === 0 ? 'text-blue-500' : 'text-purple-500';
                            const IconComponent = idx === 0 ? FileText : Sparkles;

                            return (
                                <div
                                    key={tpl.id}
                                    className="group bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 ease-out hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-1 cursor-pointer"
                                >
                                    {/* A4 Preview Card - Compact */}
                                    <div className="relative bg-gray-50 p-4 transition-all duration-300 group-hover:bg-gray-100" style={{ minHeight: '180px' }}>
                                        {/* TOP PICK Badge */}
                                        {isFree && (
                                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-medium transition-transform duration-300 group-hover:scale-105">
                                                <Award size={12} strokeWidth={2} />
                                                <span>TOP PICK</span>
                                            </div>
                                        )}

                                        {/* Resume Preview - Smaller Frame */}
                                        <div className="flex items-center justify-center h-full pt-2">
                                            <div
                                                className="bg-white shadow-lg border border-bw-border/50 rounded transition-all duration-300 group-hover:shadow-xl group-hover:shadow-blue-200/30 group-hover:scale-[1.02]"
                                                style={{
                                                    width: '140px',
                                                    height: '180px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div style={{ transform: 'scale(0.167)', transformOrigin: 'top left', width: '840px', height: '1080px' }}>
                                                    <TemplateRenderer
                                                        templateId={tpl.id}
                                                        resumeData={data}
                                                        currentPage={1}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Label */}
                                        <div className="absolute bottom-2 left-0 right-0 text-center">
                                            <span className="text-[10px] font-medium text-bw-gray-500">Preview</span>
                                        </div>
                                    </div>

                                    {/* Template Info */}
                                    <div className="p-4 space-y-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg ${idx === 0 ? 'bg-blue-500' : 'bg-purple-500'} flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                                                <IconComponent size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:rotate-3" />
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">{tpl.name}</h3>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{tpl.description}</p>

                                        {/* Why This Works Section */}
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 transition-all duration-300 group-hover:bg-blue-50/30 group-hover:border-blue-200">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <CheckCircle className={`w-3.5 h-3.5 ${idx === 0 ? 'text-blue-600' : 'text-purple-600'} transition-transform duration-300 group-hover:scale-110`} strokeWidth={2} />
                                                <span className={`text-xs font-medium ${idx === 0 ? 'text-blue-600' : 'text-purple-600'}`}>Why This Works</span>
                                            </div>
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                {tpl.id === 'template1free'
                                                    ? 'Puts your achievements first. Recruiters scan for 6 seconds—make every second count.'
                                                    : 'AI-enhanced bullet points that showcase impact with quantifiable metrics.'}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => {
                                                onSelect(tpl);
                                                setCurrentPage(1);
                                            }}
                                            className={`w-full py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isSelected
                                                    ? `${idx === 0 ? 'bg-blue-600' : 'bg-purple-600'} text-white shadow-md`
                                                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                                                }`}
                                        >
                                            {isSelected ? 'SELECTED' : 'CONTINUE TO PREVIEW'}
                                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT SIDE: Live Preview */}
                <div className="hidden md:flex md:w-[45%] bg-white flex-col border-l border-gray-200">
                    {/* Compact Header */}
                    <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wide">Live Preview</h3>
                            <span className="text-xs text-gray-600">{selectedTemplate.name}</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowFullscreen(true);
                            }}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-all"
                        >
                            Full Preview
                        </button>
                    </div>

                    {/* A4 Preview Area */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
                        {/* Zoom Controls Bar */}
                        <div className="flex items-center justify-center gap-3 py-2.5 px-4 bg-white border-b border-gray-200 z-10">
                            <button
                                onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-medium transition-all"
                            >
                                −
                            </button>
                            <span className="text-xs font-medium text-gray-600 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
                            <button
                                onClick={() => setZoom(z => Math.min(1.2, z + 0.1))}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-medium transition-all"
                            >
                                +
                            </button>
                        </div>

                        {/* Scrollable Preview Area - Hidden scrollbar */}
                        <div
                            className="flex-1 overflow-auto p-6 flex items-start justify-center"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none'
                            }}
                            onWheel={handleWheelZoom}
                        >
                            <style>{`
                                .flex-1.overflow-auto::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            <div
                                className="transition-transform duration-bw ease-bw-smooth"
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top center',
                                }}
                            >
                                {/* A4 Page - Clean white with subtle border */}
                                <div
                                    className="bg-bw-white shadow-bw-card"
                                    style={{
                                        border: '1px solid #E0E0E0',
                                        width: 'fit-content'
                                    }}
                                >
                                    <TemplateRenderer
                                        templateId={selectedTemplate.id}
                                        resumeData={data}
                                        currentPage={currentPage}
                                        onPageCountChange={handlePageCountChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Buttons with Navigation */}
                    <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>

                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            {totalPages > 1 && (
                                <span className="text-xs text-gray-600 ml-2">Page {currentPage} of {totalPages}</span>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                if (selectedTemplate) {
                                    handleDownload(selectedTemplate);
                                }
                            }}
                            disabled={!selectedTemplate || processing || isResumeIncomplete}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processing...' : isTemplateUnlocked(selectedTemplate.id) ? 'Download' : 'Next'}
                        </button>
                    </div>
                </div>

                {/* MOBILE: Floating Preview Button */}
                <button
                    onClick={() => setShowFullscreen(true)}
                    className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all"
                    aria-label="View Preview"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
            </div>

            {/* FULLSCREEN PREVIEW - Premium Black Theme with Vertical Scroll + Zoom */}
            {showFullscreen && (
                <div
                    className="fixed inset-0 z-[9999] flex flex-col bg-gradient-to-br from-slate-900 via-black to-slate-900"
                    onClick={() => setShowFullscreen(false)}
                >
                    {/* Top Bar - Minimal Dark Theme with Zoom Controls */}
                    <div className="px-4 py-3 flex items-center justify-between bg-black/90 backdrop-blur-sm border-b border-white/10 relative z-20">
                        <div>
                            <span className="text-white text-xs font-semibold">Full Preview</span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Zoom Controls */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFullscreenZoom(z => Math.max(0.4, z - 0.1));
                                }}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all text-lg font-bold"
                            >
                                −
                            </button>
                            <span className="text-white text-xs font-medium min-w-[50px] text-center">{Math.round(fullscreenZoom * 100)}%</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFullscreenZoom(z => Math.min(1.5, z + 0.1));
                                }}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all text-lg font-bold"
                            >
                                +
                            </button>

                            {/* Close */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFullscreen(false);
                                }}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all ml-2"
                            >
                                <span className="text-lg">✕</span>
                            </button>
                        </div>
                    </div>

                    {/* A4 Pages View - Vertical Scroll with Black Background */}
                    <div
                        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 relative z-10"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={handleFullscreenWheelZoom}
                    >
                        <style>{`
                            .overflow-y-auto::-webkit-scrollbar {
                                width: 8px;
                            }
                            .overflow-y-auto::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .overflow-y-auto::-webkit-scrollbar-thumb {
                                background: rgba(255,255,255,0.2);
                                border-radius: 4px;
                            }
                            .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                                background: rgba(255,255,255,0.3);
                            }
                        `}</style>

                        {/* Container for all pages - vertical layout */}
                        <div className="flex flex-col gap-6 items-center">
                            {/* Render ALL pages vertically */}
                            {Array.from({ length: fullscreenTotalPages }, (_, i) => i + 1).map(pageNum => (
                                <div key={pageNum} className="flex flex-col items-center">
                                    {/* Page Number */}
                                    <div className="mb-2">
                                        <span className="text-xs font-medium text-white/50">
                                            Page {pageNum} of {fullscreenTotalPages}
                                        </span>
                                    </div>

                                    {/* A4 Page with zoom */}
                                    <div
                                        className="bg-white shadow-2xl transition-transform duration-200"
                                        style={{
                                            width: '210mm',
                                            height: '297mm',
                                            transform: `scale(${fullscreenZoom})`,
                                            transformOrigin: 'top center'
                                        }}
                                    >
                                        <TemplateRenderer
                                            templateId={selectedTemplate.id}
                                            resumeData={data}
                                            currentPage={pageNum}
                                            onPageCountChange={pageNum === 1 ? handleFullscreenPageCountChange : undefined}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Bar - Dark Theme with Download */}
                    <div className="px-4 py-3 bg-black/90 backdrop-blur-sm border-t border-white/10 flex items-center justify-between relative z-20">
                        <div className="flex items-center gap-2">
                            <span className="text-white/50 text-xs font-medium">{fullscreenTotalPages} {fullscreenTotalPages === 1 ? 'Page' : 'Pages'}</span>
                            {fullscreenTotalPages > 1 && (
                                <span className="text-white/30 text-xs">• Scroll to view all</span>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(selectedTemplate);
                                setShowFullscreen(false);
                            }}
                            disabled={processing || isResumeIncomplete}
                            className="px-5 py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 bg-white text-black hover:bg-slate-200 active:scale-95"
                        >
                            {processing ? 'Processing...' : isTemplateUnlocked(selectedTemplate.id) ? 'Download' : 'Unlock'}
                        </button>
                    </div>
                </div>
            )}

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
