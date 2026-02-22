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
    ChevronDown, ChevronUp, MoreVertical, Pencil, ArrowUp, ArrowDown, GripVertical, ChevronRight
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

    // Premium Input Component with Icon - Optmized for Readability
    const InputField = ({ label, value, onChange, placeholder, type = "text", optional = false, icon: Icon }: any) => (
        <div className="mb-4 w-full group">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
                <label className="text-[13px] font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">
                    {label}
                </label>
                {optional && <span className="text-[11px] text-gray-400 font-normal">Optional</span>}
            </div>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                        <Icon size={18} strokeWidth={2} />
                    </div>
                )}
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full min-w-0 h-11 min-h-[44px] bg-white border border-gray-300 rounded-[10px] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
                />
            </div>
        </div>
    );

    const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, icon: Icon }: any) => (
        <div className="mb-4 w-full group">
            <div className="flex items-center gap-2 mb-1.5 px-0.5">
                {Icon && <Icon size={14} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" strokeWidth={2} />}
                <label className="text-[13px] font-medium text-gray-700 group-focus-within:text-blue-600 transition-colors">{label}</label>
            </div>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full min-w-0 min-h-[72px] px-3 py-3 bg-white border border-gray-300 rounded-[10px] text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none leading-relaxed"
            />
        </div>
    );

    const handleStickyCta = () => {
        if (onSaveAndPreview) onSaveAndPreview();
        else onBack();
    };

    const stickyLabel = onSaveAndPreview ? 'Save' : `Save ${getSectionTitle()}`;

    // Layout Wrapper - one primary CTA per screen
    const SectionWrapper = ({ children, isDoneEnabled = true }: any) => (
        <div className="mobile-app h-full bg-gray-50 flex flex-col relative overflow-hidden">
            <MobileHeader title={getSectionTitle()} onBack={onBack} showNext={false} variant="light" />

            <div className="mobile-app-scroll flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-20 pb-56 scrollbar-hide relative z-10 text-gray-900">
                {children}
            </div>

            <div className="mobile-app-sticky fixed bottom-0 left-0 right-0 p-4 z-[200]">
                <button
                    onClick={handleStickyCta}
                    disabled={!isDoneEnabled}
                    className="mobile-app-cta w-full min-h-[52px] rounded-[14px] bg-blue-600 text-white font-bold text-[16px] flex items-center justify-center gap-3 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={stickyLabel}
                >
                    <CheckCircle2 size={22} strokeWidth={3} aria-hidden />
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

    // ===== PERSONAL INFO (compact, mobile-first) =====
    if (sectionId === 'profile') {
        const photoInputRef = useRef<HTMLInputElement>(null);
        const [summaryOpen, setSummaryOpen] = useState(false);

        return (
            <SectionWrapper isDoneEnabled={!!(data.basics.fullName?.trim() && data.basics.email?.trim())}>
                <div className="ux-section flex flex-col pt-2 mobile-app-scroll">
                    {/* Identity */}
                    <div className="ux-field-gap flex flex-col">
                        <label className="text-[13px] font-medium text-[#111827] ux-label-gap">Full Name</label>
                        <input className="ux-input w-full" value={data.basics.fullName || ''} onChange={(e) => onChange({ basics: { ...data.basics, fullName: e.target.value } })} placeholder="e.g. Surag M.S." />
                    </div>
                    <div className="ux-field-gap flex flex-col">
                        <label className="text-[13px] font-medium text-[#6B7280] ux-label-gap">Role title <span className="font-normal text-[#6B7280]">(optional)</span></label>
                        <input className="ux-input w-full" value={data.basics.targetRole || ''} onChange={(e) => onChange({ basics: { ...data.basics, targetRole: e.target.value } })} placeholder="e.g. Senior Engineer" />
                    </div>

                    {/* Contact — full-width stacked on mobile */}
                    <div className="ux-field-gap flex flex-col">
                        <p className="text-[13px] font-medium text-[#111827] ux-label-gap">Contact</p>
                        <div className="flex flex-col gap-3">
                            <input className="ux-input w-full min-w-0" value={data.basics.email || ''} onChange={(e) => onChange({ basics: { ...data.basics, email: e.target.value } })} placeholder="Email" type="email" />
                            <input className="ux-input w-full min-w-0" value={data.basics.phone || ''} onChange={(e) => onChange({ basics: { ...data.basics, phone: e.target.value } })} placeholder="Phone" type="tel" />
                            <input className="ux-input w-full min-w-0" value={data.basics.location || ''} onChange={(e) => onChange({ basics: { ...data.basics, location: e.target.value } })} placeholder="Location" />
                        </div>
                    </div>

                    {/* Links — full-width stacked on mobile (prevents URL truncation) */}
                    <div className="ux-field-gap flex flex-col">
                        <p className="text-[13px] font-medium text-[#111827] ux-label-gap">Links</p>
                        <div className="flex flex-col gap-3">
                            <input className="ux-input w-full min-w-0" value={data.basics.linkedin || ''} onChange={(e) => onChange({ basics: { ...data.basics, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/yourprofile" />
                            <input className="ux-input w-full min-w-0" value={data.basics.github || ''} onChange={(e) => onChange({ basics: { ...data.basics, github: e.target.value } })} placeholder="https://github.com/username" />
                        </div>
                    </div>

                    {/* Photo — one compact row */}
                    <div className="ux-field-gap flex flex-col">
                        <p className="text-[13px] font-medium text-[#6B7280] ux-label-gap">Photo (optional)</p>
                        <div className="flex items-center gap-3">
                            {data.photoUrl ? (
                                <>
                                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#f9fafb] shrink-0">
                                        <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <button type="button" onClick={() => onChange({ photoUrl: undefined, basics: { ...data.basics, includePhoto: false } })} className="text-[13px] font-medium text-[#6B7280]">Remove</button>
                                </>
                            ) : (
                                <button type="button" onClick={() => photoInputRef.current?.click()} className="flex items-center gap-2 ux-chip h-11 min-h-[44px]">
                                    <Camera size={18} className="text-[#6B7280]" />
                                    <span>Add photo</span>
                                </button>
                            )}
                            <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const r = new FileReader();
                                    r.onload = (ev) => onChange({ photoUrl: ev.target?.result as string, basics: { ...data.basics, includePhoto: true } });
                                    r.readAsDataURL(file);
                                }
                            }} />
                        </div>
                    </div>

                    {/* Summary — expandable, 3–4 lines when collapsed */}
                    <div className="ux-field-gap flex flex-col">
                        <button type="button" onClick={() => setSummaryOpen((o) => !o)} className="flex items-center justify-between w-full text-left">
                            <span className="text-[13px] font-medium text-[#111827]">Summary</span>
                            <ChevronDown size={18} className={`text-[#6B7280] transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {summaryOpen ? (
                            <textarea className="ux-textarea w-full min-h-[100px] resize-none" value={data.summary || ''} onChange={(e) => onChange({ summary: e.target.value })} placeholder="Brief professional summary..." rows={5} />
                        ) : (
                            <p className="text-[14px] text-[#6B7280] leading-relaxed line-clamp-3" style={{ minHeight: 56 }}>{data.summary || 'Tap to add summary'}</p>
                        )}
                    </div>
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

    // ===== EXPERIENCE ===== Flat list, no cards; edit: inline bullets, drag grip, Done CTA
    if (sectionId === 'experience') {
        const [expandedRoleIndex, setExpandedRoleIndex] = useState<number | null>(null);
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
        const setBullet = (roleIdx: number, bulletIdx: number, text: string) => {
            const lines = [...highlights(items[roleIdx])];
            lines[bulletIdx] = text;
            setHighlights(roleIdx, lines);
        };
        const deleteBullet = (roleIdx: number, bulletIdx: number) => {
            const lines = highlights(items[roleIdx]).filter((_, i) => i !== bulletIdx);
            setHighlights(roleIdx, lines.length ? lines : ['']);
        };
        const addBulletAt = (roleIdx: number, afterIdx: number) => {
            const lines = [...highlights(items[roleIdx])];
            lines.splice(afterIdx + 1, 0, '');
            setHighlights(roleIdx, lines);
        };
        const moveBullet = (roleIdx: number, fromIdx: number, toIdx: number) => {
            if (toIdx < 0 || toIdx >= highlights(items[roleIdx]).length) return;
            const lines = [...highlights(items[roleIdx])];
            [lines[fromIdx], lines[toIdx]] = [lines[toIdx], lines[fromIdx]];
            setHighlights(roleIdx, lines);
        };

        return (
            <SectionWrapper>
                <button type="button" onClick={addItem} className="mobile-app-cta w-full min-h-[52px] py-3 mb-4 rounded-[14px] bg-white text-[#111827] border border-[#E5E7EB] flex items-center justify-center gap-2 font-bold text-[15px]">
                    <Plus size={20} aria-hidden />
                    <span>Add position</span>
                </button>

                <div className="space-y-0 pb-24">
                    {items.map((item, idx) => {
                        const isExpanded = expandedRoleIndex === idx;
                        const bullets = highlights(item);
                        return (
                            <div key={item.id} className="border-b border-[#E5E7EB] last:border-b-0">
                                {/* List row: flat, no card */}
                                <div className="flex items-center gap-3 py-3">
                                    <button type="button" onClick={() => setExpandedRoleIndex(isExpanded ? null : idx)} className="flex-1 min-w-0 text-left">
                                        <p className="text-[15px] font-semibold text-[#111827] truncate">{item.position || 'Position'} — {item.company || 'Company'}</p>
                                        <p className="text-[13px] text-[#6B7280]">{item.startDate || '—'} – {item.endDate || '—'}</p>
                                        <p className="text-[12px] text-[#6B7280] mt-0.5">{bullets.filter(Boolean).length} bullet{bullets.filter(Boolean).length !== 1 ? 's' : ''}</p>
                                    </button>
                                    <button type="button" onClick={() => setExpandedRoleIndex(isExpanded ? null : idx)} className="flex items-center gap-1 text-[13px] font-medium text-[#111827] shrink-0 min-h-[44px]">
                                        Edit <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* Edit block: compact fields + inline bullets with grip */}
                                {isExpanded && (
                                    <div className="ux-section pb-4 pt-2 border-t border-[#E5E7EB]">
                                        <div className="ux-field-gap flex flex-col">
                                            <input className="ux-input w-full" placeholder="Position" value={item.position || ''} onChange={(e) => updateItem(idx, 'position', e.target.value)} />
                                            <input className="ux-input w-full" placeholder="Company" value={item.company || ''} onChange={(e) => updateItem(idx, 'company', e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-3 ux-field-gap">
                                            <input className="ux-input w-full min-w-0" placeholder="Start Date" value={item.startDate || ''} onChange={(e) => updateItem(idx, 'startDate', e.target.value)} />
                                            <input className="ux-input w-full min-w-0" placeholder="End Date" value={item.endDate || ''} onChange={(e) => updateItem(idx, 'endDate', e.target.value)} />
                                        </div>
                                        <p className="text-[13px] font-medium text-[#6B7280] ux-label-gap">Bullets</p>
                                        <div className="space-y-2">
                                            {bullets.map((bullet, bIdx) => (
                                                <div key={bIdx} className="flex items-start gap-2 border-b border-[#E5E7EB] pb-2 last:border-0">
                                                    <span className="flex-shrink-0 mt-2.5 text-[#6B7280] cursor-grab" aria-hidden><GripVertical size={18} /></span>
                                                    <input
                                                        type="text"
                                                        value={bullet}
                                                        onChange={(e) => setBullet(idx, bIdx, e.target.value)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBulletAt(idx, bIdx); } }}
                                                        className="flex-1 min-w-0 ux-input min-h-[44px] text-[14px]"
                                                        placeholder="Bullet point (Enter = new)"
                                                    />
                                                    <button type="button" onClick={() => deleteBullet(idx, bIdx)} className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#6B7280] active:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addBulletAt(idx, bullets.length - 1)} className="mt-2 w-full ux-chip flex items-center justify-center gap-2">
                                            <Plus size={16} /> Add bullet
                                        </button>
                                        <button type="button" onClick={() => setExpandedRoleIndex(null)} className="mobile-app-cta w-full min-h-[52px] rounded-[14px] font-bold text-[16px] bg-[#111827] text-white mt-4">
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-[13px] font-medium text-[#6B7280]">No positions yet</p>
                            <p className="text-[12px] text-[#6B7280] mt-1">Tap “Add position” above</p>
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
                <button type="button" onClick={addItem} className="mobile-app-cta w-full min-h-[52px] mb-8 rounded-[14px] bg-white text-gray-900 border-2 border-gray-200 flex items-center justify-center gap-3 font-bold text-[15px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add New Project</span>
                </button>

                <div className="space-y-4 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-[14px] p-4 shadow-sm relative group overflow-hidden">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                <span className="text-[12px] font-bold text-gray-500">Project {items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <InputField label="Project Name" icon={FileText} value={item.name} onChange={(v: string) => updateItem(idx, 'name', v)} placeholder="e.g. E-commerce Platform" />
                                <TextAreaField label="Tech Stack" icon={Plus} value={(item.tech || []).join(', ')} onChange={(v: string) => updateItem(idx, 'tech', v)} placeholder="React, Node.js..." rows={1} />
                                <TextAreaField label="Description" icon={Sparkles} value={item.description} onChange={(v: string) => updateItem(idx, 'description', v)} placeholder="What did you build and achieve?" rows={4} />
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
                <button type="button" onClick={addItem} className="mobile-app-cta w-full min-h-[52px] mb-8 rounded-[14px] bg-white text-gray-900 border-2 border-gray-200 flex items-center justify-center gap-3 font-bold text-[15px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Education</span>
                </button>

                <div className="space-y-4 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-[14px] p-4 shadow-sm relative group overflow-hidden">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                <span className="text-[12px] font-bold text-gray-500">Education {items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <InputField label="Degree / Course" icon={GraduationCap} value={item.degree} onChange={(v: string) => updateItem(idx, 'degree', v)} placeholder="e.g. B.Tech Computer Science" />
                                <InputField label="Institution" icon={Globe} value={item.institution} onChange={(v: string) => updateItem(idx, 'institution', v)} placeholder="e.g. IIT Madras" />
                                <InputField label="Graduation Year" icon={Calendar} value={item.graduationDate} onChange={(v: string) => updateItem(idx, 'graduationDate', v)} placeholder="e.g. 2024" />
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
                <button type="button" onClick={addItem} className="mobile-app-cta w-full min-h-[52px] mb-8 rounded-[14px] bg-white text-gray-900 border-2 border-gray-200 flex items-center justify-center gap-3 font-bold text-[15px]">
                    <div className="w-8 h-8 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Milestone</span>
                </button>

                <div className="space-y-4 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-[14px] p-4 shadow-sm relative group overflow-hidden">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                                <span className="text-[12px] font-bold text-gray-500">Milestone {items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <TextAreaField
                                    label="Description"
                                    icon={Award}
                                    value={item.description}
                                    onChange={(v: string) => updateItem(idx, v)}
                                    placeholder="e.g. Won 1st place in National Hackathon..."
                                    rows={4}
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

