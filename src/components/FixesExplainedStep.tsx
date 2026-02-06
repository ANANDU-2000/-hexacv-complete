// FixesExplainedStep Component
// Step 4: Shows specific fixes with before/after examples and explanations

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wand2
} from 'lucide-react';
import { RealityAnalysis, Fix } from '../reality-matching-types';
import { UserProfile } from '../agents/shared/types';

interface FixesExplainedStepProps {
  realityAnalysis: RealityAnalysis;
  userProfile: UserProfile | null;
  onContinue: () => void;
  onBack: () => void;
  onEditManually: () => void;
}

// Generate fixes from reality analysis
function generateFixes(analysis: RealityAnalysis, userProfile: UserProfile | null): Fix[] {
  const fixes: Fix[] = [];
  const { panels, overallAssessment } = analysis;

  // Generate fixes from warnings and blockers in each panel
  Object.values(panels).forEach(panel => {
    panel.items.forEach(item => {
      if ((item.status === 'warning' || item.status === 'blocker') && item.fixSuggestion) {
        fixes.push({
          id: `fix-${fixes.length}`,
          category: getCategoryFromPanel(panel.panelId),
          priority: item.status === 'blocker' ? 'high' : 'medium',
          before: getBeforeExample(item.label, panel.panelId),
          after: getAfterExample(item.label, panel.panelId, userProfile),
          reasoning: item.explanation,
          impact: item.status === 'blocker'
            ? 'Fixing this removes a major blocker'
            : 'Improves shortlist probability by ~15%'
        });
      }
    });
  });

  // Sort by priority
  return fixes.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 5); // Show top 5 fixes
}

function getCategoryFromPanel(panelId: string): Fix['category'] {
  switch (panelId) {
    case 'skillCoverage': return 'keywords';
    case 'contextQuality': return 'metrics';
    case 'structureReadability': return 'structure';
    case 'roleAlignment': return 'keywords';
    default: return 'brevity';
  }
}

function getBeforeExample(label: string, panelId: string): string {
  // Generic examples based on issue type
  if (label.includes('Metric') || label.includes('metric')) {
    return 'Worked on improving system performance and user experience';
  }
  if (label.includes('Keyword') || label.includes('Missing')) {
    return 'Built features using JavaScript and worked with databases';
  }
  if (label.includes('Generic') || label.includes('Buzzword')) {
    return 'Responsible for leveraging cutting-edge technologies to drive innovation';
  }
  if (label.includes('Action') || label.includes('verb')) {
    return 'Was involved in the development of payment processing system';
  }
  return 'Handled various tasks related to software development projects';
}

function getAfterExample(label: string, panelId: string, userProfile: UserProfile | null): string {
  // Generate improved examples
  if (label.includes('Metric') || label.includes('metric')) {
    return 'Optimized database queries, reducing API response time by ~40% and supporting 10K+ daily active users';
  }
  if (label.includes('Keyword') || label.includes('Missing')) {
    return 'Built checkout features using React and Node.js, integrating PostgreSQL for order management';
  }
  if (label.includes('Generic') || label.includes('Buzzword')) {
    return 'Developed real-time notification system using WebSockets, improving user engagement by 25%';
  }
  if (label.includes('Action') || label.includes('verb')) {
    return 'Architected payment processing system handling ~₹50L monthly transactions with 99.9% uptime';
  }
  return 'Led development of 3 microservices using Python and Docker, serving 5K+ requests/day';
}

export function FixesExplainedStep({
  realityAnalysis,
  userProfile,
  onContinue,
  onBack,
  onEditManually
}: FixesExplainedStepProps) {
  const [expandedFix, setExpandedFix] = useState<string | null>(null);

  const fixes = useMemo(
    () => generateFixes(realityAnalysis, userProfile),
    [realityAnalysis, userProfile]
  );

  const highPriorityCount = fixes.filter(f => f.priority === 'high').length;
  const mediumPriorityCount = fixes.filter(f => f.priority === 'medium').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fixes Explained</h1>
            <p className="text-gray-600">Understand why each change matters</p>
          </div>
        </div>

        {/* Summary banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">
                {fixes.length} Improvements Identified
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                {highPriorityCount > 0 && `${highPriorityCount} critical fix${highPriorityCount > 1 ? 'es' : ''}`}
                {highPriorityCount > 0 && mediumPriorityCount > 0 && ', '}
                {mediumPriorityCount > 0 && `${mediumPriorityCount} improvement${mediumPriorityCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Fixes list */}
        <div className="space-y-4 mb-8">
          {fixes.map((fix, idx) => (
            <FixCard
              key={fix.id}
              fix={fix}
              index={idx + 1}
              expanded={expandedFix === fix.id}
              onToggle={() => setExpandedFix(expandedFix === fix.id ? null : fix.id)}
            />
          ))}
        </div>

        {/* No fixes state */}
        {fixes.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Looking Good!</h3>
            <p className="text-emerald-700">
              No major fixes needed. Your resume is well-optimized.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            onClick={onEditManually}
            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Edit Manually
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Continue to Rewrite Options
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface FixCardProps {
  fix: Fix;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function FixCard({ fix, index, expanded, onToggle }: FixCardProps) {
  const priorityConfig = {
    high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' }
  };

  const config = priorityConfig[fix.priority];
  const categoryLabels: Record<string, string> = {
    keywords: 'Add Keywords',
    metrics: 'Add Metrics',
    structure: 'Fix Structure',
    brevity: 'Improve Clarity',
    section_order: 'Reorder Sections'
  };

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl overflow-hidden`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center gap-3 hover:bg-white/30 transition-colors"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-700">
          {index}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {categoryLabels[fix.category] || fix.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
              {fix.priority === 'high' ? 'Critical' : fix.priority === 'medium' ? 'Recommended' : 'Optional'}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Before/After comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="bg-red-100/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                <AlertTriangle className="w-4 h-4" />
                Before
              </div>
              <p className="text-gray-700 text-sm">{fix.before}</p>
            </div>

            {/* After */}
            <div className="bg-emerald-100/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                After
              </div>
              <p className="text-gray-700 text-sm">{fix.after}</p>
            </div>
          </div>

          {/* Why this matters */}
          <div className="bg-white/60 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Why This Matters
            </h4>
            <p className="text-sm text-gray-600">{fix.reasoning}</p>
            <p className="text-sm text-emerald-600 font-medium mt-2">{fix.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FixesExplainedStep;
