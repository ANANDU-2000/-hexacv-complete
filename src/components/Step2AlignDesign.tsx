import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { A4_WIDTH, A4_HEIGHT } from '../constants';
import ResumeRenderer from './ResumeRenderer';
import { calculateATSScore } from '../services/geminiService';

interface Step2AlignDesignProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onDataChange: (data: ResumeData) => void;
    onNext: () => void;
    onBack: () => void;
}

const Step2AlignDesign: React.FC<Step2AlignDesignProps> = ({ data, selectedTemplate, onDataChange, onNext, onBack }) => {
    const [role, setRole] = useState(data.basics.targetRole || '');
    const [jd, setJd] = useState(data.jobDescription || '');
    const [isAligning, setIsAligning] = useState(false);
    const [previewScale, setPreviewScale] = useState(0.5);
    const [pageCount, setPageCount] = useState(1);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const contentMeasureRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const padding = 100;
                const availableWidth = width - padding;
                const availableHeight = height - padding;
                const scaleW = availableWidth / A4_WIDTH;
                const scaleH = availableHeight / A4_HEIGHT;
                const finalScale = Math.min(scaleW, scaleH, 1.0);
                setPreviewScale(Math.max(finalScale, 0.1));
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

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

    const handleAlign = async () => {
        if (!role || jd.length < 120) return;
        setIsAligning(true);
        try {
            const metrics = await calculateATSScore({ ...data, basics: { ...data.basics, targetRole: role }, jobDescription: jd });
            onDataChange({ ...data, basics: { ...data.basics, targetRole: role }, jobDescription: jd, atsMetrics: metrics });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAligning(false);
        }
    };

    const isFormValid = role.trim() !== '' && jd.trim().length >= 120;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-white animate-in slide-in-from-right-10 duration-700">
            {/* LEFT: 55% ATS Strategy */}
            <div className="lg:w-[55%] h-full overflow-y-auto bg-slate-50/40 border-r border-slate-100 p-8 lg:p-20 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <header className="mb-16">
                        <div className="inline-flex bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">Phase 03</div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Final ATS Calibration</h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Target a specific role to tailor your content. Our AI will analyze your match strength using industrial keyword clustering.
                        </p>
                    </header>

                    <section className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-200/50 mb-12">
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Target Professional Role
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                </label>
                                <input
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    placeholder="e.g. Senior Product Manager"
                                    className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-2 border-slate-50 focus:border-slate-900 focus:bg-white outline-none text-sm font-bold transition-all shadow-inner"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Job Description Requirements</label>
                                <textarea
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                    placeholder="Paste the key requirements and responsibilities here..."
                                    className="w-full h-64 px-8 py-7 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 focus:border-slate-900 focus:bg-white outline-none text-sm font-medium leading-relaxed resize-none transition-all shadow-inner custom-scrollbar"
                                />
                                <div className="flex justify-between px-2 pt-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${jd.length < 120 ? 'text-red-400' : 'text-green-500'}`}>
                                        {jd.length} / 120 chars
                                    </span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Mandatory Alignment Check</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAlign}
                                disabled={!isFormValid || isAligning}
                                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                {isAligning ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Analyzing Match Strength...
                                    </>
                                ) : 'Run ATS Intelligence Match'}
                            </button>
                        </div>
                    </section>

                    <div className="flex items-center justify-between pt-10 pb-20">
                        <button onClick={onBack} className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:text-slate-900 transition-colors group">
                            ← Change Layout
                        </button>
                        {data.atsMetrics && (
                            <button
                                onClick={onNext}
                                className="bg-blue-600 text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl active:scale-[0.98] animate-in slide-in-from-bottom-5"
                            >
                                Final Review →
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: 45% High-Fidelity Preview */}
            <div className="lg:w-[45%] bg-slate-950 flex flex-col overflow-hidden relative shadow-inner">
                <div className="p-8 border-b border-white/5 flex justify-between items-center z-10 bg-slate-900/60 backdrop-blur-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em] mb-1">Live Synthesis</span>
                        <h3 className="text-white font-bold text-sm tracking-tight">{selectedTemplate.name} • Calibration Mode</h3>
                    </div>
                    {data.atsMetrics && (
                        <div className="bg-green-500 text-white px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-green-400/20 shadow-xl shadow-green-500/10 animate-in zoom-in">
                            {data.atsMetrics.score}% Match
                        </div>
                    )}
                </div>

                <div
                    ref={previewContainerRef}
                    className="flex-1 flex flex-col items-center justify-start p-12 overflow-y-auto custom-scrollbar relative group bg-[#020617]"
                >
                    {isAligning && (
                        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in">
                            <div className="w-14 h-14 border-[3px] border-white/10 border-t-white rounded-full animate-spin mb-6" />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400">Comparing Weighted Keywords...</span>
                        </div>
                    )}

                    {data.atsMetrics && (
                        <div className="sticky top-0 left-0 w-full z-30 mb-8 flex flex-wrap gap-3">
                            {data.atsMetrics.missingKeywords.slice(0, 4).map((k, i) => (
                                <div key={i} className="bg-red-500/10 backdrop-blur-md border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-red-200 uppercase tracking-widest">Missing: {k}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className="shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] bg-white rounded-sm overflow-hidden mb-20 relative transition-transform duration-700 ease-out"
                        style={{
                            width: `${A4_WIDTH}px`,
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <div ref={contentMeasureRef}>
                            <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                        </div>

                        <div className="absolute bottom-8 right-8 z-10 bg-slate-900/90 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/10 shadow-2xl">
                            {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Standard
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">A4 Scale: {Math.round(previewScale * 100)}% • Real-time Synthetic Preview</p>
                </div>
            </div>
        </div>
    );
};

export default Step2AlignDesign;
