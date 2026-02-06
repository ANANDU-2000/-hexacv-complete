import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import { TEMPLATES, A4_WIDTH, A4_HEIGHT } from '../constants';
import ResumeRenderer from './ResumeRenderer';
import { initiatePayment } from '../payment-service';
import { populateTemplate } from '../template-engine';

interface Step3TemplateExportProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onNext: () => void;
}

const Step3TemplateExport: React.FC<Step3TemplateExportProps> = ({ data, selectedTemplate, onSelect, onBack, onNext }) => {
    const [zoom, setZoom] = useState(1.0);
    const [totalPages, setTotalPages] = useState(1);
    const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    const measureRef = useRef<HTMLDivElement>(null);

    // Check unlocked templates
    useEffect(() => {
        const unlocked = localStorage.getItem('unlocked_templates');
        if (unlocked) {
            setUnlockedTemplates(JSON.parse(unlocked));
        }
    }, []);

    // Calculate page count
    useEffect(() => {
        if (!measureRef.current) return;
        const timer = setTimeout(() => {
            const height = measureRef.current?.scrollHeight || 0;
            const count = Math.max(1, Math.ceil(height / A4_HEIGHT));
            setTotalPages(count);
        }, 300);
        return () => clearTimeout(timer);
    }, [data, selectedTemplate]);

    // ESC key to close fullscreen
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && fullscreen) {
                setFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [fullscreen]);

    const isTemplateUnlocked = (templateId: string) => {
        const template = TEMPLATES.find(t => t.id === templateId);
        return template && (template.price === 0 || unlockedTemplates.includes(templateId));
    };

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
                const updated = [...unlockedTemplates, result.templateId];
                setUnlockedTemplates(updated);
                localStorage.setItem('unlocked_templates', JSON.stringify(updated));
                alert(`✓ ${template.name} unlocked! You can now download.`);
            }
        } catch (error: any) {
            alert(error.message || 'Payment failed.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = async (template: TemplateConfig) => {
        if (!isTemplateUnlocked(template.id)) {
            await handlePurchase(template);
            return;
        }

        try {
            setProcessing(true);
            
            const html = await populateTemplate(template.id, data);
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentWindow?.document;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(html);
                iframeDoc.close();

                setTimeout(() => {
                    iframe.contentWindow?.print();
                    setTimeout(() => document.body.removeChild(iframe), 1000);
                }, 500);
            }
            
            alert('✓ Resume downloaded successfully!');
        } catch (error) {
            alert('Download failed.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 top-0 flex bg-white overflow-hidden">
            {/* LEFT PANEL: 45% - Mini Template Cards */}
            <div className="w-[45%] h-full overflow-y-auto bg-white border-r border-slate-200 p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-6">
                        <h2 className="text-2xl font-black tracking-tight text-slate-950 mb-1">Choose Template</h2>
                        <p className="text-xs text-slate-500 font-medium">Select a template · Preview updates on right</p>
                    </header>

                    {/* 2-Column Grid of Mini Cards */}
                    <div className="grid grid-cols-2 gap-3 pb-6">
                        {TEMPLATES.filter(t => t.enabled).map((tpl) => {
                            const isFree = tpl.price === 0;
                            const isUnlocked = isTemplateUnlocked(tpl.id);
                            const isSelected = selectedTemplate.id === tpl.id;

                            return (
                                <div
                                    key={tpl.id}
                                    onClick={() => onSelect(tpl)}
                                    className={`group cursor-pointer transition-all duration-300 ${
                                        isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                                    }`}
                                >
                                    {/* Mini Card with A4 Ratio */}
                                    <div
                                        className={`relative bg-white rounded-xl overflow-hidden shadow-md border-2 transition-all duration-300 ${
                                            isSelected
                                                ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-xl'
                                                : 'border-slate-200 hover:border-slate-400 hover:shadow-lg'
                                        }`}
                                        style={{ aspectRatio: '210/297', height: '280px' }}
                                    >
                                        {/* Mini Preview (18% scale) */}
                                        <div className="absolute inset-0 overflow-hidden p-4 flex items-start justify-center bg-white">
                                            <div 
                                                className="origin-top"
                                                style={{ transform: 'scale(0.22)', width: `${A4_WIDTH}px` }}
                                            >
                                                <ResumeRenderer data={data} config={tpl} scale={1} />
                                            </div>
                                        </div>

                                        {/* Price Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            {isFree ? (
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md">
                                                    🔓 FREE
                                                </span>
                                            ) : isUnlocked ? (
                                                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md">
                                                    ✓ UNLOCKED
                                                </span>
                                            ) : (
                                                <span className="bg-slate-900 text-white px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow-md">
                                                    🔒 ₹{tpl.price}
                                                </span>
                                            )}
                                        </div>

                                        {/* Selected Checkmark */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border border-white">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Template Info */}
                                    <div className="mt-3 px-1">
                                        <h4 className="font-black text-sm text-slate-950 tracking-tight mb-1">{tpl.name}</h4>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tpl.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-6">
                        <button
                            onClick={() => handleDownload(selectedTemplate)}
                            disabled={processing}
                            className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isTemplateUnlocked(selectedTemplate.id)
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {processing ? (
                                '⏳ Processing...'
                            ) : isTemplateUnlocked(selectedTemplate.id) ? (
                                '⬇ Download PDF'
                            ) : (
                                `🔒 Pay ₹${selectedTemplate.price} & Download`
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: 55% - Live A4 Preview */}
            <div className="w-[55%] h-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col overflow-hidden">
                {/* Preview Header - Compact */}
                <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm text-slate-900">{selectedTemplate.name}</h3>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 font-medium">{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFullscreen(true)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            Fullscreen
                        </button>
                        <div className="w-px h-5 bg-slate-300"></div>
                        <button
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors"
                        >
                            −
                        </button>
                        <span className="text-xs font-bold text-slate-700 min-w-[40px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* A4 Preview Container - With Padding & Page Breaks */}
                <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                    {Array.from({ length: totalPages }).map((_, pageIndex) => (
                        <div
                            key={pageIndex}
                            className="bg-white shadow-lg border border-slate-200 rounded-sm mb-5 relative"
                            style={{
                                width: `${A4_WIDTH}px`,
                                height: `${A4_HEIGHT}px`,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center',
                                padding: '60px'
                            }}
                        >
                            {pageIndex === 0 && (
                                <div ref={measureRef} className="absolute inset-0 p-[60px]">
                                    <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                                </div>
                            )}
                            {pageIndex > 0 && (
                                <div className="absolute inset-0 p-[60px] overflow-hidden" style={{ top: `-${pageIndex * A4_HEIGHT}px` }}>
                                    <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                                </div>
                            )}
                            
                            {/* Page Number */}
                            <div className="absolute bottom-8 right-8 text-[10px] text-slate-400 font-medium">
                                Page {pageIndex + 1} of {totalPages}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar - Removed (download moved to left panel) */}
            </div>

            {/* FULLSCREEN MODAL */}
            {fullscreen && (
                <div 
                    className="fixed inset-0 bg-black/95 z-50 flex flex-col"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setFullscreen(false);
                    }}
                >
                    {/* Fullscreen Header */}
                    <div className="flex items-center justify-between px-8 py-4 bg-black/50 backdrop-blur-sm border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <h3 className="text-white font-bold text-base">{selectedTemplate.name}</h3>
                            <span className="text-white/50 text-sm">•</span>
                            <span className="text-white/70 text-sm">{totalPages} {totalPages === 1 ? 'Page' : 'Pages'}</span>
                        </div>
                        <button
                            onClick={() => setFullscreen(false)}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 transition-colors"
                        >
                            ✕ Close (ESC)
                        </button>
                    </div>

                    {/* Fullscreen Content */}
                    <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center">
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div
                                key={pageIndex}
                                className="bg-white shadow-2xl mb-6 relative"
                                style={{
                                    width: `${A4_WIDTH}px`,
                                    height: `${A4_HEIGHT}px`,
                                    padding: '60px'
                                }}
                            >
                                {pageIndex === 0 && (
                                    <div className="absolute inset-0 p-[60px]">
                                        <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                                    </div>
                                )}
                                {pageIndex > 0 && (
                                    <div className="absolute inset-0 p-[60px] overflow-hidden" style={{ top: `-${pageIndex * A4_HEIGHT}px` }}>
                                        <ResumeRenderer data={data} config={selectedTemplate} scale={1} />
                                    </div>
                                )}
                                
                                {/* Page Number */}
                                <div className="absolute bottom-8 right-8 text-[10px] text-slate-400 font-medium">
                                    Page {pageIndex + 1} of {totalPages}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3TemplateExport;
