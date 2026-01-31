// Reality Dashboard Component
// Main container showing all 5 reality panels (replaces fake ATS scores)

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Code2, 
  FileText, 
  Clock, 
  Layout,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { RealityPanel } from './RealityPanel';
import { 
  RealityAnalysis, 
  OverallAssessment,
  RealityPanel as RealityPanelType 
} from '../reality-matching-types';

interface RealityDashboardProps {
  analysis: RealityAnalysis;
  onContinue?: () => void;
  onEditResume?: () => void;
  compact?: boolean;
  showActions?: boolean;
}

const PANEL_ICONS: Record<string, React.ReactNode> = {
  roleAlignment: <Target className="w-5 h-5" />,
  skillCoverage: <Code2 className="w-5 h-5" />,
  contextQuality: <FileText className="w-5 h-5" />,
  experienceWeight: <Clock className="w-5 h-5" />,
  structureReadability: <Layout className="w-5 h-5" />
};

const SHORTLIST_CONFIG = {
  high: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
    label: 'High Chance',
    description: 'Your resume is well-positioned for shortlisting'
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: <Minus className="w-6 h-6 text-amber-600" />,
    label: 'Medium Chance',
    description: 'Some improvements needed to increase your chances'
  },
  low: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: <TrendingDown className="w-6 h-6 text-red-600" />,
    label: 'Low Chance',
    description: 'Critical issues need to be fixed before applying'
  }
};

export function RealityDashboard({ 
  analysis, 
  onContinue, 
  onEditResume,
  compact = false,
  showActions = true 
}: RealityDashboardProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const { panels, overallAssessment } = analysis;
  const shortlistConfig = SHORTLIST_CONFIG[overallAssessment.shortlistChance];

  // Auto-expand the worst panel
  useEffect(() => {
    const panelOrder = ['roleAlignment', 'skillCoverage', 'contextQuality', 'experienceWeight', 'structureReadability'];
    const worstPanel = panelOrder.find(p => panels[p as keyof typeof panels].status === 'blocker')
      || panelOrder.find(p => panels[p as keyof typeof panels].status === 'warning');
    if (worstPanel && !compact) {
      setExpandedPanel(worstPanel);
    }
  }, [panels, compact]);

  if (compact) {
    return <CompactDashboard analysis={analysis} />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Assessment Card */}
      <div className={`${shortlistConfig.bg} ${shortlistConfig.border} border-2 rounded-2xl p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${shortlistConfig.bg}`}>
            {shortlistConfig.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Reality Check</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${shortlistConfig.bg} ${shortlistConfig.text}`}>
                {shortlistConfig.label}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{shortlistConfig.description}</p>
            
            {/* Quick stats */}
            <div className="flex flex-wrap gap-4">
              <QuickStat 
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                label="ATS Filter"
                value={overallAssessment.likelyToPassATS ? 'Likely Pass' : 'At Risk'}
                positive={overallAssessment.likelyToPassATS}
              />
              <QuickStat 
                icon={<Target className="w-4 h-4 text-blue-600" />}
                label="Shortlist"
                value={overallAssessment.likelyToGetShortlisted ? 'Good Chance' : 'Needs Work'}
                positive={overallAssessment.likelyToGetShortlisted}
              />
              <QuickStat 
                icon={<AlertCircle className="w-4 h-4 text-red-600" />}
                label="Blockers"
                value={overallAssessment.majorBlockers.length.toString()}
                positive={overallAssessment.majorBlockers.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Honest Feedback */}
        <div className="mt-4 p-4 bg-white/60 rounded-xl">
          <p className="text-gray-700">{overallAssessment.honestFeedback}</p>
        </div>

        {/* Quick Wins */}
        {overallAssessment.quickWins.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Wins
            </h4>
            <ul className="space-y-1">
              {overallAssessment.quickWins.map((win, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  {win}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Major Blockers */}
        {overallAssessment.majorBlockers.length > 0 && (
          <div className="mt-4 p-3 bg-red-100/50 rounded-lg">
            <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Major Blockers
            </h4>
            <ul className="space-y-1">
              {overallAssessment.majorBlockers.map((blocker, idx) => (
                <li key={idx} className="text-sm text-red-600">• {blocker}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Realistic Roles */}
        {overallAssessment.realisticRoles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Realistic Roles for You</h4>
            <div className="flex flex-wrap gap-2">
              {overallAssessment.realisticRoles.map((role, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reality Panels */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
        {Object.entries(panels).map(([key, panel]) => (
          <RealityPanel
            key={key}
            panel={panel}
            expanded={expandedPanel === key}
            onToggle={() => setExpandedPanel(expandedPanel === key ? null : key)}
          />
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onEditResume && (
            <button
              onClick={onEditResume}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Edit Resume
            </button>
          )}
          {onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Continue to Fixes
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function QuickStat({ 
  icon, 
  label, 
  value, 
  positive 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  positive: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
      {icon}
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-sm font-semibold ${positive ? 'text-emerald-700' : 'text-red-700'}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function CompactDashboard({ analysis }: { analysis: RealityAnalysis }) {
  const { panels, overallAssessment } = analysis;
  const shortlistConfig = SHORTLIST_CONFIG[overallAssessment.shortlistChance];

  return (
    <div className={`${shortlistConfig.bg} ${shortlistConfig.border} border rounded-xl p-4 space-y-3`}>
      <div className="flex items-center gap-3">
        {shortlistConfig.icon}
        <div>
          <div className="font-semibold text-gray-900">{shortlistConfig.label}</div>
          <div className="text-sm text-gray-600">{shortlistConfig.description}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(panels).map(([key, panel]) => (
          <RealityPanel key={key} panel={panel} compact />
        ))}
      </div>

      {overallAssessment.majorBlockers.length > 0 && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {overallAssessment.majorBlockers.length} blocker(s) found
        </div>
      )}
    </div>
  );
}

export default RealityDashboard;
