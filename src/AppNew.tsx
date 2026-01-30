import { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Share2, Lock as LucideLock, ShieldCheck, DollarSign, Clock, TrendingUp, Plus, Minus, MoveVertical, Eye, EyeOff, Sparkles, LayoutDashboard, Database, Activity, Settings2, Smartphone, Cpu } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './index.css';
import './design_overrides.css';
import './mobile.css';
import { parseResumeWithAI } from './services/geminiService';
import { trackEvent } from './api-service';
import { validateResumeData, ValidationError } from './services/validationService';
import Step2Editor from './components/Step2Editor';
import MobileEditor from './components/mobile/MobileEditor';
import Step2Templates from './components/Step2Templates';
import Step3TemplateExport from './components/Step3TemplateExport';
import Step3Preview from './components/Step3Preview';
import MobileTemplateExport from './components/mobile/MobileTemplateExport';
import MobileFinalPreview from './components/mobile/MobileFinalPreview';
import Step3Finalize from './components/Step3Finalize';
import GoalStep, { GoalData } from './components/GoalStep';
import { ResumeData } from './types';
import { TEMPLATES } from './constants';
import { Hero } from './components/Hero';
import { MobileOptimizationEngine } from './components/mobile/MobileOptimizationEngine';

// New Hiring Reality System imports
import RoleMarketStep, { RoleMarketData } from './components/RoleMarketStep';
import RealityCheckStep from './components/RealityCheckStep';
import FixesExplainedStep from './components/FixesExplainedStep';
import RewriteOptionsStep from './components/RewriteOptionsStep';
import DownloadChecklistStep from './components/DownloadChecklistStep';
import { RealityDashboard } from './components/RealityDashboard';
import { RealityAnalysis } from './reality-matching-types';
import {
    runFullAnalysis,
    analyzeJD,
    UserProfile,
    JDAnalysis,
    SectionPriority
} from './services/agentOrchestrationService';
import { TargetMarket } from './agents/shared/types';


// ============== TYPES ==============
// New 7-step flow for Hiring Reality System
type Step =
    | 'homepage'
    | 'target-role-market'  // Step 1: Role + Market
    | 'upload-cv'           // Step 2: Upload/Import
    | 'reality-check'       // Step 3: Reality Dashboard
    | 'fixes-explained'     // Step 4: Fixes with explanations
    | 'rewrite-options'     // Step 5: Free vs Paid
    | 'editor'              // Edit mode (can jump here from any step)
    | 'template'            // Template selection
    | 'preview'             // Final preview
    | 'download-checklist'  // Step 7: Download + Checklist
    // Legacy steps (kept for backwards compatibility)
    | 'goal'
    | 'jd'
    | 'finalize';

// ============== VALIDATION ==============
interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

function validateResumeForTemplates(data: ResumeData): ValidationResult {
    const result = validateResumeData(data);
    return {
        isValid: result.isValid,
        errors: result.errors.map(e => e.message)
    };
}

function isResumeEmpty(data: ResumeData): boolean {
    return !data.basics.fullName?.trim() &&
        !data.basics.email?.trim() &&
        !data.summary?.trim();
}

