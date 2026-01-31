// Simple Analytics View - Frontend Only
// Shows aggregate anonymous stats from localStorage
// NO login required, NO backend

import React, { useState, useEffect } from 'react';
import { getLocalStats, clearLocalAnalytics } from '../analytics/googleAnalytics';
import { BarChart3, Download, FileText, Users, Sparkles, Trash2, ArrowLeft } from 'lucide-react';

interface AnalyticsViewProps {
  onClose: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onClose }) => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalDownloads: 0,
    totalSessions: 0,
    keywordExtractions: 0
  });

  useEffect(() => {
    setStats(getLocalStats());
  }, []);

  const handleClearData = () => {
    if (window.confirm('Clear all local analytics data? This cannot be undone.')) {
      clearLocalAnalytics();
      setStats({
        totalResumes: 0,
        totalDownloads: 0,
        totalSessions: 0,
        keywordExtractions: 0
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Local Analytics</h1>
              <p className="text-sm text-slate-500">Anonymous stats from this browser only</p>
            </div>
          </div>
          <button
            onClick={handleClearData}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Clear Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FileText className="text-blue-500" />}
            label="Resumes Created"
            value={stats.totalResumes}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Download className="text-emerald-500" />}
            label="Downloads"
            value={stats.totalDownloads}
            bgColor="bg-emerald-50"
          />
          <StatCard
            icon={<Users className="text-purple-500" />}
            label="Sessions"
            value={stats.totalSessions}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<Sparkles className="text-amber-500" />}
            label="Keyword Extractions"
            value={stats.keywordExtractions}
            bgColor="bg-amber-50"
          />
        </div>

        {/* Info Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <BarChart3 size={24} className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">About These Stats</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Data is stored only in your browser (localStorage)</li>
                <li>• No data is sent to any server</li>
                <li>• Stats are anonymous and aggregate only</li>
                <li>• Clearing browser data will reset these stats</li>
                <li>• For full analytics, check Google Analytics dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* GA Setup Info */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-2">Google Analytics Setup</h3>
          <p className="text-sm text-amber-800 mb-3">
            To enable full analytics tracking, you need to:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
            <li>Create a GA4 property at analytics.google.com</li>
            <li>Get your Measurement ID (G-XXXXXXXXXX)</li>
            <li>Replace the placeholder in index.html</li>
            <li>Verify in Google Search Console</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-4`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
  </div>
);

export default AnalyticsView;
