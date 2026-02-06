
import { useState } from 'react';
import { ChevronLeft, RefreshCw, Sparkles, Check, Zap } from 'lucide-react';
import { improveBullet } from '../../../services/keywordEngine';

interface Props {
    onBack: () => void;
}

interface BulletResult {
    original: string;
    improved: string;
    changes: string[];
}

export default function MobileResumeBulletImprover({ onBack }: Props) {
    const [bulletText, setBulletText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [result, setResult] = useState<BulletResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImprove = () => {
        if (!bulletText.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const improved = improveBullet(bulletText, targetRole || undefined);
            setResult(improved);
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
                    Bullet Improver
                </div>
                <div className="w-10" />
            </header>

            <main className="flex-1 p-4 pb-12">
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Original Bullet</label>
                        <textarea
                            value={bulletText}
                            onChange={(e) => setBulletText(e.target.value)}
                            placeholder="e.g. Responsible for website development..."
                            className="w-full h-24 py-2 text-sm text-gray-900 border-none outline-none resize-none"
                        />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Target Role (Optional)</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Frontend Engineer"
                            className="w-full py-1 text-sm text-gray-900 border-none outline-none"
                        />
                    </div>

                    <button
                        onClick={handleImprove}
                        disabled={!bulletText.trim() || loading}
                        className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${bulletText.trim() ? 'bg-black text-white active:scale-0.98' : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Sparkles size={16} className="fill-current" />
                                <span>Improve Wording</span>
                            </>
                        )}
                    </button>
                </div>

                {result && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50/30 to-white">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">AI Improved Version</h3>
                            <p className="text-sm text-gray-900 font-bold leading-relaxed">{result.improved}</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Changes Logic</h3>
                            <ul className="space-y-2">
                                {result.changes.map((change, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-3 text-xs font-bold text-gray-400 border border-dashed border-gray-200 rounded-xl"
                        >
                            Try Another Bullet
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
