
/**
 * TOOL: ATS Score Checker
 * URL: /ats-score-checker
 *
 * Upload PDF or paste resume text + JD to get an ATS Score
 */

import { useState, useRef } from 'react';
import { ChevronLeft, Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, X } from 'lucide-react';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS, ATSScoreResult, checkResumeStructure } from '../core/ats/scoreATS';
import { extractTextFromPDF } from '../utils/pdfExtractor';

interface Props {
    onNavigateHome: () => void;
}

export default function ATSScoreChecker({ onNavigateHome }: Props) {
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

        let jdKeywords;
        let scoreResult: ATSScoreResult;

        if (jdText.trim()) {
            // JD Provided: Match Analysis
            jdKeywords = extractKeywordsFromJD(jdText);
            scoreResult = scoreATS(resumeText, jdKeywords);
        } else {
            // No JD: Strength Analysis
            const resumeKeywords = extractKeywordsFromJD(resumeText);
            const structureResult = checkResumeStructure(resumeText);

            // Create a synthetic result for "Strength"
            scoreResult = {
                score: structureResult.score,
                matched: resumeKeywords.skills.map(k => ({ keyword: k, found: true, category: 'skill' }))
                    .concat(resumeKeywords.tools.map(k => ({ keyword: k, found: true, category: 'tool' })))
                    .concat(resumeKeywords.technologies.map(k => ({ keyword: k, found: true, category: 'tech' }))),
                missing: [],
                totalKeywords: 0,
                overused: [],
                suggestions: structureResult.suggestions
            };
            scoreResult.totalKeywords = scoreResult.matched.length;
        }

        setResult(scoreResult);
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between">
                <button
                    onClick={onNavigateHome}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
                >
                    <ChevronLeft size={18} />
                    Back to Home
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">H</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">ATS Scorer</span>
                </div>
                <div className="w-20" /> {/* Spacer */}
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ATS Score</span>
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Upload your resume and the job description to see how well you match. Get instant feedback on missing keywords.
                    </p>
                </div>

                {!result ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Resume Input - PDF Optimized */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} />
                                    Your Resume
                                </h2>
                                {resumeText && (
                                    <button
                                        onClick={() => { setResumeText(''); setFileName(null); }}
                                        className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1"
                                    >
                                        <X size={12} /> Clear
                                    </button>
                                )}
                            </div>

                            {!resumeText && !isExtracting ? (
                                <div
                                    className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-50/80 hover:border-blue-400 transition-all flex flex-col items-center justify-center cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="text-blue-600" size={24} />
                                    </div>
                                    <p className="font-semibold text-slate-700 mb-1">Upload Resume (PDF)</p>
                                    <p className="text-xs text-slate-400">or paste text below</p>
                                </div>
                            ) : isExtracting ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                    <RefreshCw className="animate-spin mb-2" size={24} />
                                    <p className="text-sm">Extracting text...</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    {fileName && (
                                        <div className="mb-3 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg flex items-center gap-2">
                                            <CheckCircle2 size={14} />
                                            Loaded: {fileName}
                                        </div>
                                    )}
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Paste resume text here..."
                                        className="flex-1 w-full p-4 bg-slate-50 border-0 rounded-xl text-sm text-slate-700 resize-none focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                            )}

                            {/* Fallback Text Area toggle or indicator could go here */}
                            {!resumeText && !isExtracting && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setResumeText(' ')} // Hack to show textarea
                                        className="text-xs text-slate-500 hover:text-blue-600 font-medium w-full text-center"
                                    >
                                        I want to paste text instead
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleCheckScore}
                                    disabled={!resumeText.trim()}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2"
                                >
                                    Analyze Resume <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Results View
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-8">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                {/* Score Circle */}
                                {jdText.trim() ? (
                                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-slate-100"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={440}
                                                strokeDashoffset={440 - (440 * result.score) / 100}
                                                className={result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900">{result.score}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-slate-100"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={440}
                                                strokeDashoffset={440 - (440 * result.score) / 100}
                                                className={result.score >= 80 ? 'text-emerald-500' : result.score >= 60 ? 'text-amber-500' : 'text-rose-500'}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-slate-900">{result.score}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Strength</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 text-center md:text-left">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border mb-4 ${getScoreColor(result.score)}`}>
                                        {jdText.trim() ? (result.score >= 80 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />) : <FileText size={14} />}
                                        {getScoreLabel(result.score)}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {jdText.trim()
                                            ? (result.score >= 80 ? "You're a strong candidate!" : "Optimize your keywords to rank higher.")
                                            : (result.score >= 80 ? "Your resume structure is solid!" : "Improve your resume structure.")}
                                    </h3>
                                    <p className="text-slate-600 max-w-lg">
                                        {jdText.trim()
                                            ? <>We found <strong className="text-slate-900">{result.matched.length}</strong> matching keywords out of <strong className="text-slate-900">{result.totalKeywords}</strong> important terms in the job description.</>
                                            : <>Your resume strength score is based on essential sections and structure. We also found <strong className="text-slate-900">{result.matched.length}</strong> relevant keywords.</>}
                                    </p>
                                </div>

                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Check Another
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {jdText.trim() && (
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                            <X size={14} strokeWidth={3} />
                                        </div>
                                        Missing Keywords (Critical)
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing.length > 0 ? result.missing.map((item, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-medium rounded-lg border border-rose-100">
                                                {item.keyword}
                                            </span>
                                        )) : (
                                            <p className="text-slate-400 italic text-sm">No missing keywords! Great job.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={`${jdText.trim() ? '' : 'md:col-span-2'} bg-white rounded-2xl p-6 border border-slate-200`}>
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 size={14} strokeWidth={3} />
                                    </div>
                                    {jdText.trim() ? "Matched Keywords" : "Found Keywords"}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.matched.length > 0 ? result.matched.map((item, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-100">
                                            {item.keyword}
                                        </span>
                                    )) : (
                                        <p className="text-slate-400 italic text-sm">No matches found yet.</p>
                                    )}
                                </div>

                                {/* Suggestions Section (Strength Mode Only) */}
                                {!jdText.trim() && result.suggestions && result.suggestions.length > 0 && (
                                    <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                        <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                            <AlertCircle size={18} /> Ways to Improve Your Score
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.suggestions.map((suggestion, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h4>
                            <p className="text-blue-800 text-sm">
                                Don't just stuff these keywords into a list. weave them into your **Experience** bullet points.
                                For example, instead of just saying "React", say "Built scalable frontend using **React** and Redux."
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
