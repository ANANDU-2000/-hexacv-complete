// Reality Panel Component
// Individual panel showing one aspect of reality check (no fake scores)

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Info,
  Lightbulb
} from 'lucide-react';
import { RealityPanel as RealityPanelType, RealityItem, PanelStatus } from '../reality-matching-types';

interface RealityPanelProps {
  panel: RealityPanelType;
  expanded?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}

const STATUS_CONFIG: Record<PanelStatus, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  strong: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    label: 'Strong'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    label: 'Needs Work'
  },
  blocker: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    label: 'Critical'
  }
};

const ITEM_STATUS_ICON = {
  ok: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
  blocker: <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
};

export function RealityPanel({ panel, expanded = false, onToggle, compact = false }: RealityPanelProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const config = STATUS_CONFIG[panel.status];

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const currentExpanded = onToggle ? expanded : isExpanded;

  if (compact) {
    return (
      <div className={`${config.bg} ${config.border} border rounded-lg p-3`}>
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="font-medium text-gray-900 text-sm">{panel.title}</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            panel.status === 'strong' ? 'bg-emerald-100 text-emerald-700' :
            panel.status === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {config.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl overflow-hidden transition-all duration-200`}>
      {/* Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/50 transition-colors"
      >
        {config.icon}
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900">{panel.title}</h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          panel.status === 'strong' ? 'bg-emerald-100 text-emerald-700' :
          panel.status === 'warning' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {config.label}
        </span>
        {currentExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {currentExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Items list */}
          <div className="space-y-2">
            {panel.items.map((item, idx) => (
              <RealityItemRow key={idx} item={item} />
            ))}
          </div>

          {/* Education note */}
          <div className="bg-white/70 rounded-lg p-3 flex gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">{panel.educationNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RealityItemRow({ item }: { item: RealityItem }) {
  const [showFix, setShowFix] = useState(false);

  return (
    <div className="bg-white/60 rounded-lg p-3">
      <div className="flex items-start gap-2">
        {ITEM_STATUS_ICON[item.status]}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{item.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              item.impact === 'pass_filter' ? 'bg-emerald-100 text-emerald-700' :
              item.impact === 'hurts_shortlist' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {item.impact === 'pass_filter' ? 'Helps' :
               item.impact === 'hurts_shortlist' ? 'Hurts' : 'Blocks'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">{item.explanation}</p>
          
          {/* Fix suggestion */}
          {item.fixSuggestion && (
            <div className="mt-2">
              {!showFix ? (
                <button
                  onClick={() => setShowFix(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" />
                  Show fix suggestion
                </button>
              ) : (
                <div className="bg-blue-50 rounded-md p-2 text-sm text-blue-800">
                  <span className="font-medium">Fix: </span>
                  {item.fixSuggestion}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RealityPanel;