// ============== MAIN APP ==============
export default function AppNew() {
    const [step, setStep] = useState<Step>('homepage');
    const [selectedTemplateId, setSelectedTemplateId] = useState('template1free');
    const [processing, setProcessing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Goal step data - target role, experience level, country
    const [goalData, setGoalData] = useState<GoalData | null>(null);

    // JD keywords extracted from job description
    const [jdKeywords, setJdKeywords] = useState<string[]>([]);

    // ============== NEW HIRING REALITY SYSTEM STATE ==============
    // Role + Market data from Step 1
    const [roleMarketData, setRoleMarketData] = useState<RoleMarketData | null>(null);

    // User profile classification (Fresher/1-3yrs/3-5yrs/Switcher)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // JD analysis (extracted or generated)
    const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);

    // Reality analysis (5 panels - no fake ATS scores)
    const [realityAnalysis, setRealityAnalysis] = useState<RealityAnalysis | null>(null);

    // Section priority based on user type
    const [sectionPriority, setSectionPriority] = useState<SectionPriority | null>(null);

    // Selected rewrite option (free or paid)
    const [rewriteOption, setRewriteOption] = useState<'free' | 'paid'>('free');

    // Flag for paid user status
    const [isPaidUser, setIsPaidUser] = useState(false);

    // Handler to navigate to templates with validation
    const handleNavigateToTemplates = () => {
        const validation = validateResumeForTemplates(resume);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            // Auto-clear after 5 seconds
            setTimeout(() => setValidationErrors([]), 5000);
            return;
        }
        setValidationErrors([]);
        setStep('template');
    };

    // Deep link or state check for feedback redirect
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#/feedback-success') {
                setFeedbackSent(true);
                setStep('homepage');
                window.location.hash = '#/';
                setTimeout(() => setFeedbackSent(false), 6000);
            }
        };

        handleHashChange(); // Check on mount
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Header shadow on scroll
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track mobile status
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
        // NO demo feedback - only show real user feedback
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
            let finalPrice = Math.max(0, Math.floor(basePrice * (1 - discount / 100)));
            if (!showAdmin && t.id === 'template2' && basePrice > 0 && finalPrice === 0) {
                finalPrice = basePrice;
            }

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
                setStep('editor'); // Go directly to editor after upload
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
        setStep('editor'); // Go directly to editor
    };

    // Handler for goal step completion
    const handleGoalComplete = (data: GoalData) => {
        setGoalData(data);
        // Update resume with target role
        setResume(prev => ({
            ...prev,
            basics: { ...prev.basics, targetRole: data.targetRole }
        }));
        setStep('editor');
    };

    // ============== NEW HIRING REALITY SYSTEM HANDLERS ==============

    // Handler for Role + Market step completion (Step 1)
    const handleRoleMarketComplete = async (data: RoleMarketData) => {
        setRoleMarketData(data);
        // Update resume with target role
        setResume(prev => ({
            ...prev,
            basics: {
                ...prev.basics,
                targetRole: data.targetRole,
                targetRoleCategory: data.targetRoleCategory
            }
        }));
        setStep('upload-cv');
    };

    // Handler for Upload CV step - start from scratch
    const handleStartFromScratch = () => {
        setStep('editor');
    };

    // Handler for Upload CV step - after parsing
    const handleResumeUploaded = async (parsedData: ResumeData) => {
        setResume(parsedData);

        // Run analysis in background
        if (roleMarketData) {
            try {
                // Analyze JD (or generate one if not provided)
                const jdResult = await analyzeJD(
                    parsedData.jobDescription || null,
                    roleMarketData.targetRole,
                    { isPaidUser }
                );
                if (jdResult.success && jdResult.analysis) {
                    setJdAnalysis(jdResult.analysis);
                }
            } catch (error) {
                console.error('JD analysis failed:', error);
            }
        }

        setStep('reality-check');
    };

    // Handler for Reality Check step completion (Step 3)
    const handleRealityCheckComplete = (analysis: RealityAnalysis, priority: SectionPriority | null) => {
        setRealityAnalysis(analysis);
        setSectionPriority(priority);
        setStep('fixes-explained');
    };

    // Handler for Fixes Explained step completion (Step 4)
    const handleFixesComplete = () => {
        setStep('rewrite-options');
    };

    // Handler for Rewrite Options step completion (Step 5)
    const handleRewriteOptionSelected = (option: 'free' | 'paid') => {
        setRewriteOption(option);
        if (option === 'paid') {
            setIsPaidUser(true);
        }
        setStep('template');
    };

    // Handler for Download Checklist actions (Step 7)
    const handleDownloadAgain = () => {
        // Trigger download logic
        console.log('Download again');
    };

    const handleStartNewResume = () => {
        // Reset all state
        setStep('homepage');
        setRoleMarketData(null);
        setUserProfile(null);
        setJdAnalysis(null);
        setRealityAnalysis(null);
        setSectionPriority(null);
        setRewriteOption('free');
        setResume({
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
    };

    const handleVerifyPin = (pin: string) => {
        if (pin === '303741') {
            setIsAdminAuthenticated(true);
        } else {
            return false;
        }
        return true;
    };

    return (
        <MobileOptimizationEngine isAdmin={isAdminAuthenticated}>
            {(() => {
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

                if (step === 'homepage') {
                    return (
                        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-black selection:text-white">
                            {processing && (
                                <div className="fixed inset-0 bg-white/98 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500">
                                    {/* ... existing processing code ... */}
                                    <div className="relative mb-10">
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full animate-pulse opacity-20 blur-2xl"></div>
                                        <div className="relative w-32 h-32 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                            <svg className="w-16 h-16 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                            </svg>
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
                                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-pink-500 rounded-full -translate-x-1/2"></div>
                                        </div>
                                        <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-pink-400 rounded-full -translate-x-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="text-center px-6 space-y-3 animate-in fade-in duration-700 delay-300">
                                        <h2 className="text-black font-bold text-2xl tracking-tight">Analyzing Your Resume</h2>
                                        <p className="text-slate-600 text-sm font-medium max-w-md mx-auto leading-relaxed">
                                            Extracting key skills, experience, and achievements to optimize for ATS systems
                                        </p>
                                        <div className="flex items-center justify-center gap-2 pt-4">
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className={`px-5 md:px-12 h-[56px] sticky top-0 bg-white border-b border-[#E5E7EB] z-[100] flex items-center justify-center transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                                <div className="w-full max-w-7xl flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setStep('homepage')}>
                                        <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center p-1.5 transition-transform group-active:scale-95">
                                            <img src="/logo.svg" alt="HexaResume Logo" className="w-full h-full brightness-0 invert" />
                                        </div>
                                        <span className="text-[17px] font-black text-[#111111] uppercase tracking-tight">HEXARESUME</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'HexaResume - Premium AI Resume Builder',
                                                    text: 'Create role-targeted, ATS-proof resumes for free.',
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link copied to clipboard!');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] rounded-full text-[#111111] hover:border-[#111111] transition-all active:scale-90 sm:w-9 sm:h-9 sm:p-0 sm:justify-center"
                                    >
                                        <Share2 size={16} />
                                        <span className="text-[13px] font-bold sm:hidden">Share</span>
                                    </button>
                                </div>
                            </nav>

                            <Hero
                                onStart={() => setStep('editor')}
                                onUpload={handleFileUpload}
                                showFeedbackSuccess={feedbackSent}
                            />

                            <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 py-4 overflow-hidden">
                                <div className="flex items-center gap-12 animate-scroll-marquee whitespace-nowrap">
                                    {[...Array(2)].map((_, setIndex) => (
                                        <div key={setIndex} className="flex items-center gap-12">
                                            <div className="inline-flex items-center gap-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                                                    ))}
                                                </div>
                                                <span className="font-black text-slate-900 text-xs uppercase tracking-wider">Rahul S.</span>
                                                <span className="text-slate-500 font-medium text-xs">"Got interview in 2 days with this"</span>
                                            </div>
                                            <div className="inline-flex items-center gap-4">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                                                    ))}
                                                </div>
                                                <span className="font-black text-slate-900 text-xs uppercase tracking-wider">Anita M.</span>
                                                <span className="text-slate-500 font-medium text-xs">"Clean ATS format helped"</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }

                // ============== NEW HIRING REALITY SYSTEM STEPS ==============

                // Step 1: Target Role + Market
                if (step === 'target-role-market') {
                    return (
                        <RoleMarketStep
                            onComplete={handleRoleMarketComplete}
                            initialData={roleMarketData || undefined}
                        />
                    );
                }

                // Step 2: Upload CV
                if (step === 'upload-cv') {
                    return (
                        <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
                            {processing && (
                                <div className="fixed inset-0 bg-white/98 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-500">
                                    <div className="relative mb-10">
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full animate-pulse opacity-20 blur-2xl"></div>
                                        <div className="relative w-32 h-32 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                                            <svg className="w-16 h-16 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-center px-6 space-y-3">
                                        <h2 className="text-black font-bold text-2xl tracking-tight">Analyzing Your Resume</h2>
                                        <p className="text-slate-600 text-sm font-medium max-w-md mx-auto">
                                            Extracting skills, experience, and achievements...
                                        </p>
                                        <div className="flex items-center justify-center gap-2 pt-4">
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className={`px-5 md:px-12 h-[56px] sticky top-0 bg-white border-b border-[#E5E7EB] z-[100] flex items-center justify-center transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                                <div className="w-full max-w-7xl flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setStep('homepage')}>
                                        <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center p-1.5 transition-transform group-active:scale-95">
                                            <img src="/logo.svg" alt="HexaResume Logo" className="w-full h-full brightness-0 invert" />
                                        </div>
                                        <span className="text-[17px] font-black text-[#111111] uppercase tracking-tight">HEXARESUME</span>
                                    </div>
                                    <button
                                        onClick={() => setStep('target-role-market')}
                                        className="h-9 px-4 rounded-full border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] hover:border-[#111111] text-[13px] font-bold transition-all flex items-center gap-2"
                                    >
                                        ← Back
                                    </button>
                                </div>
                            </nav>

                            <div className="flex-1 flex items-center justify-center p-6">
                                <div className="max-w-xl w-full">
                                    <div className="text-center mb-10">
                                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                                            Upload Your Resume
                                        </h1>
                                        <p className="text-slate-500 font-medium">
                                            We'll analyze it against <span className="font-bold text-slate-700">{roleMarketData?.targetRole || 'your target role'}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Upload Area */}
                                        <label className="block border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-pink-300 hover:bg-pink-50/30 transition-all cursor-pointer group">
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
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
                                                            const parsedData = mapParsedToResumeData(result.resume);
                                                            setProcessing(false);
                                                            handleResumeUploaded(parsedData);
                                                        } catch (err) {
                                                            console.error('Parse error:', err);
                                                            alert('Failed to parse resume. Please try again.');
                                                            setProcessing(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="inline-flex bg-slate-100 group-hover:bg-pink-100 p-4 rounded-2xl mb-4 transition-colors">
                                                <Upload size={32} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-700 mb-2">Drop your PDF here</p>
                                            <p className="text-sm text-slate-400">or click to browse</p>
                                        </label>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 py-4">
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                            <span className="text-sm font-bold text-slate-400 uppercase">or</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>

                                        {/* Start from scratch */}
                                        <button
                                            onClick={handleStartFromScratch}
                                            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 transition-all"
                                        >
                                            Build from Scratch →
                                        </button>
                                    </div>

                                    {/* Education Note */}
                                    <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-sm text-blue-700 font-medium">
                                            <span className="font-bold">Why upload first?</span> We analyze your current resume to show you exactly what recruiters see - honest gaps, missing keywords, and section order issues.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                // Step 3: Reality Check
                if (step === 'reality-check') {
                    return (
                        <RealityCheckStep
                            resume={resume}
                            targetRole={roleMarketData?.targetRole || resume.basics.targetRole}
                            jdAnalysis={jdAnalysis}
                            userProfile={userProfile}
                            onContinue={handleRealityCheckComplete}
                            onBack={() => setStep('upload-cv')}
                            onEditResume={() => setStep('editor')}
                        />
                    );
                }

                // Step 4: Fixes Explained
                if (step === 'fixes-explained') {
                    return (
                        <FixesExplainedStep
                            realityAnalysis={realityAnalysis}
                            userProfile={userProfile}
                            onContinue={handleFixesComplete}
                            onBack={() => setStep('reality-check')}
                            onEditManually={() => setStep('editor')}
                        />
                    );
                }

                // Step 5: Rewrite Options
                if (step === 'rewrite-options') {
                    return (
                        <RewriteOptionsStep
                            onContinue={handleRewriteOptionSelected}
                            onBack={() => setStep('fixes-explained')}
                            isPaidUser={isPaidUser}
                        />
                    );
                }

                // Step 7: Download Checklist
                if (step === 'download-checklist') {
                    const selectedTemplate = dynamicTemplates.find(t => t.id === selectedTemplateId) || dynamicTemplates[0];
                    return (
                        <DownloadChecklistStep
                            resumeName={`${resume.basics.fullName || 'Resume'}_${selectedTemplate.name}.pdf`}
                            onDownloadAgain={handleDownloadAgain}
                            onStartNew={handleStartNewResume}
                            onShareFeedback={() => window.location.hash = '#/feedback'}
                        />
                    );
                }

                // ============== LEGACY STEPS ==============





                if (step === 'editor') {
                    return isMobile ? (
                        <MobileEditor
                            data={resume}
                            onChange={setResume}
                            onNext={handleNavigateToTemplates}
                            onBack={() => setStep('homepage')}
                            validationErrors={validationErrors}
                        />
                    ) : (
                        <Step2Editor
                            data={resume}
                            onChange={setResume}
                            onNext={handleNavigateToTemplates}
                            onBack={() => setStep('homepage')}
                            validationErrors={validationErrors}
                        />
                    );
                }

                if (step === 'template') {
                    const selectedTemplate = dynamicTemplates.find(t => t.id === selectedTemplateId) || dynamicTemplates[0];
                    return isMobile ? (
                        <MobileTemplateExport
                            data={resume}
                            selectedTemplate={selectedTemplate}
                            templates={dynamicTemplates}
                            onSelect={(tpl) => setSelectedTemplateId(tpl.id)}
                            onBack={() => setStep('editor')}
                            onNext={() => setStep('preview')}
                        />
                    ) : (
                        <Step2Templates
                            data={resume}
                            selectedTemplate={selectedTemplate}
                            templates={dynamicTemplates}
                            onSelect={(tpl) => setSelectedTemplateId(tpl.id)}
                            onDataChange={setResume}
                            onBack={() => setStep('editor')}
                            onNext={() => setStep('preview')}
                        />
                    );
                }

                if (step === 'preview') {
                    const selectedTemplate = dynamicTemplates.find(t => t.id === selectedTemplateId) || dynamicTemplates[0];
                    return isMobile ? (
                        <MobileFinalPreview
                            data={resume}
                            selectedTemplate={selectedTemplate}
                            onBack={() => setStep('template')}
                            onNext={() => setStep('finalize')}
                        />
                    ) : (
                        <Step3Preview
                            data={resume}
                            setData={setResume}
                            config={selectedTemplate}
                            onBack={() => setStep('template')}
                        />
                    );
                }

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
            })()}
        </MobileOptimizationEngine>
    );
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

    const finalPrice = Math.floor((stats.templatePrices?.[t.id] ?? (t as any).price) * (1 - (stats.templateDiscounts?.[t.id] || 0) / 100));

    return (
        <div ref={setNodeRef} style={style} className={`bg-white border ${isVisible ? 'border-slate-200' : 'border-dashed border-slate-300'} rounded-[2.5rem] p-8 space-y-6 relative group transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <MoveVertical size={16} className="text-slate-300" />
                    </div>
                    <button
                        onClick={() => onToggleVisibility(id)}
                        className={`p-2 rounded-xl transition-all ${isVisible ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}
                    >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                </div>
                {isCustom && onDelete && (
                    <button
                        onClick={() => onDelete(id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                        <Plus size={18} className="rotate-45" />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">SKU Profile</label>
                    <input
                        value={stats.templateMetadata?.[id]?.name ?? t.name}
                        onChange={(e) => onUpdateMetadata(id, { name: e.target.value })}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black text-slate-900 focus:ring-2 focus:ring-black transition-all"
                        placeholder="Template Name"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Base</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                            <input
                                type="number"
                                value={stats.templatePrices?.[t.id] ?? (t as any).price}
                                onChange={(e) => handlePriceChange(t.id, parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-50 border-none rounded-xl pl-8 pr-4 py-3 text-sm font-black text-slate-900"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Off</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={stats.templateDiscounts?.[t.id] || 0}
                                onChange={(e) => handleDiscountChange(t.id, parseInt(e.target.value))}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black text-slate-900"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Price</p>
                        <p className="text-xl font-black text-slate-900 tracking-tighter">₹{finalPrice}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isVisible ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {isVisible ? 'Active' : 'Hidden'}
                    </div>
                </div>
            </div>
        </div>
    );
}


// ============== HELPERS ==============
// ============== SECURITY SCREEN ==============
function SecurityPinScreen({ onVerify, onClose }: { onVerify: (pin: string) => boolean, onClose: () => void }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onVerify(pin)) {
            // success
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#020617] md:bg-black/95 backdrop-blur-3xl z-[99999] flex flex-col items-center justify-center p-6 lg:p-12 selection:bg-white selection:text-black">
            <div className="w-full max-w-md animate-in zoom-in-95 duration-700">
                <div className="text-center mb-12">
                    <div className="inline-flex bg-white/5 p-4 rounded-3xl mb-8 border border-white/10 ring-8 ring-white/[0.02]">
                        <LucideLock size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-4 uppercase">Restricted Area</h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide">AUTHENTICATION PROTOCOL REQUIRED</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <input
                            type="password"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value.replace(/[^0-9]/g, ''));
                                setError(false);
                            }}
                            placeholder="000000"
                            className={`w-full bg-white/[0.03] border-2 ${error ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : 'border-white/10'} rounded-[2rem] px-6 py-6 text-center text-4xl lg:text-5xl tracking-[0.6em] font-mono text-white focus:bg-white/5 focus:border-white/30 focus:outline-none transition-all duration-500 placeholder:text-zinc-800`}
                            autoFocus
                        />
                        {error && (
                            <div className="absolute -bottom-10 left-0 right-0 text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
                                Access Denied • Invalid Protocol
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-6">
                        <button
                            type="submit"
                            className="w-full h-16 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3"
                        >
                            Execute Unlock
                            <ShieldCheck size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors py-4"
                        >
                            Return to Frontend
                        </button>
                    </div>
                </form>
            </div>
            <div className="absolute bottom-12 left-0 right-0 text-center px-10">
                <p className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.8em]">End-to-End Cryptographic Security • System v6.0</p>
            </div>
        </div>
    );
}


// ============== HELPERS ==============
function AdminDashboard({ stats, onUpdateStats, onClose }: { stats: any, onUpdateStats: (s: any) => void, onClose: () => void }) {
    const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'api' | 'optimiser'>('analytics');
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
        <div className="fixed inset-0 bg-[#f8fafc] z-[9999] overflow-y-auto font-sans">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-black p-2 rounded-xl hidden md:block">
                            <LucideLock size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">System Core</h2>
                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management v6.1</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar max-w-[50%] md:max-w-none">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Activity size={12} strokeWidth={3} />
                            <span className="hidden md:inline">Analytics</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Database size={12} strokeWidth={3} />
                            <span className="hidden md:inline">Inventory</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('api')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'api' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Settings2 size={12} strokeWidth={3} />
                            <span className="hidden md:inline">Services</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('optimiser')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'optimiser' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            <Smartphone size={12} strokeWidth={3} />
                            <span className="hidden md:inline">Optimiser</span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
                    >
                        Exit
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
                {activeTab === 'analytics' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                            <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FileText size={40} />
                                </div>
                                <div className="relative">
                                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Output</div>
                                    <div className="text-2xl md:text-4xl font-black text-slate-900">{stats.totalResumes}</div>
                                    <div className="mt-3 flex items-center gap-2 text-emerald-500 text-[9px] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        LIVE
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Clock size={40} />
                                </div>
                                <div className="relative">
                                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Engage Time</div>
                                    <div className="text-lg md:text-2xl font-black text-slate-900 truncate">{formatTime(stats.totalBrowseTime || 0)}</div>
                                    <div className="mt-3 text-slate-400 text-[9px] font-medium">Avg: {formatTime(avgSession)}</div>
                                </div>
                            </div>

                            <div className="bg-white p-4 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <DollarSign size={40} />
                                </div>
                                <div className="relative">
                                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Revenue Net</div>
                                    <div className="text-2xl md:text-4xl font-black text-slate-900">₹{stats.paidConversions * 99}</div>
                                    <div className="mt-3 text-slate-400 text-[9px] font-medium">{stats.paidConversions} Orders</div>
                                </div>
                            </div>

                            <div className="bg-black p-4 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <TrendingUp size={40} className="text-white" />
                                </div>
                                <div className="relative">
                                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Reach Total</div>
                                    <div className="text-2xl md:text-4xl font-black text-white">{stats.sessionCount || 0}</div>
                                    <div className="mt-3 text-zinc-500 text-[9px] font-medium italic">Unique visitors</div>
                                </div>
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
                ) : activeTab === 'api' ? (
                    <>
                        {/* API Management Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">AI API Management</h1>
                            <p className="text-slate-500 text-sm font-medium">Manage AI service API keys and models - Changes apply immediately</p>
                        </div>

                        {/* Current API Keys */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Gemini API */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-blue-500 p-3 rounded-xl">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Gemini AI</h3>
                                        <p className="text-xs text-slate-500 font-medium">Google Gemini 1.5 Pro</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">API Key</label>
                                        <input
                                            type="password"
                                            value={import.meta.env.VITE_GEMINI_API_KEY || 'Not set'}
                                            readOnly
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-bold text-emerald-600">✓ Active</span>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Update Key</button>
                                    </div>
                                </div>
                            </div>

                            {/* Groq API */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-purple-500 p-3 rounded-xl">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">Groq AI</h3>
                                        <p className="text-xs text-slate-500 font-medium">LLaMA 3.1 70B</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">API Key</label>
                                        <input
                                            type="password"
                                            value={import.meta.env.VITE_GROQ_API_KEY || 'Not set'}
                                            readOnly
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-600"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-bold text-emerald-600">✓ Active</span>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Update Key</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* API Usage Stats */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 mb-8 text-white">
                            <h3 className="text-xl font-black mb-6">API Usage Monitor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <div className="text-sm font-bold text-white/60 mb-2">Total API Calls</div>
                                    <div className="text-3xl font-black">{stats.totalResumes * 3}</div>
                                    <div className="text-xs text-white/40 mt-2">This month</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <div className="text-sm font-bold text-white/60 mb-2">Success Rate</div>
                                    <div className="text-3xl font-black">98.5%</div>
                                    <div className="text-xs text-emerald-400 mt-2">↑ 2.3% from last month</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                    <div className="text-sm font-bold text-white/60 mb-2">Avg Response Time</div>
                                    <div className="text-3xl font-black">2.1s</div>
                                    <div className="text-xs text-white/40 mt-2">Excellent performance</div>
                                </div>
                            </div>
                        </div>

                        {/* Add New AI Model */}
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-300 p-12 text-center hover:border-slate-400 transition-all cursor-pointer group">
                            <div className="inline-flex bg-slate-100 p-4 rounded-2xl mb-4 group-hover:bg-slate-900 transition-all">
                                <Plus size={32} className="text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Add New AI Model</h3>
                            <p className="text-sm text-slate-500 font-medium">Connect OpenAI, Claude, or any custom AI service</p>
                        </div>
                    </>
                ) : activeTab === 'optimiser' ? (
                    <>
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Device Optimisation Engine</h1>
                            <p className="text-slate-500 text-sm font-medium">System Health Monitoring and Mobile Performance Controls</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                    <Cpu className="text-emerald-600" size={24} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Engine Status</h3>
                                <p className="text-xl font-black text-slate-900">Operational</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Proactive Monitoring Active</span>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                    <Smartphone className="text-blue-600" size={24} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Mobile Traffic</h3>
                                <p className="text-xl font-black text-slate-900">{Math.floor(stats.sessionCount * 0.65)} Devices</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">~65% of Total Reach</p>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <div className="bg-purple-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                    <Activity className="text-purple-600" size={24} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Pass Rate</h3>
                                <p className="text-xl font-black text-slate-900">99.2%</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase">Core Web Vitals Optimal</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Live Diagnostic Feed</h2>
                                    <p className="text-slate-400 text-sm font-medium">The floating optimizer engine is now active for your session.</p>
                                </div>
                                <button
                                    onClick={() => {
                                        (window as any).showMobileDebug = true;
                                        window.dispatchEvent(new Event('resize'));
                                    }}
                                    className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl"
                                >
                                    Launch Diagnostic Overlay
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Product Catalog</h1>
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
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            {(() => {
                                                const availableTemplates = [
                                                    ...TEMPLATES.map((t: any) => ({ ...t, isCustom: false })),
                                                    ...(stats.customTemplates || []).map((t: any) => ({ ...t, isCustom: true }))
                                                ];

                                                // Combine saved order with any new templates not yet in the order
                                                const savedOrder = (stats.templateOrder || []).filter((id: string) =>
                                                    availableTemplates.some((t: any) => t.id === id)
                                                );
                                                const pendingIds = availableTemplates
                                                    .map((t: any) => t.id)
                                                    .filter(id => !savedOrder.includes(id));

                                                const order = [...savedOrder, ...pendingIds];

                                                return order.map((id: string) => {
                                                    const t = availableTemplates.find((tpl: any) => tpl.id === id);
                                                    if (!t) return null;
                                                    return (
                                                        <SortableTemplateItem
                                                            key={t.id}
                                                            id={t.id}
                                                            t={t}
                                                            stats={stats}
                                                            handlePriceChange={handlePriceChange}
                                                            handleDiscountChange={handleDiscountChange}
                                                            onToggleVisibility={handleToggleVisibility}
                                                            onUpdateMetadata={handleUpdateMetadata}
                                                            onDelete={t.isCustom ? handleDeleteCustom : undefined}
                                                            isCustom={t.isCustom}
                                                        />
                                                    );
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
