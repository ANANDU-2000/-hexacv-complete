/**
 * MOBILE SECTION EDITOR - MAXIMUM VISIBILITY & PREMIUM DESIGN
 * 
 * Objectives:
 * 1. Superior contrast (Pure black/white where possible)
 * 2. Icon-rich inputs for professional feel
 * 3. Clear section separation
 */

import React, { useRef, useState } from 'react';
import { ResumeData } from '../../types';
import {
    Plus, Trash2, Camera, X, CheckCircle2, Briefcase, Globe,
    FileText, Sparkles, User, Mail, Phone, MapPin,
    Linkedin, Github, Calendar, GraduationCap, Award, Target,
    ChevronDown, ChevronUp, MoreVertical, Pencil, ArrowUp, ArrowDown
} from 'lucide-react';
import { matchKeywords, extractJDSkills } from '../../utils/keywordMatcher';
import { MobileHeader } from './MobileHeader';

interface Props {
    sectionId: string;
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
    onBack: () => void;
    /** When set, sticky CTA becomes "Save & Preview" and calls this instead of onBack */
    onSaveAndPreview?: () => void;
}

export default function MobileSectionEditor({ sectionId, data, onChange, onBack, onSaveAndPreview }: Props) {
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const getSectionTitle = (): string => {
        const titles: Record<string, string> = {
            profile: 'PERSONAL INFO',
            experience: 'WORK HISTORY',
            projects: 'KEY PROJECTS',
            skills: 'EXPERTISE',
            education: 'EDUCATION',
            achievements: 'ACHIEVEMENTS'
        };
        return titles[sectionId] || 'EDITOR';
    };

    // Premium Input Component with Icon & High Contrast - Fluid & Responsive
    const InputField = ({ label, value, onChange, placeholder, type = "text", optional = false, icon: Icon }: any) => (
        <div className="mb-5 sm:mb-6 w-full group">
            <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-600 group-focus-within:text-gray-900 transition-colors">
                    {label}
                </label>
                {optional && <span className="text-[8px] sm:text-[9px] font-semibold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">Optional</span>}
            </div>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors pointer-events-none">
                        <Icon size={18} strokeWidth={2.5} className="sm:scale-110" />
                    </div>
                )}
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full h-12 sm:h-14 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-[15px] sm:text-[16px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all ${Icon ? 'pl-12 sm:pl-14 pr-4 sm:pr-6' : 'px-4 sm:px-6'}`}
                />
            </div>
        </div>
    );

    const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, icon: Icon }: any) => (
        <div className="mb-5 sm:mb-6 w-full group">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 px-1">
                {Icon && <Icon size={14} className="text-gray-400 group-focus-within:text-gray-700 transition-colors sm:scale-110" strokeWidth={3} />}
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-600 group-focus-within:text-gray-900 transition-colors">{label}</label>
            </div>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-4 sm:px-5 sm:py-5 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-[15px] sm:text-[16px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none leading-relaxed"
            />
        </div>
    );

    const handleStickyCta = () => {
        if (onSaveAndPreview) onSaveAndPreview();
        else onBack();
    };

    const stickyLabel = onSaveAndPreview ? 'Save & Preview' : `Save ${getSectionTitle()}`;

    // Layout Wrapper - one primary CTA per screen
    const SectionWrapper = ({ children, isDoneEnabled = true }: any) => (
        <div className="h-full bg-gray-50 flex flex-col relative overflow-hidden">
            <MobileHeader title={getSectionTitle()} onBack={onBack} showNext={false} variant="light" />

            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 pt-24 pb-60 scrollbar-hide relative z-10 text-gray-900">
                {children}
            </div>

            {/* Sticky bottom: one primary CTA — Save & Preview or Save */}
            <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-6 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-bottom z-[200]">
                <button
                    onClick={handleStickyCta}
                    disabled={!isDoneEnabled}
                    className="w-full min-h-[52px] sm:min-h-[56px] rounded-2xl bg-blue-600 text-white font-bold text-[15px] sm:text-[16px] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:text-gray-500 shadow-md touch-manipulation"
                    aria-label={stickyLabel}
                >
                    <CheckCircle2 size={24} strokeWidth={3} className="sm:scale-110" aria-hidden />
                    <span>{stickyLabel}</span>
                </button>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.25rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .pl-13 { padding-left: 3.25rem; }
                .mobile-compact-form input, .mobile-compact-form textarea { padding: 12px 14px; font-size: 14px; border-radius: 12px; }
            `}</style>
        </div>
    );

    // ===== PERSONAL INFO =====
    if (sectionId === 'profile') {
        const photoInputRef = useRef<HTMLInputElement>(null);
        const includePhoto = data.basics?.includePhoto !== false;
        const targetMarket = data.basics?.targetMarket;
        const photoGuidance =
            targetMarket === 'gulf'
                ? 'For Gulf roles, photo is often optional unless the job ad asks for it.'
                : targetMarket === 'india'
                    ? 'In India, a professional photo is common on resumes.'
                    : targetMarket && ['us', 'uk', 'eu', 'remote'].includes(targetMarket)
                        ? 'For international roles, check the job ad; many prefer no photo.'
                        : 'Check the job ad for photo requirements.';

        return (
            <SectionWrapper isDoneEnabled={!!(data.basics.fullName?.trim() && data.basics.email?.trim())}>
                <div className="flex flex-col min-[380px]:flex-row gap-6 min-[380px]:items-start pt-4 mobile-compact-form">
                    <div className="flex-1 min-w-0 space-y-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Add a professional photo (optional)</p>
                        <p className="text-sm text-gray-600 mb-3">Do you want to add a profile photo?</p>
                        <div className="flex gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => onChange({ basics: { ...data.basics, includePhoto: true } })}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${includePhoto ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            >
                                Yes
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange({ basics: { ...data.basics, includePhoto: false } })}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${!includePhoto ? 'bg-gray-200 border-gray-300 text-gray-800' : 'bg-white border-gray-200 text-gray-700'}`}
                            >
                                No / Skip
                            </button>
                        </div>

                        {includePhoto && (
                            <>
                                <div className="flex flex-col items-center min-[380px]:items-start mb-6">
                                    <div className="relative group">
                                        {data.photoUrl ? (
                                            <div className="relative w-36 h-36 min-[380px]:w-44 min-[380px]:h-44 rounded-3xl overflow-hidden border-2 border-gray-200 shadow bg-gray-100">
                                                <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => onChange({ photoUrl: undefined })}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-white"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => photoInputRef.current?.click()}
                                                className="w-36 h-36 min-[380px]:w-44 min-[380px]:h-44 rounded-3xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 active:scale-[0.98]"
                                            >
                                                <Camera size={28} strokeWidth={2.5} />
                                                <span className="text-[10px] font-semibold uppercase">Add Photo</span>
                                            </button>
                                        )}
                                        <input ref={photoInputRef} type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const r = new FileReader();
                                                r.onload = (ev) => onChange({ photoUrl: ev.target?.result as string });
                                                r.readAsDataURL(file);
                                            }
                                        }} className="hidden" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 max-w-[280px]">{photoGuidance}</p>
                                </div>
                            </>
                        )}
                        {!includePhoto && (
                            <p className="text-xs text-gray-500 mb-4">You can add a photo later from the editor.</p>
                        )}

                        <InputField label="Full Name" icon={User} value={data.basics.fullName} onChange={(val: string) => onChange({ basics: { ...data.basics, fullName: val } })} placeholder="e.g. Surag M.S." />
                        <InputField label="Email Address" icon={Mail} value={data.basics.email} onChange={(val: string) => onChange({ basics: { ...data.basics, email: val } })} placeholder="e.g. name@email.com" type="email" />
                        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                            <InputField label="Phone" icon={Phone} value={data.basics.phone} onChange={(val: string) => onChange({ basics: { ...data.basics, phone: val } })} placeholder="+91 987..." />
                            <InputField label="Location" icon={MapPin} value={data.basics.location} onChange={(val: string) => onChange({ basics: { ...data.basics, location: val } })} placeholder="London, UK" />
                        </div>
                        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                            <InputField label="LinkedIn" icon={Linkedin} value={data.basics.linkedin} onChange={(val: string) => onChange({ basics: { ...data.basics, linkedin: val } })} placeholder="username" optional />
                            <InputField label="GitHub" icon={Github} value={data.basics.github} onChange={(val: string) => onChange({ basics: { ...data.basics, github: val } })} placeholder="username" optional />
                        </div>
                        <TextAreaField label="Professional Summary" icon={Sparkles} value={data.summary} onChange={(val: string) => onChange({ summary: val })} placeholder="Briefly describe your professional background..." rows={5} />
                    </div>
                    {data.photoUrl && (
                        <div className="min-[380px]:shrink-0 min-[380px]:w-32 min-[380px]:pt-10">
                            <div className="w-28 h-28 min-[380px]:w-32 min-[380px]:h-32 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100">
                                <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>
            </SectionWrapper>
        );
    }

    // ===== SKILLS =====
    if (sectionId === 'skills') {
        const skillsText = data.skills.join(', ');
        const jdSkills = extractJDSkills(data.jobDescription || '');
        const { matched } = matchKeywords(skillsText, data.jobDescription || '');

        return (
            <SectionWrapper>
                <div className="mb-8">
                    <TextAreaField
                        label="Expertise & Skills"
                        icon={Sparkles}
                        value={skillsText}
                        onChange={(val: string) => onChange({ skills: val.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="React, TypeScript, Node.js, AWS, System Architecture..."
                        rows={10}
                    />
                    <p className="text-[11px] font-bold text-gray-400 mt-2 px-1">Separate skills with commas for best results.</p>
                </div>

                {jdSkills.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 shadow-sm overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Target size={22} strokeWidth={3} className="scale-90 sm:scale-100" />
                                </div>
                                <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-widest text-gray-900">Keyword Match</span>
                            </div>
                            <div className="bg-gray-100 px-3.5 py-2 rounded-full border border-gray-200 w-fit">
                                <span className="text-[9px] sm:text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
                                    {matched.length} / {jdSkills.length} FOUND
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                            {jdSkills.slice(0, 20).map((skill, i) => {
                                const isMatched = data.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
                                return (
                                    <span key={i} className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-tight transition-all border ${isMatched
                                        ? 'bg-white text-black border-white shadow-lg scale-105'
                                        : 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}>
                                        {skill}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </SectionWrapper>
        );
    }

    // ===== EXPERIENCE ===== — Collapsible role cards, bullets vertical, Move Up/Down, no drag
    if (sectionId === 'experience') {
        const [expandedRoleIndex, setExpandedRoleIndex] = useState<number | null>(0);
        const [bulletMenu, setBulletMenu] = useState<{ roleIdx: number; bulletIdx: number } | null>(null);
        const [editingBullet, setEditingBullet] = useState<{ roleIdx: number; bulletIdx: number } | null>(null);
        const items = data.experience;
        const addItem = () => {
            const next = [{ id: generateId(), company: '', position: '', startDate: '', endDate: '', highlights: [''] }, ...items];
            onChange({ experience: next });
            setExpandedRoleIndex(0);
        };
        const updateItem = (idx: number, f: string, v: any) => { const u = [...items]; (u[idx] as any)[f] = v; onChange({ experience: u }); };
        const deleteItem = (idx: number) => {
            onChange({ experience: items.filter((_, i) => i !== idx) });
            setExpandedRoleIndex(expandedRoleIndex === idx ? null : expandedRoleIndex != null && expandedRoleIndex > idx ? expandedRoleIndex - 1 : expandedRoleIndex);
        };
        const moveRole = (fromIdx: number, dir: 'up' | 'down') => {
            const toIdx = dir === 'up' ? fromIdx - 1 : fromIdx + 1;
            if (toIdx < 0 || toIdx >= items.length) return;
            const u = [...items];
            [u[fromIdx], u[toIdx]] = [u[toIdx], u[fromIdx]];
            onChange({ experience: u });
            setExpandedRoleIndex(toIdx);
        };
        const highlights = (item: typeof items[0]) => item.highlights ?? [];
        const setHighlights = (idx: number, lines: string[]) => {
            const u = [...items];
            u[idx] = { ...u[idx], highlights: lines };
            onChange({ experience: u });
        };
        const moveBullet = (roleIdx: number, bulletIdx: number, dir: 'up' | 'down') => {
            const lines = [...highlights(items[roleIdx])];
            const toIdx = dir === 'up' ? bulletIdx - 1 : bulletIdx + 1;
            if (toIdx < 0 || toIdx >= lines.length) return;
            [lines[bulletIdx], lines[toIdx]] = [lines[toIdx], lines[bulletIdx]];
            setHighlights(roleIdx, lines);
            setBulletMenu(null);
            setEditingBullet(null);
        };
        const editBullet = (roleIdx: number, bulletIdx: number, text: string) => {
            const lines = [...highlights(items[roleIdx])];
            lines[bulletIdx] = text;
            setHighlights(roleIdx, lines);
            setBulletMenu(null);
            setEditingBullet(null);
        };
        const deleteBullet = (roleIdx: number, bulletIdx: number) => {
            const lines = highlights(items[roleIdx]).filter((_, i) => i !== bulletIdx);
            setHighlights(roleIdx, lines.length ? lines : ['']);
            setBulletMenu(null);
            setEditingBullet(null);
        };
        const addBullet = (roleIdx: number) => {
            const lines = [...highlights(items[roleIdx]), ''];
            setHighlights(roleIdx, lines);
        };

        return (
            <SectionWrapper>
                <button onClick={addItem} className="w-full min-h-[52px] py-4 mb-8 rounded-[2rem] bg-white text-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black uppercase tracking-[0.2em] text-[14px] touch-manipulation">
                    <Plus size={22} strokeWidth={4} aria-hidden />
                    <span>Add position</span>
                </button>

                <div className="space-y-4 pb-10">
                    {items.map((item, idx) => {
                        const isExpanded = expandedRoleIndex === idx;
                        const bullets = highlights(item);
                        return (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                {/* Role card header — collapsible */}
                                <button
                                    type="button"
                                    onClick={() => setExpandedRoleIndex(isExpanded ? null : idx)}
                                    className="w-full flex items-center gap-3 p-4 sm:p-5 text-left touch-manipulation"
                                >
                                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                        {isExpanded ? <ChevronUp size={20} className="text-gray-700" /> : <ChevronDown size={20} className="text-gray-700" />}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] sm:text-[16px] font-bold text-gray-900 truncate">{item.position || 'Position'}</p>
                                        <p className="text-[12px] text-gray-500 truncate">{item.company || 'Company'} · {item.startDate || '—'} – {item.endDate || '—'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveRole(idx, 'up'); }} disabled={idx === 0} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 touch-manipulation" aria-label="Move up"><ArrowUp size={18} /></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); moveRole(idx, 'down'); }} disabled={idx === items.length - 1} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 touch-manipulation" aria-label="Move down"><ArrowDown size={18} /></button>
                                        <button type="button" onClick={(e) => { e.stopPropagation(); deleteItem(idx); }} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 active:bg-red-500 active:text-white touch-manipulation" aria-label="Delete role"><Trash2 size={18} /></button>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-5 pt-1 border-t border-gray-200">
                                        <InputField label="Position" icon={Briefcase} value={item.position} onChange={(v: string) => updateItem(idx, 'position', v)} placeholder="e.g. Senior Engineer" />
                                        <InputField label="Company" icon={Globe} value={item.company} onChange={(v: string) => updateItem(idx, 'company', v)} placeholder="Company name" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Start" icon={Calendar} value={item.startDate} onChange={(v: string) => updateItem(idx, 'startDate', v)} placeholder="Jan 2020" />
                                            <InputField label="End" icon={Calendar} value={item.endDate} onChange={(v: string) => updateItem(idx, 'endDate', v)} placeholder="Present" />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-4 mb-2 px-1">Bullets</p>
                                        <div className="space-y-2">
                                            {bullets.map((bullet, bIdx) => (
                                                <div key={bIdx} className="flex items-start gap-2 group/bullet">
                                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 mt-1.5" aria-hidden />
                                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                                        {editingBullet?.roleIdx === idx && editingBullet?.bulletIdx === bIdx ? (
                                                            <input
                                                                type="text"
                                                                defaultValue={bullet}
                                                                onBlur={(e) => editBullet(idx, bIdx, e.target.value.trim() || bullet)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                                                className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400"
                                                                placeholder="Bullet point"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button type="button" onClick={() => { setEditingBullet({ roleIdx: idx, bulletIdx: bIdx }); setBulletMenu(null); }} className="flex-1 text-left px-3 py-2.5 rounded-xl bg-gray-50 text-[14px] text-gray-900 min-h-[44px] touch-manipulation">
                                                                {bullet || 'Tap to edit'}
                                                            </button>
                                                        )}
                                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                                            <button type="button" onClick={() => moveBullet(idx, bIdx, 'up')} disabled={bIdx === 0} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 touch-manipulation" aria-label="Move bullet up"><ArrowUp size={16} /></button>
                                                            <button type="button" onClick={() => moveBullet(idx, bIdx, 'down')} disabled={bIdx === bullets.length - 1} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 touch-manipulation" aria-label="Move bullet down"><ArrowDown size={16} /></button>
                                                            <div className="relative">
                                                                <button type="button" onClick={(e) => { e.stopPropagation(); setBulletMenu(bulletMenu?.roleIdx === idx && bulletMenu?.bulletIdx === bIdx ? null : { roleIdx: idx, bulletIdx: bIdx }); setEditingBullet(null); }} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 touch-manipulation" aria-label="Actions"><MoreVertical size={18} /></button>
                                                                {bulletMenu?.roleIdx === idx && bulletMenu?.bulletIdx === bIdx && (
                                                                    <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[140px]">
                                                                        <button type="button" onClick={() => { setEditingBullet({ roleIdx: idx, bulletIdx: bIdx }); setBulletMenu(null); }} className="w-full px-4 py-2.5 text-left text-[13px] text-gray-900 flex items-center gap-2 hover:bg-gray-50"><Pencil size={14} /> Edit</button>
                                                                        <button type="button" onClick={() => setBulletMenu(null)} className="w-full px-4 py-2.5 text-left text-[13px] text-gray-900 flex items-center gap-2 hover:bg-gray-50"><Sparkles size={14} /> Improve</button>
                                                                        <button type="button" onClick={() => deleteBullet(idx, bIdx)} className="w-full px-4 py-2.5 text-left text-[13px] text-red-600 flex items-center gap-2 hover:bg-gray-50"><Trash2 size={14} /> Delete</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addBullet(idx)} className="mt-3 w-full min-h-[44px] rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-[13px] font-bold flex items-center justify-center gap-2 touch-manipulation">
                                            <Plus size={18} /> Add bullet
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-6 text-gray-500">
                                <Briefcase size={40} strokeWidth={1.5} />
                            </div>
                            <p className="font-bold text-[13px] uppercase tracking-wider text-gray-500">No positions yet</p>
                            <p className="text-[12px] text-slate-500 mt-1">Tap “Add position” above</p>
                        </div>
                    )}
                </div>
            </SectionWrapper>
        );
    }

    // ===== PROJECTS =====
    if (sectionId === 'projects') {
        const items = data.projects;
        const addItem = () => onChange({ projects: [{ id: generateId(), name: '', description: '', tech: [] }, ...items] });
        const updateItem = (idx: number, f: string, v: any) => {
            const u = [...items];
            if (f === 'tech') {
                (u[idx] as any)[f] = typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : v;
            } else {
                (u[idx] as any)[f] = v;
            }
            onChange({ projects: u });
        };
        const deleteItem = (idx: number) => onChange({ projects: items.filter((_, i) => i !== idx) });

        return (
            <SectionWrapper>
                <button onClick={addItem} className="w-full h-18 sm:h-20 mb-10 rounded-[2rem] bg-white text-black flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black uppercase tracking-[0.2em] text-[13px] sm:text-[14px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add New Project</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Project 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="pt-12 sm:pt-14 space-y-4">
                                <InputField label="Project Name" icon={FileText} value={item.name} onChange={(v: string) => updateItem(idx, 'name', v)} placeholder="E-commerce Engine" />
                                <TextAreaField label="Tech Stack" icon={Plus} value={(item.tech || []).join(', ')} onChange={(v: string) => updateItem(idx, 'tech', v)} placeholder="React, Node.js, Stripe" rows={2} />
                                <TextAreaField label="Description" icon={Sparkles} value={item.description} onChange={(v: string) => updateItem(idx, 'description', v)} placeholder="Describe your contribution and the impact..." rows={6} />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        );
    }

    // ===== EDUCATION =====
    if (sectionId === 'education') {
        const items = data.education;
        const addItem = () => onChange({ education: [{ id: generateId(), institution: '', degree: '', field: '', graduationDate: '' }, ...items] });
        const updateItem = (idx: number, f: string, v: any) => { const u = [...items]; (u[idx] as any)[f] = v; onChange({ education: u }); };
        const deleteItem = (idx: number) => onChange({ education: items.filter((_, i) => i !== idx) });

        return (
            <SectionWrapper>
                <button onClick={addItem} className="w-full h-18 sm:h-20 mb-10 rounded-[2rem] bg-white text-black flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black uppercase tracking-[0.2em] text-[13px] sm:text-[14px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Education</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-[0.25em]">Academic 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="pt-12 sm:pt-14 space-y-4">
                                <InputField label="Degree / Course" icon={GraduationCap} value={item.degree} onChange={(v: string) => updateItem(idx, 'degree', v)} placeholder="B.Tech in AI" />
                                <InputField label="Institution" icon={Globe} value={item.institution} onChange={(v: string) => updateItem(idx, 'institution', v)} placeholder="IIT Madras" />
                                <InputField label="Graduation Year" icon={Calendar} value={item.graduationDate} onChange={(v: string) => updateItem(idx, 'graduationDate', v)} placeholder="2024" />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        );
    }

    // ===== ACHIEVEMENTS =====
    if (sectionId === 'achievements') {
        const items = data.achievements;
        const addItem = () => onChange({ achievements: [{ id: generateId(), description: '' }, ...items] });
        const updateItem = (idx: number, v: string) => { const u = [...items]; u[idx] = { ...u[idx], description: v }; onChange({ achievements: u }); };
        const deleteItem = (idx: number) => onChange({ achievements: items.filter((_, i) => i !== idx) });

        return (
            <SectionWrapper>
                <button onClick={addItem} className="w-full h-18 sm:h-20 mb-10 rounded-[2rem] bg-white text-black flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black uppercase tracking-[0.2em] text-[13px] sm:text-[14px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Milestone</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-[0.25em]">Award 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="pt-12 sm:pt-14 space-y-4">
                                <TextAreaField
                                    label="Description"
                                    icon={Award}
                                    value={item.description}
                                    onChange={(v: string) => updateItem(idx, v)}
                                    placeholder="e.g. Winner of Global Hackathon 2023..."
                                    rows={5}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper>
            <div className="py-20 text-center text-black font-black uppercase tracking-widest opacity-30">
                Segment Ready
            </div>
        </SectionWrapper>
    );
}

