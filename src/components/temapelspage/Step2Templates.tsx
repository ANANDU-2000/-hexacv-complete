import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { TEMPLATES, A4_WIDTH, A4_HEIGHT } from '../constants';
import ResumeRenderer from './ResumeRenderer';
import { calculateATSScore } from '../services/geminiService';
import AuthoritativeTemplateSelector from './AuthoritativeTemplateSelector';
import { TemplateRecommendation } from '../ai-service';

interface Step2TemplatesProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onSelect: (template: TemplateConfig) => void;
    onDataChange: (data: ResumeData) => void;
    onBack: () => void;
    onNext: () => void;
}

const Step2Templates: React.FC<Step2TemplatesProps> = ({ data, selectedTemplate, onSelect, onDataChange, onBack, onNext }) => {
    const [previewScale, setPreviewScale] = useState(0.7);
    const [isAligning, setIsAligning] = useState(false);
    const [pageCount, setPageCount] = useState(1);
    const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([
        {
            templateId: 'tech',
            rank: 1,
            score: 94,
            reason: 'Optimal for technical roles with prominent skills section',
            confidence: 92,
            tradeOffs: ['Less visual appeal', 'ATS-focused layout']
        },
        {
            templateId: 'modern',
            rank: 2,
            score: 87,
            reason: 'Balanced approach with good technical presentation',
            confidence: 85,
            tradeOffs: ['Slightly complex layout', 'May confuse ATS']
        },
        {
            templateId: 'executive',
            rank: 3,
            score: 78,
            reason: 'Professional appearance but less technical focus',
            confidence: 75,
            tradeOffs: ['Not ATS-optimized', 'Hides technical skills']
        },
        {
            templateId: 'template1free',
            rank: 4,
            score: 65,
            reason: 'Basic ATS compatibility with minimal optimization',
            confidence: 60,
            tradeOffs: ['Limited features', 'Generic appearance']
        }
    ]);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const contentMeasureRef = useRef<HTMLDivElement>(null);

    // Auto-scale the preview to fit the container
    useEffect(() => {
        const container = previewContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const padding = 60;
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

    // Update page count
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

    const handleATSCheck = async () => {
        if (!data.jobDescription || data.jobDescription.length < 50) {
            alert("Please provide a more detailed Job Description in the editor first.");
            return;
        }
        setIsAligning(true);
        try {
            const metrics = await calculateATSScore(data);
            onDataChange({ ...data, atsMetrics: metrics });
        } catch (e) {
            console.error(e);
        } finally {
            setIsAligning(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-white animate-in fade-in duration-500">
            {/* LEFT: 60% Template Grid */}
            <div className="lg:w-[60%] h-full overflow-y-auto bg-slate-50/50 border-r border-slate-100 p-8 lg:p-12 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12 flex justify-between items-end">
                        <div>
                            <div className="inline-flex bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">Phase 02</div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Design & Optimization</h2>
                            <p className="text-slate-500 font-medium">Select a layout. Preview shows the final output.</p>
                        </div>
                        {data.jobDescription && (
                            <button
                                onClick={handleATSCheck}
                                disabled={isAligning}
                                className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 disabled:opacity-50"
                            >
                                {isAligning ? 'Auditing...' : 'Run ATS Audit'}
                            </button>
                        )}
                    </header>

                    <AuthoritativeTemplateSelector 
                        recommendations={recommendations}
                        onSelect={(templateId, config) => onSelect(config)}
                        selectedTemplate={selectedTemplate.id}
                    />

                    <div className="h-20" />
                </div>
            </div>

            {/* RIGHT: 40% Sticky Preview */}
            <div className="lg:w-[40%] bg-slate-950 flex flex-col items-center justify-start overflow-hidden relative">
                <div className="w-full p-8 border-b border-white/5 flex justify-between items-center z-10 bg-slate-900/60 backdrop-blur-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Live Synthesis</span>
                        <h3 className="text-white font-bold text-sm tracking-tight">{selectedTemplate.name} • {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}</h3>
                    </div>
                    {data.atsMetrics && (
                        <div className="bg-green-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in">
                            {data.atsMetrics.score}% Match
                        </div>
                    )}
                </div>

                <div
                    ref={previewContainerRef}
                    className="flex-1 w-full flex flex-col items-center justify-start overflow-y-auto custom-scrollbar p-10 bg-[#020617] group"
                >
                    {isAligning && (
                        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-white animate-in fade-in">
                            <div className="w-14 h-14 border-[3px] border-white/10 border-t-white rounded-full animate-spin mb-6" />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400">Auditing Content...</span>
                        </div>
                    )}

                    {data.atsMetrics && (
                        <div className="sticky top-0 left-0 w-full z-30 mb-8 flex flex-wrap gap-2">
                            {data.atsMetrics.missingKeywords.slice(0, 3).map((k, i) => (
                                <div key={i} className="bg-red-500/10 backdrop-blur-md border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black text-red-200 uppercase tracking-widest">Add: {k}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className="shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] bg-white rounded-sm overflow-hidden relative transition-all duration-700 ease-out"
                        style={{
                            width: `${A4_WIDTH}px`,
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <div ref={contentMeasureRef}>
                            <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                        </div>
                    </div>
                </div>

                <div className="w-full p-10 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex gap-6 z-20">
                    <button
                        onClick={onBack}
                        className="flex-1 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-white transition-colors"
                    >
                        ← Edit Content
                    </button>
                    <button
                        onClick={onNext}
                        className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-2xl active:scale-[0.98]"
                    >
                        Final Review →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step2Templates;
