import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const A4_PX_WIDTH = 794;
const A4_PX_HEIGHT = 1123;
import { ResumeEditor } from '../ui/editor/ResumeEditor';
import { DocumentPreview } from '../ui/document';
import { resumeDataToNormalized } from '../core/normalizedResume';
import { ATSScoreCard } from '../ui/editor/ATSScoreCard';
import { ResumeData } from '../core/types';
import { resumeToText } from '../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS } from '../core/ats/scoreATS';
import { checkResumeStructure } from '../core/ats/scoreATS';
import { analyzeResume } from '../core/resumeIntelligence';
import type { RoleContext, AnalysisResult } from '../core/resumeIntelligence';
import { AnalysisPanel } from '../components/AnalysisPanel';

const ATS_DEBOUNCE_MS = 500;

interface EditorPageProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onNext?: () => void;
  onBack?: () => void;
  roleContext?: RoleContext | null;
}

export const EditorPage: React.FC<EditorPageProps> = ({ data, onChange, onNext, onBack, roleContext }) => {
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

  // Resume Intelligence analysis
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (!roleContext) {
      setAnalysis(null);
      return;
    }
    setAnalysisLoading(true);
    const t = setTimeout(() => {
      const result = analyzeResume(data, roleContext, data.jobDescription);
      setAnalysis(result);
      setAnalysisLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [data, roleContext]);

  const handleAlertAction = useCallback((alertId: string, actionId: string, payload?: Record<string, unknown>) => {
    if (actionId === 'remove_skill' && payload?.skill) {
      const skillToRemove = String(payload.skill);
      onChange({
        ...data,
        skills: data.skills.filter((s) => s.toLowerCase() !== skillToRemove.toLowerCase()),
      });
    }
    // Other actions (add_proof, edit_manually, skip) — for now just dismiss
    // Later: open specific editor section or show inline edit
  }, [data, onChange]);

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
        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-900 text-sm">Build a clean, ATS-safe resume</span>
          <span className="text-xs text-gray-500">This format works with most ATS systems used by companies.</span>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Review format
        </button>
      </header>
      {/* Role context bar */}
      {roleContext && (
        <div className="shrink-0 bg-gray-900 text-white px-4 py-2 flex items-center gap-3 text-sm">
          <span className="font-semibold">{roleContext.roleTitle}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">{roleContext.experienceLevel === 'fresher' ? 'Fresher' : roleContext.experienceLevel === '8+' ? '8+ yrs' : roleContext.experienceLevel + ' yrs'}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300 capitalize">{roleContext.market}</span>
          {roleContext.jdText && <span className="text-gray-400 ml-1">• JD added</span>}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left column 40%: Editor with single-open accordion */}
        <aside className="w-full lg:w-[40%] lg:max-w-[40%] flex flex-col overflow-hidden border-r border-gray-200 bg-white">
          <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
            <ResumeEditor data={data} onChange={onChange} />
          </div>
        </aside>
        {/* Right column 60%: ATS (collapsible) + Live preview - full resume with zoom */}
        <main className="hidden lg:flex flex-1 flex-col overflow-hidden bg-gray-100 min-w-0">
          {/* Resume Intelligence Panel — replaces old ATS-only feedback */}
          <div className="shrink-0 max-h-[50%] overflow-y-auto border-b border-gray-200 bg-white">
            {roleContext ? (
              <AnalysisPanel analysis={analysis} onAction={handleAlertAction} loading={analysisLoading} />
            ) : (
              <div className="p-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAtsPanelExpanded((e) => !e)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={atsPanelExpanded}
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ATS feedback</span>
                    {atsPanelExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                  </button>
                  {atsPanelExpanded && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                      <ATSScoreCard score={atsScore} structureOk={structureOk} structureScore={structureScore} missingKeywords={missingKeywords} sectionWarnings={sectionWarnings} loading={atsLoading} showHeader={false} />
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {/* Right preview scrolls independently; page stack scales as a unit */}
            <div
              ref={previewContainerRef}
              className="flex-1 min-h-0 border border-gray-200 rounded-lg bg-gray-200/50 preview-scroll"
              onWheel={handlePreviewWheel}
              role="region"
              aria-label="Resume preview — full resume in view; zoom with +/− or Ctrl+scroll"
            >
              <div className="flex items-start justify-center p-2" style={{ minHeight: '100%', minWidth: '100%' }}>
                <div
                  className="page-stack"
                  style={{
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <DocumentPreview
                    resume={resumeDataToNormalized(data)}
                    options={{ tier: 'free' }}
                    scale={1}
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
