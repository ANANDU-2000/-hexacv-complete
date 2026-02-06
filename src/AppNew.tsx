import { useState, useEffect, lazy, Suspense } from 'react';
import { Share2, Search, FileText, Sparkles, Briefcase, List, ChevronDown } from 'lucide-react';
import './index.css';
import './design_overrides.css';
import './mobile.css';
import './styles/accessibility.css';
import { parseResumeWithAI } from './services/geminiService';
import { validateResumeData } from './services/validationService';
import { ResumeData } from './types';
import { TEMPLATES } from './constants';
import { Hero } from './components/Hero';
import { MobileOptimizationEngine } from './components/mobile/MobileOptimizationEngine';
import { trackEvent } from './analytics/googleAnalytics';
import { initAccessibility } from './utils/accessibility';

// ============== LAZY LOADED COMPONENTS ==============
// Core editor components - lazy load for faster initial page load
const Step2Editor = lazy(() => import('./components/Step2Editor'));
const MobileEditor = lazy(() => import('./components/mobile/MobileEditor'));
const Step3Preview = lazy(() => import('./components/Step3Preview'));
const MobileFinalPreview = lazy(() => import('./components/mobile/MobileFinalPreview'));
const Step2Templates = lazy(() => import('./components/Step2Templates'));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));

// SEO Landing Pages - lazy load since they're not needed on initial load
const FreeATSResumeBuilder = lazy(() => import('./pages/FreeATSResumeBuilder'));
const ResumeKeywordExtractor = lazy(() => import('./pages/ResumeKeywordExtractor'));
const ATSResumeForFreshers = lazy(() => import('./pages/ATSResumeForFreshers'));
const NoLoginResumeBuilder = lazy(() => import('./pages/NoLoginResumeBuilder'));
const JobDescriptionKeywordTool = lazy(() => import('./pages/JobDescriptionKeywordTool'));
const FreeToolsPage = lazy(() => import('./pages/FreeToolsPage'));

// Free SEO Tools (NO signup, NO fake scores, honest outputs) - lazy load
const ATSKeywordExtractor = lazy(() => import('./tools/ATSKeywordExtractor'));
const ResumeKeywordChecker = lazy(() => import('./tools/ResumeKeywordChecker'));
const ResumeBulletImprover = lazy(() => import('./tools/ResumeBulletImprover'));
const JobDescriptionAnalyzer = lazy(() => import('./tools/JobDescriptionAnalyzer'));
const ResumeSectionChecker = lazy(() => import('./tools/ResumeSectionChecker'));

// Mobile Free Tools - lazy load
const MobileFreeToolsPage = lazy(() => import('./components/mobile/tools/MobileFreeToolsPage'));
const MobileATSKeywordExtractor = lazy(() => import('./components/mobile/tools/MobileATSKeywordExtractor'));
const MobileResumeKeywordChecker = lazy(() => import('./components/mobile/tools/MobileResumeKeywordChecker'));
const MobileResumeBulletImprover = lazy(() => import('./components/mobile/tools/MobileResumeBulletImprover'));
const MobileJobDescriptionAnalyzer = lazy(() => import('./components/mobile/tools/MobileJobDescriptionAnalyzer'));
const MobileResumeSectionChecker = lazy(() => import('./components/mobile/tools/MobileResumeSectionChecker'));

// ============== LOADING SPINNER COMPONENT ==============
const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
        <div className="relative z-10 text-center px-6">
            <div className="mb-6 flex justify-center">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-xl">
                    <img src="/logo.svg" alt="HexaCV" className="w-8 h-8" />
                </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-slate-400 text-sm">Loading...</p>
        </div>
    </div>
);

