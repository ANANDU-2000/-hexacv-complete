/**
 * MOBILE SECTION DASHBOARD - PREMIUM REBUILD
 * Professional, high-end SaaS aesthetic with maximum visibility
 */

import React from 'react';
import { ResumeData } from '../../types';
import {
    User, Briefcase, Code, GraduationCap, Trophy,
    ChevronRight, Target, CheckCircle2, Eye, Sparkles,
    Mail, Phone, MapPin, Plus
} from 'lucide-react';

interface Props {
    data: ResumeData;
    onNavigateToSection: (sectionId: string) => void;
    onReorderSection: (fromIndex: number, toIndex: number) => void;
    onContinue: () => void;
    onBack: () => void;
    /** ATS score (0–100); when provided, shows sticky ATS bar and "Improve" opens feedback */
    atsScore?: number | null;
    missingKeywords?: string[];
    onImproveClick?: () => void;
}

export default function MobileSectionDashboard({ data, onNavigateToSection, onContinue, onBack, atsScore, missingKeywords = [], onImproveClick }: Props) {
    const resumeSections = [
        { id: 'profile', label: 'Profile', complete: !!(data.basics.fullName?.trim() && data.basics.email?.trim()) },
        { id: 'experience', label: 'Experience', complete: data.experience.length > 0 },
        { id: 'projects', label: 'Projects', complete: data.projects.length > 0 },
        { id: 'skills', label: 'Skills', complete: data.skills.length > 0 },
        { id: 'education', label: 'Education', complete: data.education.length > 0 },
        { id: 'achievements', label: 'Achievements', complete: data.achievements.length > 0 },
    ];

    const isContextReady = !!data.basics.targetRole?.trim();
    const completedCount = resumeSections.filter(s => s.complete).length;
    const progress = Math.round((completedCount / resumeSections.length) * 100);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0F172A] text-white">
            {/* Context Header Area - Fluid & High Contrast */}
            <div className="px-5 sm:px-6 pt-20 pb-8 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between mb-8 px-1">
                    <div className="min-w-0">
                        <h2 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-tight mb-1 truncate">
                            RESUME BUILDER
                        </h2>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Vertical Flow Interface</p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                        <Sparkles size={24} className="text-white animate-pulse" />
                    </div>
                </div>

                {/* Target Role Setup Card - "Step 0" / Context */}
                <button
                    onClick={() => onNavigateToSection('target-jd')}
                    className={`w-full p-6 rounded-[2rem] transition-all border-2 flex items-center gap-5 group relative overflow-hidden ${isContextReady
                        ? 'bg-white border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)]'
                        : 'bg-white/5 border-white/10 border-dashed'
                        }`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isContextReady ? 'bg-black text-white' : 'bg-white/10 text-slate-500'
                        }`}>
                        <Target size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isContextReady ? 'text-slate-500' : 'text-slate-400'
                            }`}>Resume Context</p>
                        <h3 className={`text-[17px] sm:text-[18px] font-black tracking-tight leading-tight truncate ${isContextReady ? 'text-black' : 'text-slate-300'
                            }`}>
                            {data.basics.targetRole || 'Define Target Role'}
                        </h3>
                    </div>
                    {isContextReady ? (
                        <div className="flex-shrink-0">
                            <CheckCircle2 size={24} className="text-black" strokeWidth={3} />
                        </div>
                    ) : (
                        <div className="flex-shrink-0">
                            <ChevronRight size={24} className="text-slate-600" strokeWidth={3} />
                        </div>
                    )}
                </button>
            </div>

            {/* Sections Flow List - Master Response */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 pb-64 scrollbar-hide relative">
                {/* Vertical Line for progression indicator */}
                <div className="absolute left-[3.15rem] sm:left-[3.25rem] top-12 bottom-56 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

                <div className="space-y-4 sm:space-y-6">
                    {resumeSections.map((section, index) => {
                        const isNextStep = index === resumeSections.findIndex(s => !s.complete);
                        const isDone = section.complete;

                        return (
                            <button
                                key={section.id}
                                onClick={() => onNavigateToSection(section.id)}
                                className={`w-full h-18 sm:h-20 px-5 sm:px-6 rounded-[1.5rem] flex items-center justify-between transition-all active:scale-[0.98] border-2 relative z-10 ${isDone
                                    ? 'bg-white/10 border-white/20 backdrop-blur-xl'
                                    : isNextStep
                                        ? 'bg-white border-white shadow-2xl'
                                        : 'bg-white/5 border-transparent opacity-60'
                                    }`}
                            >
                                {/* Left: Step Number Indicator */}
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-[14px] sm:text-[15px] transition-all flex-shrink-0 ${isDone
                                    ? 'bg-green-500 text-white'
                                    : isNextStep
                                        ? 'bg-black text-white'
                                        : 'bg-white/10 text-slate-500'
                                    }`}>
                                    {isDone ? <CheckCircle2 size={18} strokeWidth={3} className="sm:scale-110" /> : index + 1}
                                </div>

                                {/* Center: Section Title */}
                                <div className="flex-1 text-center px-4 min-w-0">
                                    <h3 className={`text-[14px] sm:text-[16px] font-black uppercase tracking-[0.15em] transition-all truncate ${isNextStep ? 'text-black' : 'text-white'
                                        }`}>
                                        {section.label}
                                    </h3>
                                </div>

                                {/* Right: Progress/Status Indicator Icon */}
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all flex-shrink-0 ${isNextStep ? 'text-black' : 'text-slate-500'
                                    }`}>
                                    {isDone ? (
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                            <ChevronRight size={18} strokeWidth={3} className="scale-90 sm:scale-100" />
                                        </div>
                                    ) : isNextStep ? (
                                        <Plus size={24} strokeWidth={3} className="scale-90 sm:scale-100" />
                                    ) : (
                                        <ChevronRight size={20} strokeWidth={2} className="opacity-30 scale-90 sm:scale-100" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Overall Progress Progress Indicator at the bottom of the list */}
                <div className="mt-12 p-6 sm:p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">Completion Status</span>
                        <span className="text-[18px] sm:text-[20px] font-black text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Sticky ATS bar (when ATS data provided) - above CTA, min touch target 44px */}
            {onImproveClick != null && (
                <div className="fixed left-0 right-0 bottom-[5.5rem] sm:bottom-[6rem] px-5 sm:px-6 z-40 safe-area-bottom">
                    <button
                        type="button"
                        onClick={onImproveClick}
                        className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white flex items-center justify-between gap-3 text-sm font-semibold active:scale-[0.98]"
                        aria-label="View ATS score and missing keywords"
                    >
                        <span>ATS: {atsScore ?? 0}/100</span>
                        <span className="flex items-center gap-1">Improve <ChevronRight size={18} strokeWidth={2.5} /></span>
                    </button>
                </div>
            )}

            {/* Sticky Footer CTA - Master Safety */}
            <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-6 bg-black/80 backdrop-blur-2xl border-t border-white/10 safe-area-bottom z-50">
                <button
                    onClick={onContinue}
                    className="w-full min-h-[48px] h-15 sm:h-18 rounded-[2rem] bg-white text-black font-black text-[15px] sm:text-[16px] uppercase tracking-[0.2em] transition-all active:scale-[0.95] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                    aria-label="Review resume"
                >
                    <Eye size={22} strokeWidth={3} className="sm:scale-110" />
                    <span>Review resume</span>
                </button>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.25rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .h-15 { height: 3.75rem; }
                .h-18 { height: 4.5rem; }
            `}</style>
        </div>
    );
}

