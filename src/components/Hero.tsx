"use client";

import { useState, useRef } from "react";
import { Upload, Check, X, Zap, ShieldCheck, ChevronDown } from "lucide-react";
import { FeedbackStrip } from "./FeedbackStrip";
import { SiteFooter } from "./SiteFooter";
import type { RoleContext, ExperienceLevel, TargetMarket } from "../core/resumeIntelligence";

interface HeroProps {
    onStart: () => void;
    onUpload: (file: File) => void;
    onRoleStart?: (ctx: RoleContext, mode: 'upload' | 'scratch') => void;
    showFeedbackSuccess?: boolean;
}

// Upload states
type HeroUploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

// ===== ROLE CARD (right side) =====
function RoleCard({ onRoleStart, onUpload }: { onRoleStart: (ctx: RoleContext, mode: 'upload' | 'scratch') => void; onUpload: (file: File) => void }) {
    const [role, setRole] = useState('');
    const [level, setLevel] = useState<ExperienceLevel>('fresher');
    const [market, setMarket] = useState<TargetMarket>('india');
    const [jd, setJd] = useState('');
    const [jdOpen, setJdOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const ctx: RoleContext = { roleTitle: role, experienceLevel: level, market, jdText: jd, year: 2026 };
    const canProceed = role.trim().length > 1;

    const handleUpload = (file: File) => {
        onRoleStart(ctx, 'upload');
        onUpload(file);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mx-auto lg:mx-0">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Start your ATS resume</h2>
            <p className="text-xs text-gray-500 mb-5">Tell us your target and we'll analyze your fit.</p>

            {/* Target Role */}
            <label className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-1 block">Target Role</label>
            <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Generative AI Engineer"
                className="w-full h-11 px-3 border border-gray-200 rounded-lg text-[15px] text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none mb-4"
            />

            {/* Experience Level */}
            <label className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Experience</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {([
                    { id: 'fresher' as const, label: 'Fresher' },
                    { id: '1-3' as const, label: '1–3 yrs' },
                    { id: '3-5' as const, label: '3–5 yrs' },
                    { id: '5-8' as const, label: '5–8 yrs' },
                    { id: '8+' as const, label: '8+ yrs' },
                ]).map((l) => (
                    <button
                        key={l.id}
                        type="button"
                        onClick={() => setLevel(l.id)}
                        className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-all ${level === l.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            {/* Market */}
            <label className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Market</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {([
                    { id: 'india' as const, label: 'India' },
                    { id: 'gulf' as const, label: 'Gulf' },
                    { id: 'us' as const, label: 'US' },
                    { id: 'global' as const, label: 'Global' },
                ]).map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => setMarket(m.id)}
                        className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-all ${market === m.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Optional JD */}
            <button type="button" onClick={() => setJdOpen(!jdOpen)} className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 mb-2">
                <ChevronDown size={14} className={`transition-transform ${jdOpen ? 'rotate-180' : ''}`} />
                Job description (optional)
            </button>
            {jdOpen && (
                <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste job description for better analysis…"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 resize-none focus:border-blue-500 outline-none mb-4"
                    rows={4}
                />
            )}

            {/* CTAs */}
            <div className="space-y-2 mt-4">
                <label htmlFor="role-card-upload" className="block w-full cursor-pointer">
                    <div className={`w-full min-h-[48px] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${canProceed ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                        <Upload size={18} />
                        Upload & analyze my resume
                    </div>
                </label>
                <input
                    ref={fileRef}
                    id="role-card-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={!canProceed}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                    }}
                />
                <button
                    type="button"
                    onClick={() => canProceed && onRoleStart(ctx, 'scratch')}
                    disabled={!canProceed}
                    className={`w-full min-h-[44px] rounded-xl font-semibold text-[14px] border-2 transition-all ${canProceed ? 'border-gray-900 text-gray-900 hover:bg-gray-50 active:scale-[0.98]' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    Build from scratch
                </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">No signup. No data stored. Free.</p>
        </div>
    );
}

export function Hero({ onStart, onUpload, onRoleStart, showFeedbackSuccess }: HeroProps) {
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

                            {/* Subtitle - Pain point + outcome + trust */}
                            <p className="text-base text-slate-600 leading-relaxed">
                                Stop getting rejected by ATS. Match your resume to job description keywords and get more callbacks.
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

                                {/* Create New Resume Button - benefit-led CTA */}
                                <button
                                    onClick={onStart}
                                    className="flex-1 bg-white text-slate-900 border-2 border-slate-200 px-6 py-4 rounded-xl font-bold text-base hover:border-slate-900 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                                >
                                    Build my ATS resume — free
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

                        {/* Honest Guidance - outcome */}
                        <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Your experience, ATS-friendly layout. Add a job description to get keyword-matched wording.
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

                {/* RIGHT PANEL - Role Card (premium card feel) */}
                <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-slate-50 to-slate-100 relative items-center justify-center p-8 overflow-hidden">
                    {onRoleStart ? (
                        <RoleCard onRoleStart={onRoleStart} onUpload={onUpload} />
                    ) : (
                        /* Fallback: old image if onRoleStart not provided */
                        <div className="relative w-full max-w-2xl">
                            <div className="relative bg-white shadow-xl rounded-lg overflow-hidden border-2 border-slate-200/80">
                                <img src="/homesectionrigthsidecv.png" alt="Resume Preview" className="w-full h-auto select-none" draggable={false} onContextMenu={(e) => e.preventDefault()} onError={(e) => { (e.target as HTMLImageElement).src = '/resume-preview.png'; }} />
                            </div>
                        </div>
                    )}
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
                            Match job description keywords. Get more callbacks. No signup.
                        </p>
                    </div>

                    {/* 2. Role Card (mobile) — same as desktop but in mobile view */}
                    <div className="w-full px-4 pb-8">
                        {onRoleStart ? (
                            <RoleCard onRoleStart={onRoleStart} onUpload={onUpload} />
                        ) : (
                            <div className="w-full max-w-[360px] space-y-4 px-2 mx-auto">
                                <label htmlFor="pdf-upload-mobile" className="block w-full cursor-pointer">
                                    <div className="w-full bg-[#0F172A] text-white min-h-[56px] h-[56px] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.97]">
                                        <Upload size={20} strokeWidth={2.5} />
                                        <span className="text-[16px] font-semibold">Upload Existing PDF</span>
                                    </div>
                                </label>
                                <input type="file" id="pdf-upload-mobile" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                                <button onClick={onStart} className="w-full bg-white text-[#111111] border-2 border-[#111111] min-h-[56px] h-[56px] rounded-2xl font-bold transition-all active:scale-[0.97] flex items-center justify-center">
                                    Build my resume — free
                                </button>
                            </div>
                        )}
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
