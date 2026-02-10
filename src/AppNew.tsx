import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Share2, Search, FileText, Sparkles, Briefcase, List } from 'lucide-react';
import { track } from './admin-analytics';
import './index.css';
import './design_overrides.css';
import './mobile.css';
import './styles/accessibility.css';
import { parseResumeWithAI } from './core/ats/resumeParser';
import { validateResumeData } from './core/ats/validation';
import { ResumeData } from './types';

import { Hero } from './components/Hero';
import { MobileOptimizationEngine } from './components/mobile/MobileOptimizationEngine';
import { trackEvent } from './analytics/googleAnalytics';
import { initAccessibility } from './utils/accessibility';
import { useDraftPersistence } from './hooks/useDraftPersistence';
import type { RoleContext } from './core/resumeIntelligence';

// ============== LAZY LOADED COMPONENTS ==============
// Core editor components - lazy load for faster initial page load
// REFACTORED: Using new clean architecture components
const EditorPage = lazy(() => import('./pages/EditorPage').then(module => ({ default: module.EditorPage })));
const PreviewPage = lazy(() => import('./pages/PreviewPage').then(module => ({ default: module.PreviewPage })));

const MobileEditor = lazy(() => import('./components/mobile/MobileEditor'));

const AnalyticsView = lazy(() => import('./components/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// SEO Landing Pages - lazy load since they're not needed on initial load
const FreeATSResumeBuilder = lazy(() => import('./pages/FreeATSResumeBuilder'));
const ResumeKeywordExtractor = lazy(() => import('./pages/ResumeKeywordExtractor'));
const ATSResumeForFreshers = lazy(() => import('./pages/ATSResumeForFreshers'));
const GulfATSResume = lazy(() => import('./pages/GulfATSResume'));
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

// Legal / PayU-required pages
const PricingPage = lazy(() => import('./pages/legal/PricingPage').then(m => ({ default: m.PricingPage })));
const TermsPage = lazy(() => import('./pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const RefundPage = lazy(() => import('./pages/legal/RefundPage').then(m => ({ default: m.RefundPage })));
const ContactPage = lazy(() => import('./pages/legal/ContactPage').then(m => ({ default: m.ContactPage })));

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
type Step = 'homepage' | 'editor' | 'preview' | 'analytics' | 'admin'
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
    const navigate = useNavigate();
    const location = useLocation();
    const [processing, setProcessing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [scrolled, setScrolled] = useState(false);

    // Initial resume state
    const [resume, setResume] = useState<ResumeData>({
        id: '1', // Ensure ID is present
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
    // Removed selectedTemplate state as it's now handled in PreviewPage

    const { showRestorePrompt, onRestore, onDismiss } = useDraftPersistence(resume, setResume);

    // Role context — collected on homepage, used everywhere
    const [roleContext, setRoleContext] = useState<RoleContext | null>(null);

    // Handler to navigate to preview.
    const handleNavigateToPreview = () => {
        setValidationErrors([]);
        navigate('/preview');
        trackEvent('preview_opened');
    };

    // Handler to start new resume from scratch (with role context already set)
    const handleStartNew = () => {
        navigate('/editor');
        trackEvent('resume_started');
        trackEvent('editor_opened');
    };

    // Handler: start from homepage role card
    const handleRoleStart = (ctx: RoleContext, mode: 'upload' | 'scratch') => {
        setRoleContext(ctx);
        // Seed resume basics with role info
        setResume((prev) => ({
            ...prev,
            basics: {
                ...prev.basics,
                targetRole: ctx.roleTitle,
                experienceLevel: ctx.experienceLevel as any,
                targetMarket: ctx.market as any,
            },
            jobDescription: ctx.jdText || prev.jobDescription,
        }));
        if (mode === 'scratch') {
            navigate('/editor');
            trackEvent('resume_started');
            trackEvent('editor_opened');
        }
        // If mode === 'upload', the Hero component handles file input; onUpload callback will route to editor
    };

    // Feedback success handling
    useEffect(() => {
        if (location.pathname === '/feedback-success') {
            setFeedbackSent(true);
            navigate('/', { replace: true });
            setTimeout(() => setFeedbackSent(false), 6000);
        }
    }, [location.pathname, navigate]);

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

    // Initialize accessibility and analytics
    useEffect(() => {
        initAccessibility();
        track.page('homepage');
        // Geographic hint for admin dashboard
        import('./admin-analytics').then(({ analyticsCollector }) => {
            analyticsCollector.trackGeographicHint();
        });
    }, []);

    // Helper to map parsed result to ResumeData
    const mapParsedToResumeData = (parsed: any): ResumeData => {
        return {
            id: Math.random().toString(36).substr(2, 9),
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
                navigate('/editor');
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
            <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-black selection:text-white">
                {processing && (
                    <div className="fixed inset-0 bg-slate-900 z-[9999] flex flex-col items-center justify-center">
                        <div className="text-center px-6 max-w-lg">
                            <h2 className="text-white font-bold text-xl mb-2">Reading your resume</h2>
                            <p className="text-slate-400 text-sm">This usually takes a few seconds.</p>
                        </div>
                    </div>
                )}

                {showRestorePrompt && (
                    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="restore-draft-title">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                            <h2 id="restore-draft-title" className="text-lg font-bold text-gray-900 mb-2">Restore draft?</h2>
                            <p className="text-gray-600 text-sm mb-6">We found an unsaved resume from this device. Restore?</p>
                            <div className="flex gap-3">
                                <button type="button" onClick={onDismiss} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Dismiss</button>
                                <button type="button" onClick={onRestore} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Restore</button>
                            </div>
                        </div>
                    </div>
                )}

                <Routes>
                    <Route path="/" element={
                        <>
                            {/* Compact nav: left HEXACV, right FREE TOOLS only — no extra space */}
                            <nav className={`hidden lg:flex px-3 py-2 min-h-[40px] sticky top-0 bg-white border-b border-gray-200 z-[100] items-center justify-between transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                                <button type="button" onClick={() => navigate('/')} className="flex items-center gap-1.5 shrink-0">
                                    <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center p-0.5">
                                        <img src="/logo.svg" alt="" className="w-full h-full brightness-0 invert" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">HEXACV</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/free-tools')}
                                    className="text-xs font-semibold text-gray-700 hover:text-gray-900 uppercase tracking-wide shrink-0"
                                >
                                    Free Tools
                                </button>
                            </nav>

                            <Hero
                                onStart={handleStartNew}
                                onUpload={handleFileUpload}
                                onRoleStart={handleRoleStart}
                                showFeedbackSuccess={feedbackSent}
                            />
                        </>
                    } />

                    <Route path="/editor" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ? (
                                <MobileEditor
                                    data={resume}
                                    onChange={setResume}
                                    onNext={handleNavigateToPreview}
                                    onBack={() => navigate('/')}
                                    validationErrors={validationErrors}
                                    roleContext={roleContext}
                                />
                            ) : (
                                <EditorPage
                                    data={resume}
                                    onChange={setResume}
                                    onNext={handleNavigateToPreview}
                                    onBack={() => navigate('/')}
                                    roleContext={roleContext}
                                />
                            )}
                        </Suspense>
                    } />

                    <Route path="/preview" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <PreviewPage
                                data={resume}
                                onBack={() => navigate('/editor')}
                                onGoHome={() => navigate('/')}
                            />
                        </Suspense>
                    } />

                    <Route path="/analytics" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <AnalyticsView onClose={() => navigate('/')} />
                        </Suspense>
                    } />

                    <Route path="/admin" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <AdminDashboard onClose={() => navigate('/')} />
                        </Suspense>
                    } />

                    {/* SEO Landing Pages */}
                    <Route path="/free-ats-resume-builder" element={<Suspense fallback={<LoadingSpinner />}><FreeATSResumeBuilder onStart={handleStartNew} /></Suspense>} />
                    <Route path="/resume-keyword-extractor" element={<Suspense fallback={<LoadingSpinner />}><ResumeKeywordExtractor onStart={handleStartNew} /></Suspense>} />
                    <Route path="/ats-resume-for-freshers" element={<Suspense fallback={<LoadingSpinner />}><ATSResumeForFreshers onStart={handleStartNew} /></Suspense>} />
                    <Route path="/gulf-ats-resume" element={<Suspense fallback={<LoadingSpinner />}><GulfATSResume onStart={handleStartNew} /></Suspense>} />
                    <Route path="/no-login-resume-builder" element={<Suspense fallback={<LoadingSpinner />}><NoLoginResumeBuilder onStart={handleStartNew} /></Suspense>} />
                    <Route path="/job-description-keyword-tool" element={<Suspense fallback={<LoadingSpinner />}><JobDescriptionKeywordTool onStart={handleStartNew} /></Suspense>} />

                    {/* Free SEO Tools */}
                    <Route path="/free-ats-keyword-extractor" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileATSKeywordExtractor onBack={() => navigate('/free-tools')} /> :
                                <ATSKeywordExtractor onNavigateHome={() => navigate('/')} />}
                        </Suspense>
                    } />
                    {/* ... other tools ... */}
                    <Route path="/resume-keyword-checker" element={<Suspense fallback={<LoadingSpinner />}><ResumeKeywordChecker onNavigateHome={() => navigate('/')} /></Suspense>} />
                    <Route path="/resume-bullet-improver" element={<Suspense fallback={<LoadingSpinner />}><ResumeBulletImprover onNavigateHome={() => navigate('/')} /></Suspense>} />
                    <Route path="/job-description-analyzer" element={<Suspense fallback={<LoadingSpinner />}><JobDescriptionAnalyzer onNavigateHome={() => navigate('/')} /></Suspense>} />
                    <Route path="/resume-section-checker" element={<Suspense fallback={<LoadingSpinner />}><ResumeSectionChecker onNavigateHome={() => navigate('/')} /></Suspense>} />

                    <Route path="/free-tools" element={
                        <Suspense fallback={<LoadingSpinner />}>
                            {isMobile ?
                                <MobileFreeToolsPage
                                    onNavigate={(route: string) => navigate(route)}
                                    onBack={() => navigate('/')}
                                /> :
                                <FreeToolsPage
                                    onNavigate={(route: string) => navigate(route)}
                                    onBack={() => navigate('/')}
                                />}
                        </Suspense>
                    } />

                    <Route path="/pricing" element={<Suspense fallback={<LoadingSpinner />}><PricingPage /></Suspense>} />
                    <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><TermsPage /></Suspense>} />
                    <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPage /></Suspense>} />
                    <Route path="/refund" element={<Suspense fallback={<LoadingSpinner />}><RefundPage /></Suspense>} />
                    <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><ContactPage /></Suspense>} />

                    {/* Catch-all redirect to homepage */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </MobileOptimizationEngine>
    );
}