// ============== TYPES ==============
// Simplified 3-step flow for HexaCV FREE
// Step 1: Homepage (upload/create resume)
// Step 2: Editor (fill/edit resume data)
// Step 3: Preview (view + download PDF)
// SEO Pages: Landing pages for different keywords
// Tools: Free SEO tools for ATS optimization
type Step = 'homepage' | 'editor' | 'preview' | 'analytics'
    | 'seo-free-ats' | 'seo-keyword-extractor' | 'seo-freshers' | 'seo-no-login' | 'seo-jd-tool'
    | 'tool-ats-keyword-extractor' | 'tool-resume-keyword-checker' | 'tool-resume-bullet-improver'
    | 'tool-jd-analyzer' | 'tool-resume-section-checker' | 'free-tools-page';

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

// ============== MAIN APP ==============
export default function AppNew() {
    const [step, setStep] = useState<Step>('homepage');
    const [processing, setProcessing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [scrolled, setScrolled] = useState(false);

    // Initial resume state
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
    const [selectedTemplate, setSelectedTemplate] = useState<any>(TEMPLATES[0]);

    // Handler to navigate to preview with validation
    const handleNavigateToPreview = () => {
        const validation = validateResumeForTemplates(resume);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setTimeout(() => setValidationErrors([]), 5000);
            return;
        }
        setValidationErrors([]);
        setStep('preview');
        trackEvent('preview_opened');
    };

    // Handler to start new resume from scratch
    const handleStartNew = () => {
        setStep('editor');
        trackEvent('resume_started');
        trackEvent('editor_opened');
    };

    // Deep link for feedback redirect, analytics, and SEO pages
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#/feedback-success') {
                setFeedbackSent(true);
                setStep('homepage');
                window.location.hash = '#/';
                setTimeout(() => setFeedbackSent(false), 6000);
            } else if (hash === '#/analytics') {
                setStep('analytics');
            } else if (hash === '#/free-ats-resume-builder') {
                setStep('seo-free-ats');
            } else if (hash === '#/resume-keyword-extractor') {
                setStep('seo-keyword-extractor');
            } else if (hash === '#/ats-resume-for-freshers') {
                setStep('seo-freshers');
            } else if (hash === '#/no-login-resume-builder') {
                setStep('seo-no-login');
            } else if (hash === '#/job-description-keyword-tool') {
                setStep('seo-jd-tool');
            } else if (hash === '#/free-tools') {
                setStep('free-tools-page');
            }
            // Free SEO Tools
            else if (hash === '#/free-ats-keyword-extractor') {
                setStep('tool-ats-keyword-extractor');
            } else if (hash === '#/resume-keyword-checker') {
                setStep('tool-resume-keyword-checker');
            } else if (hash === '#/resume-bullet-improver') {
                setStep('tool-resume-bullet-improver');
            } else if (hash === '#/job-description-analyzer') {
                setStep('tool-jd-analyzer');
            } else if (hash === '#/resume-section-checker') {
                setStep('tool-resume-section-checker');
            }
        };
        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Header shadow on scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track mobile status
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize accessibility features
    useEffect(() => {
        initAccessibility();
    }, []);

    // Helper to map parsed result to ResumeData
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

    // Handle PDF file upload
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
                trackEvent('resume_uploaded');
                trackEvent('editor_opened');
            }, 500);
        } catch (err) {
            console.error('Parse error:', err);
            alert('Failed to parse resume. Please try again or build from scratch.');
            setProcessing(false);
        }
    };

    return (
        <MobileOptimizationEngine isAdmin={false}>
            {(() => {
                // Step 1: Homepage
                if (step === 'homepage') {
                    return (
                        <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-black selection:text-white">
                            {processing && (
                                <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col items-center justify-center">
                                    {/* Animated background gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>
                                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                                    <div className="relative z-10 text-center px-6 max-w-lg">
                                        {/* Logo */}
                                        <div className="mb-8 flex justify-center">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                                                <img src="/logo.svg" alt="HexaCV" className="w-10 h-10" />
                                            </div>
                                        </div>

                                        {/* Main heading */}
                                        <h2 className="text-white font-bold text-2xl mb-3">Reading your resume...</h2>
                                        <p className="text-slate-400 text-sm mb-8">This usually takes 5-10 seconds</p>

                                        {/* Progress steps */}
                                        <div className="space-y-4 text-left mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <span className="text-slate-300 text-sm">Extracting text from PDF</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                                <span className="text-white text-sm font-medium">Identifying skills, experience & education</span>
                                            </div>
                                            <div className="flex items-center gap-3 opacity-50">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                                                </div>
                                                <span className="text-slate-500 text-sm">Preparing your editor</span>
                                            </div>
                                        </div>

                                        {/* Why this matters */}
                                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-left">
                                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Why we do this</p>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                We parse your resume locally to understand your background.
                                                Your data never leaves your browser - we don't store anything on servers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className={`hidden lg:flex px-4 md:px-8 h-[48px] sticky top-0 bg-white border-b border-gray-200 z-[100] items-center justify-center transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                                <div className="w-full max-w-7xl flex items-center justify-between">
                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('homepage')}>
                                        <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center p-1">
                                            <img src="/logo.svg" alt="HexaCV" className="w-full h-full brightness-0 invert" />
                                        </div>
                                        <span className="text-[15px] font-bold text-gray-900">HEXACV</span>
                                    </div>

                                    {/* Tools Dropdown - Mega Menu */}
                                    <div className="hidden md:flex items-center gap-4">
                                        <div className="relative group">
                                            <button
                                                onClick={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }}
                                                className="flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-black font-medium px-2 py-1 transition-colors uppercase tracking-wider"
                                            >
                                                Free Tools
                                                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                                            </button>

                                            {/* Dropdown Container with specific user CSS overrides */}
                                            <div className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 pt-4 min-w-[500px] max-w-[95vw] w-max opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 cursor-auto ease-out translate-y-2 group-hover:translate-y-0">
                                                <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-2 grid grid-cols-2 gap-2 overflow-hidden">
                                                    {[
                                                        { name: 'ATS Keyword Extractor', icon: Search, href: '#/free-ats-keyword-extractor', desc: 'Extract keywords from JD' },
                                                        { name: 'Resume Keyword Checker', icon: FileText, href: '#/resume-keyword-checker', desc: 'Match resume to job' },
                                                        { name: 'Bullet Point Improver', icon: Sparkles, href: '#/resume-bullet-improver', desc: 'Enhance impact' },
                                                        { name: 'JD Analyzer', icon: Briefcase, href: '#/job-description-analyzer', desc: 'Analyze requirements' },
                                                        { name: 'Section Checker', icon: List, href: '#/resume-section-checker', desc: 'Verify resume sections' },
                                                    ].map((item, i) => (
                                                        <a
                                                            key={i}
                                                            href={item.href}
                                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors group/item"
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-black/5 text-black flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-black group-hover/item:text-white transition-all">
                                                                <item.icon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 group-hover/item:text-black transition-colors">
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                                    {item.desc}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'HexaCV - Free ATS Resume Builder',
                                                    text: 'Build ATS-friendly resumes for free.',
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link copied!');
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-3 h-[32px] border border-gray-200 rounded-full text-gray-700 hover:border-gray-900 text-[12px] font-medium"
                                    >
                                        <Share2 size={14} />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                </div>
                            </nav>

                            <Hero
                                onStart={handleStartNew}
                                onUpload={handleFileUpload}
                                showFeedbackSuccess={feedbackSent}
                            />
                        </div>
                    );
                }

                // Step 2: Editor
                if (step === 'editor') {
                    const selectedTemplate = TEMPLATES[0];
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ? (
                                <MobileEditor
                                    data={resume}
                                    onChange={setResume}
                                    onNext={handleNavigateToPreview}
                                    onBack={() => setStep('homepage')}
                                    validationErrors={validationErrors}
                                />
                            ) : (
                                <Step2Editor
                                    data={resume}
                                    onChange={setResume}
                                    onNext={handleNavigateToPreview}
                                    onBack={() => setStep('homepage')}
                                    validationErrors={validationErrors}
                                />
                            )}
                        </Suspense>
                    );
                }

                // Step 3: Preview + Download (Templates with Live Preview)
                if (step === 'preview') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            <Step2Templates
                                data={resume}
                                selectedTemplate={selectedTemplate}
                                onSelect={setSelectedTemplate}
                                onBack={() => setStep('editor')}
                                onNext={() => setStep('homepage')}
                                onGoToHomepage={() => setStep('homepage')}
                            />
                        </Suspense>
                    );
                }

                // Analytics View (hidden, access via #/analytics)
                if (step === 'analytics') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            <AnalyticsView
                                onClose={() => {
                                    window.location.hash = '#/';
                                    setStep('homepage');
                                }}
                            />
                        </Suspense>
                    );
                }

                // SEO Landing Pages
                if (step === 'seo-free-ats') {
                    return <Suspense fallback={<LoadingSpinner />}><FreeATSResumeBuilder onStart={handleStartNew} /></Suspense>;
                }
                if (step === 'seo-keyword-extractor') {
                    return <Suspense fallback={<LoadingSpinner />}><ResumeKeywordExtractor onStart={handleStartNew} /></Suspense>;
                }
                if (step === 'seo-freshers') {
                    return <Suspense fallback={<LoadingSpinner />}><ATSResumeForFreshers onStart={handleStartNew} /></Suspense>;
                }
                if (step === 'seo-no-login') {
                    return <Suspense fallback={<LoadingSpinner />}><NoLoginResumeBuilder onStart={handleStartNew} /></Suspense>;
                }
                if (step === 'seo-jd-tool') {
                    return <Suspense fallback={<LoadingSpinner />}><JobDescriptionKeywordTool onStart={handleStartNew} /></Suspense>;
                }

                // Free SEO Tools
                if (step === 'tool-ats-keyword-extractor') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileATSKeywordExtractor onBack={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }} /> :
                                <ATSKeywordExtractor onNavigateHome={() => { window.location.hash = '#/'; setStep('homepage'); }} />}
                        </Suspense>
                    );
                }
                if (step === 'tool-resume-keyword-checker') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileResumeKeywordChecker onBack={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }} /> :
                                <ResumeKeywordChecker onNavigateHome={() => { window.location.hash = '#/'; setStep('homepage'); }} />}
                        </Suspense>
                    );
                }
                if (step === 'tool-resume-bullet-improver') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileResumeBulletImprover onBack={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }} /> :
                                <ResumeBulletImprover onNavigateHome={() => { window.location.hash = '#/'; setStep('homepage'); }} />}
                        </Suspense>
                    );
                }
                if (step === 'tool-jd-analyzer') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileJobDescriptionAnalyzer onBack={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }} /> :
                                <JobDescriptionAnalyzer onNavigateHome={() => { window.location.hash = '#/'; setStep('homepage'); }} />}
                        </Suspense>
                    );
                }
                if (step === 'tool-resume-section-checker') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileResumeSectionChecker onBack={() => { window.location.hash = '#/free-tools'; setStep('free-tools-page'); }} /> :
                                <ResumeSectionChecker onNavigateHome={() => { window.location.hash = '#/'; setStep('homepage'); }} />}
                        </Suspense>
                    );
                }

                // Main Free Tools Page
                if (step === 'free-tools-page') {
                    return (
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileFreeToolsPage
                                    onNavigate={(route) => window.location.hash = route}
                                    onBack={() => { window.location.hash = '#/'; setStep('homepage'); }}
                                /> :
                                <FreeToolsPage
                                    onNavigate={(route) => window.location.hash = route}
                                    onBack={() => { window.location.hash = '#/'; setStep('homepage'); }}
                                />}
                        </Suspense>
                    );
                }

                return null;
            })()}
        </MobileOptimizationEngine>
    );
}
