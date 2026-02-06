
import {
    Search,
    FileText,
    Sparkles,
    Briefcase,
    List,
    ArrowRight,
    ChevronLeft,
    ShieldCheck,
    Zap
} from 'lucide-react';

interface Props {
    onNavigate: (route: string) => void;
    onBack: () => void;
}

export default function MobileFreeToolsPage({ onNavigate, onBack }: Props) {
    const tools = [
        {
            id: 'ats-keyword',
            name: 'ATS Keyword Extractor',
            icon: Search,
            description: 'Extract high-priority keywords from any job description.',
            route: '#/free-ats-keyword-extractor',
            gradient: 'from-blue-600 to-indigo-600',
        },
        {
            id: 'resume-checker',
            name: 'Resume Keyword Checker',
            icon: FileText,
            description: 'Compare your resume against job keywords instantly.',
            route: '#/resume-keyword-checker',
            gradient: 'from-emerald-500 to-teal-600',
        },
        {
            id: 'bullet-improver',
            name: 'Bullet Point Improver',
            icon: Sparkles,
            description: 'Refine passive phrasing into high-impact bullet points.',
            route: '#/resume-bullet-improver',
            gradient: 'from-amber-500 to-orange-600',
        },
        {
            id: 'jd-analyzer',
            name: 'JD Analyzer',
            icon: Briefcase,
            description: 'Strategic analysis of role requirements and tech stacks.',
            route: '#/job-description-analyzer',
            gradient: 'from-purple-600 to-violet-600',
        },
        {
            id: 'section-checker',
            name: 'Section Checker',
            icon: List,
            description: 'Ensure your resume has all critical industry sections.',
            route: '#/resume-section-checker',
            gradient: 'from-rose-500 to-pink-600',
        }
    ];

    return (
        <div className="flex flex-col bg-gray-50 min-h-screen font-sans selection:bg-black selection:text-white">
            {/* Proper Header */}
            <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-[100]">
                <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-2xl active:bg-slate-50 transition-colors">
                    <ChevronLeft size={22} className="text-slate-900" />
                    <span className="text-[15px] font-bold text-slate-900">Back</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-black text-slate-900 uppercase tracking-tight">
                    Free AI Tools
                </div>
                <div className="w-10" />
            </header>

            {/* Hero */}
            <div className="px-6 pt-10 pb-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4">
                    <Zap size={10} className="text-blue-600 fill-blue-600" />
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">AI Tool Suite</span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                    Free AI Tools
                </h1>
                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                    Professional utilities to audit your resume and optimize for ATS.
                </p>
            </div>

            {/* Tools List */}
            <div className="px-4 pb-12 space-y-4">
                {tools.map((tool) => (
                    <div
                        key={tool.id}
                        onClick={() => onNavigate(tool.route)}
                        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 active:scale-[0.98] transition-transform"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0`}>
                            <tool.icon size={22} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-1">{tool.name}</h3>
                            <p className="text-xs text-gray-500 leading-normal">{tool.description}</p>
                        </div>
                        <div className="mt-4">
                            <ArrowRight size={14} className="text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Privacy Note */}
            <div className="mx-4 mb-10 p-5 bg-black rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Privacy First</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Your data never leaves your browser. All AI processing happens locally in real-time.
                </p>
            </div>
        </div>
    );
}
