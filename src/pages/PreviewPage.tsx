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
import { useIsMobile } from '../hooks/useIsMobile';
import { ChevronDown, ChevronUp, FileDown, ArrowLeft, Sparkles } from 'lucide-react';

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

  const isMobile = useIsMobile();
  const [mobileScale, setMobileScale] = useState(1);
  const [atsExpanded, setAtsExpanded] = useState(false);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const mobileZoomRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const pinchStartRef = useRef<{ scale: number; dist: number } | null>(null);

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

  const handleMobileDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setMobileScale(1);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, []);

  const getTouchDistance = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return 0;
    return Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
  };
  const handleMobileTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) pinchStartRef.current = { scale: mobileScale, dist: getTouchDistance(e) };
  }, [mobileScale]);
  const handleMobileTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const dist = getTouchDistance(e);
      if (pinchStartRef.current.dist > 0) {
        const ratio = dist / pinchStartRef.current.dist;
        const next = Math.min(2, Math.max(0.5, pinchStartRef.current.scale * ratio));
        setMobileScale(next);
      }
    }
  }, []);
  const handleMobileTouchEnd = useCallback(() => {
    pinchStartRef.current = null;
  }, []);

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

      {isMobile ? (
        /* Mobile: one action per screen, full-width A4, vertical scroll, pinch/double-tap zoom */
        <div className="flex-1 flex flex-col min-h-0 bg-[#0F172A]">
          {/* Top bar: Back, Download PDF */}
          <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-black/40 border-b border-white/10 safe-area-top">
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 text-white font-semibold touch-manipulation"
              aria-label="Back to editor"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
              <span className="text-[15px]">Back</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTemplateSheet(true)}
              className="min-h-[44px] px-3 flex items-center gap-1.5 text-white/90 text-[14px] font-medium touch-manipulation"
            >
              Template <ChevronDown size={18} />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || isLocked}
              className="min-h-[44px] px-4 flex items-center justify-center gap-2 rounded-xl bg-white text-black font-bold text-[14px] disabled:opacity-50 touch-manipulation"
            >
              <FileDown size={18} />
              <span>{downloading ? '…' : 'PDF'}</span>
            </button>
          </header>

          {/* Full-width A4 preview: pinch zoom, double-tap reset */}
          <main
            ref={mobileZoomRef}
            className="flex-1 min-h-0 overflow-auto flex justify-center items-start p-4 touch-pan-y"
            onTouchStart={handleMobileTouchStart}
            onTouchMove={handleMobileTouchMove}
            onTouchEnd={handleMobileTouchEnd}
            onClick={handleMobileDoubleTap}
          >
            <div
              className="relative shadow-2xl bg-white origin-top"
              style={{
                width: '210mm',
                minHeight: '297mm',
                transform: `scale(${mobileScale})`,
                transformOrigin: 'top center',
              }}
            >
              <ResumePreview data={data} templateId={selectedTemplateId} scale={1} />
              {isLocked && unlockChecked && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10" aria-live="polite">
                  <p className="text-gray-800 font-medium mb-3 text-center px-4">Unlock to download this template.</p>
                  <button
                    type="button"
                    onClick={handleUnlockClick}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[15px]"
                  >
                    Unlock stronger wording — ₹49 one-time
                  </button>
                </div>
              )}
            </div>
          </main>

          {/* Bottom sticky: ATS (tap to expand), Unlock CTA if locked */}
          <footer className="shrink-0 p-4 bg-black/50 border-t border-white/10 safe-area-bottom">
            <button
              type="button"
              onClick={() => setAtsExpanded((e) => !e)}
              className="w-full min-h-[48px] flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-[15px] font-semibold touch-manipulation"
              aria-expanded={atsExpanded}
            >
              <span>ATS Score</span>
              <span className="font-black">{atsScoreBefore != null ? `${atsScoreBefore}/100` : '—'}</span>
              {atsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {atsExpanded && atsScoreBefore != null && (
              <div className="mt-2 px-4 py-3 rounded-xl bg-white/5 text-[13px] text-slate-300">
                Add keywords from your job description to improve your score. Edit Skills and Experience in the editor.
              </div>
            )}
            {isLocked && unlockChecked && (
              <button
                type="button"
                onClick={handleUnlockClick}
                className="w-full min-h-[52px] mt-3 flex items-center justify-center gap-2 rounded-xl bg-white text-black font-black text-[15px] touch-manipulation"
              >
                <Sparkles size={20} />
                Unlock stronger wording — ₹49 one-time
              </button>
            )}
          </footer>

          {/* Template picker sheet */}
          {showTemplateSheet && (
            <div className="fixed inset-0 z-50 flex flex-col bg-[#0F172A]">
              <div className="shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Choose Template</h2>
                <button type="button" onClick={() => setShowTemplateSheet(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white" aria-label="Close">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TemplateList
                  templates={AVAILABLE_TEMPLATES}
                  selectedTemplateId={selectedTemplateId}
                  onSelect={(id) => { setSelectedTemplateId(id); setShowTemplateSheet(false); }}
                  freeTemplateId={FREE_TEMPLATE_ID}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="flex flex-1 min-h-0">
      <aside className="w-full sm:w-72 lg:w-[25%] lg:min-w-[200px] lg:max-w-[280px] bg-white border-r flex flex-col flex-shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900" aria-label="Back to editor">← Back</button>
          <button type="button" onClick={handleDownload} disabled={downloading || isLocked} className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{downloading ? 'Generating…' : 'Download PDF'}</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Choose Template</h2>
          <TemplateList templates={AVAILABLE_TEMPLATES} selectedTemplateId={selectedTemplateId} onSelect={setSelectedTemplateId} freeTemplateId={FREE_TEMPLATE_ID} />
          {isLocked && unlockChecked && (
            <div className="mt-4 lg:hidden">
              <button type="button" onClick={handleUnlockClick} className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">Unlock Advanced ATS Rewrite — ₹49</button>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 relative bg-gray-100 overflow-y-auto">
        <div className="shrink-0 flex items-center gap-2 px-6 pt-4 pb-2">
          <label className="text-xs font-medium text-gray-600">Zoom</label>
          <input type="range" min={0.7} max={1.3} step={0.05} value={previewScale} onChange={(e) => setPreviewScale(Number(e.target.value))} className="w-24" />
          <span className="text-xs text-gray-500 w-10">{Math.round(previewScale * 100)}%</span>
        </div>
        <div className="flex-1 flex justify-center pt-2 pb-8 px-6 relative min-h-0">
          <div className="shadow-lg bg-white origin-top relative" style={{ maxWidth: '210mm' }}>
            <ResumePreview data={data} templateId={selectedTemplateId} scale={previewScale} />
            {isLocked && unlockChecked && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10" aria-live="polite">
                <p className="text-gray-700 font-medium mb-2">Unlock this template to download.</p>
                <button type="button" onClick={handleUnlockClick} className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700">Unlock Advanced ATS Rewrite — ₹49</button>
              </div>
            )}
          </div>
        </div>
      </main>
      <aside className="hidden lg:flex w-[25%] min-w-[200px] max-w-[280px] bg-gray-100 border-l flex-col flex-shrink-0 p-4 overflow-y-auto">
        <OptimizationPanel atsScoreBefore={atsScoreBefore} isPaidUnlocked={unlocked && !isFreeTemplate} onUnlockClick={handleUnlockClick} />
      </aside>
      </div>
      )}

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
