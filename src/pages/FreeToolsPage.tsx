
import {
    Search,
    FileText,
    Sparkles,
    Briefcase,
    List,
    ArrowRight,
    CheckCircle2,
    Home,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    Zap,
    Globe,
    ArrowLeft,
    ExternalLink,
    Maximize2
} from 'lucide-react';

interface FreeToolsPageProps {
    onNavigate: (route: string) => void;
    onBack: () => void;
}

export default function FreeToolsPage({ onNavigate, onBack }: FreeToolsPageProps) {
    const tools = [
        {
            id: 'ats-keyword',
            name: 'ATS Keyword Extractor',
            icon: Search,
            description: 'Harness AI to dissect job descriptions. Identify high-priority keywords that Applicant Tracking Systems prioritize for your specific role.',
            features: ['Semantic Analysis', 'Frequency Ranking', 'Contextual Mapping'],
            route: '/free-ats-keyword-extractor',
            badge: 'Popular',
            gradient: 'from-blue-600 to-indigo-600',
            iconColor: 'text-white'
        },
        {
            id: 'resume-checker',
            name: 'Resume Keyword Checker',
            icon: FileText,
            description: 'An intelligent auditing tool for your CV. Instantly verify the presence of critical keywords and close the gap between your resume and the JD.',
            features: ['Gap Detection', 'Alignment Scoring', 'Instant Reporting'],
            route: '/resume-keyword-checker',
            gradient: 'from-emerald-500 to-teal-600',
            iconColor: 'text-white'
        },
        {
            id: 'bullet-improver',
            name: 'Bullet Point Improver',
            icon: Sparkles,
            description: 'Elevate your experience descriptions. Our AI refines passive phrasing into high-impact, achievement-oriented bullet points.',
            features: ['Quantifiable Metrics', 'Active Voice Polish', 'Action Verbs'],
            route: '/resume-bullet-improver',
            gradient: 'from-amber-500 to-orange-600',
            iconColor: 'text-white'
        },
        {
            id: 'jd-analyzer',
            name: 'JD Analyzer',
            icon: Briefcase,
            description: 'Strategic role analysis. Gain insights into seniority expectations, required tech stacks, and cultural indicators buried in job descriptions.',
            features: ['Market Benchmark', 'Tech Stack Audit', 'Soft Skill Mapping'],
            route: '/job-description-analyzer',
            gradient: 'from-purple-600 to-violet-600',
            iconColor: 'text-white'
        },
        {
            id: 'section-checker',
            name: 'Section Checker',
            icon: List,
            description: 'Structural integrity verification. Ensure your resume adheres to industry standards with every critical section placed for maximum impact.',
            features: ['Layout Validation', 'Missing Section Alerts', 'Industry Standards'],
            route: '/resume-section-checker',
            gradient: 'from-rose-500 to-pink-600',
            iconColor: 'text-white'
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Minimal Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50/50 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-emerald-50/50 blur-[100px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
                <div className="max-w-7xl mx-auto h-full px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                <ChevronLeft size={20} />
                            </div>
                            <span className="text-sm font-semibold">Back</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-black">H</span>
                            </div>
                            <span className="text-sm font-bold tracking-tight text-slate-900 uppercase">HexaCV</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Suite v2.0</span>
                    </div>

                    <button
                        onClick={onBack}
                        className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                    >
                        Launch Builder
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 lg:px-8 z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-8">
                        <Zap size={12} className="text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Precision Engineering</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                        Free <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">AI Tool Suite</span>
                    </h1>

                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
                        Powerful, privacy-first tools to audit your resume, analyze job requirements, and optimize your professional narrative for modern ATS.
                    </p>
                </div>
            </section>

            {/* Tools Grid Area */}
            <section className="px-6 lg:px-8 pb-32 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map((tool) => (
                            <div
                                key={tool.id}
                                className="group relative flex flex-col p-8 rounded-3xl border border-slate-100 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 cursor-pointer overflow-hidden"
                                onClick={() => onNavigate(tool.route)}
                            >
                                {/* Tool Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500`}>
                                        <tool.icon size={24} className="text-white" strokeWidth={2} />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                                            <ArrowRight size={14} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                                            {tool.name}
                                        </h3>
                                        {tool.badge && (
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold uppercase tracking-wider rounded-md border border-indigo-100">
                                                {tool.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium group-hover:text-slate-600 transition-colors">
                                        {tool.description}
                                    </p>

                                    <div className="space-y-3">
                                        {tool.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                </div>
                                                <span className="text-[12px] font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-500 rounded-full`} />
                            </div>
                        ))}

                        {/* Feature CTA */}
                        <div className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/30 text-center hover:bg-slate-50/50 transition-colors cursor-default group">
                            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:rotate-12 transition-transform">
                                <Maximize2 size={24} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">More Tools coming</h4>
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Intelligence Expansion</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Privacy Bar */}
            <section className="py-20 bg-slate-950 px-6 lg:px-8 overflow-hidden relative">
                <div className="absolute top-0 left-[20%] w-[40%] h-[100%] bg-indigo-500/10 blur-[120px] rounded-full" />

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 text-indigo-400">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Privacy Secured</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Your data never leaves your browser.</h2>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">
                            Our AI tools are engineered with a strict privacy-first architecture. We process your professional information in-memory, ensuring no data is ever stored on our servers.
                        </p>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white mb-1">100%</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local Processing</div>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white mb-1">AES</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encryption</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 lg:px-8 text-center bg-white relative">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Ready to optimize your CV?
                    </h2>
                    <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto">
                        Take the next step in your career journey with our premium resume builder.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            Get Started Now
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100/60 px-6 lg:px-8 text-center bg-slate-50/30">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 grayscale opacity-50">
                        <div className="w-5 h-5 bg-slate-900 rounded flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">H</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">HexaCV Ecosystem</span>
                    </div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2025 Precision Career Engineering</p>
                </div>
            </footer>
        </div>
    );
}
