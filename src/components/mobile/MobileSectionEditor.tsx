import React, { useState, useEffect } from 'react';
import { ResumeData } from '../../types';
import { ChevronLeft, ChevronUp, ChevronDown, Plus, Trash2, GripVertical, User, FileText, Building2, Briefcase, Calendar, Code, GraduationCap, Award, ChevronRight, Image as ImageIcon, CheckCircle2, Check, X, Camera } from 'lucide-react';
import { categorizeRole } from '../../constants/roles';

// Professional form field with validation checkmark
interface ProfessionalFieldProps {
    label: string;
    icon?: React.ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
}

const ProfessionalField: React.FC<ProfessionalFieldProps> = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
    multiline = false,
    rows = 4
}) => {
    return (
        <div className="w-full">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {multiline ? (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full px-6 py-5 bg-white border border-white rounded-[1.5rem] text-[15px] font-bold text-black placeholder:text-gray-200 focus:ring-2 focus:ring-black/5 transition-all resize-none shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                    />
                ) : (
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-16 px-6 bg-white border border-white rounded-[1.5rem] text-[15px] font-bold text-black placeholder:text-gray-200 focus:ring-2 focus:ring-black/5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                    />
                )}
            </div>
        </div>
    );
};

interface MobileSectionEditorProps {
    sectionId: string;
    data: ResumeData;
    onChange: (data: Partial<ResumeData>) => void;
    onBack: () => void;
}

