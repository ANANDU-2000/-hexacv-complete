"use client";

import { useState, useRef } from "react";
import { Upload, Check, X, Zap, ShieldCheck } from "lucide-react";
import { FeedbackStrip } from "./FeedbackStrip";
import { SiteFooter } from "./SiteFooter";

interface HeroProps {
    onStart: () => void;
    onUpload: (file: File) => void;
    showFeedbackSuccess?: boolean;
}

// Upload states
type HeroUploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function Hero({ onStart, onUpload, showFeedbackSuccess }: HeroProps) {
    const [uploadState, setUploadState] = useState<HeroUploadState>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (!file || file.type !== 'application/pdf') {
            setUploadState('error');
            setTimeout(() => setUploadState('idle'), 3000);
            return;
        }

        setUploadState('uploading');
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploadState('success');
                    setTimeout(() => {
                        onUpload(file);
                    }, 800);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setUploadState('idle');
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (uploadState === 'idle') setUploadState('dragging');
    };

    const handleDragLeave = () => {
        if (uploadState === 'dragging') setUploadState('idle');
    };

    return (
        <section className="relative w-full min-h-screen bg-white overflow-x-hidden flex flex-col">
            {/* Success Toast */}
            {showFeedbackSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check size={14} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-sm">Thanks for your feedback!</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-none flex flex-col lg:flex-row min-h-screen lg:h-screen">
                {/* LEFT PANEL - 50% */}
                <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-8 lg:px-16">
                    <div className="w-full max-w-xl space-y-8">
                        {/* Main Headline - SEO Optimized */}
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                                Free ATS Resume Builder - No Login Required
                            </h1>

                            {/* Subtitle - Pain Point Focused */}
                            <p className="text-base text-slate-600 leading-relaxed">
                                Stop getting rejected by ATS. Extract keywords from job descriptions instantly.
                                <span className="font-semibold text-slate-900"> No signup. No payment. No data stored.</span>
                            </p>

                            {/* Trust Badges - Minimal, authentic styling */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md bg-white shadow-sm">
                                    100% Free
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md bg-white shadow-sm">
                                    No Login Required
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md bg-white shadow-sm">
                                    <ShieldCheck size={12} className="mr-1.5 text-blue-500" />
                                    100% Privacy Focused
                                </span>
                            </div>
                        </div>

                        {/* SINGLE ROW: Upload CV + Create New Resume */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Upload CV Button */}
                                <label
                                    htmlFor="pdf-upload"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={`
                                        flex-1 relative cursor-pointer group
                                        transition-all duration-300 ease-out
                                        ${uploadState === 'uploading' ? 'pointer-events-none' : ''}
                                    `}
                                >
                                    <div className={`
                                        relative flex items-center justify-center gap-2.5 rounded-xl px-6 py-4
                                        transition-all duration-300 font-bold text-base
                                        ${uploadState === 'idle' ? 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.02]' : ''}
                                        ${uploadState === 'dragging' ? 'bg-slate-800 text-white scale-[1.02]' : ''}
                                        ${uploadState === 'uploading' ? 'bg-slate-700 text-white' : ''}
                                        ${uploadState === 'success' ? 'bg-emerald-600 text-white' : ''}
                                        ${uploadState === 'error' ? 'bg-red-600 text-white' : ''}
                                        active:scale-95
                                    `}>
                                        {/* Upload Icon */}
                                        {uploadState === 'success' ? (
                                            <Check size={20} strokeWidth={3} />
                                        ) : uploadState === 'error' ? (
                                            <X size={20} strokeWidth={3} />
                                        ) : uploadState === 'uploading' ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Upload size={20} strokeWidth={2.5} />
                                        )}

                                        <span>
                                            {uploadState === 'dragging' ? 'Drop Here' :
                                                uploadState === 'uploading' ? `${uploadProgress}%` :
                                                    uploadState === 'success' ? 'Done!' :
                                                        uploadState === 'error' ? 'Try Again' :
                                                            'Upload Your CV'}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    {uploadState === 'uploading' && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-300 rounded-b-xl overflow-hidden">
                                            <div
                                                className="h-full bg-white transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </label>

                                {/* Create New Resume Button */}
                                <button
                                    onClick={onStart}
                                    className="flex-1 bg-white text-slate-900 border-2 border-slate-200 px-6 py-4 rounded-xl font-bold text-base hover:border-slate-900 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                >
                                    Create New Resume
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                id="pdf-upload"
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />

                            <p className="text-xs text-slate-500 text-center">
                                PDF only • Drag & drop supported
                            </p>
                        </div>

                        {/* Honest Guidance */}
                        <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Edits based on your actual experience. Layout optimized for readability.
                            </p>
                        </div>

                        {/* Trust Statement */}
                        <div
                            className="pt-2 animate-in fade-in duration-700"
                            style={{ animationDelay: '450ms' }}
                        >
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Your resume is processed securely and not stored.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - 50% - extra top padding so resume preview clears nav */}
                <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-slate-50 to-slate-100 relative items-center justify-center p-8 pt-40 overflow-hidden">
                    {/* Resume Preview - Large & Crystal Clear */}
                    <div className="relative w-full max-w-2xl">
                        {/* Resume Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-300/30 to-slate-400/30 blur-3xl transform translate-y-6"></div>

                        {/* Resume Image - Scaled for Readability */}
                        <div className="relative bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] rounded-lg overflow-hidden border-2 border-slate-200/80 transform hover:scale-105 transition-transform duration-500 ease-out">
                            <img
                                src="/homesectionrigthsidecv.png"
                                alt="Resume Preview - Benjamin Shah Example"
                                className="w-full h-auto select-none"
                                style={{
                                    imageRendering: 'auto',
                                }}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                onError={(e) => {
                                    console.error('Failed to load resume preview image');
                                    (e.target as HTMLImageElement).src = '/resume-preview.png';
                                }}
                            />
                        </div>

                        {/* Subtle Floating Badge */}
                        <div className="absolute -bottom-4 -right-4 bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs font-medium">ATS Friendly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real feedback — horizontal strip below hero */}
            <div className="w-full hidden lg:block">
                <FeedbackStrip />
            </div>
            {/* Legal footer for PayU verification: name, address, pricing */}
            <div className="w-full hidden lg:block">
                <SiteFooter />
            </div>

            {/* Mobile View (Redesigned) */}
            <div className="lg:hidden fixed inset-0 flex flex-col bg-white overflow-y-auto pt-0 pb-6 selection:bg-gray-900 selection:text-white">
                {/* Ultra-Premium Mobile Navbar */}
                <div className="w-full h-16 px-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-100/60 sticky top-0 z-[100]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-slate-900 rounded-[11px] flex items-center justify-center p-2 shadow-lg shadow-slate-200">
                            <img src="/logo.svg" alt="HexaCV" className="w-full h-full brightness-0 invert" />
                        </div>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-[14px] font-black text-slate-900 tracking-tight">HEXACV</span>
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none">AI Suite</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/free-tools'}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-full active:scale-95 transition-all shadow-md"
                        >
                            <Zap size={12} className="text-blue-400 fill-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Free Tools</span>
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(-0.5deg); }
                        50% { transform: translateY(-8px) rotate(0.5deg); }
                        100% { transform: translateY(0px) rotate(-0.5deg); }
                    }
                    .animate-float {
                        animation: float 5s ease-in-out infinite;
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                <div className="flex-shrink-0 w-full flex flex-col items-center">
                    {/* 1. Main Hero Content (Swapped to Top) */}
                    <div className="text-center space-y-4 pt-10 pb-4 px-8">
                        <h1 className="text-[34px] font-black text-[#111111] leading-[1.1] tracking-tight">
                            Free ATS Resume Builder - No Login Required
                        </h1>
                        <p className="text-[#6B7280] text-[16px] font-medium leading-[1.5] max-w-[280px] mx-auto">
                            Transform your experience into a professional, recruiter-ready resume.
                        </p>
                    </div>

                    {/* 2. Resume Preview Display (Moved Below Content) */}
                    <div className="w-full pb-10 flex justify-center px-6">
                        <div className="relative w-full max-w-[300px] animate-float">
                            {/* Card Container */}
                            <div className="relative bg-white rounded-[16px] shadow-[0_20px_48px_-12px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden">
                                <img
                                    src="/homesectionrigthsidecv.png"
                                    alt="Resume Preview"
                                    className="w-full h-auto opacity-100"
                                    onContextMenu={(e) => e.preventDefault()}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/resume-preview.png';
                                    }}
                                />
                                {/* Subtle white overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none"></div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-3 -right-2 bg-[#0F172A] text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/10 z-10">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                <span className="text-[10px] font-medium uppercase tracking-wider">ATS Friendly</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Primary Action Buttons - Touch Optimized */}
                    <div className="w-full max-w-[360px] space-y-4 px-6 mb-12">
                        <label htmlFor="pdf-upload-mobile" className="block w-full cursor-pointer">
                            <div className="w-full bg-[#0F172A] text-white min-h-[56px] h-[56px] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.97] shadow-[0_4px_16px_rgba(15,23,42,0.15)]">
                                {uploadState === 'uploading' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Upload size={20} strokeWidth={2.5} />
                                )}
                                <span className="text-[16px] font-semibold">
                                    {uploadState === 'uploading' ? `Uploading ${uploadProgress}%` : 'Upload Existing PDF'}
                                </span>
                            </div>
                        </label>
                        <input
                            type="file"
                            id="pdf-upload-mobile"
                            className="hidden"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />

                        <button
                            onClick={onStart}
                            className="w-full bg-white text-[#111111] border-2 border-[#111111] min-h-[56px] h-[56px] rounded-2xl font-bold transition-all active:scale-[0.97] flex items-center justify-center shadow-sm hover:bg-gray-50"
                        >
                            Build From Scratch
                        </button>
                    </div>
                </div>

                {/* Real feedback — horizontal strip below hero */}
                <div id="feedback" className="w-full">
                    <FeedbackStrip />
                </div>

                {/* Legal footer for PayU: name, address, pricing */}
                <div className="w-full lg:hidden mt-6">
                    <SiteFooter compact />
                </div>
            </div>
        </section>
    );
}
