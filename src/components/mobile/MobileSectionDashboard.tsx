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
        <div className="mobile-app flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50 text-gray-900">
            {/* Context Header Area — compact to reduce scroll */}
            <div className="px-4 sm:px-5 pt-16 pb-4">
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="min-w-0">
                        <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight leading-tight mb-0.5 truncate text-gray-900">
                            RESUME BUILDER
                        </h2>
                        <p className="text-[8px] sm:text-[9px] font-semibold text-gray-500 uppercase tracking-widest">Vertical flow</p>
                    </div>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Sparkles size={20} className="text-gray-600" />
                    </div>
                </div>

                {/* Target Role Setup Card - "Step 0" / Context */}
                <button
                    onClick={() => onNavigateToSection('target-jd')}
                    className={`mobile-app-card w-full p-4 rounded-[14px] transition-all flex items-center gap-3 group relative overflow-hidden ${isContextReady
                        ? 'border border-gray-200/80'
                        : 'border-2 border-dashed border-gray-300 bg-gray-50/50'
                        }`}
                >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isContextReady ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <Target size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-[8px] font-semibold uppercase tracking-wider mb-0.5 text-gray-500">Context</p>
                        <h3 className={`text-[14px] sm:text-[15px] font-bold tracking-tight leading-tight truncate ${isContextReady ? 'text-gray-900' : 'text-gray-600'
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

            {/* Sections Flow List — compact spacing */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-2 pb-56 scrollbar-hide relative">
                <div className="absolute left-[2.5rem] sm:left-[2.75rem] top-8 bottom-48 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />

                <div className="space-y-2.5 sm:space-y-3">
                    {resumeSections.map((section, index) => {
                        const isNextStep = index === resumeSections.findIndex(s => !s.complete);
                        const isDone = section.complete;
                        const hasWarning = section.atsIssue;

                        return (
                            <button
                                key={section.id}
                                onClick={() => onNavigateToSection(section.id)}
                                className={`mobile-app-card w-full min-h-[48px] py-3 px-4 sm:px-5 rounded-[14px] flex items-center justify-between gap-2 transition-all active:scale-[0.98] border border-gray-200/80 relative z-10 touch-manipulation ${isDone
                                    ? 'bg-white'
                                    : isNextStep
                                        ? 'bg-white ring-1 ring-gray-300/80'
                                        : 'bg-white/90'
                                    }`}
                                aria-label={`${section.label}${hasWarning ? ', ATS issue' : ''}. ${isDone ? 'Complete' : 'Edit'}`}
                            >
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[13px] sm:text-[14px] transition-all flex-shrink-0 ${isDone
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

                <div className="mobile-app-card mt-8 p-5 rounded-[14px]">
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

            <div className="mobile-app-sticky fixed bottom-0 left-0 right-0 p-4 z-50">
                <button
                    onClick={onContinue}
                    className="mobile-app-cta w-full min-h-[52px] rounded-[14px] bg-blue-600 text-white font-bold text-[16px] flex items-center justify-center gap-3 touch-manipulation"
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

