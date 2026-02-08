import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ResumeData, TabId } from '../../types';
import { ChevronRight, ChevronLeft, Plus, X, Eye, Sparkles, Target, User, Briefcase, Code, GraduationCap, Trophy, Camera, CheckCircle2, Globe, FileText, Laptop } from 'lucide-react';
import { MobileHeader } from './MobileHeader';

import { refineResumeSummary, refineExperienceHighlights } from '../../core/ats/refinement';
import { resumeToText } from '../../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../../core/ats/extractKeywords';
import { scoreATS } from '../../core/ats/scoreATS';
import MobileSectionDashboard from './MobileSectionDashboard';
import MobileSectionEditor from './MobileSectionEditor';
import { MobileATSModal } from './MobileATSModal';

import { getRoleSuggestions } from '../../constants/roles';

const ATS_DEBOUNCE_MS = 500;

type MobileView = 'dashboard' | 'section-editor';

interface MobileEditorProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
    onNext: () => void;
    onBack: () => void;
    validationErrors?: string[];
}

const MobileEditor: React.FC<MobileEditorProps> = ({ data, onChange, onNext, onBack, validationErrors = [] }) => {
    const [currentView, setCurrentView] = useState<MobileView>('dashboard');
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('target-jd');
    const tabsRef = useRef<HTMLDivElement>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const [isRefining, setIsRefining] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoUrl || null);
    const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [atsModalOpen, setAtsModalOpen] = useState(false);
    const [atsScore, setAtsScore] = useState<number | null>(null);
    const [atsMissing, setAtsMissing] = useState<string[]>([]);

    const resumeText = useMemo(() => resumeToText(data), [data]);
    const jdText = data.jobDescription?.trim() ?? '';

    useEffect(() => {
        const t = setTimeout(() => {
            if (jdText) {
                const keywords = extractKeywordsFromJD(jdText);
                const result = scoreATS(resumeText, keywords);
                setAtsScore(result.score);
                setAtsMissing(result.missing.map((m) => m.keyword));
            } else {
                setAtsScore(null);
                setAtsMissing([]);
            }
        }, ATS_DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [resumeText, jdText]);

    const tabs: { id: TabId, label: string, icon: any }[] = [
        { id: 'target-jd', label: 'Job Role', icon: Target },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'projects', label: 'Projects', icon: Code },
        { id: 'skills', label: 'Skills', icon: Sparkles },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
    ];

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const updateData = useCallback((newData: Partial<ResumeData>) => {
        onChange({ ...data, ...newData });
    }, [data, onChange]);

    // Handle role input change
    const onRoleChange = (val: string) => {
        updateData({ basics: { ...data.basics, targetRole: val } });
        if (val.trim()) {
            const suggestions = getRoleSuggestions(val, 5);
            setRoleSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setRoleSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectRole = (role: string) => {
        updateData({ basics: { ...data.basics, targetRole: role } });
        setShowSuggestions(false);
    };

    // Navigation handlers
    const navigateToSection = (sectionId: string) => {
        setCurrentSectionId(sectionId);
        setCurrentView('section-editor');
    };

    const navigateToDashboard = () => {
        setCurrentView('dashboard');
        setCurrentSectionId(null);
    };

    const handleReorderSection = (fromIndex: number, toIndex: number) => {
        // Section reordering logic handled by dashboard component
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[#0F172A] relative font-sans overflow-hidden">
            {/* Dashboard View - Master Shell Fix */}
            {currentView === 'dashboard' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    <MobileHeader
                        title="RESUME EDITOR"
                        onBack={onBack}
                        onNext={onNext}
                        showNext={false}
                        variant="dark"
                    />

                    <MobileSectionDashboard
                        data={data}
                        onNavigateToSection={navigateToSection}
                        onReorderSection={handleReorderSection}
                        onContinue={onNext}
                        onBack={onBack}
                        atsScore={atsScore}
                        missingKeywords={atsMissing}
                        onImproveClick={() => setAtsModalOpen(true)}
                    />

                    {/* Validation Error Toast - Premium Style */}
                    {validationErrors.length > 0 && (
                        <div className="fixed bottom-32 left-6 right-6 z-[200] animate-in slide-in-from-bottom-10 duration-500 ease-out">
                            <div className="bg-white/90 backdrop-blur-2xl text-black p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white flex items-start gap-5">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                                        <X size={20} className="text-red-500" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400">Required Details</p>
                                    <ul className="space-y-2">
                                        {validationErrors.map((err, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-red-500/20 rounded-full" />
                                                <span className="text-[12px] font-bold text-gray-800">{err}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {currentView === 'section-editor' && currentSectionId && currentSectionId !== 'target-jd' && (
                <MobileSectionEditor
                    sectionId={currentSectionId}
                    data={data}
                    onChange={(newData: Partial<ResumeData>) => onChange({ ...data, ...newData })}
                    onBack={navigateToDashboard}
                    onSaveAndPreview={onNext}
                />
            )}

            {currentView === 'section-editor' && currentSectionId === 'target-jd' && (
                <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0F172A] relative overflow-hidden">
                    <MobileHeader
                        title="TARGET ROLE"
                        onBack={navigateToDashboard}
                        showNext={false}
                        variant="dark"
                    />

                    <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 pt-24 pb-60 scrollbar-hide">
                        {/* Role Selection Card - Master Refinement */}
                        <div className="mb-10 relative pt-4">
                            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
                                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 block px-1">Target Job Role</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
                                        <Target size={28} strokeWidth={2.5} className="scale-90 sm:scale-100" />
                                    </div>
                                    <input
                                        value={data.basics.targetRole || ''}
                                        onChange={(e) => onRoleChange(e.target.value)}
                                        className="w-full bg-transparent border-none text-[22px] sm:text-[26px] font-black text-white placeholder:text-slate-700 focus:ring-0 p-0 tracking-tight leading-none"
                                        placeholder="Software Engineer"
                                    />
                                </div>
                            </div>

                            {/* Suggestions Dropdown - Limited Height & Scroll */}
                            {showSuggestions && roleSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-[90%] mt-2 z-50 bg-slate-900/98 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 overflow-y-auto max-h-[280px] sm:max-h-[350px] animate-in fade-in slide-in-from-top-4 duration-300">
                                    {roleSuggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectRole(suggestion)}
                                            className="w-full px-7 sm:px-8 py-4 sm:py-5 text-left hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5 last:border-none flex items-center justify-between group"
                                        >
                                            <span className="text-[12px] sm:text-[13px] font-black text-white uppercase tracking-widest leading-none">{suggestion}</span>
                                            <ChevronRight size={18} className="text-slate-500 group-active:text-white transition-colors" strokeWidth={3} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience & Market Grid */}
                        <div className="space-y-12">
                            {/* Experience Level */}
                            <div>
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                        <Briefcase size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[11px] font-black tracking-[0.25em] uppercase text-slate-400">Experience Level</h2>
                                </div>
                                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                                    {[
                                        { id: 'fresher', label: 'Fresher', sub: '0-1 yrs' },
                                        { id: 'early', label: 'Early Career', sub: '1-3 Yrs' },
                                        { id: 'mid', label: 'Professional', sub: '3-5 Yrs' },
                                        { id: 'senior', label: 'Expert', sub: '6+ Yrs' }
                                    ].map((lvl) => {
                                        const isSelected = data.basics.experienceLevel === lvl.id;
                                        return (
                                            <button
                                                key={lvl.id}
                                                // @ts-ignore - We know these IDs match the type
                                                onClick={() => updateData({ basics: { ...data.basics, experienceLevel: lvl.id as any } })}
                                                className={`p-5 min-[400px]:p-6 rounded-[2rem] border-2 text-left transition-all active:scale-[0.95] flex flex-col justify-between h-32 ${isSelected
                                                    ? 'bg-white border-white shadow-2xl shadow-white/10'
                                                    : 'bg-white/5 border-white/5 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div className={`w-9 h-9 min-[400px]:w-10 min-[400px]:h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-black text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
                                                        {isSelected ? <CheckCircle2 size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`font-black text-[13px] min-[400px]:text-[14px] uppercase tracking-wide leading-none transition-colors ${isSelected ? 'text-black' : 'text-white'}`}>{lvl.label}</p>
                                                    <p className={`text-[10px] font-black mt-1.5 transition-colors ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>{lvl.sub}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Target Market - Master Refinement */}
                            <div className="pb-10">
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                        <Globe size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] uppercase text-slate-300">Target Market</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: 'india', label: 'India', sub: 'Domestic Market', icon: 'IN' },
                                        { id: 'us', label: 'USA', sub: 'International (US)', icon: 'US' },
                                        { id: 'gulf', label: 'Gulf', sub: 'UAE / Saudi / Qatar', icon: 'AE' },
                                        { id: 'global', label: 'Global', sub: 'Europe / UK / Others', icon: <Globe size={18} /> }
                                    ].map((m) => {
                                        const isSelected = data.basics.targetMarket === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                // @ts-ignore
                                                onClick={() => updateData({ basics: { ...data.basics, targetMarket: m.id as any } })}
                                                className={`p-5 min-[400px]:p-6 rounded-[2.5rem] border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between ${isSelected
                                                    ? 'bg-white border-white shadow-2xl shadow-white/10'
                                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 min-[400px]:gap-6">
                                                    <div className={`w-11 h-11 min-[400px]:w-14 min-[400px]:h-14 rounded-2xl flex items-center justify-center font-black text-[14px] min-[400px]:text-[16px] transition-all ${isSelected ? 'bg-black text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
                                                        {m.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black text-[14px] min-[400px]:text-[15px] uppercase tracking-wide leading-tight transition-colors ${isSelected ? 'text-black' : 'text-white'}`}>{m.label}</p>
                                                        <p className={`text-[9px] min-[400px]:text-[10px] font-black mt-1.5 transition-colors ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>{m.sub}</p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                                                        <CheckCircle2 size={14} className="text-white" strokeWidth={4} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Job Description - Master Refinement */}
                            <div className="pb-10">
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                        <FileText size={20} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[10px] sm:text-[11px] font-black tracking-[0.25em] uppercase text-slate-300">Job Description <span className="opacity-40 text-slate-500 ml-1">(Optional)</span></h2>
                                </div>
                                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl overflow-hidden">
                                    <textarea
                                        value={data.jobDescription || ''}
                                        onChange={(e) => updateData({ jobDescription: e.target.value })}
                                        className="w-full bg-transparent border-none text-[15px] sm:text-[16px] font-bold text-white placeholder:text-slate-700 focus:ring-0 p-0 min-h-[180px] sm:min-h-[250px] resize-none leading-relaxed"
                                        placeholder="Paste the job description here for AI optimization..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Bottom CTA - Master Safety */}
                    <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-6 bg-black/60 backdrop-blur-3xl border-t border-white/10 safe-area-bottom z-[200]">
                        <button
                            onClick={navigateToDashboard}
                            disabled={!data.basics.targetRole?.trim() || !data.basics.experienceLevel || !data.basics.targetMarket}
                            className={`w-full h-15 sm:h-18 rounded-[2rem] font-black text-[15px] sm:text-[16px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-2xl ${data.basics.targetRole?.trim() && data.basics.experienceLevel && data.basics.targetMarket
                                ? 'bg-white text-black shadow-white/10'
                                : 'bg-white/5 text-slate-700 cursor-not-allowed shadow-none border border-white/5'
                                }`}
                        >
                            <Sparkles size={24} strokeWidth={3} className="sm:scale-110" />
                            <span>Confirm & Next</span>
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
            )}

            <MobileATSModal
                open={atsModalOpen}
                onClose={() => setAtsModalOpen(false)}
                score={atsScore}
                missingKeywords={atsMissing}
            />
        </div>
    );
};

export default MobileEditor;
