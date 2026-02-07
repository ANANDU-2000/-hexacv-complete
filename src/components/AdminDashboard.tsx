import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    Users,
    MousePointer2,
    Globe,
    Lock,
    ArrowLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    ExternalLink,
    MessageSquare,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Star
} from 'lucide-react';
import { analyticsCollector } from '../admin-analytics';
import { feedbackService, FeedbackItem } from '../services/feedback';

interface AdminDashboardProps {
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const [passcode, setPasscode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'analytics' | 'feedback'>('analytics');
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);

    // Simple passcode check (Default: hexacv2026)
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === 'hexacv2026') {
            setIsAuthenticated(true);
            setError('');
            // Load stats
            const summary = analyticsCollector.getSummary();
            setStats(summary);

            // Add custom insights
            const generatedInsights = [
                `Total active sessions recorded: ${summary.totalSessions}`,
                `Most popular template: ${summary.templatePopularity[0]?.templateId || 'N/A'}`,
                `Average engagement time: ${Math.round(summary.averageSessionDuration / 60000)} mins`
            ];
            setInsights(generatedInsights);

            // Load feedback
            setFeedback(feedbackService.getFeedback());
        } else {
            setError('Invalid passcode. Access denied.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[9999] p-6">
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                            <Lock className="text-blue-500" size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Admin Terminal</h1>
                        <p className="text-slate-400 text-sm mt-2">Enter restricted access passcode</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-14 bg-slate-800 border-none rounded-2xl px-6 text-center text-xl text-white tracking-widest focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-red-400 text-xs font-bold text-center animate-pulse">{error}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Authorize Access
                            <ChevronRight size={18} />
                        </button>
                    </form>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 text-slate-500 text-xs font-bold hover:text-white transition-colors"
                    >
                        Return to Public Interface
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-50 z-[9999] overflow-y-auto no-scrollbar font-sans selection:bg-blue-100">
            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <BarChart3 className="text-blue-600" size={20} />
                                HexaCV Insights
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Admin Control Center
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'feedback' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Feedback
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-wider animate-pulse">
                            System Live
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-500">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 pb-32">
                {activeTab === 'analytics' ? (
                    <>
                        {/* Hero Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <MetricCard
                                label="Total Sessions"
                                value={stats?.totalSessions || 0}
                                change="+12%"
                                icon={<Users className="text-blue-500" />}
                                subtext="Last 30 days"
                            />
                            <MetricCard
                                label="Resume Downloads"
                                value={stats?.templatePopularity?.reduce((acc: number, t: any) => acc + t.count, 0) || 0}
                                change="+24.5%"
                                icon={<Download className="text-emerald-500" />}
                                subtext="Conversion: 18%"
                            />
                            <MetricCard
                                label="Tool Engagement"
                                value={stats?.featureUsage?.reduce((acc: number, f: any) => acc + f.count, 0) || 0}
                                change="+8%"
                                icon={<MousePointer2 className="text-purple-500" />}
                                subtext="Keyword checking is #1"
                            />
                            <MetricCard
                                label="Global Reach"
                                value="14"
                                change="Stable"
                                icon={<Globe className="text-amber-500" />}
                                subtext="Top: India, USA, Gulf"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Popularity Lists */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Templates Ranking */}
                                <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Template Popularity</h3>
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">Expand Details</button>
                                    </div>
                                    <div className="space-y-4">
                                        {stats?.templatePopularity?.map((t: any, idx: number) => (
                                            <div key={t.templateId} className="flex items-center gap-4">
                                                <span className="w-6 text-[11px] font-black text-slate-300">0{idx + 1}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1.5">
                                                        <span className="text-sm font-bold text-slate-700 capitalize">{t.templateId}</span>
                                                        <span className="text-xs font-black text-slate-900">{t.count} use cases</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, (t.count / stats.totalSessions) * 500)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Recent Activity */}
                                <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Recent Engagement</h3>
                                        <TrendingUp size={16} className="text-slate-400" />
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {insights.map((insight, i) => (
                                            <div key={i} className="px-8 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-default">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <p className="text-sm font-medium text-slate-600">{insight}</p>
                                                <span className="ml-auto text-[10px] font-bold text-slate-300 uppercase">Just now</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Right: Tools and External */}
                            <div className="space-y-8">
                                <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/10">
                                    <h3 className="text-lg font-black mb-6 tracking-tight">Free Tools CTR</h3>
                                    <div className="space-y-6">
                                        {stats?.featureUsage?.map((f: any) => (
                                            <div key={f.feature} className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{f.feature.replace('tool_', '')}</span>
                                                    <span className="text-sm font-black">{f.count} clicks</span>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                    <ChevronRight size={16} className="text-blue-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="bg-blue-600 rounded-3xl p-8 text-white">
                                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Global Analytics</h3>
                                    <p className="text-2xl font-black mb-6 leading-tight italic">"Full data visualization lives in GA4."</p>
                                    <a
                                        href="https://analytics.google.com"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-lg"
                                    >
                                        Launch Dashboard
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">User Feedback Moderation</h3>
                            <div className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest">
                                {feedback.length} Submissions
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {feedback.map((item) => (
                                <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-slate-900 text-lg">{item.userName}</h4>
                                            <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded uppercase tracking-wider">{item.role}</span>
                                            <div className="flex gap-0.5 ml-auto">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed italic mb-4">"{item.content}"</p>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock size={12} />
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col justify-end gap-2 shrink-0 md:min-w-[140px]">
                                        <button
                                            onClick={() => {
                                                feedbackService.toggleFeatured(item.id);
                                                setFeedback(feedbackService.getFeedback());
                                            }}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${item.isFeatured ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                                        >
                                            {item.isFeatured ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                            {item.isFeatured ? 'Featured' : 'Draft'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this feedback?')) {
                                                    feedbackService.deleteFeedback(item.id);
                                                    setFeedback(feedbackService.getFeedback());
                                                }
                                            }}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-400 uppercase tracking-wider hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
    subtext: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, icon, subtext }) => (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-slate-50 text-slate-900 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className={`text-[11px] font-black px-2 py-1 rounded-full ${change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {change}
            </span>
        </div>
        <div className="space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value.toLocaleString()}</h4>
            <div className="flex items-center gap-1.5 pt-1">
                <Clock size={10} className="text-slate-300" />
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{subtext}</p>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
