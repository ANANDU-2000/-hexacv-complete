import React from 'react';
import { ResumeData } from '../../types';
import { User, Briefcase, Code, Sparkles, GraduationCap, Trophy, ChevronRight, Target, CheckCircle2, Home, Eye } from 'lucide-react';

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
                <div className="flex-none px-5 pt-14 pb-6 bg-transparent z-20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1 block">Editor</span>
                            <h1 className="text-xl font-black text-black tracking-tight">Your Resume</h1>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-xl border border-white shadow-sm">
                            <span className="text-sm font-black text-black tabular-nums">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>

                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-white shadow-inner">
                        <div
                            className="h-full bg-black rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Section Menu */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-24 no-scrollbar">
                <div className="space-y-2.5">
                    {sections.map((section) => {
                        const getSubtitle = () => {
                            if (section.id === 'profile') {
                                return section.isComplete ? 'Complete' : 'Required';
                            }
                            if (section.count === 0) {
                                return '0 items';
                            }
                            return `${section.count} ${section.count === 1 ? 'item' : 'items'}`;
                        };

                        return (
                            <div
                                key={section.id}
                                onClick={() => onNavigateToSection(section.id)}
                                className="group bg-white rounded-2xl p-4 active:scale-[0.98] transition-all border border-white shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm`}>
                                        <section.icon size={18} strokeWidth={2.5} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm text-black">
                                            {section.label}
                                        </h3>
                                        <p className="text-[10px] font-medium text-gray-400">
                                            {getSubtitle()}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {section.isComplete && (
                                            <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                                                <CheckCircle2 size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                        <ChevronRight size={16} className="text-gray-300" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                        {completedCount === sections.length
                            ? 'All sections complete'
                            : `${sections.length - completedCount} sections to go`
                        }
                    </p>
                </div>
            </div>

            {/* Compact Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60" />
                
                <div className="relative px-4 py-3 flex items-center gap-3">
                    {/* Home button */}
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Home size={18} className="text-gray-600" />
                    </button>
                    
                    {/* Progress indicator */}
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${progressPercentage}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600">{Math.round(progressPercentage)}%</span>
                    </div>
                    
                    {/* Preview button */}
                    <button
                        onClick={onContinue}
                        className="h-10 px-4 rounded-xl bg-black text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform"
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                    </button>
                </div>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
