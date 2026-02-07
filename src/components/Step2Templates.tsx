import React, { useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { A4_HEIGHT, A4_WIDTH, TEMPLATES } from '../constants';
import { TemplateRenderer, generatePDFFromHTMLTemplate } from '../template-renderer';
import FeedbackPopup from './FeedbackPopup';

interface Step2TemplatesProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    templates?: TemplateConfig[];
    onSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onNext: () => void;
    onDataChange?: (data: ResumeData) => void;
    onGoToHomepage?: () => void;
}

const Step2Templates: React.FC<Step2TemplatesProps> = ({ data, selectedTemplate, templates = TEMPLATES, onSelect, onBack, onGoToHomepage }) => {
    // State
    const [zoom, setZoom] = useState(0.75);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPreviewPage, setCurrentPreviewPage] = useState(1);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Quality validation - blocks download if errors found
    const validateResumeQuality = (): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!data.basics?.fullName?.trim()) {
            errors.push('Full name is required');
        }
        if (!data.basics?.email?.trim()) {
            errors.push('Email is required');
        }
        if (!data.summary?.trim() && (!data.experience || data.experience.length === 0)) {
            errors.push('Resume must have a summary or at least one experience entry');
        }
        if (totalPages > 3) {
            errors.push(`Resume is ${totalPages} pages. Consider condensing to 2-3 pages max.`);
        }

        // Critical section checks
        if (!data.experience || data.experience.length === 0) {
            errors.push('Work Experience is missing. A strong resume needs at least one job role.');
        }

        if (!data.skills || data.skills.length === 0) {
            errors.push('Skills section is empty. Add your key technical and soft skills for ATS optimization.');
        }

        if (!data.education || data.education.length === 0) {
            errors.push('Education is missing. Add your highest degree or certification.');
        }

        const expWithoutDates = data.experience?.filter(exp => !exp.startDate);
        if (expWithoutDates && expWithoutDates.length > 0) {
            errors.push('All experience entries must have start dates');
        }

        return { valid: errors.length === 0, errors };
    };

    const isResumeIncomplete = !data.basics?.fullName?.trim() || !data.basics?.email?.trim();

    // Mouse wheel zoom - Only activate when Ctrl/Cmd key is pressed
    const handleWheelZoom = (e: React.WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) {
            // Allow normal scrolling when Ctrl/Cmd is not pressed
            return;
        }
        e.preventDefault();
        if (e.deltaY < 0) {
            setZoom(z => Math.min(1.5, z + 0.05));
        } else {
            setZoom(z => Math.max(0.25, z - 0.05));
        }
    };

    // Download handler with validation - triggers download directly
    const handleDownload = async () => {
        const validation = validateResumeQuality();
        if (!validation.valid) {
            alert('Cannot download. Please fix these issues:\n\n' + validation.errors.join('\n\n'));
            return;
        }

        try {
            setProcessing(true);
            await generatePDFFromHTMLTemplate(selectedTemplate.id, data);
            setShowFeedbackPopup(true);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleFeedbackSubmit = async () => {
        setShowFeedbackPopup(false);
        setTimeout(() => {
            window.location.hash = '#/feedback-success';
        }, 1000);
    };

    const handleRedirectToHomepage = () => {
        if (onGoToHomepage) {
            onGoToHomepage();
        } else {
            window.location.hash = '#/';
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#f3f4f6' }}>
            {/* TOP NAVIGATION BAR */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        ← Back to Editor
                    </button>
                    <div className="border-l border-slate-300 pl-4 hidden sm:block">
                        <h2 className="text-sm font-black text-slate-950">Resume Preview</h2>
                        <span className="text-[10px] text-slate-500">{selectedTemplate.name}</span>
                    </div>
                </div>

                {/* PAGE NAVIGATION - CENTERED IN TOP BAR */}
                {totalPages > 1 && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setCurrentPreviewPage(p => Math.max(1, p - 1))}
                            disabled={currentPreviewPage === 1}
                            className={`p-1 w-8 h-8 flex items-center justify-center rounded-md transition-colors ${currentPreviewPage === 1 ? 'text-slate-300' : 'text-slate-700 hover:bg-white shadow-sm'}`}
                            title="Previous Page"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>

                        <span className="text-xs font-bold text-slate-700 min-w-[60px] text-center select-none">
                            {currentPreviewPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPreviewPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPreviewPage === totalPages}
                            className={`p-1 w-8 h-8 flex items-center justify-center rounded-md transition-colors ${currentPreviewPage === totalPages ? 'text-slate-300' : 'text-slate-700 hover:bg-white shadow-sm'}`}
                            title="Next Page"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                )}

                {/* Zoom Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setZoom(z => Math.max(0.25, z - 0.1))}
                            className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-lg font-bold transition-all shadow-sm border border-slate-200"
                            title="Zoom Out"
                        >
                            −
                        </button>

                        {/* Preset Zoom Levels */}
                        <div className="flex items-center mx-1 gap-0.5">
                            {[0.5, 0.75, 1.0].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setZoom(level)}
                                    className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${Math.abs(zoom - level) < 0.05
                                        ? 'bg-slate-800 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {level * 100}%
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                            className="w-7 h-7 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center text-lg font-bold transition-all shadow-sm border border-slate-200"
                            title="Zoom In"
                        >
                            +
                        </button>

                        <div className="w-[1px] h-4 bg-slate-300 mx-1"></div>

                        <button
                            onClick={() => {
                                // Calculate fit width (approximate based on standard screen)
                                const viewerWidth = window.innerWidth - 64; // padding
                                const fitZoom = Math.min(1.2, Math.max(0.4, viewerWidth / (A4_WIDTH + 64)));
                                setZoom(fitZoom);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-all flex items-center gap-1"
                            title="Fit Width"
                        >
                            <span className="hidden sm:inline">FIT</span> ↔
                        </button>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={processing || isResumeIncomplete}
                        className="px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {processing ? '...' : isResumeIncomplete ? 'Fill' : 'Download'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden">
                {/* MOBILE VIEW: HORIZONTAL SWIPE */}
                <div className="lg:hidden flex-1 overflow-x-auto snap-x snap-mandatory flex items-start gap-6 px-6 pt-10 pb-20 no-scrollbar" style={{ background: '#f3f4f6' }}>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <div
                            key={idx}
                            className="snap-center shrink-0 shadow-2xl bg-white rounded-sm overflow-hidden"
                            style={{
                                width: 'calc(100vw - 48px)',
                                height: `calc((100vw - 48px) * ${A4_HEIGHT / A4_WIDTH})`,
                                maxWidth: '400px',
                                maxHeight: '565px'
                            }}
                        >
                            <div style={{
                                transform: `scale(${(window.innerWidth - 48) / A4_WIDTH})`,
                                transformOrigin: 'top left',
                                width: `${A4_WIDTH}px`,
                                height: `${A4_HEIGHT}px`
                            }}>
                                <TemplateRenderer
                                    templateId={selectedTemplate.id}
                                    resumeData={data}
                                    currentPage={idx + 1}
                                    onPageCountChange={setTotalPages}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* DESKTOP VIEW: SINGLE PAGE WITH ZOOM */}
                <div
                    className="hidden lg:flex flex-1 overflow-x-auto overflow-y-auto"
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

                    {/* Centered container for zoomed content - SINGLE PAGE VIEW */}
                    <div className="document-viewer min-h-full flex flex-col items-center justify-start pt-8 pb-8 w-full">
                        <div
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center',
                                transition: 'transform 0.2s ease',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Render ONLY Current Page */}
                            <div className="relative group transition-opacity duration-300">
                                {/* A4 Page - Clean Professional Look */}
                                <div
                                    style={{
                                        width: `${A4_WIDTH}px`,
                                        height: `${A4_HEIGHT}px`,
                                        background: 'white',
                                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                                        marginBottom: '20px'
                                    }}
                                >
                                    <TemplateRenderer
                                        templateId={selectedTemplate.id}
                                        resumeData={data}
                                        currentPage={currentPreviewPage}
                                        onPageCountChange={setTotalPages}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK POPUP */}
            {showFeedbackPopup && (
                <FeedbackPopup
                    isOpen={showFeedbackPopup}
                    onClose={() => setShowFeedbackPopup(false)}
                    onSubmit={handleFeedbackSubmit}
                    templateName={selectedTemplate.name}
                    onRedirect={handleRedirectToHomepage}
                />
            )}
        </div>
    );
};

export default Step2Templates;
