/**
 * MOBILE SECTION EDITOR - MAXIMUM VISIBILITY & PREMIUM DESIGN
 * 
 * Objectives:
 * 1. Superior contrast (Pure black/white where possible)
 * 2. Icon-rich inputs for professional feel
 * 3. Clear section separation
 */

import React, { useRef } from 'react';
import { ResumeData } from '../../types';
import {
    ChevronLeft, Plus, Trash2, GripVertical, Camera,
    X, CheckCircle2, AlertCircle, Briefcase, Globe,
    FileText, Sparkles, User, Mail, Phone, MapPin,
    Linkedin, Github, Calendar, GraduationCap, Award,
    Target
} from 'lucide-react';
import { matchKeywords, extractJDSkills } from '../../utils/keywordMatcher';
import { MobileHeader } from './MobileHeader';

interface Props {
    sectionId: string;
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
    onBack: () => void;
}

export default function MobileSectionEditor({ sectionId, data, onChange, onBack }: Props) {
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
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 group-focus-within:text-white transition-colors">
                    {label}
                </label>
                {optional && <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>}
            </div>
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors pointer-events-none">
                        <Icon size={18} strokeWidth={2.5} className="sm:scale-110" />
                    </div>
                )}
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full h-15 sm:h-18 bg-white/5 border border-white/10 rounded-2xl sm:rounded-[1.5rem] shadow-2xl text-[15px] sm:text-[16px] font-bold text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all backdrop-blur-xl ${Icon ? 'pl-13 sm:pl-16 pr-4 sm:pr-6' : 'px-4 sm:px-6'}`}
                />
            </div>
        </div>
    );

    const TextAreaField = ({ label, value, onChange, placeholder, rows = 3, icon: Icon }: any) => (
        <div className="mb-5 sm:mb-6 w-full group">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 px-1">
                {Icon && <Icon size={14} className="text-slate-400 group-focus-within:text-white transition-colors sm:scale-110" strokeWidth={3} />}
                <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 group-focus-within:text-white transition-colors">{label}</label>
            </div>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-5 py-5 sm:px-6 sm:py-6 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl text-[15px] sm:text-[16px] font-bold text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-4 focus:ring-white/5 outline-none transition-all backdrop-blur-xl resize-none leading-relaxed"
            />
        </div>
    );

    // Layout Wrapper - Master Scroll Fix
    const SectionWrapper = ({ children, isDoneEnabled = true }: any) => (
        <div className="h-full bg-[#0F172A] flex flex-col relative overflow-hidden">
            <MobileHeader title={getSectionTitle()} onBack={onBack} showNext={false} variant="dark" />

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 pt-24 pb-60 scrollbar-hide relative z-10 text-white">
                {children}
            </div>

            {/* Sticky Bottom Action - Enhanced Height & Safety */}
            <div className="fixed bottom-0 left-0 right-0 p-5 sm:p-6 bg-black/60 backdrop-blur-3xl border-t border-white/10 safe-area-bottom z-[200]">
                <button
                    onClick={onBack}
                    disabled={!isDoneEnabled}
                    className="w-full h-15 sm:h-18 rounded-[2rem] bg-white text-black font-black text-[15px] sm:text-[16px] uppercase tracking-[0.2em] transition-all active:scale-[0.95] flex items-center justify-center gap-3 disabled:bg-white/10 disabled:text-white/20 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    <CheckCircle2 size={24} strokeWidth={3} className="sm:scale-110" />
                    <span>Save {getSectionTitle()}</span>
                </button>
            </div>

            <style>{`
                .safe-area-bottom { padding-bottom: max(1.25rem, env(safe-area-inset-bottom)); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .h-15 { height: 3.75rem; }
                .pl-13 { padding-left: 3.25rem; }
            `}</style>
        </div>
    );

    // ===== PERSONAL INFO =====
    if (sectionId === 'profile') {
        const photoInputRef = useRef<HTMLInputElement>(null);
        return (
            <SectionWrapper isDoneEnabled={!!(data.basics.fullName?.trim() && data.basics.email?.trim())}>
                <div className="flex flex-col items-center mb-12 sm:mb-16 pt-4">
                    <div className="relative group">
                        {data.photoUrl ? (
                            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-[3.5rem] sm:rounded-[4rem] overflow-hidden border-4 border-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] bg-slate-800">
                                <img src={data.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => onChange({ photoUrl: undefined })}
                                    className="absolute top-4 right-4 w-10 h-10 bg-black/80 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl active:scale-90 transition-all hover:bg-black/100"
                                >
                                    <X size={18} className="text-white" strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => photoInputRef.current?.click()}
                                className="w-44 h-44 sm:w-48 sm:h-48 rounded-[3.5rem] sm:rounded-[4rem] bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 text-white active:scale-[0.98] transition-all shadow-2xl group hover:border-white/40"
                            >
                                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[1.75rem] sm:rounded-[2rem] bg-white text-black flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-active:scale-95 transition-transform">
                                    <Camera size={32} strokeWidth={2.5} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[11px] font-black uppercase tracking-[0.25em] block mb-1">Add Identity</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Professional Photo</span>
                                </div>
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
                </div>

                <div className="space-y-4">
                    <InputField label="Full Name" icon={User} value={data.basics.fullName} onChange={(val: string) => onChange({ basics: { ...data.basics, fullName: val } })} placeholder="e.g. Surag M.S." />
                    <InputField label="Email Address" icon={Mail} value={data.basics.email} onChange={(val: string) => onChange({ basics: { ...data.basics, email: val } })} placeholder="e.g. name@email.com" type="email" />
                    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                        <InputField label="Phone" icon={Phone} value={data.basics.phone} onChange={(val: string) => onChange({ basics: { ...data.basics, phone: val } })} placeholder="+91 987..." />
                        <InputField label="Location" icon={MapPin} value={data.basics.location} onChange={(val: string) => onChange({ basics: { ...data.basics, location: val } })} placeholder="London, UK" />
                    </div>
                    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                        <InputField label="LinkedIn" icon={Linkedin} value={data.basics.linkedin} onChange={(val: string) => onChange({ basics: { ...data.basics, linkedin: val } })} placeholder="username" optional />
                        <InputField label="GitHub" icon={Github} value={data.basics.github} onChange={(val: string) => onChange({ basics: { ...data.basics, github: val } })} placeholder="username" optional />
                    </div>
                    <TextAreaField label="Professional Summary" icon={Sparkles} value={data.summary} onChange={(val: string) => onChange({ summary: val })} placeholder="Briefly describe your professional background..." rows={6} />
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
                    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-8 shadow-2xl overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Target size={22} strokeWidth={3} className="scale-90 sm:scale-100" />
                                </div>
                                <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-white">Keyword Match</span>
                            </div>
                            <div className="bg-white/10 px-3.5 py-2 rounded-full border border-white/10 w-fit">
                                <span className="text-[9px] sm:text-[11px] font-black text-slate-300 uppercase tracking-widest">
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
                                        : 'bg-white/5 text-slate-500 border-white/10'
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

    // ===== EXPERIENCE =====
    if (sectionId === 'experience') {
        const items = data.experience;
        const addItem = () => onChange({ experience: [{ id: generateId(), company: '', position: '', startDate: '', endDate: '', highlights: [''] }, ...items] });
        const updateItem = (idx: number, f: string, v: any) => { const u = [...items]; (u[idx] as any)[f] = v; onChange({ experience: u }); };
        const deleteItem = (idx: number) => onChange({ experience: items.filter((_, i) => i !== idx) });

        return (
            <SectionWrapper>
                <button onClick={addItem} className="w-full h-18 sm:h-20 mb-10 rounded-[2rem] bg-white text-black flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black uppercase tracking-[0.2em] text-[13px] sm:text-[14px]">
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add New Position</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Position 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow-lg"
                                >
                                    <Trash2 size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="pt-12 sm:pt-14 space-y-4">
                                <InputField label="Position Title" icon={Briefcase} value={item.position} onChange={(v: string) => updateItem(idx, 'position', v)} placeholder="Senior Software Engineer" />
                                <InputField label="Company Name" icon={Globe} value={item.company} onChange={(v: string) => updateItem(idx, 'company', v)} placeholder="Google Inc." />
                                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                                    <InputField label="Start Date" icon={Calendar} value={item.startDate} onChange={(v: string) => updateItem(idx, 'startDate', v)} placeholder="Jan 2020" />
                                    <InputField label="End Date" icon={Calendar} value={item.endDate} onChange={(v: string) => updateItem(idx, 'endDate', v)} placeholder="Present" />
                                </div>
                                <TextAreaField
                                    label="Impact & Achievements"
                                    icon={FileText}
                                    value={item.highlights?.join('\n')}
                                    onChange={(v: string) => updateItem(idx, 'highlights', v.split('\n').filter(Boolean))}
                                    placeholder="• Led a team of 10 developers&#10;• Increased revenue by 25%&#10;• Built a global design system"
                                    rows={8}
                                />
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-8 text-slate-700">
                                <Briefcase size={48} strokeWidth={1.5} />
                            </div>
                            <p className="font-black text-[13px] uppercase tracking-[0.3em] text-slate-500">No work history added</p>
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
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add New Project</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Project 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow-lg"
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
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Education</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Academic 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow-lg"
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
                    <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                        <Plus size={20} strokeWidth={4} />
                    </div>
                    <span>Add Milestone</span>
                </button>

                <div className="space-y-12 pb-10">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 shadow-2xl relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 sm:px-8">
                                <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Award 0{items.length - idx}</span>
                                <button
                                    onClick={() => deleteItem(idx)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-500 flex items-center justify-center active:bg-red-500 active:text-white active:border-red-500 transition-all shadow-lg"
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

