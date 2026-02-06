
import { useState } from 'react';
import { Search, ChevronLeft, Copy, Check, Zap } from 'lucide-react';
import { extractKeywordsFromJD, ExtractedKeywords } from '../../../services/keywordEngine';

interface Props {
    onBack: () => void;
}

export default function MobileATSKeywordExtractor({ onBack }: Props) {
    const [jdText, setJdText] = useState('');
    const [keywords, setKeywords] = useState<ExtractedKeywords | null>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleExtract = () => {
        if (!jdText.trim()) return;
        setLoading(true);
        // Simulate slight delay for "AI" feel
        setTimeout(() => {
            const result = extractKeywordsFromJD(jdText);
            setKeywords(result);
            setLoading(false);
        }, 600);
    };

    const handleCopyAll = () => {
        if (!keywords) return;
        const allText = keywords.allKeywords.join(', ');
        navigator.clipboard.writeText(allText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    Keyword Extractor
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 p-4 pb-12">
                {/* Intro */}
                <div className="mb-6">
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Paste a job description to identify the skills and keywords ATS systems prioritize.
                    </p>
                </div>

                {/* Input */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Job Description</label>
                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full h-48 py-2 text-sm text-gray-900 placeholder:text-gray-300 border-none outline-none resize-none"
                    />
                    <button
                        onClick={handleExtract}
                        disabled={!jdText.trim() || loading}
                        className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${jdText.trim() ? 'bg-black text-white active:scale-[0.98]' : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Zap size={16} className="fill-current" />
                                <span>Extract Keywords</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {keywords && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">Results</h2>
                            <button
                                onClick={handleCopyAll}
                                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 active:opacity-50"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy All'}
                            </button>
                        </div>

                        {/* Keyword Categories */}
                        {[
                            { title: 'Technical Skills', list: keywords.skills },
                            { title: 'Tools & Platforms', list: keywords.tools },
                            { title: 'Soft Skills', list: keywords.softSkills },
                            { title: 'Role Specific', list: keywords.roleKeywords }
                        ].map((section, idx) => (
                            section.list.length > 0 && (
                                <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{section.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {section.list.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}

                        {keywords.allKeywords.length === 0 && (
                            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-sm text-gray-400">No keywords found. Try a more detailed description.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
