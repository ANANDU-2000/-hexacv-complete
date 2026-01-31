import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import './index.css';
import './design_overrides.css';
import './mobile.css';
import { parseResumeWithAI } from './services/geminiService';
import { validateResumeData } from './services/validationService';
import Step2Editor from './components/Step2Editor';
import MobileEditor from './components/mobile/MobileEditor';
import Step3Preview from './components/Step3Preview';
import MobileFinalPreview from './components/mobile/MobileFinalPreview';
import { ResumeData } from './types';
import { TEMPLATES } from './constants';
import { Hero } from './components/Hero';
import { MobileOptimizationEngine } from './components/mobile/MobileOptimizationEngine';
import { trackEvent } from './analytics/googleAnalytics';
import { AnalyticsView } from './components/AnalyticsView';

// SEO Landing Pages
import FreeATSResumeBuilder from './pages/FreeATSResumeBuilder';
import ResumeKeywordExtractor from './pages/ResumeKeywordExtractor';
import ATSResumeForFreshers from './pages/ATSResumeForFreshers';
import NoLoginResumeBuilder from './pages/NoLoginResumeBuilder';
import JobDescriptionKeywordTool from './pages/JobDescriptionKeywordTool';

// ============== TYPES ==============
// Simplified 3-step flow for HexaCV FREE
// Step 1: Homepage (upload/create resume)
// Step 2: Editor (fill/edit resume data)
// Step 3: Preview (view + download PDF)
// SEO Pages: Landing pages for different keywords
type Step = 'homepage' | 'editor' | 'preview' | 'analytics' 
  | 'seo-free-ats' | 'seo-keyword-extractor' | 'seo-freshers' | 'seo-no-login' | 'seo-jd-tool';

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

                            <nav className={`px-5 md:px-12 h-[56px] sticky top-0 bg-white border-b border-[#E5E7EB] z-[100] flex items-center justify-center transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                                <div className="w-full max-w-7xl flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setStep('homepage')}>
                                        <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center p-1.5">
                                            <img src="/logo.svg" alt="HexaCV Logo" className="w-full h-full brightness-0 invert" />
                                        </div>
                                        <span className="text-[17px] font-black text-[#111111] uppercase tracking-tight">HEXACV</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'HexaCV - Free ATS Resume Builder',
                                                    text: 'Create ATS-optimized resumes for free.',
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('Link copied to clipboard!');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 h-[40px] border border-[#E5E7EB] rounded-full text-[#111111] hover:border-[#111111] transition-all"
                                    >
                                        <Share2 size={16} />
                                        <span className="text-[13px] font-bold sm:hidden">Share</span>
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
                    return isMobile ? (
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
                    );
                }

                // Step 3: Preview + Download
                if (step === 'preview') {
                    const selectedTemplate = TEMPLATES[0];
                    return isMobile ? (
                        <MobileFinalPreview
                            data={resume}
                            selectedTemplate={selectedTemplate}
                            onBack={() => setStep('editor')}
                            onNext={() => setStep('homepage')}
                        />
                    ) : (
                        <Step3Preview
                            data={resume}
                            setData={setResume}
                            config={selectedTemplate}
                            onBack={() => setStep('editor')}
                        />
                    );
                }

                // Analytics View (hidden, access via #/analytics)
                if (step === 'analytics') {
                    return (
                        <AnalyticsView
                            onClose={() => {
                                window.location.hash = '#/';
                                setStep('homepage');
                            }}
                        />
                    );
                }

                // SEO Landing Pages
                if (step === 'seo-free-ats') {
                    return <FreeATSResumeBuilder onStart={handleStartNew} />;
                }
                if (step === 'seo-keyword-extractor') {
                    return <ResumeKeywordExtractor onStart={handleStartNew} />;
                }
                if (step === 'seo-freshers') {
                    return <ATSResumeForFreshers onStart={handleStartNew} />;
                }
                if (step === 'seo-no-login') {
                    return <NoLoginResumeBuilder onStart={handleStartNew} />;
                }
                if (step === 'seo-jd-tool') {
                    return <JobDescriptionKeywordTool onStart={handleStartNew} />;
                }

                return null;
            })()}
        </MobileOptimizationEngine>
    );
}
