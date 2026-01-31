import React, { useState, useRef, useEffect } from 'react';
import { ResumeData, TemplateConfig } from '../../types';
import { TemplateRenderer } from '../../template-renderer';
import { generatePDFFromTemplate } from '../../template-engine';
import FeedbackPopup from '../FeedbackPopup';
import { A4_WIDTH } from '../../constants';
import { A4_DIMENSIONS } from '../../a4-page-system';
import {
    X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Eye, Search, Maximize2, FileText
} from 'lucide-react';

interface MobileFinalPreviewProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onBack: () => void;
    onNext?: () => void;
}

const MobileFinalPreview: React.FC<MobileFinalPreviewProps> = ({ data, selectedTemplate, onBack, onNext }) => {
    const [processing, setProcessing] = useState(false);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [zoom, setZoom] = useState(0.45); // Better zoom for mobile visibility
    const [currentPage, setCurrentPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);
    const [showStep3Preview, setShowStep3Preview] = useState(false);
    const [aiRewrittenData, setAiRewrittenData] = useState<ResumeData>(data);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const isPaidTemplate = (selectedTemplate as any).price > 0;

    const isTemplateUnlocked = (templateId: string) => {
        const sessionId = localStorage.getItem('user_session_id');
        const unlocked = JSON.parse(localStorage.getItem(`unlocked_templates_${sessionId}`) || '[]');
        return (selectedTemplate as any).finalPrice === 0 || unlocked.includes(templateId);
    };

    const unlocked = isTemplateUnlocked(selectedTemplate.id);

    const mergeResumeData = (original: ResumeData, rewritten: ResumeData): ResumeData => ({
        ...original,
        ...rewritten,
        basics: { ...original.basics, ...rewritten.basics }
    });

    const generateAIRewrittenData = async (originalData: ResumeData): Promise<ResumeData> => {
        const targetRole = originalData.basics.targetRole || 'Software Engineer';
        const targetMarket = (originalData.basics.targetMarket as any) || 'india';
        const experienceLevel = (originalData.basics.experienceLevel as any) || '1-3';

        let rewrittenSummary = originalData.summary;

        try {
            const { fixGrammarOnly, rewriteWithConstraints } = await import('../../services/honestAIRewriteService');
            const { extractJDKeywords } = await import('../../services/openaiService');
            const jdKeywords = extractJDKeywords(originalData.jobDescription || '');

            if (originalData.summary) {
                const summaryResult = await fixGrammarOnly(originalData.summary, {
                    role: targetRole,
                    experienceLevel
                });
                rewrittenSummary = summaryResult.rewritten || originalData.summary;
            }

            const rewrittenExperience = await Promise.all(
                (originalData.experience || []).map(async (exp) => {
                    const rewrittenHighlights = await Promise.all(
                        (exp.highlights || []).map(async (bullet) => {
                            const result = await rewriteWithConstraints({
                                mode: 'rewrite',
                                role: targetRole,
                                market: targetMarket,
                                experienceLevel,
                                jdKeywords: jdKeywords.length > 0 ? jdKeywords : undefined,
                                originalText: bullet
                            });
                            return result.rewritten;
                        })
                    );
                    return { ...exp, highlights: rewrittenHighlights };
                })
            );

            return {
                ...originalData,
                summary: rewrittenSummary,
                experience: rewrittenExperience
            };
        } catch (err) {
            console.warn('Mobile AI rewrite failed, using original:', err);
            return originalData;
        }
    };

    useEffect(() => {
        if (selectedTemplate.id !== 'template2') {
            setAiRewrittenData(data);
            return;
        }
        let cancelled = false;
        generateAIRewrittenData(data)
            .then((rewritten) => {
                if (!cancelled) {
                    setAiRewrittenData(rewritten);
                }
            })
            .catch((err) => {
                console.warn('Mobile AI rewrite generation failed:', err);
                if (!cancelled) {
                    setAiRewrittenData(data);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [data, selectedTemplate.id]);

    const previewData = selectedTemplate.id === 'template2'
        ? mergeResumeData(data, aiRewrittenData)
        : data;

    // Entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // Disable right-click for security
    useEffect(() => {
        const preventContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const previewArea = document.getElementById('preview-area');
        if (previewArea) {
            previewArea.addEventListener('contextmenu', preventContextMenu);
            return () => previewArea.removeEventListener('contextmenu', preventContextMenu);
        }
    }, []);

    // Scroll handling for page counter
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollPos = container.scrollTop;
        const pageHeight = A4_DIMENSIONS.HEIGHT * zoom + 24; // margin gap
        const newPage = Math.floor((scrollPos + pageHeight / 3) / pageHeight) + 1;
        if (newPage !== currentPage && newPage > 0 && newPage <= pageCount) {
            setCurrentPage(newPage);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(1.5, prev + 0.1));
    const handleZoomOut = () => setZoom(prev => Math.max(0.3, prev - 0.1));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pageCount, prev + 1));

    const scrollToPage = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > pageCount) return;
        if (scrollContainerRef.current) {
            const pageHeight = A4_DIMENSIONS.HEIGHT * zoom + 24;
            scrollContainerRef.current.scrollTo({
                top: (pageNumber - 1) * pageHeight,
                behavior: 'smooth'
            });
            setCurrentPage(pageNumber);
        }
    };

    const handleDownload = () => {
        if (isPaidTemplate && !isTemplateUnlocked(selectedTemplate.id)) {
            setShowPaymentModal(true);
        } else {
            // Trigger download for unlocked templates
            handleDirectDownload();
        }
    };

    const handleDirectDownload = async () => {
        if (processing) return;

        try {
            setProcessing(true);

            const finalData = selectedTemplate.id === 'template2'
                ? previewData
                : data;

            await generatePDFFromTemplate(selectedTemplate.id, finalData);
            setShowFeedbackPopup(true);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setProcessing(false);
        }
    };

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
                    sessionId: localStorage.getItem('user_session_id')
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

    const handleRedirectToHomepage = () => {
        window.location.hash = '#/feedback-success';
    };

    const handlePaymentSuccess = async (templateId: string) => {
        const sessionId = localStorage.getItem('user_session_id');
        const unlockedList = JSON.parse(localStorage.getItem(`unlocked_templates_${sessionId}`) || '[]');
        unlockedList.push(templateId);
        localStorage.setItem(`unlocked_templates_${sessionId}`, JSON.stringify(unlockedList));

        // Close modal and trigger download
        setShowPaymentModal(false);
        await handleDirectDownload();
    };

    if (showStep3Preview) {
        return (
            <>
                {/* Full Screen Modal Overlay */}
                <div
                    className={`
                        fixed inset-0 bg-[#F5F5F7]/95 backdrop-blur-xl z-[9999]
                        flex flex-col
                        ${isAnimating ? 'animate-in fade-in duration-500' : ''}
                    `}
                >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200/50 bg-[#F5F5F7]/80 backdrop-blur-md">
                        {/* Left: Back Button */}
                        <button
                            onClick={() => setShowStep3Preview(false)}
                            className="flex items-center gap-2 text-black/40 hover:text-black transition-colors group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-widest">Back</span>
                        </button>

                        {/* Center: Template Name */}
                        <div className="text-center">
                            <h2 className="text-black font-black text-[11px] tracking-widest uppercase">{selectedTemplate.name}</h2>
                            <p className="text-black/20 text-[9px] font-black uppercase tracking-widest">Focus Mode</p>
                        </div>

                        {/* Right: Close Button */}
                        <button
                            onClick={() => setShowStep3Preview(false)}
                            className="p-2 text-black/40 hover:text-black transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Main Preview Area */}
                    <div
                        id="preview-area"
                        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 select-none no-scrollbar"
                        style={{ userSelect: 'none' }}
                    >
                        <div
                            className={`
                                relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-sm
                                transition-all duration-500 ease-out
                                ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                            `}
                            style={{
                                width: `${A4_WIDTH}px`,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center center',
                            }}
                        >
                            {/* Watermark Overlay for Paid Templates */}
                            {isPaidTemplate && !isTemplateUnlocked(selectedTemplate.id) && (
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/5 to-transparent"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-[0.03]">
                                        <div className="text-black text-6xl font-black uppercase tracking-wider">
                                            Preview Only
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resume Content */}
                            <div className="relative">
                                <TemplateRenderer
                                    templateId={selectedTemplate.id}
                                    resumeData={previewData}
                                    currentPage={currentPage}
                                    onPageCountChange={(count) => {
                                        if (count !== pageCount) {
                                            setPageCount(count);
                                            if (currentPage > count) setCurrentPage(count);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="flex items-center justify-between px-8 py-6 border-t border-gray-200/50 bg-[#F5F5F7]/80 backdrop-blur-md">
                        {/* Left: Zoom Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.3}
                                className="p-2 text-black/30 hover:text-black transition-all disabled:opacity-10"
                            >
                                <ZoomOut size={18} />
                            </button>
                            <span className="text-black font-black text-[11px] uppercase tracking-widest w-16 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                disabled={zoom >= 1.5}
                                className="p-2 text-black/30 hover:text-black transition-all disabled:opacity-10"
                            >
                                <ZoomIn size={18} />
                            </button>
                        </div>

                        {/* Center: Page Navigation */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="p-2 text-black/30 hover:text-black transition-all disabled:opacity-10"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-black font-black text-[11px] uppercase tracking-widest">
                                Page {currentPage} / {pageCount}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === pageCount}
                                className="p-2 text-black/30 hover:text-black transition-all disabled:opacity-10"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Right: Download/Payment Button */}
                        <button
                            onClick={handleDownload}
                            className={`
                                h-12 px-8 rounded-xl font-black text-[11px] uppercase tracking-widest
                                transition-all duration-300
                                bg-white text-black border-2 border-black active:scale-95 flex items-center gap-2 shadow-sm
                            `}
                        >
                            {isPaidTemplate && !isTemplateUnlocked(selectedTemplate.id) ? (
                                <>
                                    <Lock size={14} />
                                    <span>Unlock Premium</span>
                                </>
                            ) : (
                                <>
                                    <Download size={14} />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[99999] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-500">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="inline-flex bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl mb-6 shadow-lg">
                                    <Lock size={32} className="text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                    Unlock Premium Template
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Get instant access to this professionally designed template. No watermarks, no restrictions.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 font-bold">Premium Template</span>
                                    <span className="text-2xl font-black text-slate-900">₹{(selectedTemplate as any).price || 99}</span>
                                </div>
                                <div className="pt-3 border-t border-slate-200 space-y-2 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span>ATS-Optimized Layout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span>Instant PDF Download</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span>Lifetime Access & Edits</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    // All templates are free - just download
                                    await handleDownload();
                                    setShowPaymentModal(false);
                                }}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                <span>Download Free Resume</span>
                            </button>

                            <p className="mt-6 text-center text-xs text-slate-400 font-medium">
                                100% Free - No payment required
                            </p>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className={`
            fixed inset-0 bg-[#F5F5F7] z-[9999] flex flex-col font-sans
            ${isAnimating ? 'animate-in fade-in duration-500' : ''}
        `}>
            {/* Minimal Floating Page Indicator */}
            <div className="fixed top-0 left-0 right-0 z-[100] h-14 flex items-center justify-center pointer-events-none">
                <div className="px-3 py-1.5 bg-black/10 backdrop-blur-md rounded-full pointer-events-auto">
                    <span className="text-[10px] font-bold text-black/60 tabular-nums">
                        {currentPage} / {pageCount}
                    </span>
                </div>
            </div>

            {/* Document Viewer */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 relative overflow-y-auto overflow-x-hidden p-4 pt-16 pb-24 flex flex-col items-center gap-6 select-none"
            >
                {Array.from({ length: pageCount }).map((_, idx) => (
                    <div
                        key={idx + 1}
                        className={`
                            relative bg-white shadow-xl transition-all duration-700
                            ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                        `}
                        style={{
                            width: `${A4_DIMENSIONS.WIDTH * zoom}px`,
                            height: `${A4_DIMENSIONS.HEIGHT * zoom}px`,
                        }}
                    >
                        {/* Page Content */}
                        <div
                            className="origin-top-left absolute inset-0 pointer-events-none"
                            style={{ transform: `scale(${zoom})`, width: A4_DIMENSIONS.WIDTH, height: A4_DIMENSIONS.HEIGHT }}
                        >
                            <TemplateRenderer
                                templateId={selectedTemplate.id}
                                resumeData={previewData}
                                currentPage={idx + 1}
                                onPageCountChange={(count) => {
                                    if (idx === 0 && count !== pageCount) setPageCount(count);
                                }}
                            />
                        </div>

                        {/* Paid Overlay */}
                        {isPaidTemplate && !unlocked && idx === pageCount - 1 && (
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-[1px] z-30 flex flex-col items-center justify-end pb-10 px-6 text-center">
                                <div className="bg-black text-white px-4 py-2 rounded-full mb-2 shadow-lg">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Premium Template</span>
                                </div>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Unlock Full Access</p>
                            </div>
                        )}
                    </div>
                ))}

                <div className="py-12 flex flex-col items-center gap-4 opacity-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                    <span className="text-[8px] font-black uppercase tracking-[0.5em]">End of Document</span>
                </div>
            </div>

            {/* Compact Bottom Bar - Download + Zoom */}
            <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60" />
                
                <div className="relative px-4 py-3 flex items-center gap-3">
                    {/* Back button */}
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    
                    {/* Zoom controls */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                        <button onClick={handleZoomOut} className="text-gray-500 active:text-black">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-[10px] font-bold text-gray-600 w-8 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={handleZoomIn} className="text-gray-500 active:text-black">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    
                    {/* Download button */}
                    <button
                        onClick={handleDownload}
                        disabled={processing}
                        className="flex-1 h-10 rounded-xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Download size={16} />
                                <span>Download</span>
                            </>
                        )}
                    </button>
                    
                    {/* Focus button */}
                    <button
                        onClick={() => setShowStep3Preview(true)}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Maximize2 size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
            {showFeedbackPopup && (
                <FeedbackPopup
                    isOpen={showFeedbackPopup}
                    onClose={() => setShowFeedbackPopup(false)}
                    onSubmit={handleFeedbackSubmit}
                    onRedirect={handleRedirectToHomepage}
                    templateName={selectedTemplate.name}
                />
            )}
        </div>
    );
};

export default MobileFinalPreview;
