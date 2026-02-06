
import { useState } from 'react';
import { ChevronLeft, Check, X, AlertCircle, Zap, FileText } from 'lucide-react';
import { extractKeywordsFromJD, compareResumeToJD, ComparisonResult } from '../../../services/keywordEngine';

interface Props {
    onBack: () => void;
}

export default function MobileResumeKeywordChecker({ onBack }: Props) {
    const [resumeText, setResumeText] = useState('');
    const [jdText, setJdText] = useState('');
    const [result, setResult] = useState<ComparisonResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = () => {
        if (!resumeText.trim() || !jdText.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const jdKeywords = extractKeywordsFromJD(jdText);
            const comparison = compareResumeToJD(resumeText, jdKeywords);
            setResult(comparison);
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
                    Keyword Checker
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 p-4 pb-12">
                {!result ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resume Text</label>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume content..."
                                className="w-full h-32 py-2 text-sm text-gray-900 border-none outline-none resize-none"
                            />
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Job Description</label>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Paste the target job description..."
                                className="w-full h-32 py-2 text-sm text-gray-900 border-none outline-none resize-none"
                            />
                        </div>
                        <button
                            onClick={handleCheck}
                            disabled={!resumeText.trim() || !jdText.trim() || loading}
                            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${resumeText.trim() && jdText.trim() ? 'bg-black text-white active:scale-0.98' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Zap size={16} className="fill-current" />
                                    <span>Match Keywords</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                            <div className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Match Overview</div>
                            <div className="text-3xl font-black text-gray-900">
                                {result.matchedCount}<span className="text-gray-300 text-xl font-medium mx-1">/</span>{result.totalKeywords}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Keywords found in your resume</p>
                            <button
                                onClick={() => setResult(null)}
                                className="mt-4 text-xs font-bold text-blue-600 px-4 py-2 bg-blue-50 rounded-lg"
                            >
                                Edit Content
                            </button>
                        </div>

                        {/* Matched */}
                        {result.matched.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check size={12} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Matched ({result.matched.length})</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.matched.map((item, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-semibold rounded-md border border-green-100">
                                            {item.keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Missing */}
                        {result.missing.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                        <X size={12} className="text-red-600" />
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Missing ({result.missing.length})</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing.map((item, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-[11px] font-semibold rounded-md border border-red-100">
                                            {item.keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
