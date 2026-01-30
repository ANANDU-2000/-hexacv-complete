import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ResumeData, TabId } from '../../types';
import { ChevronRight, ChevronLeft, Plus, X, Eye, Sparkles, Target, User, Briefcase, Code, GraduationCap, Trophy, Camera, CheckCircle2, Globe, FileText, Laptop } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { TemplateRenderer } from '../../template-renderer';
import { refineResumeSummary, refineExperienceHighlights } from '../../services/geminiService';
import MobileSectionDashboard from './MobileSectionDashboard';
import MobileSectionEditor from './MobileSectionEditor';

import { getRoleSuggestions } from '../../constants/roles';

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
        <div className="flex flex-col h-[100dvh] bg-[#F5F5F7] relative font-sans overflow-hidden">
            {/* Dashboard View */}
            {currentView === 'dashboard' && (
                <>
                    <MobileHeader
                        title="RESUME EDITOR"
                        onBack={onBack}
                        onNext={onNext}
                        showNext={false}
                    />

                    <MobileSectionDashboard
                        data={data}
                        onNavigateToSection={navigateToSection}
                        onReorderSection={handleReorderSection}
                        onContinue={onNext}
                        onBack={onBack}
                    />

                    {/* Validation Error Toast - Professional Style */}
                    {validationErrors.length > 0 && (
                        <div className="fixed bottom-32 left-6 right-6 z-[60] animate-in slide-in-from-bottom-6 duration-500">
                            <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 flex items-start gap-4">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                                        <X size={18} className="text-red-500" strokeWidth={3} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400">Required Fields</p>
                                    <ul className="text-[11px] font-bold text-gray-800 space-y-1.5">
                                        {validationErrors.map((err, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-black/20 rounded-full" />
                                                <span>{err}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {currentView === 'section-editor' && currentSectionId && currentSectionId !== 'target-jd' && (
                <MobileSectionEditor
                    sectionId={currentSectionId}
                    data={data}
                    onChange={(newData: Partial<ResumeData>) => onChange({ ...data, ...newData })}
                    onBack={navigateToDashboard}
                />
            )}

            {currentView === 'section-editor' && currentSectionId === 'target-jd' && (
                <div className="h-[100dvh] flex flex-col bg-[#F5F5F7] text-black">
                    {/* Header */}
                    <div className="fixed top-0 left-0 right-0 z-[150] bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
                        <div className="flex items-center justify-between px-6 h-20">
                            <button onClick={navigateToDashboard} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5 transition-all text-black">
                                <ChevronLeft size={24} strokeWidth={2.5} />
                            </button>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Job Role Setup</span>
                            <div className="w-10" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 pt-24 pb-32 scrollbar-hide">
                        {/* Role Input Card */}
                        <div className="mb-8 relative">
                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">Target Role</label>
                                <input
                                    value={data.basics.targetRole || ''}
                                    onChange={(e) => onRoleChange(e.target.value)}
                                    className="w-full bg-transparent border-none text-[26px] font-black text-black placeholder:text-gray-200 focus:ring-0 p-0 tracking-tight"
                                    placeholder="Software Engineer"
                                />
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && roleSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {roleSuggestions.map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => selectRole(suggestion)}
                                            className="w-full px-6 py-4 text-left hover:bg-black/5 active:bg-black/5 transition-colors border-b border-gray-50 last:border-none flex items-center justify-between group"
                                        >
                                            <span className="text-[14px] font-bold text-black uppercase tracking-wide">{suggestion}</span>
                                            <ChevronRight size={16} className="text-gray-200 group-active:text-black" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Experience Level Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                        <User size={18} className="text-black" />
                                    </div>
                                    <h2 className="text-[15px] font-black tracking-widest uppercase text-black">Experience Level</h2>
                                </div>
                                <button onClick={() => updateData({ basics: { ...data.basics, experienceLevel: '' } })} className="text-gray-300 hover:text-black transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'fresher', label: 'Fresher', sub: '0-1 yrs' },
                                    { id: 'early', label: 'Early Career', sub: '1-3 Years' },
                                    { id: 'mid', label: 'Professional', sub: '3-5 Years' },
                                    { id: 'senior', label: 'Expert', sub: '6+ Years' }
                                ].map((lvl) => {
                                    const isSelected = data.basics.experienceLevel === lvl.id;
                                    return (
                                        <button
                                            key={lvl.id}
                                            onClick={() => updateData({ basics: { ...data.basics, experienceLevel: lvl.id } })}
                                            className={`p-6 rounded-[1.5rem] border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between ${isSelected
                                                ? 'bg-black border-black shadow-xl shadow-black/10'
                                                : 'bg-white border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
                                                }`}
                                        >
                                            <div>
                                                <p className={`font-black text-[15px] uppercase tracking-wide leading-tight ${isSelected ? 'text-white' : 'text-black'}`}>{lvl.label}</p>
                                                <p className={`text-[11px] font-bold ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>{lvl.sub}</p>
                                            </div>
                                            {isSelected && <CheckCircle2 size={20} className="text-white" strokeWidth={3} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Target Market Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                        <Globe size={18} className="text-black" />
                                    </div>
                                    <h2 className="text-[15px] font-black tracking-widest uppercase text-black">Target Market</h2>
                                </div>
                                <button onClick={() => updateData({ basics: { ...data.basics, targetMarket: '' } })} className="text-gray-300 hover:text-black transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'india', label: 'India', sub: 'Domestic Market', icon: 'IN' },
                                    { id: 'us', label: 'USA', sub: 'International (US)', icon: 'US' },
                                    { id: 'gulf', label: 'Gulf', sub: 'UAE / Saudi / Qatar', icon: 'AE' },
                                    { id: 'global', label: 'Global', sub: 'Europe / UK / Others', icon: <Globe size={16} /> }
                                ].map((m) => {
                                    const isSelected = data.basics.targetMarket === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => updateData({ basics: { ...data.basics, targetMarket: m.id } })}
                                            className={`p-6 rounded-[1.5rem] border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isSelected
                                                ? 'border-black'
                                                : 'border-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[12px] shadow-sm ${isSelected ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                    {m.icon}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[15px] uppercase tracking-wide leading-tight text-black">{m.label}</p>
                                                    <p className="text-[11px] font-bold text-gray-400">{m.sub}</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                                    <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Job Description Section */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                                        <FileText size={18} className="text-black" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[15px] font-black tracking-widest uppercase text-black">Job Description</h2>
                                        <span className="text-[10px] font-black text-gray-300 uppercase leading-none">(Optional)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white border-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-2">
                                <textarea
                                    value={data.jobDescription || ''}
                                    onChange={(e) => updateData({ jobDescription: e.target.value })}
                                    className="w-full bg-transparent border-none text-[15px] font-bold text-black placeholder:text-gray-200 focus:ring-0 p-0 min-h-[160px] resize-none leading-relaxed"
                                    placeholder="Paste the job description here for AI keyword matching..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Premium White Button CTA */}
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#F5F5F7]/90 backdrop-blur-xl border-t border-gray-200/50 safe-area-bottom">
                        <button
                            onClick={navigateToDashboard}
                            disabled={!data.basics.targetRole?.trim() || !data.basics.experienceLevel || !data.basics.targetMarket}
                            className={`w-full h-16 rounded-[1.5rem] font-black text-[15px] uppercase tracking-[0.1em] transition-all active:scale-[0.98] flex items-center justify-center gap-4 ${data.basics.targetRole?.trim() && data.basics.experienceLevel && data.basics.targetMarket
                                ? 'bg-white text-black border-2 border-black shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
                                : 'bg-white text-gray-200 border-2 border-gray-100 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <span>Confirm Role Setup</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${data.basics.targetRole?.trim() && data.basics.experienceLevel && data.basics.targetMarket ? 'bg-black' : 'bg-gray-200'}`} />
                        </button>
                    </div>

                    <style>{`
                        .safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); }
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default MobileEditor;
