import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeEditor } from '../ui/editor/ResumeEditor';
import { ResumePreview } from '../ui/preview/ResumePreview';
import { StepIndicator } from '../ui/editor/StepIndicator';
import { ATSScoreCard } from '../ui/editor/ATSScoreCard';
import { ResumeData } from '../core/types';
import { AVAILABLE_TEMPLATES } from '../core/delivery/templates';
import { resumeToText } from '../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS } from '../core/ats/scoreATS';
import { checkResumeStructure } from '../core/ats/scoreATS';

const DEFAULT_PREVIEW_TEMPLATE = AVAILABLE_TEMPLATES[0]?.id ?? 'basic';
const ATS_DEBOUNCE_MS = 500;

type StepId = 'content' | 'ats' | 'template' | 'download';
type StepItem = { id: StepId; label: string; done: boolean };

const EDITOR_STEPS: StepItem[] = [
  { id: 'content', label: 'Content', done: true },
  { id: 'ats', label: 'ATS optimization', done: false },
  { id: 'template', label: 'Template', done: false },
  { id: 'download', label: 'Download', done: false },
];

interface EditorPageProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ data, onChange, onNext, onBack }) => {
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [structureScore, setStructureScore] = useState(0);
  const [structureOk, setStructureOk] = useState(false);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [sectionWarnings, setSectionWarnings] = useState<{ section: string; present: boolean; warning?: string }[]>([]);
  const [atsLoading, setAtsLoading] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [atsPanelExpanded, setAtsPanelExpanded] = useState(false); // collapsed by default per UX spec

  const resumeText = useMemo(() => resumeToText(data), [data]);
  const jdText = data.jobDescription?.trim() ?? '';

  const computeATS = useCallback(() => {
    setAtsLoading(true);
    const structure = checkResumeStructure(resumeText);
    setStructureScore(structure.score);
    setStructureOk(structure.score >= 50);
    setSectionWarnings(structure.sections || []);

    if (jdText) {
      const keywords = extractKeywordsFromJD(jdText);
      const result = scoreATS(resumeText, keywords);
      setAtsScore(result.score);
      setMissingKeywords(result.missing.map((m) => m.keyword));
    } else {
      setAtsScore(null);
      setMissingKeywords([]);
    }
    setAtsLoading(false);
  }, [resumeText, jdText]);

  useEffect(() => {
    const t = setTimeout(computeATS, ATS_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [computeATS]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
          aria-label="Go back"
        >
          Back
        </button>
        <span className="font-bold text-gray-800">Resume Editor</span>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Review format
        </button>
      </header>
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left column ~60%: Step indicator + Section switcher + Editor */}
        <aside className="w-full lg:w-[60%] lg:max-w-[60%] flex flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="shrink-0 px-6 pt-4 pb-2 border-b border-gray-100">
            <StepIndicator steps={EDITOR_STEPS} currentStep="ats" />
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <ResumeEditor data={data} onChange={onChange} />
          </div>
        </aside>
        {/* Right column ~40%: ATS card (collapsed by default) + Live preview */}
        <main className="hidden lg:flex flex-1 flex-col overflow-hidden bg-gray-100 min-w-0">
          <div className="shrink-0 p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-0 z-10 overflow-hidden">
              <button
                type="button"
                onClick={() => setAtsPanelExpanded((e) => !e)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={atsPanelExpanded}
                aria-label={atsPanelExpanded ? 'Collapse ATS feedback' : 'Expand ATS feedback'}
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS feedback</span>
                <span className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">ATS SCORE: {atsScore ?? 0}/100</span>
                  {atsPanelExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </span>
              </button>
              {atsPanelExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                  <ATSScoreCard
                    score={atsScore}
                    structureOk={structureOk}
                    structureScore={structureScore}
                    missingKeywords={missingKeywords}
                    sectionWarnings={sectionWarnings}
                    loading={atsLoading}
                    showHeader={false}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
            <div className="shrink-0 flex items-center gap-2 mb-2">
              <label className="text-xs font-medium text-gray-600">Zoom</label>
              <input
                type="range"
                min={0.7}
                max={1.3}
                step={0.05}
                value={previewScale}
                onChange={(e) => setPreviewScale(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-xs text-gray-500 w-10">{Math.round(previewScale * 100)}%</span>
            </div>
            <div className="flex-1 flex justify-center min-h-0 overflow-auto">
              <div className="shadow-lg bg-white" style={{ maxWidth: '210mm' }}>
                <ResumePreview data={data} templateId={DEFAULT_PREVIEW_TEMPLATE} scale={previewScale} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
