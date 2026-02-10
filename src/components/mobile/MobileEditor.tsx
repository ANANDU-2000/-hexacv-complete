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
        <div className="flex flex-col h-[100dvh] bg-gray-50 relative font-sans overflow-hidden">
            {/* Dashboard View - Master Shell Fix */}
            {currentView === 'dashboard' && (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                    <MobileHeader
                        title="RESUME EDITOR"
                        onBack={onBack}
                        onNext={onNext}
                        showNext={false}
                        variant="light"
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
                <div className="mobile-app flex-1 flex flex-col h-full min-h-0 bg-gray-50 relative overflow-hidden">
                    <MobileHeader
                        title="TARGET ROLE"
                        onBack={navigateToDashboard}
                        showNext={false}
                        variant="light"
                    />

                    <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 pt-24 pb-60 scrollbar-hide">
                        {/* Role Selection Card - Master Refinement */}
                        <div className="mb-10 relative pt-4">
                            <div className="mobile-app-card rounded-[14px] p-5 border border-gray-200/80">
                                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-600 mb-4 block px-1">Target Job Role</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-black flex items-center justify-center shrink-0 shadow-lg">
                                        <Target size={28} strokeWidth={2.5} className="scale-90 sm:scale-100" />
                                    </div>
                                    <input
                                        value={data.basics.targetRole || ''}
                                        onChange={(e) => onRoleChange(e.target.value)}
                                        className="w-full bg-transparent border-none text-[22px] sm:text-[26px] font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0 p-0 tracking-tight leading-none"
                                        placeholder="Software Engineer"
                                    />
                                </div>
                            </div>

                            {/* Suggestions Dropdown - Limited Height & Scroll */}
                            {showSuggestions && roleSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-[90%] mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto max-h-[280px] sm:max-h-[350px] animate-in fade-in slide-in-from-top-4 duration-300">
                                    {roleSuggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectRole(suggestion)}
                                            className="w-full px-7 sm:px-8 py-4 sm:py-5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-none flex items-center justify-between group"
                                        >
                                            <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 uppercase tracking-widest leading-none">{suggestion}</span>
                                            <ChevronRight size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" strokeWidth={3} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience & Market Grid — compact to reduce scroll */}
                        <div className="space-y-6">
                            {/* Experience Level */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <Briefcase size={16} className="text-gray-600" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Experience Level</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {[
                                        { id: 'fresher', label: 'Fresher', sub: '0-1 yrs' },
                                        { id: '1-3', label: 'Early Career', sub: '1-3 Yrs' },
                                        { id: '3-5', label: 'Professional', sub: '3-5 Yrs' },
                                        { id: '5-8', label: 'Expert', sub: '5-8 Yrs' },
                                        { id: '8+', label: 'Lead', sub: '8+ Yrs' }
                                    ].map((lvl) => {
                                        const isSelected = data.basics.experienceLevel === lvl.id;
                                        return (
                                            <button
                                                key={lvl.id}
                                                // @ts-ignore - We know these IDs match the type
                                                onClick={() => updateData({ basics: { ...data.basics, experienceLevel: lvl.id as any } })}
                                                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all active:scale-[0.95] flex flex-col justify-between min-h-[72px] ${isSelected
                                                    ? 'bg-white border-gray-300 shadow-md'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <div className={`w-9 h-9 min-[400px]:w-10 min-[400px]:h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500'}`}>
                                                        {isSelected ? <CheckCircle2 size={18} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-[13px] min-[400px]:text-[14px] uppercase tracking-wide leading-none transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{lvl.label}</p>
                                                    <p className={`text-[10px] font-semibold mt-1.5 transition-colors ${isSelected ? 'text-gray-500' : 'text-gray-500'}`}>{lvl.sub}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Target Market */}
                            <div className="pb-4">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <Globe size={16} className="text-gray-600" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Target Market</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                                                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between gap-3 ${isSelected
                                                    ? 'bg-white border-gray-300 shadow-md'
                                                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4 min-[400px]:gap-6">
                                                    <div className={`w-11 h-11 min-[400px]:w-14 min-[400px]:h-14 rounded-2xl flex items-center justify-center font-bold text-[14px] min-[400px]:text-[16px] transition-all ${isSelected ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500'}`}>
                                                        {m.icon}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-[14px] min-[400px]:text-[15px] uppercase tracking-wide leading-tight transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{m.label}</p>
                                                        <p className={`text-[9px] min-[400px]:text-[10px] font-semibold mt-1.5 transition-colors ${isSelected ? 'text-gray-500' : 'text-gray-500'}`}>{m.sub}</p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                                                        <CheckCircle2 size={14} className="text-white" strokeWidth={4} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Job Description (Optional) */}
                            <div className="pb-4">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <FileText size={16} className="text-gray-600" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Job Description <span className="text-gray-400 font-normal">(optional)</span></h2>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-hidden">
                                    <textarea
                                        value={data.jobDescription || ''}
                                        onChange={(e) => updateData({ jobDescription: e.target.value })}
                                        className="w-full bg-transparent border-none text-[14px] font-medium text-gray-900 placeholder:text-gray-400 focus:ring-0 p-0 min-h-[120px] sm:min-h-[160px] resize-none leading-relaxed"
                                        placeholder="Paste the job description here for AI optimization..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mobile-app-sticky fixed bottom-0 left-0 right-0 p-4 z-[200]">
                        <button
                            onClick={navigateToDashboard}
                            disabled={!data.basics.targetRole?.trim() || !data.basics.experienceLevel || !data.basics.targetMarket}
                            className={`mobile-app-cta w-full min-h-[52px] rounded-[14px] font-bold text-[16px] transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${data.basics.targetRole?.trim() && data.basics.experienceLevel && data.basics.targetMarket
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
