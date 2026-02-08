import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ResumeData } from '../core/types';
import { ResumePreview } from '../ui/preview/ResumePreview';
import { TemplateList } from '../ui/templates/TemplateList';
import { OptimizationPanel } from '../ui/preview/OptimizationPanel';
import { SoftLockModal } from '../ui/preview/SoftLockModal';
import { AVAILABLE_TEMPLATES } from '../core/delivery/templates';
import { generatePDF } from '../core/delivery/generatePDF';
import { getSessionId } from '../api-service';
import { checkUnlockStatus } from '../core/payment/checkUnlock';
import { createOrderAndPay } from '../core/payment/createOrder';
import { resumeToText } from '../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS } from '../core/ats/scoreATS';

const FREE_TEMPLATE_ID = AVAILABLE_TEMPLATES[0]?.id ?? 'template1free';

interface PreviewPageProps {
  data: ResumeData;
  onBack: () => void;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({ data, onBack }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(FREE_TEMPLATE_ID);
  const [downloading, setDownloading] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [softLockOpen, setSoftLockOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const isFreeTemplate = selectedTemplateId === FREE_TEMPLATE_ID;
  const isLocked = !isFreeTemplate && !unlocked;

  const sessionId = getSessionId();

  const atsScoreBefore = useMemo(() => {
    const text = resumeToText(data);
    const jd = data.jobDescription?.trim();
    if (!jd) return null;
    const keywords = extractKeywordsFromJD(jd);
    const result = scoreATS(text, keywords);
    return result.score;
  }, [data]);

  useEffect(() => {
    if (isFreeTemplate) {
      setUnlocked(true);
      setUnlockChecked(true);
      return;
    }
    let cancelled = false;
    setUnlockChecked(false);
    checkUnlockStatus(sessionId, selectedTemplateId)
      .then((ok) => {
        if (!cancelled) {
          setUnlocked(ok);
          setUnlockChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUnlocked(false);
          setUnlockChecked(true);
        }
      });
    return () => { cancelled = true; };
  }, [sessionId, selectedTemplateId, isFreeTemplate]);

  const handleDownload = useCallback(async () => {
    if (isLocked) return;
    setDownloading(true);
    try {
      await generatePDF(selectedTemplateId, data);
    } catch (e) {
      console.error('Download failed', e);
      alert('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  }, [selectedTemplateId, data, isLocked]);

  const handleUnlockClick = useCallback(() => {
    setSoftLockOpen(true);
  }, []);

  const handleSoftLockContinue = useCallback(async () => {
    const email = data.basics?.email?.trim() || '';
    const phone = data.basics?.phone?.trim() || '';
    if (!email) {
      alert('Please add your email in the editor so we can send your receipt.');
      return;
    }
    setPayLoading(true);
    try {
      const result = await createOrderAndPay(
        sessionId,
        selectedTemplateId,
        4900,
        email,
        phone
      );
      if (!result.success) {
        alert(result.message || 'Payment not available.');
      }
    } finally {
      setPayLoading(false);
      setSoftLockOpen(false);
    }
  }, [sessionId, selectedTemplateId, data.basics?.email, data.basics?.phone]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left: template list (+ mobile CTA when paid locked) */}
      <aside className="w-full sm:w-72 lg:w-[25%] lg:min-w-[200px] lg:max-w-[280px] bg-white border-r flex flex-col flex-shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
            aria-label="Back to editor"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading || isLocked}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Choose Template</h2>
          <TemplateList
            templates={AVAILABLE_TEMPLATES}
            selectedTemplateId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
            freeTemplateId={FREE_TEMPLATE_ID}
          />
          {/* Mobile: show unlock CTA when paid template selected and locked */}
          {isLocked && unlockChecked && (
            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={handleUnlockClick}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
              >
                Unlock Advanced ATS Rewrite — ₹49
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Center: preview (with soft-lock overlay when paid and not unlocked) */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-gray-100 overflow-y-auto">
        <div className="shrink-0 flex items-center gap-2 px-6 pt-4 pb-2">
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
        <div className="flex-1 flex justify-center pt-2 pb-8 px-6 relative min-h-0">
          <div className="shadow-lg bg-white origin-top relative" style={{ maxWidth: '210mm' }}>
            <ResumePreview data={data} templateId={selectedTemplateId} scale={previewScale} />
            {isLocked && unlockChecked && (
              <div
                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10"
                aria-live="polite"
              >
                <p className="text-gray-700 font-medium mb-2">Unlock this template to download.</p>
                <button
                  type="button"
                  onClick={handleUnlockClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700"
                >
                  Unlock Advanced ATS Rewrite — ₹49
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Right: optimization panel (hidden on small screens) */}
      <aside className="hidden lg:flex w-[25%] min-w-[200px] max-w-[280px] bg-gray-100 border-l flex-col flex-shrink-0 p-4 overflow-y-auto">
        <OptimizationPanel
          atsScoreBefore={atsScoreBefore}
          isPaidUnlocked={unlocked && !isFreeTemplate}
          onUnlockClick={handleUnlockClick}
        />
      </aside>

      <SoftLockModal
        open={softLockOpen}
        onClose={() => setSoftLockOpen(false)}
        onContinue={handleSoftLockContinue}
        loading={payLoading}
      />
    </div>
  );
};
