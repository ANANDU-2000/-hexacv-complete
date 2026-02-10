/**
 * MOBILE SECTION DASHBOARD — One action per screen, thumb-friendly.
 * Progress, Target Role summary, section cards with completion + ATS warning.
 */

import React from 'react';
import { ResumeData } from '../../types';
import {
    User, Briefcase, Code, GraduationCap, Trophy,
    ChevronRight, Target, CheckCircle2, Eye, Sparkles, AlertCircle
} from 'lucide-react';

interface Props {
    data: ResumeData;
    onNavigateToSection: (sectionId: string) => void;
    onReorderSection: (fromIndex: number, toIndex: number) => void;
    onContinue: () => void;
    onBack: () => void;
    atsScore?: number | null;
    missingKeywords?: string[];
    onImproveClick?: () => void;
}

/** True if this section has an ATS-related issue (missing JD keywords, weak content). */
function sectionHasAtsIssue(sectionId: string, missingKeywords: string[], atsScore: number | null | undefined): boolean {
    if (sectionId === 'skills' && missingKeywords.length > 0) return true;
    if (sectionId === 'experience' && atsScore != null && atsScore < 60) return true;
    return false;
}

export default function MobileSectionDashboard({ data, onNavigateToSection, onContinue, onBack, atsScore, missingKeywords = [], onImproveClick }: Props) {
    const resumeSections = [
        { id: 'profile', label: 'Profile', complete: !!(data.basics.fullName?.trim() && data.basics.email?.trim()) },
        { id: 'experience', label: 'Experience', complete: data.experience.length > 0 },
        { id: 'projects', label: 'Projects', complete: data.projects.length > 0 },
        { id: 'skills', label: 'Skills', complete: data.skills.length > 0 },
        { id: 'education', label: 'Education', complete: data.education.length > 0 },
        { id: 'achievements', label: 'Achievements', complete: data.achievements.length > 0 },
    ].map(s => ({
        ...s,
        atsIssue: sectionHasAtsIssue(s.id, missingKeywords, atsScore),
    }));

    const isContextReady = !!data.basics.targetRole?.trim();
    const completedCount = resumeSections.filter(s => s.complete).length;
    const progress = Math.round((completedCount / resumeSections.length) * 100);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50 text-gray-900">
            {/* Context Header Area */}
            <div className="px-5 sm:px-6 pt-20 pb-8">
                <div className="flex items-center justify-between mb-8 px-1">
                    <div className="min-w-0">
                        <h2 className="text-[24px] sm:text-[28px] font-bold tracking-tight leading-tight mb-1 truncate text-gray-900">
                            RESUME BUILDER
                        </h2>
                        <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-[0.3em]">Vertical Flow Interface</p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles size={24} className="text-gray-600 animate-pulse" />
                    </div>
                </div>

                {/* Target Role Setup Card - "Step 0" / Context */}
                <button
                    onClick={() => onNavigateToSection('target-jd')}
                    className={`w-full p-6 rounded-2xl transition-all border-2 flex items-center gap-5 group relative overflow-hidden ${isContextReady
                        ? 'bg-white border-gray-200 shadow-sm'
                        : 'bg-white border-gray-200 border-dashed'
                        }`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isContextReady ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <Target size={28} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-[9px] font-semibold uppercase tracking-[0.2em] mb-1 ${isContextReady ? 'text-gray-500' : 'text-gray-500'
                            }`}>Resume Context</p>
                        <h3 className={`text-[17px] sm:text-[18px] font-bold tracking-tight leading-tight truncate ${isContextReady ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                            {data.basics.targetRole || 'Define Target Role'}
                        </h3>
                    </div>
                    {isContextReady ? (
                        <div className="flex-shrink-0">
                            <CheckCircle2 size={24} className="text-gray-700" strokeWidth={3} />
                        </div>
                    ) : (
                        <div className="flex-shrink-0">
                            <ChevronRight size={24} className="text-gray-500" strokeWidth={3} />
                        </div>
                    )}
                </button>
            </div>

            {/* Sections Flow List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 pb-64 scrollbar-hide relative">
                <div className="absolute left-[3.15rem] sm:left-[3.25rem] top-12 bottom-56 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />

                <div className="space-y-4 sm:space-y-6">
                    {resumeSections.map((section, index) => {
                        const isNextStep = index === resumeSections.findIndex(s => !s.complete);
                        const isDone = section.complete;
                        const hasWarning = section.atsIssue;

                        return (
                            <button
                                key={section.id}
                                onClick={() => onNavigateToSection(section.id)}
                                className={`w-full min-h-[56px] py-4 px-5 sm:px-6 rounded-2xl flex items-center justify-between gap-3 transition-all active:scale-[0.98] border-2 relative z-10 touch-manipulation ${isDone
                                    ? 'bg-white border-gray-200 shadow-sm'
                                    : isNextStep
                                        ? 'bg-white border-gray-300 shadow-md'
                                        : 'bg-white/80 border-gray-100 opacity-90'
                                    }`}
                                aria-label={`${section.label}${hasWarning ? ', ATS issue' : ''}. ${isDone ? 'Complete' : 'Edit'}`}
                            >
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-[14px] sm:text-[15px] transition-all flex-shrink-0 ${isDone
                                    ? 'bg-green-500 text-white'
                                    : isNextStep
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {isDone ? <CheckCircle2 size={20} strokeWidth={3} className="sm:scale-110" /> : index + 1}
                                </div>

                                <div className="flex-1 text-left px-3 min-w-0">
                                    <h3 className={`text-[15px] sm:text-[17px] font-bold uppercase tracking-[0.12em] transition-all truncate ${isNextStep ? 'text-gray-900' : 'text-gray-800'}`}>
                                        {section.label}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {hasWarning && (
                                        <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center" aria-hidden>
                                            <AlertCircle size={20} strokeWidth={2.5} />
                                        </span>
                                    )}
                                    <span className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all ${isNextStep ? 'text-gray-900' : 'text-gray-500'}`}>
                                        <ChevronRight size={22} strokeWidth={2.5} className="sm:scale-100" />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">Completion Status</span>
                        <span className="text-[18px] sm:text-[20px] font-bold text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-6 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-bottom z-50">
                <button
                    onClick={onContinue}
                    className="w-full min-h-[52px] sm:min-h-[56px] rounded-2xl bg-blue-600 text-white font-bold text-[16px] sm:text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-md touch-manipulation"
                    aria-label="Preview resume"
                >
                    <Eye size={24} strokeWidth={3} className="sm:scale-110" aria-hidden />
                    <span>Preview resume</span>
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

