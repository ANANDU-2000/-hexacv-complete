import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { A4_WIDTH, A4_HEIGHT } from '../constants';
import ResumeRenderer from './ResumeRenderer';
import { refineResumeSummary, refineExperienceHighlights } from '../services/geminiService';
import { ChevronLeft, Sparkles, Plus, X, Eye, EyeOff, Lock as LucideLock } from 'lucide-react';

interface Step3FinalizeProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onChange: (data: ResumeData) => void;
    onBack: () => void;
}

const Step3Finalize: React.FC<Step3FinalizeProps> = ({ data, selectedTemplate, onChange, onBack }) => {
    const [previewScale, setPreviewScale] = useState(0.8);
    const [userZoom, setUserZoom] = useState(1);
    const [showPayment, setShowPayment] = useState(false);
    const [refiningId, setRefiningId] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState(1);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const contentMeasureRef = useRef<HTMLDivElement>(null);

    // Auto-fit logic + observer
    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container) return;

        const calculateBaseScale = () => {
            const { width } = container.getBoundingClientRect();
            const padding = window.innerWidth < 1024 ? 40 : 80;
            const availableWidth = width - padding;

            const scaleW = availableWidth / A4_WIDTH;
            setPreviewScale(Math.min(scaleW, 1.1));
        };

        calculateBaseScale();
        const resizeObserver = new ResizeObserver(calculateBaseScale);
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [showMobilePreview]); // Re-calculate when mobile preview toggles

    // Detect content height for multi-page indicators
    useEffect(() => {
        const measure = contentMeasureRef.current;
        if (!measure) return;

        const updatePageCount = () => {
            const height = measure.scrollHeight;
            const count = Math.max(1, Math.ceil(height / A4_HEIGHT));
            setPageCount(count);
        };

        const obs = new MutationObserver(updatePageCount);
        obs.observe(measure, { childList: true, subtree: true, characterData: true });
        updatePageCount();

        return () => obs.disconnect();
    }, [data, selectedTemplate]);

    const handleRefineSummary = async () => {
        setRefiningId('summary');
        setIsFinalizing(true);
        try {
            const refined = await refineResumeSummary(data.summary, data.basics.targetRole, data.jobDescription || '');
            onChange({ ...data, summary: refined });
        } finally {
            setRefiningId(null);
            setIsFinalizing(false);
        }
    };

    const handleRefineExp = async (idx: number) => {
        const exp = data.experience[idx];
        setRefiningId(exp.id);
        setIsFinalizing(true);
        try {
            const refined = await refineExperienceHighlights(exp.highlights, exp.position, exp.company, data.jobDescription || '');
            const newExp = [...data.experience];
            newExp[idx] = { ...exp, highlights: refined };
            onChange({ ...data, experience: newExp });
        } finally {
            setRefiningId(null);
            setIsFinalizing(false);
        }
    };

    const finalScale = previewScale * userZoom;

    return (
        <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-80px)] overflow-hidden bg-white animate-in slide-in-from-right-10 duration-700">
            {/* LEFT: Field Editor */}
            <div className={`w-full lg:w-[50%] h-full overflow-y-auto bg-white border-r border-slate-100 p-6 md:p-10 lg:p-16 custom-scrollbar ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>
                <div className="max-w-4xl mx-auto space-y-10 lg:space-y-16 pb-40">
                    <header className="mb-8 lg:mb-12">
                        <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 hover:text-slate-900 transition-colors">
                            <ChevronLeft size={14} /> Back to Templates
                        </button>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">Phase 03</div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">Final Polish</h2>
                        <p className="text-slate-400 text-base md:text-lg font-medium mt-2 leading-relaxed">Quantify impact. Use keywords. AI is ready to optimize your bullets.</p>
                    </header>

                    <div className="space-y-10">
                        {/* Identity Group */}
                        <div className="space-y-6 lg:space-y-8">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" /> Identity Fields
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <input value={data.basics.fullName} onChange={(e) => onChange({ ...data, basics: { ...data.basics, fullName: e.target.value } })} className="md:col-span-2 px-6 py-4 lg:py-5 rounded-[1.2rem] lg:rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold transition-all shadow-inner" placeholder="Full Professional Name" />
                                <input value={data.basics.email} onChange={(e) => onChange({ ...data, basics: { ...data.basics, email: e.target.value } })} className="px-6 py-4 lg:py-5 rounded-[1.2rem] lg:rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold transition-all shadow-inner" placeholder="Email Address" />
                                <input value={data.basics.phone} onChange={(e) => onChange({ ...data, basics: { ...data.basics, phone: e.target.value } })} className="px-6 py-4 lg:py-5 rounded-[1.2rem] lg:rounded-[1.5rem] bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-bold transition-all shadow-inner" placeholder="Phone Number" />
                            </div>
                        </div>

                        {/* Profile Summary */}
                        <div className="space-y-6 lg:space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                                    <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" /> Narrative Summary
                                </h3>
                                <button
                                    onClick={handleRefineSummary}
                                    disabled={refiningId === 'summary'}
                                    className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl border border-blue-100 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 shadow-sm flex items-center gap-2"
                                >
                                    <Sparkles size={12} />
                                    {refiningId === 'summary' ? 'Refining...' : 'AI Rewrite'}
                                </button>
                            </div>
                            <textarea
                                value={data.summary}
                                onChange={(e) => onChange({ ...data, summary: e.target.value })}
                                className="w-full h-40 lg:h-44 px-6 lg:px-8 py-5 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-slate-900 outline-none text-sm font-medium leading-relaxed resize-none transition-all shadow-inner"
                                placeholder="Professional career narrative..."
                            />
                        </div>

                        {/* Work History */}
                        <div className="space-y-8 lg:space-y-10">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4 lg:pb-6">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Professional History</h3>
                                <button onClick={() => onChange({ ...data, experience: [{ id: Math.random().toString(36).substr(2, 9), company: '', position: '', startDate: '', endDate: '', highlights: [''] }, ...data.experience] })} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add Position</button>
                            </div>
                            <div className="space-y-8 lg:space-y-12">
                                {data.experience.map((exp, idx) => (
                                    <div key={exp.id || idx} className="bg-slate-50/40 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border-2 border-slate-50 space-y-6 lg:space-y-8 relative group transition-all hover:border-slate-200">
                                        <div className="absolute top-4 lg:top-8 right-4 lg:right-8 flex gap-2 lg:gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleRefineExp(idx)} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                                <Sparkles size={18} className={refiningId === exp.id ? 'animate-spin' : ''} />
                                            </button>
                                            <button onClick={() => onChange({ ...data, experience: data.experience.filter((_, i) => i !== idx) })} className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-600 transition-all">
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 pt-8 lg:pt-0">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Company</label>
                                                <input value={exp.company} onChange={(e) => { const n = [...data.experience]; n[idx].company = e.target.value; onChange({ ...data, experience: n }) }} className="w-full px-5 py-3 lg:py-4 rounded-[1rem] lg:rounded-[1.2rem] border-2 border-white bg-white focus:border-slate-900 outline-none text-xs font-bold shadow-sm" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                                <input value={exp.position} onChange={(e) => { const n = [...data.experience]; n[idx].position = e.target.value; onChange({ ...data, experience: n }) }} className="w-full px-5 py-3 lg:py-4 rounded-[1rem] lg:rounded-[1.2rem] border-2 border-white bg-white focus:border-slate-900 outline-none text-xs font-bold shadow-sm" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantified Achievements</label>
                                            {exp.highlights.map((h, hIdx) => (
                                                <div key={hIdx} className="flex gap-2 lg:gap-3">
                                                    <textarea
                                                        value={h}
                                                        onChange={(e) => { const n = [...data.experience]; n[idx].highlights[hIdx] = e.target.value; onChange({ ...data, experience: n }) }}
                                                        className="flex-1 px-5 py-3 lg:py-4 rounded-[1rem] lg:rounded-[1.2rem] border-2 border-white bg-white focus:border-slate-900 outline-none text-[12px] font-medium resize-none min-h-[60px] lg:min-h-[70px] leading-relaxed transition-all shadow-sm"
                                                        placeholder="Action verb + Result + Metric..."
                                                    />
                                                    <button onClick={() => { const n = [...data.experience]; n[idx].highlights = n[idx].highlights.filter((_, i) => i !== hIdx); onChange({ ...data, experience: n }) }} className="text-slate-200 hover:text-red-500 transition-colors p-1">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => { const n = [...data.experience]; n[idx].highlights.push(''); onChange({ ...data, experience: n }) }} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">+ New Bullet</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Final A4 Frame */}
            <div className={`${showMobilePreview ? 'flex w-full' : 'hidden'} lg:flex lg:w-[50%] bg-slate-950 flex-col overflow-hidden relative shadow-inner`}>
                {/* Preview Panel Header */}
                <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-0 z-30 bg-slate-900/60 backdrop-blur-3xl sticky top-0">
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-2">Final Preview</div>
                        <h3 className="text-white font-black text-2xl md:text-3xl tracking-tighter">{selectedTemplate.name}</h3>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-1.5 md:p-2 rounded-xl border border-white/10">
                            <button onClick={() => setUserZoom(z => Math.max(0.5, z - 0.1))} className="w-8 h-8 rounded-lg hover:bg-white/10 text-white font-bold transition-all">-</button>
                            <span className="text-[10px] font-black text-white w-10 md:w-12 text-center uppercase tracking-widest">{Math.round(finalScale * 100)}%</span>
                            <button onClick={() => setUserZoom(z => Math.min(1.5, z + 0.1))} className="w-8 h-8 rounded-lg hover:bg-white/10 text-white font-bold transition-all">+</button>
                        </div>
                        {/* ATS Status - Real data only, no fake scores */}
                        <div className="text-right">
                            {data.jobDescription && data.atsMetrics?.score !== undefined ? (
                                <>
                                    <div className="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] mb-1">
                                        Keyword Match
                                    </div>
                                    <div className="text-white font-black text-2xl md:text-3xl tracking-tighter leading-none">
                                        {data.atsMetrics.score}%
                                    </div>
                                    {data.atsMetrics.missingKeywords && data.atsMetrics.missingKeywords.length > 0 && (
                                        <div className="text-amber-400 text-[9px] font-semibold mt-1">
                                            {data.atsMetrics.missingKeywords.length} keywords to add
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">
                                        ATS Check
                                    </div>
                                    <div className="text-slate-500 font-bold text-sm tracking-tighter leading-none">
                                        Add JD for analysis
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    ref={previewContainerRef}
                    className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto custom-scrollbar relative group bg-[#020617]"
                >
                    {isFinalizing && (
                        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in">
                            <div className="w-16 h-16 border-[4px] border-white/10 border-t-white rounded-full animate-spin mb-8" />
                            <span className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-400">Updating Neural Frame...</span>
                        </div>
                    )}

                    <div
                        className="shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)] lg:shadow-[0_120px_240px_-40px_rgba(0,0,0,1)] bg-white rounded-sm overflow-hidden transition-all duration-700 relative"
                        style={{
                            width: `${A4_WIDTH}px`,
                            transform: `scale(${finalScale})`,
                            transformOrigin: 'top center',
                            marginBottom: `${Math.max(100, (finalScale * A4_HEIGHT) * 0.1)}px`,
                            transitionTimingFunction: 'cubic-bezier(0.23,1,0.32,1)'
                        }}
                    >
                        <div ref={contentMeasureRef} className="relative">
                            <ResumeRenderer data={data} config={selectedTemplate} scale={1} />

                            {/* PREMIUM LOCK OVERLAY */}
                            <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-white via-white/98 to-transparent backdrop-blur-[4px] z-10 flex flex-col items-center justify-end pb-28">
                                <div className="text-center space-y-6 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700 px-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl ring-8 ring-white">
                                        <LucideLock className="w-8 h-8 md:w-9 md:h-9 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-2">Structure & Page 2 Locked</h4>
                                        <p className="text-slate-500 text-sm md:text-lg font-medium">Export your finalized, ATS-safe professional career asset.</p>
                                        <div className="mt-4 md:mt-6 inline-flex bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Detected
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE CLOSE PREVIEW BUTTON */}
                <button
                    onClick={() => setShowMobilePreview(false)}
                    className="lg:hidden absolute bottom-28 right-6 w-14 h-14 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center z-[100] active:scale-95 transition-all"
                >
                    <EyeOff size={24} />
                </button>

                {/* PAYMENT BAR (Desktop or Mobile Preview) */}
                <div className="p-6 md:p-10 bg-[#020617] border-t border-white/10 flex flex-col md:flex-row gap-4 md:gap-8 items-center z-40">
                    <button onClick={onBack} className="hidden md:block px-8 py-5 text-slate-500 font-black uppercase text-[11px] tracking-[0.3em] hover:text-white transition-all">Adjust Design</button>
                    <button
                        onClick={() => setShowPayment(true)}
                        disabled={isFinalizing}
                        className="w-full flex-1 bg-slate-100 text-slate-950 py-5 lg:py-7 rounded-[1.5rem] lg:rounded-[2.2rem] font-black text-lg md:text-2xl hover:bg-white transition-all shadow-2xl transform active:scale-[0.97] flex items-center justify-center gap-3 md:gap-5 group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Download ATS Resume
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>

            {/* MOBILE FLOATING ACTIONS */}
            {!showMobilePreview && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-[80]">
                    <div className="flex gap-4 pointer-events-auto">
                        <button
                            onClick={() => setShowMobilePreview(true)}
                            className="flex-1 bg-white border border-slate-200 text-slate-900 h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            <Eye size={18} /> Preview final
                        </button>
                        <button
                            onClick={() => setShowPayment(true)}
                            className="flex-1 bg-slate-900 text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Download PDF
                        </button>
                    </div>
                </div>
            )}

            {/* PREMIUM PAYMENT MODAL */}
            {showPayment && (
                <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-[40px] z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-500 overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] md:rounded-[4.5rem] p-8 md:p-16 lg:p-20 max-w-2xl w-full shadow-2xl relative animate-in zoom-in duration-500 border border-slate-100 my-auto">
                        <button onClick={() => setShowPayment(false)} className="absolute top-8 right-8 md:top-16 md:right-16 text-slate-300 hover:text-slate-950 transition-colors">
                            <X size={32} />
                        </button>

                        <div className="text-center mb-8 md:mb-16">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 text-slate-900 rounded-[2rem] md:rounded-[3rem] flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-inner ring-1 ring-slate-100">
                                <Plus className="w-8 h-8 md:w-12 md:h-12" />
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 md:mb-4 tracking-tighter leading-none">Export Asset</h3>
                            <p className="text-slate-500 text-base md:text-xl font-medium">Finalize your high-resolution, ATS-optimized document.</p>
                        </div>

                        <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] mb-8 md:mb-16 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
                            <div className="flex flex-col text-left">
                                <span className="text-[9px] md:text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-3">Lifetime Access Pass</span>
                                <p className="text-slate-900 font-black text-xl md:text-3xl tracking-tighter leading-none">PDF Package</p>
                                <p className="text-slate-400 text-[10px] md:text-sm font-medium mt-2 md:mt-3">Unlimited edits & priority support</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">{(selectedTemplate as any).priceLabel || '₹49'}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => alert(`Your professional resume is ready! Simulation complete.`)}
                            className="w-full bg-slate-950 text-white py-6 md:py-9 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 md:gap-5"
                        >
                            Confirm & Unlock
                            <Sparkles size={24} />
                        </button>

                        <div className="mt-8 md:mt-12 text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] md:tracking-[0.4em]">Secure Payment & Verified Rendering</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3Finalize;
