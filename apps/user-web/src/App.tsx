import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Share2, Lock, ShieldCheck, DollarSign, Clock, TrendingUp, Plus, Minus, MoveVertical, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../src/index.css';
import '../src/design_overrides.css';
import '../src/mobile.css';
import { parseResumeWithAI } from '../src/services/geminiService';
import { trackEvent } from '../src/api-service';
import Step2Editor from '../src/components/Step2Editor';
import Step3TemplateExport from '../src/components/Step3TemplateExport';
import Step3Finalize from '../src/components/Step3Finalize';
import { ResumeData } from '../src/types';
import { TEMPLATES } from '../src/constants';

// ============== TYPES ==============
type Step = 'homepage' | 'editor' | 'template' | 'finalize';

// ============== MAIN APP ==============
export default function App() {
    const [step, setStep] = useState<Step>('homepage');
    const [selectedTemplateId, setSelectedTemplateId] = useState('template1free');
    const [processing, setProcessing] = useState(false);

    // User feedback state (moved outside conditional)
    const [userFeedback, setUserFeedback] = useState<Array<{ name: string, message: string, timestamp: number }>>([]);

    // Load user feedback on mount
    useEffect(() => {
        const feedback = localStorage.getItem('user_feedback');
        if (feedback) {
            try {
                setUserFeedback(JSON.parse(feedback));
            } catch (e) {
                console.error('Error parsing feedback', e);
            }
        }
    }, []);

    // Initial state matching new ResumeData structure
    const [resume, setResume] = useState<ResumeData>({
        basics: {
            fullName: '',
            targetRole: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: ''
        },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        achievements: [],
        jobDescription: '',
        photoUrl: undefined
    });

    const [showAdmin, setShowAdmin] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('resume_stats');
        return saved ? JSON.parse(saved) : {
            totalResumes: 0,
            roleSearches: {} as Record<string, number>,
            templateUsage: {} as Record<string, number>,
            paidConversions: 0,
            downloads: 0,
            totalBrowseTime: 0, // In seconds
            sessionCount: 0,
            templatePrices: {} as Record<string, number>,
            templateDiscounts: {} as Record<string, number>,
            templateOrder: [] as string[],
            templateVisibility: {} as Record<string, boolean>,
            templateMetadata: {} as Record<string, { name?: string, description?: string }>,
            customTemplates: [] as { id: string, name: string, description: string, price: number, baseId: string }[]
        };
    });

    // Session Tracking
    const sessionStartTime = useRef(Date.now());

    useEffect(() => {
        // Increment session count on load
        setStats((prev: any) => {
            const updated = { ...prev, sessionCount: (prev.sessionCount || 0) + 1 };
            localStorage.setItem('resume_stats', JSON.stringify(updated));
            return updated;
        });

        // Update browse time periodically
        const timer = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - sessionStartTime.current) / 1000);
            sessionStartTime.current = now; // Reset for next tick

            setStats((prev: any) => {
                const updated = { ...prev, totalBrowseTime: (prev.totalBrowseTime || 0) + elapsed };
                localStorage.setItem('resume_stats', JSON.stringify(updated));
                return updated;
            });
        }, 10000); // Every 10 seconds

        return () => clearInterval(timer);
    }, []);

    // Merge global TEMPLATES with admin overrides and order
    const dynamicTemplates = (() => {
        // Base hardcoded templates
        const registry = [...TEMPLATES];

        // Add custom templates from stats
        if (stats.customTemplates && stats.customTemplates.length > 0) {
            stats.customTemplates.forEach((ct: any) => {
                // Find the base template to inherit config/style
                const base = TEMPLATES.find(t => t.id === ct.baseId) || TEMPLATES[0];
                registry.push({
                    ...base,
                    id: ct.id,
                    name: ct.name,
                    description: ct.description,
                    price: ct.price
                });
            });
        }

        const baseTemplates = registry.map(t => {
            const customPrice = stats.templatePrices?.[t.id];
            const discount = stats.templateDiscounts?.[t.id] || 0;
            const basePrice = customPrice !== undefined ? customPrice : (t as any).price;
            const finalPrice = Math.max(0, Math.floor(basePrice * (1 - discount / 100)));

            const visibility = stats.templateVisibility?.[t.id] ?? true;
            const metadata = stats.templateMetadata?.[t.id] || {};

            return {
                ...t,
                name: metadata.name || t.name,
                description: metadata.description || t.description,
                price: basePrice,
                discount,
                finalPrice,
                priceLabel: finalPrice === 0 ? 'Free' : `₹${finalPrice}`,
                originalPriceLabel: basePrice > finalPrice ? `₹${basePrice}` : undefined,
                enabled: visibility
            };
        });

        const sortedTemplates = (stats.templateOrder && stats.templateOrder.length > 0)
            ? [...baseTemplates].sort((a, b) => {
                const indexA = stats.templateOrder.indexOf(a.id);
                const indexB = stats.templateOrder.indexOf(b.id);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            })
            : baseTemplates;

        // Only hide disabled templates for non-admin view
        if (!showAdmin) {
            return sortedTemplates.filter(t => t.enabled);
        }
        return sortedTemplates;
    })();

    // ============== STATS TRACKING ==============
    const logStat = (action: 'resume' | 'role' | 'template' | 'paid' | 'download', value?: string) => {
        setStats((prev: any) => {
            const updated = { ...prev };
            switch (action) {
                case 'resume': updated.totalResumes += 1; break;
                case 'role': if (value) updated.roleSearches[value] = (updated.roleSearches[value] || 0) + 1; break;
                case 'template': if (value) updated.templateUsage[value] = (updated.templateUsage[value] || 0) + 1; break;
                case 'paid': updated.paidConversions += 1; break;
                case 'download': updated.downloads += 1; break;
            }
            localStorage.setItem('resume_stats', JSON.stringify(updated));
            return updated;
        });
    };

    // URL and Admin hotkey
    useEffect(() => {
        if (window.location.pathname === '/admin') {
            setShowAdmin(true);
        }

        const handler = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') setShowAdmin(true);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Track page visit
    useEffect(() => {
        trackEvent('page_visit');
    }, []);

    // Helper to map flat parsed result to structured ResumeData
    const mapParsedToResumeData = (parsed: any): ResumeData => {
        return {
            basics: {
                fullName: parsed.name || '',
                targetRole: parsed.jobTitle || parsed.role || '',
                email: parsed.email || '',
                phone: parsed.phone || '',
                location: parsed.address || parsed.location || '',
                linkedin: parsed.linkedin || '',
                github: parsed.github || ''
            },
            summary: parsed.profile || parsed.summary || '',
            experience: (parsed.experience || []).map((e: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                company: e.company || '',
                position: e.role || e.position || '',
                startDate: e.startDate || '',
                endDate: e.endDate || '',
                highlights: e.bullets || e.highlights || []
            })),
            education: (parsed.education || []).map((e: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                institution: e.institution || '',
                degree: e.degree || '',
                field: e.field || '',
                graduationDate: e.year || e.graduationDate || ''
            })),
            projects: (parsed.projects || []).map((p: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: p.name || '',
                description: p.description || ''
            })),
            skills: Array.isArray(parsed.skills)
                ? (typeof parsed.skills[0] === 'string' ? parsed.skills : parsed.skills.flatMap((s: any) => s.items))
                : [],
            achievements: (parsed.achievements || []).map((a: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                description: typeof a === 'string' ? a : a.description
            }))
        };
    };

    const handleFileUpload = async (file: File) => {
        setProcessing(true);
        try {
            const pdfjsLib = (window as any).pdfjsLib;
            if (!pdfjsLib) throw new Error('PDF.js not loaded');

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                extractedText += pageText + '\n';
            }

            const result = await parseResumeWithAI(extractedText);
            setResume(mapParsedToResumeData(result.resume));

            setTimeout(() => {
                setStep('editor');
                setProcessing(false);
                logStat('resume');
            }, 500);

        } catch (err) {
            console.error('Parse error:', err);
            alert('Failed to parse resume. Please try again or build from scratch.');
            setProcessing(false);
        }
    };

    const startFromScratch = () => {
        setResume({
            basics: { fullName: '', targetRole: '', email: '', phone: '', location: '', linkedin: '', github: '' },
            summary: '',
            experience: [],
            education: [],
            projects: [],
            skills: [],
            achievements: [],
            photoUrl: undefined
        });
        setStep('editor');
    };

    const handleVerifyPin = (pin: string) => {
        if (pin === '303741') {
            setIsAdminAuthenticated(true);
        } else {
            return false;
        }
        return true;
    };

    if (showAdmin) {
        if (!isAdminAuthenticated) {
            return (
                <SecurityPinScreen
                    onVerify={handleVerifyPin}
                    onClose={() => {
                        setShowAdmin(false);
                        if (window.location.pathname === '/admin') {
                            window.history.pushState({}, '', '/');
                        }
                    }}
                />
            );
        }
        return <AdminDashboard
            stats={stats}
            onUpdateStats={(newStats) => {
                setStats(newStats);
                localStorage.setItem('resume_stats', JSON.stringify(newStats));
            }}
            onClose={() => {
                setShowAdmin(false);
                setIsAdminAuthenticated(false);
                if (window.location.pathname === '/admin') {
                    window.history.pushState({}, '', '/');
                }
            }}
        />;
    }

    // ============== HOMEPAGE ==============
    if (step === 'homepage') {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                {processing && (
                    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-6"></div>
                        <div className="text-center">
                            <p className="text-gray-900 font-semibold text-lg mb-2">Analyzing your resume...</p>
                            <p className="text-gray-600 text-sm">Extracting experience, skills, and achievements</p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="px-6 md:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-black p-1.5 rounded-lg">
                                <FileText size={16} color="#fff" />
                            </div>
                            <span className="text-lg font-semibold text-black">HexaResume</span>
                        </div>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'HexaResume - Build a Resume You Can Trust',
                                        text: 'Create professional, role-targeted resumes',
                                        url: window.location.href
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:border-black hover:shadow-sm transition-all text-sm font-medium text-gray-700"
                        >
                            <Share2 size={16} />
                            <span className="hidden md:inline">Share</span>
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-3xl mx-auto">

                        {/* Headline */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-8">
                                Build a Resume You Can Trust
                            </h1>
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-3 max-w-2xl mx-auto">
                                Create professional, role-targeted resumes with high-quality templates. Free to use and download. Upgrade for premium templates.
                            </p>
                            <p className="text-base text-gray-500 mt-6">
                                Start free. No signup required.
                            </p>
                        </div>

                        {/* Trust Signals */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-14 text-sm text-gray-600">
                            <span>• No signup required</span>
                            <span>• No data saved without permission</span>
                            <span>• No fake ATS scores</span>
                            <span>• Preview exactly what you download</span>
                        </div>

                        {/* Action Cards */}
                        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {/* Upload Option */}
                            <label htmlFor="pdf-upload" className="cursor-pointer block">
                                <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-900 rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-black rounded-lg p-3">
                                            <Upload size={20} className="text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold mb-1.5 text-center text-black">Upload Resume</h3>
                                    <p className="text-xs text-gray-600 text-center">Refine what you already have</p>
                                </div>
                            </label>

                            {/* Start Fresh Option */}
                            <button onClick={startFromScratch} className="block">
                                <div className="bg-black border-2 border-black rounded-xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="bg-white rounded-lg p-3">
                                            <FileText size={20} className="text-black" />
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold mb-1.5 text-center text-white">Start From Scratch</h3>
                                    <p className="text-xs text-gray-300 text-center">Build step-by-step with guided sections</p>
                                </div>
                            </button>
                        </div>

                        <input type="file" id="pdf-upload" className="hidden" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                    </div>
                </div>

                {/* Real-time User Feedback Ticker */}
                {userFeedback.length > 0 && (
                    <div className="bg-gray-50 border-t border-gray-200 py-3 overflow-hidden">
                        <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
                            {userFeedback.map((fb, idx) => (
                                <div key={idx} className="inline-flex items-center gap-2 text-xs text-gray-600">
                                    <span className="font-semibold text-black">{fb.name}</span>
                                    <span>•</span>
                                    <span>{fb.message}</span>
                                </div>
                            ))}
                            {/* Duplicate for seamless loop */}
                            {userFeedback.map((fb, idx) => (
                                <div key={`dup-${idx}`} className="inline-flex items-center gap-2 text-xs text-gray-600">
                                    <span className="font-semibold text-black">{fb.name}</span>
                                    <span>•</span>
                                    <span>{fb.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ============== PHASE 01: EDITOR ==============
    if (step === 'editor') {
        return (
            <Step2Editor
                data={resume}
                onChange={setResume}
                onNext={() => setStep('template')}
                onBack={() => setStep('homepage')}
            />
        );
    }

    // ============== PHASE 02: TEMPLATES ==============
    if (step === 'template') {
        const selectedTemplate = dynamicTemplates.find(t => t.id === selectedTemplateId) || dynamicTemplates[0];
        return (
            <Step3TemplateExport
                data={resume}
                selectedTemplate={selectedTemplate}
                templates={dynamicTemplates}
                onSelect={(tpl) => setSelectedTemplateId(tpl.id)}
                onBack={() => setStep('editor')}
                onNext={() => setStep('finalize')}
            />
        );
    }

    // ============== PHASE 03: FINALIZE ==============
    if (step === 'finalize') {
        const selectedTemplate = dynamicTemplates.find(t => t.id === selectedTemplateId) || dynamicTemplates[0];
        return (
            <Step3Finalize
                data={resume}
                selectedTemplate={selectedTemplate}
                onChange={setResume}
                onBack={() => setStep('template')}
            />
        );
    }

    return null;
}

// ============== ADMIN COMPONENTS ==============
interface SortableTemplateItemProps {
    id: string;
    t: any; // Consider a more specific type if available
    stats: any;
    handlePriceChange: (id: string, price: number) => void;
    handleDiscountChange: (id: string, discount: number) => void;
    onToggleVisibility: (id: string) => void;
    onUpdateMetadata: (id: string, data: { name?: string, description?: string }) => void;
    onDelete?: (id: string) => void;
    isCustom?: boolean;
}

function SortableTemplateItem({ id, t, stats, handlePriceChange, handleDiscountChange, onToggleVisibility, onUpdateMetadata, onDelete, isCustom }: SortableTemplateItemProps) {
    const isVisible = stats.templateVisibility?.[id] !== false;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isVisible ? 1 : 0.6,
    };

    return (
        <div ref={setNodeRef} style={style} className={`bg-slate-50 border ${isVisible ? 'border-slate-100' : 'border-dashed border-slate-300'} rounded-3xl p-6 space-y-4 relative group transition-all`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded transition-colors">
                        <MoveVertical size={14} className="text-slate-400" />
                    </div>
                    <button
                        onClick={() => onToggleVisibility(id)}
                        className={`p-1.5 rounded-lg transition-all ${isVisible ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-slate-100'}`}
                        title={isVisible ? "Hide from users" : "Show to users"}
                    >
                        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <span className="text-xs font-black text-slate-900 truncate pr-2 uppercase tracking-wide">{t.id}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isCustom && onDelete && (
                        <button
                            onClick={() => onDelete(id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        >
                            <Plus size={14} className="rotate-45" />
                        </button>
                    )}
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${(stats.templateDiscounts?.[t.id] || 0) > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                        {(stats.templateDiscounts?.[t.id] || 0) > 0 ? `-${stats.templateDiscounts[t.id]}% OFF` : 'No Discount'}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Meta Inputs */}
                <div className="space-y-3 p-3 bg-white/50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Display Name</label>
                        <input
                            value={stats.templateMetadata?.[id]?.name ?? t.name}
                            onChange={(e) => onUpdateMetadata(id, { name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-black"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Description</label>
                        <textarea
                            value={stats.templateMetadata?.[id]?.description ?? t.description}
                            onChange={(e) => onUpdateMetadata(id, { description: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-medium focus:outline-none focus:border-black resize-none h-12"
                        />
                    </div>
                </div>

                {/* Price Input */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Base Price (₹)</label>
                    <div className="relative group/input">
                        <input
                            type="number"
                            value={stats.templatePrices?.[t.id] ?? (t as any).price}
                            onChange={(e) => handlePriceChange(t.id, parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-black transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/input:opacity-100 transition-opacity">
                            <button onClick={() => handlePriceChange(t.id, (stats.templatePrices?.[t.id] ?? (t as any).price) + 10)} className="p-1 hover:bg-slate-100 rounded"><Plus size={12} /></button>
                            <button onClick={() => handlePriceChange(t.id, Math.max(0, (stats.templatePrices?.[t.id] ?? (t as any).price) - 10))} className="p-1 hover:bg-slate-100 rounded"><Minus size={12} /></button>
                        </div>
                    </div>
                </div>

                {/* Discount Input */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Discount (%)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={stats.templateDiscounts?.[t.id] || 0}
                            onChange={(e) => handleDiscountChange(t.id, parseInt(e.target.value))}
                            className="flex-1 accent-black h-1.5 bg-slate-200 rounded-full cursor-pointer"
                        />
                        <span className="text-xs font-black text-slate-900 w-8">{stats.templateDiscounts?.[t.id] || 0}%</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Final Price</span>
                    <span className="text-sm font-black text-emerald-600">
                        ₹{Math.floor((stats.templatePrices?.[t.id] ?? (t as any).price) * (1 - (stats.templateDiscounts?.[t.id] || 0) / 100))}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ============== HELPERS ==============
function SecurityPinScreen({ onVerify, onClose }: { onVerify: (pin: string) => boolean, onClose: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onVerify(pin)) {
            setError(false);
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[10000] p-6">
            {/* Ambient Background */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-md relative">
                <div className="bg-zinc-900/50 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    <div className="text-center mb-10">
                        <div className="bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Lock size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-3">Admin Portal</h2>
                        <p className="text-zinc-400 text-sm">Please verify your security credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <input
                                type="password"
                                maxLength={6}
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value.replace(/[^0-9]/g, ''));
                                    setError(false);
                                }}
                                placeholder="••••••"
                                className={`w-full bg-black/40 border-2 ${error ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-white/5'} rounded-2xl px-4 py-5 text-center text-4xl tracking-[0.8em] font-mono text-white focus:border-white/20 focus:outline-none transition-all duration-300 placeholder:text-zinc-700`}
                                autoFocus
                            />
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-medium animate-shake">
                                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                    Invalid Security Pin. Access Denied.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-2">
                            <button
                                type="submit"
                                className="group w-full relative h-14 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Unlock Dashboard
                                    <ShieldCheck size={18} />
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full text-zinc-500 text-sm font-medium hover:text-white transition-colors py-2"
                            >
                                Back to HexaResume
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-zinc-600 text-xs tracking-widest uppercase font-bold">Authorized Personnel Only</p>
                </div>
            </div>
        </div>
    );
}

// ============== HELPERS ==============
function AdminDashboard({ stats, onUpdateStats, onClose }: { stats: any, onUpdateStats: (s: any) => void, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'analytics' | 'inventory'>('analytics');
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handlePriceChange = (id: string, price: number) => {
        const newPrices = { ...stats.templatePrices, [id]: price };
        onUpdateStats({ ...stats, templatePrices: newPrices });
    };

    const handleDiscountChange = (id: string, discount: number) => {
        const newDiscounts = { ...stats.templateDiscounts, [id]: Math.min(100, Math.max(0, discount)) };
        onUpdateStats({ ...stats, templateDiscounts: newDiscounts });
    };

    const handleToggleVisibility = (id: string) => {
        const currentVisibility = stats.templateVisibility?.[id] ?? true;
        const newVisibility = { ...stats.templateVisibility, [id]: !currentVisibility };
        onUpdateStats({ ...stats, templateVisibility: newVisibility });
    };

    const handleUpdateMetadata = (id: string, data: { name?: string, description?: string }) => {
        const currentMeta = stats.templateMetadata?.[id] || {};
        const newMetadata = {
            ...stats.templateMetadata,
            [id]: { ...currentMeta, ...data }
        };
        onUpdateStats({
            ...stats,
            templateMetadata: newMetadata
        });
    };

    const handleAddTemplate = () => {
        const base = TEMPLATES[0];
        const newId = `custom_${Date.now()}`;
        const newTemplate = {
            id: newId,
            name: `New Variant ${(stats.customTemplates?.length || 0) + 1}`,
            description: "Customize this new template variant",
            price: 49,
            baseId: base.id
        };

        const availableTemplates = [
            ...TEMPLATES.map((t: any) => t.id),
            ...(stats.customTemplates || []).map((t: any) => t.id)
        ];

        const currentOrder = stats.templateOrder && stats.templateOrder.length > 0
            ? stats.templateOrder.filter((id: string) => availableTemplates.includes(id))
            : availableTemplates;

        onUpdateStats({
            ...stats,
            customTemplates: [...(stats.customTemplates || []), newTemplate],
            templateOrder: [...currentOrder, newId]
        });
    };

    const handleDeleteCustom = (id: string) => {
        if (!confirm('Are you sure you want to delete this template variant?')) return;
        const newCustom = (stats.customTemplates || []).filter((t: any) => t.id !== id);
        const newOrder = (stats.templateOrder || []).filter((tid: string) => tid !== id);
        onUpdateStats({ ...stats, customTemplates: newCustom, templateOrder: newOrder });
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;
    };

    const avgSession = stats.sessionCount > 0 ? Math.floor(stats.totalBrowseTime / stats.sessionCount) : 0;

    return (
        <div className="fixed inset-0 bg-[#f8fafc] z-[9999] overflow-y-auto">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-black p-2 rounded-xl">
                            <ShieldCheck size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Growth Dashboard</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Control v2.5</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Inventory
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-all border border-slate-200"
                    >
                        Exit Admin
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-12">
                {activeTab === 'analytics' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Resumes</div>
                                    <TrendingUp size={16} className="text-emerald-500" />
                                </div>
                                <div className="text-4xl font-black text-slate-900">{stats.totalResumes}</div>
                                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Live Traffic
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visitor Time</div>
                                    <Clock size={16} className="text-blue-500" />
                                </div>
                                <div className="text-2xl font-black text-slate-900">{formatTime(stats.totalBrowseTime || 0)}</div>
                                <div className="mt-4 text-slate-400 text-xs font-medium">Avg Session: {formatTime(avgSession)}</div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue Est.</div>
                                    <DollarSign size={16} className="text-purple-500" />
                                </div>
                                <div className="text-4xl font-black text-slate-900">₹{stats.paidConversions * 99}</div>
                                <div className="mt-4 text-slate-400 text-xs font-medium">{stats.paidConversions} Paid Sales</div>
                            </div>

                            <div className="bg-black p-8 rounded-[2rem] shadow-xl">
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Total Visitors</div>
                                <div className="text-4xl font-black text-white">{stats.sessionCount || 0}</div>
                                <div className="mt-4 text-zinc-500 text-xs font-medium italic">Unique entries</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Template Usage */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Template Popularity</h3>
                                    <div className="bg-white px-3 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400">All Time</div>
                                </div>
                                <div className="p-8 space-y-1">
                                    {Object.entries(stats.templateUsage).length > 0 ? (
                                        Object.entries(stats.templateUsage).map(([id, count]: [string, any]) => (
                                            <div key={id} className="group flex justify-between items-center py-4 px-4 hover:bg-slate-50 rounded-2xl transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-black group-hover:text-white transition-all">
                                                        {id.substring(0, 2)}
                                                    </div>
                                                    <span className="font-bold uppercase tracking-widest text-[11px] text-slate-700">{id}</span>
                                                </div>
                                                <span className="font-black text-slate-900">{count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 text-sm font-medium">No template data yet</div>
                                    )}
                                </div>
                            </div>

                            {/* Target Roles */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Trending Search Roles</h3>
                                    <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700">View All</button>
                                </div>
                                <div className="p-8 space-y-1">
                                    {Object.entries(stats.roleSearches).length > 0 ? (
                                        Object.entries(stats.roleSearches).slice(0, 8).map(([role, count]: [string, any]) => (
                                            <div key={role} className="flex justify-between items-center py-4 px-4 hover:bg-slate-50 rounded-2xl transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors"></div>
                                                    <span className="font-bold uppercase tracking-widest text-[11px] text-slate-700">{role}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${Math.min(100, (count as number / (stats.totalResumes || 1)) * 500)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-black text-slate-900 tabular-nums">{count}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-slate-400 text-sm font-medium">No role search data yet</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">Product Catalog</h1>
                                <p className="text-slate-500 text-sm font-medium">Manage template variants, pricing, and visibility</p>
                            </div>
                            <button
                                onClick={handleAddTemplate}
                                className="bg-black text-white px-8 py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add New Variant
                            </button>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-12">
                            <div className="p-8">
                                <div className="bg-blue-50/50 p-4 rounded-2xl mb-8 flex items-center gap-3 border border-blue-100">
                                    <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                        <MoveVertical size={14} />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">Drag items by the handle to reorder preference for users</p>
                                </div>

                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event: DragEndEvent) => {
                                        const { active, over } = event;
                                        if (over && active.id !== over.id) {
                                            const availableTemplates = [
                                                ...TEMPLATES.map((t: any) => t.id),
                                                ...(stats.customTemplates || []).map((t: any) => t.id)
                                            ];
                                            const currentOrder = stats.templateOrder && stats.templateOrder.length > 0
                                                ? stats.templateOrder.filter((id: string) => availableTemplates.includes(id))
                                                : availableTemplates;

                                            const oldIndex = currentOrder.indexOf(active.id as string);
                                            const newIndex = currentOrder.indexOf(over.id as string);

                                            if (oldIndex !== -1 && newIndex !== -1) {
                                                const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
                                                onUpdateStats({ ...stats, templateOrder: newOrder });
                                            }
                                        }
                                    }}
                                >
                                    <SortableContext
                                        items={(() => {
                                            const availableTemplates = [
                                                ...TEMPLATES.map((t: any) => t.id),
                                                ...(stats.customTemplates || []).map((t: any) => t.id)
                                            ];
                                            return stats.templateOrder && stats.templateOrder.length > 0
                                                ? stats.templateOrder.filter((id: string) => availableTemplates.includes(id))
                                                : availableTemplates;
                                        })()}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {(() => {
                                                const availableTemplates = [
                                                    ...TEMPLATES.map((t: any) => t.id),
                                                    ...(stats.customTemplates || []).map((t: any) => t.id)
                                                ];
                                                const orderedIds = stats.templateOrder && stats.templateOrder.length > 0
                                                    ? stats.templateOrder.filter((id: string) => availableTemplates.includes(id))
                                                    : availableTemplates;

                                                return orderedIds.map((id: string) => {
                                                    const t = [...TEMPLATES, ...(stats.customTemplates || [])].find((temp: any) => temp.id === id);
                                                    const isCustom = (stats.customTemplates || []).some((ct: any) => ct.id === id);
                                                    return t ? (
                                                        <SortableTemplateItem
                                                            key={id}
                                                            id={id}
                                                            t={t}
                                                            stats={stats}
                                                            handlePriceChange={handlePriceChange}
                                                            handleDiscountChange={handleDiscountChange}
                                                            onToggleVisibility={handleToggleVisibility}
                                                            onUpdateMetadata={handleUpdateMetadata}
                                                            onDelete={isCustom ? handleDeleteCustom : undefined}
                                                            isCustom={isCustom}
                                                        />
                                                    ) : null;
                                                });
                                            })()}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}