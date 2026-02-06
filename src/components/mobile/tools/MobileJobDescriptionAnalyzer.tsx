
import { useState } from 'react';
import { ChevronLeft, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { parseJobDescription } from '../../../universal-jd-parser';

interface Props {
    onBack: () => void;
}

export default function MobileJobDescriptionAnalyzer({ onBack }: Props) {
    const [jdText, setJdText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = () => {
        if (!jdText.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const parsed = parseJobDescription(jdText);
            setResult(parsed);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            {/* Proper Header */}
            <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-[100]">
                <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-2xl active:bg-slate-50 transition-colors">
                    <ChevronLeft size={22} className="text-slate-900" />
                    <span className="text-[15px] font-bold text-slate-900">Back</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-900 uppercase tracking-tight text-center whitespace-nowrap">
                    JD Analyzer
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 p-4 pb-12">
                {!result ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Job Description</label>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Paste the target job description to analyze tech stack and requirements..."
                                className="w-full h-48 py-2 text-sm text-gray-900 border-none outline-none resize-none"
                            />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={!jdText.trim() || loading}
                            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${jdText.trim() ? 'bg-black text-white active:scale-0.98' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Briefcase size={16} />
                                    <span>Analyze JD</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Role Header */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <h2 className="text-xl font-black text-gray-900 mb-1">{result.detectedRole || 'Detected Role'}</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{result.experienceLevel || 'Experience not specified'}</p>
                            <button
                                onClick={() => setResult(null)}
                                className="mt-4 text-[11px] font-bold text-gray-400"
                            >
                                Analyze New JD
                            </button>
                        </div>

                        {/* Hard Skills */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.hardSkills.map((skill: any, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100">
                                        {skill.keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Soft Skills */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Soft Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.softSkills.map((skill: any, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-semibold rounded-lg border border-gray-100">
                                        {skill.keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
