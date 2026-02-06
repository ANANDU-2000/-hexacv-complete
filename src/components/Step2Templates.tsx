import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { ResumeData, TemplateConfig } from '../types';
import { A4_HEIGHT, A4_WIDTH, TEMPLATES } from '../constants';
import { TemplateRenderer } from '../template-renderer';
import { generatePDFFromTemplate } from '../template-engine';
import { getTemplateColors } from '../utils/templateColors';
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
    // Check if resume has minimum required content
    const isResumeIncomplete = !data.basics.fullName?.trim() || !data.basics.email?.trim() || !data.summary?.trim();

    // State
    const [zoom, setZoom] = useState(window.innerWidth < 768 ? 0.35 : 0.55);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenZoom, setFullscreenZoom] = useState(0.8);
    const [fullscreenTotalPages, setFullscreenTotalPages] = useState(1);
    const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
    const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // PERSISTENCE FOR UNLOCKED TEMPLATES
    const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>(() => {
        const saved = localStorage.getItem('unlocked_templates');
        return saved ? JSON.parse(saved) : ['template1free'];
    });

    useEffect(() => {
        localStorage.setItem('unlocked_templates', JSON.stringify(unlockedTemplates));
    }, [unlockedTemplates]);

    // HELPERS
    const isTemplateUnlocked = (id: string) => {
        const tpl = templates.find(t => t.id === id);
        if (!tpl) return true;
        if ((tpl as any).price === 0) return true;
        return unlockedTemplates.includes(id);
    };

    const handlePurchase = async (template: TemplateConfig) => {
        setProcessing(true);
        // SIMULATE PURCHASE FLOW
        // In a real app, this would call Razorpay/Stripe
        await new Promise(resolve => setTimeout(resolve, 1500));

        setUnlockedTemplates(prev => [...prev, template.id]);
        setProcessing(false);
        alert(`Successfully unlocked ${template.name}! You can now download it.`);
    };

    // Generate unique user session ID
    const [sessionId] = useState(() => {
        const existingId = localStorage.getItem('user_session_id');
        if (existingId) return existingId;
        const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_session_id', newId);
        return newId;
    });

    // DYNAMIC SCALING FOR THUMBNAILS
    const gridRef = React.useRef<HTMLDivElement>(null);
    const [dynamicScale, setDynamicScale] = useState(0.25);

    useEffect(() => {
        if (!gridRef.current) return;
        const updateScale = () => {
            if (gridRef.current) {
                const containerWidth = gridRef.current.clientWidth;
                // md:grid-cols-2 starts at 768px
                const isDesktop = window.innerWidth >= 768;
                const gap = 24; // gap-6
                const padding = 4; // border-2 is 2px each side = 4px total deduction? Actually flow content is inside.
                // gridRef is the container. Inside are columns.
                const columns = isDesktop ? 2 : 1;
                const columnWidth = (containerWidth - (isDesktop ? gap : 0)) / columns;
                // Subtract 4px for borders just in case, though box-sizing usually handles it.
                // Target width is 794px.
                const newScale = (columnWidth - 4) / 794;
                setDynamicScale(Math.max(0.1, newScale));
            }
        };

        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(gridRef.current);
        updateScale(); // Initial call

        window.addEventListener('resize', updateScale); // Also listen to window resize for breakpoint change

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, []);

    // RULE-BASED ENGINE FOR PREVIEW
    const extractKeywords = (text: string): string[] => {
        const stopWords = new Set(['the', 'and', 'for', 'with', 'using', 'from', 'into', 'that', 'this', 'was', 'were', 'has', 'have', 'had']);
        const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        const keywords = new Set<string>();
        const techPatterns = /react|angular|vue|node|python|java|aws|docker|kubernetes|api|database|sql|nosql|agile|ci\/cd|git|typescript|javascript/gi;
        const matches = text.match(techPatterns) || [];
        (matches as string[]).forEach(m => keywords.add(m.toLowerCase()));
        return Array.from(keywords);
    };

    // Get AI-rewritten data for Template 2
    const [aiRewrittenData, setAiRewrittenData] = useState<ResumeData>(data);

    useEffect(() => {
        // Simplified mockup of AI rewriting for UI purposes
        const mockRewrite = { ...data };
        if (mockRewrite.experience?.[0]?.highlights?.[0]) {
            mockRewrite.experience[0].highlights[0] = "Architected and delivered high-impact features using modern technology stack, achieving 30% performance improvement and enhancing user engagement across platform.";
        }
        setAiRewrittenData(mockRewrite);
    }, [data]);

    const getTemplateData = (templateId: string): ResumeData => {
        if (templateId === 'template2' || templateId === 'professional') {
            return aiRewrittenData;
        }
        return data;
    };

    const calculateATSMetrics = () => {
        const originalText = (data.experience?.flatMap(exp => exp.highlights) || []).join(' ');
        const rewrittenText = (aiRewrittenData.experience?.flatMap(exp => exp.highlights) || []).join(' ');

        const originalScore = Math.min(65, 45 + (originalText.match(/\d+/g)?.length || 0));
        const rewrittenScore = Math.min(98, 85 + (rewrittenText.match(/\d+/g)?.length || 0));

        return {
            original: { score: originalScore },
            rewritten: { score: rewrittenScore },
            improvements: {
                scoreGain: rewrittenScore - originalScore,
                metricsAdded: 4,
                keywordsAdded: 12
            }
        };
    };

    const atsMetrics = calculateATSMetrics();

    // HANDLERS
    const handleDownload = async (template: TemplateConfig) => {
        if (!isTemplateUnlocked(template.id)) {
            handlePurchase(template);
            return;
        }

        try {
            const finalData = getTemplateData(template.id);
            await generatePDFFromTemplate(template.id, finalData);
            setShowFeedbackPopup(true);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    };

    const handleRedirectToHomepage = () => {
        if (onGoToHomepage) onGoToHomepage();
        else window.location.hash = '#/feedback-success';
    };

    const handleFeedbackSubmit = async (feedback: any) => {
        setShowFeedbackPopup(false);
        setTimeout(() => {
            window.location.hash = '#/feedback-success';
        }, 1000);
    };

    return (
        <div className="fixed inset-0 top-0 flex flex-col bg-slate-900 overflow-hidden">
            {/* TOP NAV */}
            <div className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        ← Back
                    </button>
                    <div className="border-l border-slate-700 pl-3">
                        <h2 className="text-sm font-black text-white">Template Selection</h2>
                    </div>
                </div>
                <button
                    onClick={() => handleDownload(selectedTemplate)}
                    disabled={isResumeIncomplete || processing}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all shadow-md ${isTemplateUnlocked(selectedTemplate.id) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {processing ? 'Processing...' : isResumeIncomplete ? 'Fill Resume First' : isTemplateUnlocked(selectedTemplate.id) ? 'Download PDF' : `Unlock for ${(selectedTemplate as any).priceLabel}`}
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden">
                {/* GALLERY */}
                <div className="w-full xl:w-[58%] bg-slate-800 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                        {templates.map((tpl: any) => {
                            const isSelected = selectedTemplate.id === tpl.id;
                            const unlocked = isTemplateUnlocked(tpl.id);
                            const isAiTemplate = tpl.id === 'template2';
                            const isComingSoon = tpl.id === 'template2';

                            return (
                                <div
                                    key={tpl.id}
                                    onClick={() => !isComingSoon && onSelect(tpl)}
                                    className={`group relative flex flex-col ${isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className={`relative bg-slate-900 overflow-hidden border-2 rounded-xl transition-all duration-500 ease-out ${isComingSoon ? 'border-slate-700 opacity-80' : isSelected ? 'border-blue-500 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] ring-4 ring-blue-500/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-300 opacity-95 hover:opacity-100 shadow-xl'}`}>
                                        <div className="aspect-[210/297] bg-white relative overflow-hidden">
                                            {/* Resume Preview - Full Cover using Dynamic Scale */}
                                            <div
                                                className={`pointer-events-none w-full h-full transform transition-transform duration-700 origin-top-left ${isComingSoon ? 'blur-md grayscale' : 'group-hover:scale-[1.03]'}`}
                                                style={{
                                                    width: '794px',
                                                    height: '1123px',
                                                    transform: `scale(${dynamicScale})`
                                                }}
                                            >
                                                <TemplateRenderer
                                                    templateId={tpl.id}
                                                    resumeData={getTemplateData(tpl.id)}
                                                    currentPage={1}
                                                />
                                            </div>

                                            {isComingSoon ? (
                                                /* COMING SOON OVERLAY */
                                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px]">
                                                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30 animate-pulse">
                                                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-3 shadow-xl shadow-blue-900/40">
                                                        Coming Sooner
                                                    </div>
                                                    <h4 className="text-white text-sm font-black text-center mb-1 drop-shadow-lg">Next-Gen AI Engine</h4>
                                                    <p className="text-slate-300 text-[10px] text-center font-medium leading-relaxed max-w-[150px]">Currently in the lab. Releasing Very Soon.</p>

                                                    <div className="mt-6 flex flex-col gap-2 w-full max-w-[160px]">
                                                        {['Contextual Intelligence', 'Impact Prediction', 'Recruiter Tuning'].map((f, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest bg-white/5 py-1.5 px-3 rounded-lg border border-white/5">
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                                                {f}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* REGULAR INTERACTIVE OVERLAY */
                                                <div className="absolute inset-x-0 bottom-0 h-full z-20 pointer-events-none">

                                                    {/* Details Content (Full height when expanded) */}
                                                    <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-all duration-500 ease-in-out flex flex-col pointer-events-auto border-t border-white/10 ${expandedDetailsId === tpl.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                                                        <div className="h-full flex flex-col p-6 animate-in fade-in zoom-in-95 duration-500">
                                                            <div className="flex justify-between items-center mb-8">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                                        <h5 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Deep Analytics</h5>
                                                                    </div>
                                                                    <p className="text-sm font-black text-white tracking-tight">{tpl.name}</p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setExpandedDetailsId(null);
                                                                    }}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 shadow-2xl backdrop-blur-md"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>

                                                            <div className="flex-1 overflow-y-auto custom-scrollbar-thin pr-2 mb-8">
                                                                <div className="space-y-8 text-left">
                                                                    {isAiTemplate && (
                                                                        <section className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-inner">
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <h6 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Upgrade Insight</h6>
                                                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-lg border border-emerald-500/20 uppercase">Highly Recommended</span>
                                                                            </div>
                                                                            <p className="text-[12px] text-white font-bold leading-relaxed mb-6">
                                                                                Switching to this template boosts your ATS score to <span className="text-blue-400">87%</span> by leveraging AI-powered impact metrics and recruiter-preferred keywords.
                                                                            </p>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Impact Gain</p>
                                                                                    <p className="text-xl font-black text-emerald-400">+40%</p>
                                                                                </div>
                                                                                <div className="bg-slate-900/40 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                                                                                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">ATS Optimization</p>
                                                                                    <p className="text-xl font-black text-blue-400">High</p>
                                                                                </div>
                                                                            </div>
                                                                        </section>
                                                                    )}

                                                                    <section>
                                                                        <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 ml-1">Key Features & Benefits</h6>
                                                                        <ul className="space-y-4">
                                                                            {tpl.features?.map((feature: string, i: number) => (
                                                                                <li key={i} className="flex items-start gap-4 text-[11px] text-white leading-snug group/item">
                                                                                    <div className="mt-0.5 shrink-0 w-5 h-5 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover/item:bg-blue-500/40 transition-all shadow-lg border border-blue-500/20">
                                                                                        <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                                                        </svg>
                                                                                    </div>
                                                                                    <span className="font-bold group-hover/item:text-blue-200 transition-colors drop-shadow-md">{feature}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </section>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedDetailsId(null);
                                                                }}
                                                                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[0.98] active:scale-95 backdrop-blur-md shadow-2xl"
                                                            >
                                                                Close Details
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Hover Trigger Bar (Half cover) */}
                                                    {!expandedDetailsId && (
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/90 via-slate-900/80 to-transparent translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out flex flex-col items-center justify-end p-8 pb-10 z-20 pointer-events-auto backdrop-blur-[2px]">
                                                            <div className="text-white text-center space-y-5 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform group-hover:translate-y-0 translate-y-4">
                                                                {isAiTemplate ? (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-center gap-2 mb-1">
                                                                            <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-lg shadow-2xl border border-white/20">+40% GAIN</span>
                                                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest drop-shadow-lg">Recruiter Insight</span>
                                                                        </div>
                                                                        <p className="text-[12px] font-black leading-tight text-white max-w-[220px] mx-auto drop-shadow-2xl">Elevate your ATS score from 47% to <span className="text-blue-400">87%</span>.</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Starter Design</p>
                                                                        <p className="text-[12px] font-black leading-tight text-white drop-shadow-2xl">{tpl.description}</p>
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setExpandedDetailsId(tpl.id);
                                                                    }}
                                                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 border border-white/20"
                                                                >
                                                                    Inspect Excellence
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 z-40 flex gap-2">
                                                {isAiTemplate ? (
                                                    <div className="bg-blue-600/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow-2xl border border-white/20 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                        In Lab
                                                    </div>
                                                ) : unlocked ? (
                                                    tpl.price === 0 ? (
                                                        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow-2xl border border-white/20 flex items-center gap-1.5">
                                                            <div className="w-1 h-1 bg-white rounded-full" />
                                                            Professional
                                                        </div>
                                                    ) : (
                                                        <div className="bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow-2xl border border-white/20 flex items-center gap-1.5">
                                                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                                            Unlocked
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="bg-slate-950/80 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase shadow-2xl border border-white/10 flex items-center gap-1.5">
                                                        <span className="text-blue-400">Premium</span>
                                                        <span className="opacity-20">|</span>
                                                        {tpl.priceLabel}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 px-1 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className={`text-sm font-bold tracking-tight ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>{tpl.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{isSelected ? 'Active Choice' : tpl.category}</p>
                                        </div>
                                        {isSelected && (
                                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PREVIEW & DETAILS */}
                <div className="hidden xl:flex flex-1 bg-slate-950 flex-col border-l border-white/5 relative overflow-y-auto custom-scrollbar">

                    {/* FULLSCREEN TOGGLE BUTTON */}
                    <button
                        onClick={() => setShowFullscreen(true)}
                        className="absolute top-6 right-6 z-10 p-3 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl backdrop-blur-md border border-white/10 shadow-2xl transition-all hover:scale-110 active:scale-95 group"
                        title="View Full Screen"
                    >
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>

                    {/* TOP SECTION: LIVE PREVIEW PREVIEW */}
                    <div className="p-12 flex flex-col items-center gap-12">
                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                            <div
                                key={`${selectedTemplate.id}-page-${page}`}
                                className="bg-white shadow-2xl origin-top transition-all duration-500 hover:shadow-blue-500/10 mb-4"
                                style={{
                                    zoom: 0.65,
                                    width: `${A4_WIDTH}px`,
                                    height: `${A4_HEIGHT}px`,
                                    position: 'relative'
                                }}
                            >
                                <TemplateRenderer
                                    templateId={selectedTemplate.id}
                                    resumeData={getTemplateData(selectedTemplate.id)}
                                    currentPage={page}
                                    onPageCountChange={page === 1 ? setTotalPages : undefined}
                                />
                                {totalPages > 1 && (
                                    <div className="absolute -top-8 left-0 right-0 flex justify-center">
                                        <div className="bg-slate-800/80 backdrop-blur-sm text-slate-300 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-white/10 shadow-xl">
                                            Page {page} / {totalPages}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* BOTTOM SECTION: CTA ONLY */}
                    <div className="p-8 bg-slate-900/50 border-t border-white/5 mt-auto">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handleDownload(selectedTemplate)}
                                disabled={isResumeIncomplete || processing}
                                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-900/20 group uppercase tracking-widest text-xs"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        {isTemplateUnlocked(selectedTemplate.id) ? (
                                            <>
                                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5m0 0l5-5m-5 5V3" />
                                                </svg>
                                                Download PDF
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Unlock for {selectedTemplate.priceLabel}
                                            </>
                                        )}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-slate-500 font-medium">
                                Secure Payment • Instant Download • No Recurring Fees
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showFullscreen && (
                <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-200">
                    {/* FULLSCREEN HEADER */}
                    <div className="flex justify-between items-center px-6 py-4 bg-slate-900 border-b border-white/5 shadow-2xl z-50">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-wide">{selectedTemplate.name}</h3>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Live Preview Mode</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-white/5">
                                <button className="p-2 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white" title="Zoom Out" onClick={() => setFullscreenZoom(Math.max(0.5, fullscreenZoom - 0.1))}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                </button>
                                <span className="text-[10px] font-bold text-slate-300 w-8 text-center">{Math.round(fullscreenZoom * 100)}%</span>
                                <button className="p-2 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white" title="Zoom In" onClick={() => setFullscreenZoom(Math.min(1.5, fullscreenZoom + 0.1))}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowFullscreen(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/5 active:scale-95 group"
                            >
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 4H4m0 0v6m0-6l7 7m3-7h6m0 0v6m0-6l-7 7" />
                                </svg>
                                Minimize
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-900 flex flex-col items-center py-12 gap-12 custom-scrollbar">
                        {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map((page) => (
                            <div
                                key={`fullscreen-page-${page}`}
                                className="bg-white shadow-2xl relative transition-transform duration-200 ease-out origin-top"
                                style={{
                                    zoom: fullscreenZoom,
                                    width: `${A4_WIDTH}px`,
                                    height: `${A4_HEIGHT}px`
                                }}
                            >
                                <TemplateRenderer
                                    templateId={selectedTemplate.id}
                                    resumeData={getTemplateData(selectedTemplate.id)}
                                    currentPage={page}
                                />
                                <div className="absolute -top-8 left-0 right-0 flex justify-center">
                                    <div className="bg-slate-950/90 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-xl backdrop-blur-md">
                                        Page {page}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
