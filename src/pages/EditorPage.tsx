import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  const [atsLoading, setAtsLoading] = useState(false);

  const resumeText = useMemo(() => resumeToText(data), [data]);
  const jdText = data.jobDescription?.trim() ?? '';

  const computeATS = useCallback(() => {
    setAtsLoading(true);
    const structure = checkResumeStructure(resumeText);
    setStructureScore(structure.score);
    setStructureOk(structure.score >= 50);

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
        {/* Right column ~40%: ATS card + Live preview */}
        <main className="hidden lg:flex flex-1 flex-col overflow-hidden bg-gray-100 min-w-0">
          <div className="shrink-0 p-4">
            <ATSScoreCard
              score={atsScore}
              structureOk={structureOk}
              structureScore={structureScore}
              missingKeywords={missingKeywords}
              loading={atsLoading}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex justify-center min-h-0">
            <div className="shadow-lg bg-white" style={{ maxWidth: '210mm' }}>
              <ResumePreview data={data} templateId={DEFAULT_PREVIEW_TEMPLATE} scale={1} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
