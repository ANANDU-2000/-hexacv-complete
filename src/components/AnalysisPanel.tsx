/**
 * AnalysisPanel — shows resume analysis alerts (red/yellow/green).
 * Used in desktop editor sidebar and can feed mobile wizard.
 */
import React from 'react';
import type { ResumeAlert, AnalysisResult } from '../core/resumeIntelligence';
import { AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  onAction: (alertId: string, actionId: string, payload?: Record<string, unknown>) => void;
  loading?: boolean;
}

const severityConfig = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Must fix',
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Review',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Good',
  },
};

function AlertCard({
  alert,
  onAction,
}: {
  alert: ResumeAlert;
  onAction: (alertId: string, actionId: string, payload?: Record<string, unknown>) => void;
}) {
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 mb-2`}>
      <div className="flex items-start gap-2">
        <Icon size={18} className={`${cfg.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-semibold text-gray-900">{alert.title}</span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
          </div>
          <p className="text-[12px] text-gray-700 leading-relaxed">{alert.message}</p>
          {alert.originalText && (
            <p className="text-[11px] text-gray-500 mt-1 italic truncate">"{alert.originalText}"</p>
          )}
          {alert.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {alert.actions.map((action) => (
                <button
                  key={action.actionId}
                  type="button"
                  onClick={() => onAction(alert.id, action.actionId, action.payload)}
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.97] transition-all min-h-[32px]"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AnalysisPanel({ analysis, onAction, loading = false }: AnalysisPanelProps) {
  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-700">Analyzing your resume…</p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Set your target role first</p>
            <p className="text-xs text-gray-600">Choose a target role, experience level, and market to analyze how well your resume matches.</p>
          </div>
        </div>
      </div>
    );
  }

  const { alerts, stats, atsMatch } = analysis;
  const hasRedAlerts = stats.redAlerts > 0;

  return (
    <div className="p-4 overflow-y-auto">
      {/* Summary strip */}
      <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-bold text-gray-900">Resume Analysis</span>
          {atsMatch.score > 0 && (
            <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${
              atsMatch.score >= 70 ? 'bg-emerald-100 text-emerald-700' :
              atsMatch.score >= 40 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              ATS: {atsMatch.score}%
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[16px] font-bold text-emerald-600">{stats.verifiedSkills}</p>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Verified</p>
          </div>
          <div>
            <p className="text-[16px] font-bold text-amber-600">{stats.partialSkills}</p>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Partial</p>
          </div>
          <div>
            <p className="text-[16px] font-bold text-red-600">{stats.unverifiedSkills}</p>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Unverified</p>
          </div>
          <div>
            <p className="text-[16px] font-bold text-blue-600">{stats.missingForJd}</p>
            <p className="text-[9px] text-gray-500 uppercase font-semibold">Missing</p>
          </div>
        </div>
      </div>

      {/* Blocking banner */}
      {hasRedAlerts && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <XCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-[12px] font-semibold text-red-800">
            {stats.redAlerts} issue{stats.redAlerts > 1 ? 's' : ''} must be resolved before generating your optimized resume.
          </p>
        </div>
      )}

      {/* Alerts */}
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">All clear. Your resume looks good.</p>
        </div>
      ) : (
        <div>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onAction={onAction} />
          ))}
        </div>
      )}

      {/* Missing JD keywords */}
      {atsMatch.missingKeywords.length > 0 && (
        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
          <p className="text-[12px] font-bold text-gray-900 mb-2">Missing JD keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {atsMatch.missingKeywords.slice(0, 15).map((kw, i) => (
              <span key={i} className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md border border-gray-200">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MOBILE ALERT WIZARD (one alert per screen) =====

interface MobileAlertWizardProps {
  alerts: ResumeAlert[];
  currentIndex: number;
  onAction: (alertId: string, actionId: string, payload?: Record<string, unknown>) => void;
  onNext: () => void;
  onDone: () => void;
}

export function MobileAlertWizard({
  alerts,
  currentIndex,
  onAction,
  onNext,
  onDone,
}: MobileAlertWizardProps) {
  const redYellow = alerts.filter((a) => a.severity !== 'green');
  if (redYellow.length === 0 || currentIndex >= redYellow.length) {
    return (
      <div className="mobile-app flex-1 flex flex-col items-center justify-center p-6 bg-white">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <p className="text-lg font-bold text-gray-900 mb-2">All clear</p>
        <p className="text-sm text-gray-600 text-center mb-6">Your resume analysis is complete. No blocking issues.</p>
        <button
          type="button"
          onClick={onDone}
          className="mobile-app-cta w-full max-w-xs min-h-[52px] rounded-[14px] bg-blue-600 text-white font-bold text-[16px]"
        >
          Continue to editor
        </button>
      </div>
    );
  }

  const alert = redYellow[currentIndex];
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;
  const progress = ((currentIndex + 1) / redYellow.length) * 100;

  return (
    <div className="mobile-app flex-1 flex flex-col bg-white">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {/* Counter */}
        <p className="text-[12px] text-gray-500 font-medium mb-6">
          {currentIndex + 1} of {redYellow.length}
        </p>

        {/* Alert content */}
        <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-5 mb-6`}>
          <div className="flex items-start gap-3 mb-3">
            <Icon size={24} className={cfg.iconColor} />
            <div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
              <h2 className="text-[17px] font-bold text-gray-900 mt-2">{alert.title}</h2>
            </div>
          </div>
          <p className="text-[14px] text-gray-700 leading-relaxed">{alert.message}</p>
          {alert.originalText && (
            <p className="text-[13px] text-gray-500 mt-3 italic border-l-2 border-gray-300 pl-3">"{alert.originalText}"</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {alert.actions.map((action) => (
            <button
              key={action.actionId}
              type="button"
              onClick={() => {
                onAction(alert.id, action.actionId, action.payload);
                onNext();
              }}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-[15px] flex items-center justify-between active:scale-[0.98] transition-all"
            >
              {action.label}
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
