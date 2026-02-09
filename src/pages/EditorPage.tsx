import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const A4_PX_WIDTH = 794;
const A4_PX_HEIGHT = 1123;
import { ResumeEditor } from '../ui/editor/ResumeEditor';
import { DocumentPreview } from '../ui/document';
import { resumeDataToNormalized } from '../core/normalizedResume';
import { StepIndicator } from '../ui/editor/StepIndicator';
import { ATSScoreCard } from '../ui/editor/ATSScoreCard';
import { ResumeData } from '../core/types';
import { resumeToText } from '../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS } from '../core/ats/scoreATS';
import { checkResumeStructure } from '../core/ats/scoreATS';

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
  const [atsPanelExpanded, setAtsPanelExpanded] = useState(false);
  const [zoomMode, setZoomMode] = useState<'slider' | 'fit-width' | 'fit-height'>('slider');
  const [previewContentHeight, setPreviewContentHeight] = useState(A4_PX_HEIGHT);
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const fitScale = useMemo(() => {
    if (!viewportSize || previewContentHeight <= 0) return 1;
    const scaleW = viewportSize.w / A4_PX_WIDTH;
    const scaleH = viewportSize.h / previewContentHeight;
    return Math.max(0.35, Math.min(scaleW, scaleH, 1.2) * 0.98);
  }, [viewportSize, previewContentHeight]);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el) setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (fitScale > 0 && fitScale < 2) setPreviewScale((s) => (s === 1 ? fitScale : s));
  }, [fitScale]);

  const handlePreviewWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setPreviewScale((s) => Math.min(1.5, Math.max(0.3, s + (e.deltaY > 0 ? -0.05 : 0.05))));
      setZoomMode('slider');
    }
  }, []);

  const setFitInView = useCallback(() => {
    setPreviewScale(fitScale);
    setZoomMode('slider');
  }, [fitScale]);

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
        {/* Left column 40%: Step indicator + horizontal section tabs + Editor */}
        <aside className="w-full lg:w-[40%] lg:max-w-[40%] flex flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="shrink-0 px-4 pt-3 pb-1 border-b border-gray-100">
            <StepIndicator steps={EDITOR_STEPS} currentStep="ats" />
          </div>
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            <ResumeEditor data={data} onChange={onChange} />
          </div>
        </aside>
        {/* Right column 60%: ATS (collapsible) + Live preview - full resume with zoom */}
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
          <div className="flex-1 flex flex-col min-h-0 p-4 overflow-hidden">
            <div className="shrink-0 flex flex-wrap items-center gap-3 mb-2">
              <label className="text-sm font-medium text-gray-600">Zoom</label>
              <button type="button" onClick={setFitInView} className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 border border-blue-200">Fit in view</button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setPreviewScale((s) => Math.max(0.3, s - 0.1)); setZoomMode('slider'); }} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700" aria-label="Zoom out">−</button>
                <button type="button" onClick={() => { setPreviewScale((s) => Math.min(1.5, s + 0.1)); setZoomMode('slider'); }} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700" aria-label="Zoom in">+</button>
              </div>
              <input type="range" min={0.3} max={1.5} step={0.05} value={previewScale} onChange={(e) => { setPreviewScale(Number(e.target.value)); setZoomMode('slider'); }} className="w-24" aria-label="Zoom level" />
              <span className="text-sm text-gray-500 w-12">{Math.round(previewScale * 100)}%</span>
              <span className="text-xs text-gray-400">Ctrl+scroll to zoom</span>
            </div>
            {/* Full resume in viewport (no scroll by default); zoom in/out with buttons or Ctrl+scroll */}
            <div
              ref={previewContainerRef}
              className="flex-1 min-h-0 overflow-auto flex justify-center items-start border border-gray-200 rounded-lg bg-gray-200/50"
              onWheel={handlePreviewWheel}
              role="region"
              aria-label="Resume preview — full resume in view; zoom with +/− or Ctrl+scroll"
            >
              <div className="flex items-start justify-center p-2" style={{ minHeight: '100%', minWidth: '100%' }}>
                <div className="shadow-lg bg-white inline-block">
                  <DocumentPreview
                    resume={resumeDataToNormalized(data)}
                    options={{ tier: 'free' }}
                    scale={previewScale}
                    onPagesRendered={(pageCount) => setPreviewContentHeight(pageCount * A4_PX_HEIGHT)}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
