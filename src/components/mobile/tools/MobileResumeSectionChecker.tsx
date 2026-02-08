
import { useState } from 'react';
import { ChevronLeft, CheckCircle2, AlertCircle, List, Zap } from 'lucide-react';
import { checkResumeStructure } from '../../../core/ats/scoreATS';

interface Props {
    onBack: () => void;
}

export default function MobileResumeSectionChecker({ onBack }: Props) {
    const [resumeText, setResumeText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = () => {
        if (!resumeText.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const checked = checkResumeStructure(resumeText);
            setResult(checked);
            setLoading(false);
        }, 600);
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
                    Section Checker
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
                                placeholder="Paste your full resume text here to check for missing industry sections..."
                                className="w-full h-48 py-2 text-sm text-gray-900 border-none outline-none resize-none"
                            />
                        </div>
                        <button
                            onClick={handleCheck}
                            disabled={!resumeText.trim() || loading}
                            className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${resumeText.trim() ? 'bg-black text-white active:scale-0.98' : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <List size={18} />
                                    <span>Verify Structure</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {result.sections.map((section: any, i: number) => (
                            <div
                                key={i}
                                className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${section.present ? 'bg-white border-gray-100' : 'bg-red-50/30 border-red-100'
                                    }`}
                            >
                                <div className={`mt-0.5 ${section.present ? 'text-green-500' : 'text-red-400'}`}>
                                    {section.present ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                </div>
                                <div>
                                    <h4 className={`text-[15px] font-bold ${section.present ? 'text-gray-900' : 'text-red-700'}`}>
                                        {section.section}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {section.present ? 'Successfully identified in your resume.' : (section.warning || 'This section appears to be missing.')}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setResult(null)}
                            className="w-full mt-4 py-3 text-xs font-bold text-gray-400"
                        >
                            Check New Content
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
