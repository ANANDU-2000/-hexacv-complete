import React from 'react';
import { ResumeData } from '../../types';
import { User, Briefcase, Code, Sparkles, GraduationCap, Trophy, ChevronRight, Target, CheckCircle2 } from 'lucide-react';

interface MobileSectionDashboardProps {
    data: ResumeData;
    onNavigateToSection: (sectionId: string) => void;
    onReorderSection: (fromIndex: number, toIndex: number) => void;
    onContinue: () => void;
    onBack: () => void;
    hideHeader?: boolean;
}

export default function MobileSectionDashboard({ data, onNavigateToSection, onReorderSection, onContinue, onBack, hideHeader = false }: MobileSectionDashboardProps) {
    const sections = [
        {
            id: 'target-jd',
            label: 'Target Role',
            icon: Target,
            count: 1,
            color: 'bg-black',
            isComplete: !!data.basics.targetRole?.trim()
        },
        {
            id: 'profile',
            label: 'Personal Info',
            icon: User,
            count: 1,
            color: 'bg-black',
            isComplete: !!(data.basics.fullName?.trim() && data.basics.email?.trim() && data.summary?.trim())
        },
        {
            id: 'experience',
            label: 'Experience',
            icon: Briefcase,
            count: data.experience.length,
            color: 'bg-black',
            isComplete: data.experience.length > 0
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: Code,
            count: data.projects.length,
            color: 'bg-black',
            isComplete: data.projects.length > 0
        },
        {
            id: 'skills',
            label: 'Skills',
            icon: Sparkles,
            count: data.skills.length,
            color: 'bg-black',
            isComplete: data.skills.length > 0
        },
        {
            id: 'education',
            label: 'Education',
            icon: GraduationCap,
            count: data.education.length,
            color: 'bg-black',
            isComplete: data.education.length > 0
        },
        {
            id: 'achievements',
            label: 'Achievements',
            icon: Trophy,
            count: data.achievements.length,
            color: 'bg-black',
            isComplete: data.achievements.length > 0
        },
    ];

    const completedCount = sections.filter(s => s.isComplete).length;
    const progressPercentage = (completedCount / sections.length) * 100;

    return (
        <div className="h-full flex flex-col bg-[#F5F5F7]">
            {/* Header - Professional Light Design */}
            {!hideHeader && (
                <div className="flex-none px-6 pt-16 pb-8 bg-transparent z-20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5 block">Editor Dashboard</span>
                            <h1 className="text-3xl font-black text-black tracking-tight tracking-[-0.04em]">Your Resume</h1>
                        </div>
                        <div className="bg-white px-4 py-2.5 rounded-2xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <span className="text-[15px] font-black text-black tabular-nums">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>

                    <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-white shadow-inner">
                        <div
                            className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Section Menu */}
            <div className="flex-1 overflow-y-auto px-6 pt-4 pb-32 no-scrollbar">
                <div className="space-y-3">
                    {sections.map((section) => {
                        const getSubtitle = () => {
                            if (section.id === 'profile') {
                                return section.isComplete ? 'Details complete' : 'Required section';
                            }
                            if (section.count === 0) {
                                return '0 items added';
                            }
                            return `${section.count} ${section.count === 1 ? 'item' : 'items'} saved`;
                        };

                        return (
                            <div
                                key={section.id}
                                onClick={() => onNavigateToSection(section.id)}
                                className="group bg-white rounded-[1.5rem] p-5 active:scale-[0.98] transition-all border border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10`}>
                                        <section.icon size={20} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-black text-[15px] text-black tracking-tight uppercase">
                                            {section.label}
                                        </h3>
                                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                                            {getSubtitle()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {section.isComplete && (
                                            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                            <ChevronRight size={18} className="text-gray-300" strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 text-center pb-10">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">
                        {completedCount === sections.length
                            ? 'All sections complete'
                            : `${sections.length - completedCount} sections to go`
                        }
                    </p>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#F5F5F7]/90 backdrop-blur-xl border-t border-gray-200/50 z-50 safe-area-bottom">
                <button
                    onClick={onContinue}
                    className="w-full h-16 rounded-[1.5rem] bg-white text-black border-2 border-black font-black text-[15px] uppercase tracking-[0.1em] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center gap-3"
                >
                    <span>View Templates</span>
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </button>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
