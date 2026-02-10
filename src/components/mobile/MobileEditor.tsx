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

function CollapsibleJD({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-[13px] font-medium text-[#111827]"
            >
                <span>Optional JD</span>
                <ChevronRight size={18} className={`text-[#6B7280] transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
                <div className="border-t border-[#E5E7EB] p-3">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Paste job description for AI optimization..."
                        className="ux-textarea w-full min-h-[120px] resize-none"
                        rows={5}
                    />
                </div>
            )}
        </div>
    );
}

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
                <div className="mobile-app flex-1 flex flex-col h-full min-h-0 bg-[#fafafa] relative overflow-hidden">
                    <MobileHeader title="Target Setup" onBack={navigateToDashboard} showNext={false} variant="light" />

                    <div className="flex-1 min-h-0 overflow-y-auto mobile-app-scroll px-4 pt-20 pb-24 scrollbar-hide ux-section flex flex-col">
                        {/* Role — one task, searchable chips */}
                        <div className="ux-field-gap flex flex-col">
                            <p className="text-[13px] font-medium text-[#111827] ux-label-gap">What role are you targeting?</p>
                            <input
                                value={data.basics.targetRole || ''}
                                onChange={(e) => onRoleChange(e.target.value)}
                                placeholder="e.g. Software Engineer"
                                className="ux-input w-full"
                            />
                            {showSuggestions && roleSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {roleSuggestions.map((s, i) => (
                                        <button key={i} type="button" onClick={() => selectRole(s)} className="ux-chip">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience Level — chips, max 2 rows */}
                        <div className="ux-field-gap flex flex-col">
                            <p className="text-[13px] font-medium text-[#6B7280] ux-label-gap">Experience Level</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'fresher', label: 'Fresher' },
                                    { id: '1-3', label: 'Early Career' },
                                    { id: '3-5', label: 'Professional' },
                                    { id: '5-8', label: 'Expert' },
                                    { id: '8+', label: 'Lead' }
                                ].map((lvl) => {
                                    const isSelected = data.basics.experienceLevel === lvl.id;
                                    return (
                                        <button
                                            key={lvl.id}
                                            type="button"
                                            onClick={() => updateData({ basics: { ...data.basics, experienceLevel: lvl.id as any } })}
                                            className={`ux-chip ${isSelected ? 'active' : ''}`}
                                        >
                                            {lvl.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Market — chips */}
                        <div className="ux-field-gap flex flex-col">
                            <p className="text-[13px] font-medium text-[#6B7280] ux-label-gap">Market</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'india', label: 'India' },
                                    { id: 'us', label: 'US' },
                                    { id: 'gulf', label: 'Gulf' },
                                    { id: 'global', label: 'Global' }
                                ].map((m) => {
                                    const isSelected = data.basics.targetMarket === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => updateData({ basics: { ...data.basics, targetMarket: m.id as any } })}
                                            className={`ux-chip ${isSelected ? 'active' : ''}`}
                                        >
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Optional JD — collapsible, collapsed by default */}
                        <div className="ux-field-gap flex flex-col">
                            <CollapsibleJD
                                value={data.jobDescription || ''}
                                onChange={(v) => updateData({ jobDescription: v })}
                            />
                        </div>
                    </div>

                    <div className="mobile-app-sticky fixed bottom-0 left-0 right-0 p-4 z-[200]">
                        <button
                            type="button"
                            onClick={navigateToDashboard}
                            disabled={!data.basics.targetRole?.trim() || !data.basics.experienceLevel || !data.basics.targetMarket}
                            className="mobile-app-cta w-full min-h-[52px] rounded-[14px] font-bold text-[16px] flex items-center justify-center gap-2 text-white bg-blue-600 disabled:bg-gray-200 disabled:text-gray-500"
                        >
                            Continue →
                        </button>
                    </div>

                    <style>{`
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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
