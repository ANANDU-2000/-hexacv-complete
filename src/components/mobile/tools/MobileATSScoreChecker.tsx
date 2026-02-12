
import { useState, useRef } from 'react';
import { ChevronLeft, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, X, Zap, ArrowRight } from 'lucide-react';
import { extractKeywordsFromJD } from '../../../core/ats/extractKeywords';
import { scoreATS, ATSScoreResult, checkResumeStructure } from '../../../core/ats/scoreATS';
import { extractTextFromPDF } from '../../../utils/pdfExtractor';

interface Props {
    onBack: () => void;
}

export default function MobileATSScoreChecker({ onBack }: Props) {
    const [resumeText, setResumeText] = useState('');
    const [jdText, setJdText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [result, setResult] = useState<ATSScoreResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        setIsExtracting(true);
        setFileName(file.name);
        try {
            const text = await extractTextFromPDF(file);
            setResumeText(text);
        } catch (error) {
            console.error(error);
            alert('Failed to read PDF. Please copy-paste text instead.');
            setFileName(null);
        } finally {
            setIsExtracting(false);
        }
    };

    const handleCheckScore = () => {
        if (!resumeText.trim()) return;

        // Always extract keywords from resume for display
        const resumeKeywords = extractKeywordsFromJD(resumeText);

        let jdKeywords;
        let scoreResult: ATSScoreResult;

        if (jdText.trim()) {
            // JD Provided: Match Analysis
            jdKeywords = extractKeywordsFromJD(jdText);
            scoreResult = scoreATS(resumeText, jdKeywords);
        } else {
            // No JD: Strength Analysis
            const structureResult = checkResumeStructure(resumeText);

            // Create a synthetic result for "Strength"
            scoreResult = {
                score: structureResult.score,
                matched: resumeKeywords.skills.map(k => ({ keyword: k, found: true, category: 'skill' }))
                    .concat(resumeKeywords.tools.map(k => ({ keyword: k, found: true, category: 'tool' })))
                    .concat(resumeKeywords.technologies.map(k => ({ keyword: k, found: true, category: 'tech' }))),
                missing: [],
                totalKeywords: 0, // Not relevant for structure check
                overused: [],
                suggestions: structureResult.suggestions
            };
            scoreResult.totalKeywords = scoreResult.matched.length;
        }

        setResult(scoreResult);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setResumeText('');
        setJdText('');
        setFileName(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getScoreColor = (score: number) => {
        if (!jdText.trim()) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-rose-600 bg-rose-50 border-rose-200';
    };

    const getScoreLabel = (score: number) => {
        if (!jdText.trim()) {
            if (score >= 80) return 'Strong Resume';
            if (score >= 60) return 'Good Structure';
            return 'Needs Improvement';
        }
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Potential';
        return 'Needs Improvement';
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-[100]">
                <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-2 -ml-2 rounded-2xl active:bg-slate-50 transition-colors">
                    <ChevronLeft size={22} className="text-slate-900" />
                    <span className="text-[15px] font-bold text-slate-900">Back</span>
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-[11px] font-black text-slate-900 uppercase tracking-tight whitespace-nowrap">
                    ATS Score Checker
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 p-4 pb-12">
                {!result ? (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                Your Resume
                                {resumeText && (
                                    <button
                                        onClick={() => { setResumeText(''); setFileName(null); }}
                                        className="text-rose-500 flex items-center gap-1 normal-case"
                                    >
                                        <X size={12} /> Clear
                                    </button>
                                )}
                            </h2>

                            {!resumeText && !isExtracting ? (
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 py-8 flex flex-col items-center justify-center cursor-pointer active:bg-gray-100 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                        <Upload className="text-blue-600" size={20} />
                                    </div>
                                    <p className="font-bold text-sm text-gray-900">Upload PDF Resume</p>
                                    <p className="text-xs text-gray-400 mt-1">Tap to browse files</p>
                                </div>
                            ) : isExtracting ? (
                                <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                                    <RefreshCw className="animate-spin mb-2" size={24} />
                                    <p className="text-sm">Reading PDF...</p>
                                </div>
                            ) : (
                                <div>
                                    {fileName && (
                                        <div className="mb-3 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-2 truncate">
                                            <CheckCircle2 size={12} />
                                            {fileName}
                                        </div>
                                    )}
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Or paste resume text..."
                                        className="w-full h-32 p-3 bg-gray-50 border-none rounded-xl text-sm text-gray-700 resize-none focus:ring-0"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleCheckScore}
                                disabled={!resumeText.trim()}
                                className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/10 ${resumeText.trim() ? 'bg-slate-900 text-white active:scale-95' : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <Zap size={16} className={resumeText.trim() ? "fill-white" : ""} />
                                Analyze Resume
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                        {/* Score Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center relative overflow-hidden">
                            {jdText.trim() ? (
                                <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * result.score) / 100} className={result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-slate-900">{result.score}%</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={351} strokeDashoffset={351 - (351 * result.score) / 100} className={result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-slate-900">{result.score}%</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strength</span>
                                    </div>
                                </div>
                            )}

                            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border mb-2 ${getScoreColor(result.score)}`}>
                                {getScoreLabel(result.score)}
                            </div>

                            <p className="text-sm text-gray-500 leading-relaxed">
                                {jdText.trim()
                                    ? <>Matches <strong className="text-gray-900">{result.matched.length}</strong> / <strong className="text-gray-900">{result.totalKeywords}</strong> keywords</>
                                    : <>Score based on resume structure. Found <strong className="text-gray-900">{result.matched.length}</strong> keywords.</>}
                            </p>
                        </div>

                        {/* Missing Keywords */}
                        {jdText.trim() && (
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertCircle size={14} /> Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missing.length > 0 ? result.missing.map((item, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-100">
                                            {item.keyword}
                                        </span>
                                    )) : (
                                        <p className="text-gray-400 italic text-xs">All keywords found!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Matched Keywords */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 size={14} /> {jdText.trim() ? "Matched Keywords" : "Found Keywords"}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.matched.length > 0 ? result.matched.map((item, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                                        {item.keyword}
                                    </span>
                                )) : (
                                    <p className="text-gray-400 italic text-xs">No keywords found.</p>
                                )}
                            </div>
                        </div>

                        {/* Suggestions Section (Strength Mode Only) */}
                        {!jdText.trim() && result.suggestions && result.suggestions.length > 0 && (
                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-4">
                                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertCircle size={14} /> Improvement Tips
                                </h3>
                                <div className="space-y-2">
                                    {result.suggestions.map((suggestion, idx) => (
                                        <div key={idx} className="flex gap-2 text-xs text-amber-800 leading-relaxed">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleReset}
                            className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm"
                        >
                            Check Another Resume
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
