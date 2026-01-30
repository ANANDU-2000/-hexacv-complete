import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, DollarSign, TrendingUp, FileText, Eye, Settings,
    Zap, Database, Activity, CreditCard, Download, AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
    onLogout: () => void;
}

interface Metrics {
    dailyActiveUsers: number;
    totalResumes: number;
    totalRevenue: number;
    conversionRate: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalOrders: number;
    freeDownloads: number;
    paidDownloads: number;
}

interface AIMetrics {
    totalAICalls: number;
    todayAICalls: number;
    aiCostTotal: number;
    aiCostToday: number;
    averageCostPerCall: number;
    categorizations: number;
    rewrites: number;
    optimizations: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'feedback' | 'settings'>('overview');
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
        // Refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            // Fetch main metrics
            const response = await fetch(`${API_BASE_URL}/api/analytics-v2/summary`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMetrics(data);
            }

            // Fetch AI usage metrics
            const aiResponse = await fetch(`${API_BASE_URL}/api/admin/ai-usage`, {
                credentials: 'include'
            });
            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                setAIMetrics(aiData);
            }

            setError(null);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            setError('Failed to load metrics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-slate-200">
                <div className="px-6 flex gap-6">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                        { id: 'feedback', label: 'Feedback', icon: Eye },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-slate-900 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Metrics Cards */}
                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading metrics...</div>
                        ) : (
                            <>
                                {/* Revenue Metrics */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <DollarSign className="text-green-600" size={20} />
                                        Revenue & Orders
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <MetricCard
                                            title="Total Revenue"
                                            value={`₹${metrics?.totalRevenue || 0}`}
                                            icon={DollarSign}
                                            color="green"
                                            subtitle={`Today: ₹${metrics?.todayRevenue || 0}`}
                                        />
                                        <MetricCard
                                            title="Monthly Revenue"
                                            value={`₹${metrics?.monthlyRevenue || 0}`}
                                            icon={TrendingUp}
                                            color="blue"
                                            subtitle="Current month"
                                        />
                                        <MetricCard
                                            title="Total Orders"
                                            value={metrics?.totalOrders || 0}
                                            icon={CreditCard}
                                            color="purple"
                                            subtitle={`${metrics?.paidDownloads || 0} paid, ${metrics?.freeDownloads || 0} free`}
                                        />
                                        <MetricCard
                                            title="Conversion Rate"
                                            value={`${(metrics?.conversionRate || 0).toFixed(1)}%`}
                                            icon={TrendingUp}
                                            color="orange"
                                            subtitle="Free to paid"
                                        />
                                    </div>
                                </div>

                                {/* AI Usage & Cost */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Zap className="text-yellow-600" size={20} />
                                        AI Usage & Costs
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <MetricCard
                                            title="Total AI Calls"
                                            value={aiMetrics?.totalAICalls || 0}
                                            icon={Activity}
                                            color="blue"
                                            subtitle={`Today: ${aiMetrics?.todayAICalls || 0}`}
                                        />
                                        <MetricCard
                                            title="Total AI Cost"
                                            value={`$${(aiMetrics?.aiCostTotal || 0).toFixed(2)}`}
                                            icon={Database}
                                            color="orange"
                                            subtitle={`Today: $${(aiMetrics?.aiCostToday || 0).toFixed(2)}`}
                                        />
                                        <MetricCard
                                            title="Avg Cost/Call"
                                            value={`$${(aiMetrics?.averageCostPerCall || 0).toFixed(4)}`}
                                            icon={TrendingUp}
                                            color="purple"
                                            subtitle="Per API call"
                                        />
                                        <MetricCard
                                            title="Categorizations"
                                            value={aiMetrics?.categorizations || 0}
                                            icon={Zap}
                                            color="green"
                                            subtitle={`${aiMetrics?.rewrites || 0} rewrites`}
                                        />
                                    </div>
                                </div>

                                {/* User & Resume Metrics */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FileText className="text-blue-600" size={20} />
                                        Users & Resumes
                                    </h3>
                                    <div className="grid grid-cols-4 gap-6">
                                        <MetricCard
                                            title="Daily Active Users"
                                            value={metrics?.dailyActiveUsers || 0}
                                            icon={Users}
                                            color="blue"
                                            subtitle="Active today"
                                        />
                                        <MetricCard
                                            title="Total Resumes"
                                            value={metrics?.totalResumes || 0}
                                            icon={FileText}
                                            color="green"
                                            subtitle="Generated"
                                        />
                                        <MetricCard
                                            title="Free Downloads"
                                            value={metrics?.freeDownloads || 0}
                                            icon={Download}
                                            color="purple"
                                            subtitle={`${((metrics?.freeDownloads || 0) / ((metrics?.freeDownloads || 0) + (metrics?.paidDownloads || 1)) * 100).toFixed(1)}% of total`}
                                        />
                                        <MetricCard
                                            title="Paid Downloads"
                                            value={metrics?.paidDownloads || 0}
                                            icon={CreditCard}
                                            color="orange"
                                            subtitle="Premium PDFs"
                                        />
                                    </div>
                                </div>

                                {/* AI Operations Breakdown */}
                                <div className="bg-white rounded-lg border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">AI Operations Breakdown</h3>
                                    <div className="space-y-3">
                                        <ProgressBar
                                            label="Categorizations"
                                            value={aiMetrics?.categorizations || 0}
                                            total={aiMetrics?.totalAICalls || 1}
                                            color="bg-blue-600"
                                        />
                                        <ProgressBar
                                            label="Rewrites (Paid)"
                                            value={aiMetrics?.rewrites || 0}
                                            total={aiMetrics?.totalAICalls || 1}
                                            color="bg-purple-600"
                                        />
                                        <ProgressBar
                                            label="Optimizations"
                                            value={aiMetrics?.optimizations || 0}
                                            total={aiMetrics?.totalAICalls || 1}
                                            color="bg-green-600"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={fetchMetrics}
                                    disabled={loading}
                                    className="px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Activity size={16} className={loading ? 'animate-spin' : ''} />
                                    Refresh Data
                                </button>
                                <button className="px-4 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                    View Analytics
                                </button>
                                <button className="px-4 py-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                                    Review Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Analytics Dashboard</h3>
                        <p className="text-sm text-slate-600">Detailed analytics charts coming soon...</p>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Feedback Management</h3>
                        <p className="text-sm text-slate-600">Feedback moderation interface coming soon...</p>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">System Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">AI Model</label>
                                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                                    <option>Groq (Llama 3.3 70B)</option>
                                    <option>Gemini 1.5 Flash</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Rate Limit (req/min)</label>
                                <input
                                    type="number"
                                    defaultValue={10}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                            <button className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: 'blue' | 'green' | 'purple' | 'orange';
    subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
                <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
        </div>
    );
};

// Progress Bar Component
interface ProgressBarProps {
    label: string;
    value: number;
    total: number;
    color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm text-slate-600">{value} ({percentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${color} transition-all duration-300`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