export default function MobileSectionEditor({ sectionId, data, onChange, onBack }: MobileSectionEditorProps) {
    const [items, setItems] = useState<any[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoUrl || null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('File size too large. Max 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPhotoPreview(base64String);
                onChange({ photoUrl: base64String, includePhoto: true });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        switch (sectionId) {
            case 'experience': setItems(data.experience); break;
            case 'projects': setItems(data.projects); break;
            case 'education': setItems(data.education); break;
            case 'skills': setItems(data.skills.map((s, i) => ({ id: `skill-${i}`, name: s }))); break;
            case 'achievements': setItems(data.achievements); break;
            default: setItems([]);
        }
    }, [sectionId, data]);

    const getSectionTitle = () => {
        const titles: Record<string, string> = {
            'profile': 'Personal Info',
            'experience': 'Experience',
            'projects': 'Projects',
            'skills': 'Skills',
            'education': 'Education',
            'achievements': 'Achievements'
        };
        return titles[sectionId] || 'Section';
    };

    const addItem = () => {
        const generateId = () => Math.random().toString(36).substr(2, 9);
        let newItem: any;
        switch (sectionId) {
            case 'experience':
                newItem = { id: generateId(), company: '', position: '', startDate: '', endDate: '', highlights: [''] };
                onChange({ experience: [newItem, ...data.experience] });
                break;
            case 'projects':
                newItem = { id: generateId(), name: '', description: '', githubLink: '' };
                onChange({ projects: [newItem, ...data.projects] });
                break;
            case 'education':
                newItem = { id: generateId(), institution: '', degree: '', field: '', graduationDate: '' };
                onChange({ education: [newItem, ...data.education] });
                break;
            case 'achievements':
                newItem = { id: generateId(), description: '' };
                onChange({ achievements: [newItem, ...data.achievements] });
                break;
        }
    };

    const deleteItem = (id: string, index: number) => {
        switch (sectionId) {
            case 'experience': onChange({ experience: data.experience.filter((_, i) => i !== index) }); break;
            case 'projects': onChange({ projects: data.projects.filter((_, i) => i !== index) }); break;
            case 'education': onChange({ education: data.education.filter((_, i) => i !== index) }); break;
            case 'achievements': onChange({ achievements: data.achievements.filter((_, i) => i !== index) }); break;
        }
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0) return;
        let updatedItems: any[];
        switch (sectionId) {
            case 'experience':
                if (toIndex >= data.experience.length) return;
                updatedItems = [...data.experience];
                [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
                onChange({ experience: updatedItems });
                break;
            case 'projects':
                if (toIndex >= data.projects.length) return;
                updatedItems = [...data.projects];
                [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
                onChange({ projects: updatedItems });
                break;
            case 'education':
                if (toIndex >= data.education.length) return;
                updatedItems = [...data.education];
                [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
                onChange({ education: updatedItems });
                break;
            case 'achievements':
                if (toIndex >= data.achievements.length) return;
                updatedItems = [...data.achievements];
                [updatedItems[fromIndex], updatedItems[toIndex]] = [updatedItems[toIndex], updatedItems[fromIndex]];
                onChange({ achievements: updatedItems });
                break;
        }
    };

    const updateItemField = (index: number, field: string, value: string) => {
        let updatedItems: any[];
        switch (sectionId) {
            case 'experience':
                updatedItems = [...data.experience];
                (updatedItems[index] as any)[field] = value;
                onChange({ experience: updatedItems });
                break;
            case 'projects':
                updatedItems = [...data.projects];
                (updatedItems[index] as any)[field] = value;
                onChange({ projects: updatedItems });
                break;
            case 'education':
                updatedItems = [...data.education];
                (updatedItems[index] as any)[field] = value;
                onChange({ education: updatedItems });
                break;
            case 'achievements':
                updatedItems = [...data.achievements];
                (updatedItems[index] as any)[field] = value;
                onChange({ achievements: updatedItems });
                break;
        }
    };

    const renderItemContent = (item: any, index: number) => {
        switch (sectionId) {
            case 'experience':
                return (
                    <div className="space-y-4">
                        <ProfessionalField label="Position" value={item.position} onChange={(v) => updateItemField(index, 'position', v)} placeholder="Senior Software Engineer" />
                        <ProfessionalField label="Company" value={item.company} onChange={(v) => updateItemField(index, 'company', v)} placeholder="Google" />
                        <div className="grid grid-cols-2 gap-4">
                            <ProfessionalField label="Start Date" value={item.startDate} onChange={(v) => updateItemField(index, 'startDate', v)} placeholder="Jan 2020" />
                            <ProfessionalField label="End Date" value={item.endDate} onChange={(v) => updateItemField(index, 'endDate', v)} placeholder="Present" />
                        </div>
                    </div>
                );
            case 'projects':
                return (
                    <div className="space-y-4">
                        <ProfessionalField label="Project Name" value={item.name} onChange={(v) => updateItemField(index, 'name', v)} placeholder="E-commerce Platform" />
                        <ProfessionalField label="Description" value={item.description} onChange={(v) => updateItemField(index, 'description', v)} placeholder="Built a full-stack platform..." multiline rows={3} />
                    </div>
                );
            case 'education':
                return (
                    <div className="space-y-4">
                        <ProfessionalField label="Institution" value={item.institution} onChange={(v) => updateItemField(index, 'institution', v)} placeholder="Stanford University" />
                        <ProfessionalField label="Degree" value={item.degree} onChange={(v) => updateItemField(index, 'degree', v)} placeholder="B.S. Computer Science" />
                        <ProfessionalField label="Year" value={item.graduationDate} onChange={(v) => updateItemField(index, 'graduationDate', v)} placeholder="2024" />
                    </div>
                );
            case 'achievements':
                return (
                    <div className="space-y-4">
                        <ProfessionalField label="Achievement" value={item.description} onChange={(v) => updateItemField(index, 'description', v)} placeholder="Won first place in hackathon..." multiline rows={3} />
                    </div>
                );
            case 'skills':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded-2xl border border-white italic text-[13px] text-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            Manage skills by clicking 'Add Skill' above. Individual skill editing coming soon.
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const getItemTitle = (item: any) => {
        if (sectionId === 'experience') return item.position || 'Untitled Position';
        if (sectionId === 'projects') return item.name || 'Untitled Project';
        if (sectionId === 'education') return item.institution || 'Untitled Education';
        if (sectionId === 'achievements') return item.description?.slice(0, 30) || 'Untitled Achievement';
        return 'Item';
    };

    if (sectionId === 'target-jd') return null;

    if (sectionId === 'profile') {
        const filledFields = [data.basics.fullName, data.basics.email, data.basics.phone, data.basics.location, data.summary].filter(f => f?.trim()).length;
        const progressPercent = Math.round((filledFields / 5) * 100);

        return (
            <div className="h-[100dvh] flex flex-col bg-[#F5F5F7] font-sans">
                <div className="fixed top-0 left-0 right-0 z-[150] bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
                    <div className="flex flex-col items-center justify-center px-4 h-20 relative">
                        <button onClick={onBack} className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5 transition-all text-black">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Profile Settings</span>
                            <div className="w-12 h-1 bg-white rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-24 pb-32 scrollbar-hide">
                    <div className="mb-10">
                        <h1 className="text-[32px] font-black text-black leading-[1.1] tracking-tight uppercase tracking-wider">Personal Info</h1>
                        <p className="text-[14px] text-gray-400 font-bold mt-3 uppercase tracking-wide opacity-50">Build your professional identity</p>
                    </div>

                    <div className="mb-10 bg-white p-6 rounded-2xl border border-white shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            {/* Text on left */}
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Profile Photo</p>
                                <p className="text-[14px] text-black font-bold">Add a professional headshot</p>
                                {photoPreview && (
                                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                        <div className="relative w-5 h-5">
                                            <input type="checkbox" checked={data.includePhoto || false} onChange={(e) => onChange({ includePhoto: e.target.checked })} className="peer appearance-none w-5 h-5 rounded-lg border-2 border-gray-200 checked:bg-black checked:border-black transition-all cursor-pointer" />
                                            <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-600">Include in resume</span>
                                    </label>
                                )}
                            </div>
                            {/* Photo on right */}
                            <div className="relative flex-shrink-0">
                                {photoPreview ? (
                                    <div className="relative">
                                        <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-100" />
                                        <button onClick={() => { setPhotoPreview(null); onChange({ photoUrl: undefined, includePhoto: false }); }} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                                            <Trash2 size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all">
                                        <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="hidden" />
                                        <Camera size={24} className="text-gray-300 mb-1" />
                                        <span className="text-[8px] font-bold text-gray-300 uppercase">Upload</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <ProfessionalField label="Full Name" placeholder="John Doe" value={data.basics.fullName} onChange={(val) => onChange({ basics: { ...data.basics, fullName: val } })} required />
                        <ProfessionalField label="Email Address" placeholder="john@example.com" type="email" value={data.basics.email} onChange={(val) => onChange({ basics: { ...data.basics, email: val } })} required />
                        <ProfessionalField label="Phone Number" placeholder="+1 234 567 890" type="tel" value={data.basics.phone} onChange={(val) => onChange({ basics: { ...data.basics, phone: val } })} required />
                        <ProfessionalField label="Location" placeholder="New York, USA" value={data.basics.location} onChange={(val) => onChange({ basics: { ...data.basics, location: val } })} required />
                        <ProfessionalField label="LinkedIn Profile" placeholder="linkedin.com/in/johndoe" value={data.basics.linkedin || ''} onChange={(val) => onChange({ basics: { ...data.basics, linkedin: val } })} />
                        <ProfessionalField label="GitHub Profile" placeholder="github.com/johndoe" value={data.basics.github || ''} onChange={(val) => onChange({ basics: { ...data.basics, github: val } })} />
                        <ProfessionalField label="Professional Summary" placeholder="Briefly describe your career goals..." value={data.summary} onChange={(val) => onChange({ summary: val })} multiline rows={6} />
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-[#F5F5F7]/90 backdrop-blur-xl p-6 z-50 safe-area-bottom border-t border-gray-200/50">
                    <button onClick={onBack} disabled={!data.basics.fullName || !data.basics.email} className={`w-full h-16 rounded-[1.5rem] font-black text-[15px] uppercase tracking-[0.1em] transition-all active:scale-[0.98] flex items-center justify-center gap-4 border-2 ${data.basics.fullName && data.basics.email ? 'bg-white text-black border-black shadow-[0_10px_30px_rgba(0,0,0,0.08)]' : 'bg-white text-gray-200 border-gray-100 opacity-50 cursor-not-allowed'}`}>
                        <span>Confirm Profile</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${data.basics.fullName && data.basics.email ? 'bg-black' : 'bg-gray-200'}`} />
                    </button>
                </div>
                <style>{`.safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F5F5F7]">
            <div className="fixed top-0 left-0 right-0 z-[150] bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="flex items-center justify-between px-4 h-20 relative">
                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full active:bg-black/5 transition-all text-black">
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black tracking-widest">{getSectionTitle()}</span>
                    </div>
                    <div className="w-10" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-24 pb-32 scrollbar-hide">
                <div className="mb-8">
                    <h1 className="text-[32px] font-black text-black leading-[1.1] tracking-tight uppercase tracking-wider">{getSectionTitle()}</h1>
                    <p className="text-[14px] text-gray-400 font-bold mt-2 uppercase tracking-wide opacity-50">Manage your section entries</p>
                </div>

                <button onClick={addItem} className="w-full py-6 mb-8 rounded-[2rem] border-2 border-dashed border-gray-200 bg-white text-black font-black text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-4 group shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
                        <Plus size={20} strokeWidth={3} />
                    </div>
                    <span className="uppercase tracking-widest">Add {getSectionTitle()}</span>
                </button>

                <div className="space-y-6">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-white rounded-[2.5rem] border border-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                                <div className="text-gray-200">
                                    <GripVertical size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-[15px] text-black truncate uppercase tracking-widest">{getItemTitle(item)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0} className="w-8 h-8 rounded-lg text-gray-200 disabled:opacity-30 flex items-center justify-center">
                                        <ChevronUp size={22} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => moveItem(idx, idx + 1)} disabled={idx === items.length - 1} className="w-8 h-8 rounded-lg text-gray-200 disabled:opacity-30 flex items-center justify-center">
                                        <ChevronDown size={22} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => deleteItem(item.id, idx)} className="w-10 h-10 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center ml-2 active:scale-90 transition-all shadow-sm">
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-transparent">
                                {renderItemContent(item, idx)}
                            </div>
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-100 italic">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-white flex items-center justify-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <Plus size={40} strokeWidth={1.5} />
                        </div>
                        <p className="text-[13px] font-black uppercase tracking-[0.3em] opacity-30">Pure Focus Mode</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-[#F5F5F7]/90 backdrop-blur-xl border-t border-gray-200/50 p-6 z-50 safe-area-bottom">
                <button onClick={onBack} className="w-full h-16 rounded-[1.5rem] font-black text-[15px] uppercase tracking-[0.1em] bg-white text-black border-2 border-black shadow-[0_10px_30px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                    <CheckCircle2 size={20} strokeWidth={3} />
                    <span className="uppercase tracking-widest">Section Complete</span>
                </button>
            </div>
            <style>{`.safe-area-bottom { padding-bottom: max(1.5rem, env(safe-area-inset-bottom)); } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
}
