import React, { useState, useEffect } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import ResumeRenderer from './ResumeRenderer';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Lock } from 'lucide-react';
import { A4_WIDTH, A4_HEIGHT } from '../constants';

interface Step3PreviewProps {
    data: ResumeData;
    setData: (data: ResumeData) => void;
    config: TemplateConfig;
    onBack: () => void;
}

const Step3Preview: React.FC<Step3PreviewProps> = ({ data, setData, config, onBack }) => {
    const [zoom, setZoom] = useState(0.75);
    const [currentPage, setCurrentPage] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(true);
    
    const totalPages = 2; // Simulated, should be calculated from actual content
    const isPaidTemplate = (config as any).price > 0;

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

    const handleZoomIn = () => setZoom(prev => Math.min(1.5, prev + 0.1));
    const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.1));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));

    const handleDownload = () => {
        if (isPaidTemplate) {
            setShowPaymentModal(true);
        } else {
            // Trigger free download
            alert('Downloading free template...');
        }
    };

    return (
        <>
            {/* Full Screen Modal Overlay */}
            <div
                className={`
                    fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[9999]
                    flex flex-col
                    ${isAnimating ? 'animate-in fade-in duration-500' : ''}
                `}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 glass-ios-preview-header">
                    {/* Left: Back Button */}
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm">Back</span>
                    </button>

                    {/* Center: Template Name */}
                    <div className="text-center">
                        <h2 className="text-white font-black text-lg tracking-tight">{config.name}</h2>
                        <p className="text-white/40 text-xs font-medium">Preview Mode</p>
                    </div>

                    {/* Right: Close Button */}
                    <button
                        onClick={onBack}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Preview Area */}
                <div
                    id="preview-area"
                    className="flex-1 overflow-auto flex items-center justify-center p-12 custom-scrollbar select-none"
                    style={{ userSelect: 'none' }}
                >
                    <div
                        className={`
                            relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-sm
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
                        {isPaidTemplate && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-10">
                                    <div className="text-slate-900 text-6xl font-black uppercase tracking-wider">
                                        Preview Only
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resume Content */}
                        <div className="relative">
                            <ResumeRenderer data={data} config={config} scale={1} />
                        </div>

                        {/* Blur Lock for Paid Templates - Bottom Half */}
                        {isPaidTemplate && (
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-md flex items-end justify-center pb-8">
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full mb-2">
                                        <Lock size={16} />
                                        <span className="font-black text-sm uppercase tracking-wider">Unlock Full Resume</span>
                                    </div>
                                    <p className="text-slate-600 text-xs">Pay once to download without restrictions</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="flex items-center justify-between px-8 py-6 border-t border-white/10 glass-ios-preview-footer">
                    {/* Left: Zoom Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoom <= 0.5}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-white font-bold text-sm w-16 text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoom >= 1.5}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>

                    {/* Center: Page Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-white font-bold text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Right: Download/Payment Button */}
                    <button
                        onClick={handleDownload}
                        className={`
                            group relative px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider
                            transition-all duration-300
                            ${isPaidTemplate
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                                : 'bg-white text-slate-900 hover:bg-slate-100'
                            }
                            hover:scale-105 active:scale-95
                            flex items-center gap-2
                        `}
                    >
                        {isPaidTemplate ? (
                            <>
                                <Lock size={16} className="group-hover:animate-pulse" />
                                <span>Pay to Unlock Template</span>
                            </>
                        ) : (
                            <>
                                <Download size={16} />
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
                                <span className="text-2xl font-black text-slate-900">₹{(config as any).price || 99}</span>
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
                            onClick={() => {
                                alert('Payment processed! Downloading template...');
                                setShowPaymentModal(false);
                            }}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-black text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-600/20 hover:shadow-2xl hover:shadow-amber-600/30 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Lock size={20} />
                            <span>Pay & Download Now</span>
                        </button>

                        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
                            Secure payment powered by Razorpay • Money-back guarantee
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Step3Preview;
