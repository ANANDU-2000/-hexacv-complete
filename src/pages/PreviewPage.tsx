import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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

type PaymentBanner = 'verifying' | 'verified' | 'delayed' | 'failed' | null;

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

export const PreviewPage: React.FC<PreviewPageProps> = ({ data, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(FREE_TEMPLATE_ID);
  const [downloading, setDownloading] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [softLockOpen, setSoftLockOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentBanner, setPaymentBanner] = useState<PaymentBanner>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const pollAttempts = useRef(0);

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

  // Unlock status (single source of truth from backend)
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

  // Payment return: read ?payment=success|failure and show banner + poll unlock
  const paymentParamHandled = useRef(false);
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (!payment || paymentParamHandled.current) return;
    paymentParamHandled.current = true;

    const clearParam = () => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('payment');
        return next;
      }, { replace: true });
    };

    if (payment === 'failure') {
      setPaymentBanner('failed');
      clearParam();
      return;
    }

    if (payment === 'success') {
      setPaymentBanner('verifying');
      clearParam();
      pollAttempts.current = 0;

      const poll = () => {
        pollAttempts.current += 1;
        checkUnlockStatus(sessionId, selectedTemplateId, { cache: false })
          .then((ok) => {
            if (ok) {
              setUnlocked(true);
              setUnlockChecked(true);
              setPaymentBanner('verified');
            } else if (pollAttempts.current < POLL_MAX_ATTEMPTS) {
              setTimeout(poll, POLL_INTERVAL_MS);
            } else {
              setPaymentBanner('delayed');
            }
          })
          .catch(() => {
            if (pollAttempts.current < POLL_MAX_ATTEMPTS) {
              setTimeout(poll, POLL_INTERVAL_MS);
            } else {
              setPaymentBanner('delayed');
            }
          });
      };
      poll();
    }
  }, [searchParams, setSearchParams, sessionId, selectedTemplateId]);

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
    setPaymentError(null);
    const email = data.basics?.email?.trim() || '';
    const phone = data.basics?.phone?.trim() || '';
    if (!email) {
      setPaymentError('Please add your email in the editor so we can send your receipt.');
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
        setPaymentError(result.message || 'Payment not available. Check your connection or try again.');
      }
      // On success, createOrderAndPay redirects to PayU so modal will unmount
    } finally {
      setPayLoading(false);
    }
  }, [sessionId, selectedTemplateId, data.basics?.email, data.basics?.phone]);

  const dismissPaymentBanner = useCallback(() => setPaymentBanner(null), []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans flex-col">
      {/* Payment return banner: who paid must see verified; who failed must see message */}
      {paymentBanner && (
        <div
          role="alert"
          className={`shrink-0 px-4 py-2 text-sm flex items-center justify-between ${
            paymentBanner === 'verified'
              ? 'bg-green-100 text-green-800'
              : paymentBanner === 'failed'
                ? 'bg-amber-100 text-amber-800'
                : paymentBanner === 'delayed'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-blue-50 text-blue-800'
          }`}
        >
          <span>
            {paymentBanner === 'verifying' && 'Payment received. Verifying…'}
            {paymentBanner === 'verified' && 'Payment verified. You can download now.'}
            {paymentBanner === 'delayed' && 'Payment confirmed but delivery delayed. Please wait a moment and refresh.'}
            {paymentBanner === 'failed' && 'Payment was not completed. You can try again or use the free template.'}
          </span>
          <button
            type="button"
            onClick={dismissPaymentBanner}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
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
      </div>

      <SoftLockModal
        open={softLockOpen}
        onClose={() => { setSoftLockOpen(false); setPaymentError(null); }}
        onContinue={handleSoftLockContinue}
        loading={payLoading}
        error={paymentError}
      />
    </div>
  );
};
