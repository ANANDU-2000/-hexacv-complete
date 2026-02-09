import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResumeData } from '../core/types';
import { resumeDataToNormalized } from '../core/normalizedResume';
import { DocumentPreview } from '../ui/document';
import { printDocumentPreview } from '../core/delivery/generatePDFFromDocument';
import { TemplateList } from '../ui/templates/TemplateList';
import { OptimizationPanel } from '../ui/preview/OptimizationPanel';
import { SoftLockModal } from '../ui/preview/SoftLockModal';
import { AVAILABLE_TEMPLATES } from '../core/delivery/templates';
import { getSessionId } from '../api-service';
import { checkUnlockStatus } from '../core/payment/checkUnlock';
import { createOrderAndPay } from '../core/payment/createOrder';
import { resumeToText } from '../core/ats/resumeToText';
import { extractKeywordsFromJD } from '../core/ats/extractKeywords';
import { scoreATS } from '../core/ats/scoreATS';
import { useIsMobile } from '../hooks/useIsMobile';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileDown, ArrowLeft, Sparkles } from 'lucide-react';

const FREE_TEMPLATE_ID = AVAILABLE_TEMPLATES[0]?.id ?? 'template1free';
const A4_PX_HEIGHT = 1123;
const A4_PX_WIDTH = 794;

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
  const [previewContentHeight, setPreviewContentHeight] = useState(A4_PX_HEIGHT);
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const documentContentRef = useRef<HTMLDivElement>(null);
  const pollAttempts = useRef(0);

  const isMobile = useIsMobile();

  const fitScale = useMemo(() => {
    if (!viewportSize || previewContentHeight <= 0) return 1;
    // Fit-to-width: anchor the A4 page visually by filling most of the preview column.
    const scaleW = viewportSize.w / A4_PX_WIDTH;
    const target = Math.min(scaleW, 1.0) * 0.98;
    // Clamp into design zoom window 0.75–1.25
    return Math.max(0.75, Math.min(target, 1.25));
  }, [viewportSize, previewContentHeight]);

  const [documentPageCount, setDocumentPageCount] = useState(1);
  const totalPages = documentPageCount;

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el || isMobile) return;
    const ro = new ResizeObserver(() => {
      if (el) setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setViewportSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile && fitScale > 0 && fitScale < 2) setPreviewScale((s) => (s === 1 ? fitScale : s));
  }, [fitScale, isMobile]);

  const setFitInView = useCallback(() => {
    setPreviewScale(fitScale);
  }, [fitScale]);

  const goToPage = useCallback((page: number) => {
    const el = previewContainerRef.current;
    if (!el) return;
    const pageHeight = A4_PX_HEIGHT * previewScale;
    el.scrollTop = (page - 1) * pageHeight;
    setCurrentPage(page);
  }, [previewScale]);
  const [mobileScale, setMobileScale] = useState(1);
  const [atsExpanded, setAtsExpanded] = useState(false);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  // Desktop side panels: start hidden so preview feels calm by default.
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showAtsPanel, setShowAtsPanel] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(false);
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
      const el = documentContentRef.current;
      if (el) {
        printDocumentPreview(el);
      } else {
        alert('Preview not ready. Wait a moment and try again.');
      }
    } catch (e) {
      console.error('Download failed', e);
      alert('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  }, [isLocked]);

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
        49,
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
                transform: `scale(${mobileScale})`,
                transformOrigin: 'top center',
              }}
            >
              <DocumentPreview
                resume={resumeDataToNormalized(data)}
                options={{ tier: isLocked ? 'free' : unlocked ? 'paid' : 'free' }}
                scale={1}
                contentRef={documentContentRef}
                onPagesRendered={setDocumentPageCount}
              />
              {isLocked && unlockChecked && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10" aria-live="polite">
                  <p className="text-gray-800 font-medium mb-3 text-center px-4">
                    Free template and PDF stay unlocked forever. Upgrade wording for this role with an ATS-optimized version.
                  </p>
                  <button
                    type="button"
                    onClick={handleUnlockClick}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-[15px]"
                  >
                    ATS Optimized Version — ₹49 (one-time)
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
                ATS Optimized Version — ₹49 (one-time)
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
      {showTemplatePanel && (
      <aside className="w-full sm:w-72 lg:w-[25%] lg:min-w-[200px] lg:max-w-[280px] bg-white border-r flex flex-col flex-shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900" aria-label="Back to editor">← Back</button>
          <button type="button" onClick={handleDownload} disabled={downloading || isLocked} className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{downloading ? 'Generating…' : 'Download PDF'}</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Choose Template</h2>
          <p className="text-xs text-gray-600 mb-3">Free: ATS-friendly layout and clean PDF. Paid: ATS-optimized wording tailored to your job description.</p>
          <TemplateList templates={AVAILABLE_TEMPLATES} selectedTemplateId={selectedTemplateId} onSelect={setSelectedTemplateId} freeTemplateId={FREE_TEMPLATE_ID} />
          <p className="text-xs text-gray-500 mt-3">One-time fee for wording optimization; free template and PDF stay free for life.</p>
          {isLocked && unlockChecked && (
            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={handleUnlockClick}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700"
              >
                ATS Optimized Version — ₹49 (one-time)
              </button>
            </div>
          )}
        </div>
      </aside>
      )}
      <main className="flex-1 flex flex-col min-w-0 relative bg-gray-100 min-h-0">
        <div className="shrink-0 flex flex-wrap items-center gap-3 px-6 pt-4 pb-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Preview</span>
            <span className="text-xs text-gray-500">
              This format is safe for ATS systems used by most companies.
            </span>
          </div>
          {showZoomControls && (
            <>
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.max(0.75, s - 0.1))}
                className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 border border-gray-300"
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.min(1.25, s + 0.1))}
                className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 border border-gray-300"
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                onClick={setFitInView}
                className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200"
              >
                Fit to width
              </button>
            </>
          )}
          {!showZoomControls && (
            <button
              type="button"
              onClick={() => setShowZoomControls(true)}
              className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Zoom
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowTemplatePanel((v) => !v)}
            className="ml-auto px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            {showTemplatePanel ? 'Hide templates' : 'Change template'}
          </button>
          <button
            type="button"
            onClick={() => setShowAtsPanel((v) => !v)}
            className="px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            {showAtsPanel ? 'Hide ATS tips' : 'Improve ATS'}
          </button>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Page</span>
              <button type="button" onClick={() => goToPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="p-1.5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Previous page"><ChevronLeft size={18} /></button>
              <span className="text-xs font-medium text-gray-700 min-w-[4rem] text-center">{currentPage} / {totalPages}</span>
              <button type="button" onClick={() => goToPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="p-1.5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next page"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
        <div
          ref={previewContainerRef}
          className="flex-1 min-h-0 px-6 pb-8 preview-scroll"
          style={{ maxHeight: '100%' }}
          onScroll={() => {
            const el = previewContainerRef.current;
            if (!el || totalPages <= 1) return;
            const pageHeight = A4_PX_HEIGHT * previewScale;
            const page = Math.min(totalPages, Math.floor(el.scrollTop / pageHeight) + 1);
            setCurrentPage(page);
          }}
          >
          <div
            style={{ minHeight: `${A4_PX_HEIGHT * previewScale}px` }}
            className="flex items-start justify-center w-full"
          >
            <div
              className="relative page-stack"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
              }}
            >
              <DocumentPreview
                resume={resumeDataToNormalized(data)}
                options={{ tier: isLocked ? 'free' : unlocked ? 'paid' : 'free' }}
                scale={1}
                contentRef={documentContentRef}
                onPagesRendered={(n) => {
                  setDocumentPageCount(n);
                  setPreviewContentHeight(n * A4_PX_HEIGHT);
                }}
              />
              {isLocked && unlockChecked && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10" aria-live="polite">
                  <p className="text-gray-700 font-medium mb-2 text-center px-4">
                    Free template is fully usable. Unlock an ATS-optimized version of your wording for a one-time ₹49.
                  </p>
                  <button
                    type="button"
                    onClick={handleUnlockClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700"
                  >
                    ATS Optimized Version — ₹49 (one-time)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {showAtsPanel && (
      <aside className="hidden lg:flex w-[25%] min-w-[200px] max-w-[280px] bg-gray-100 border-l flex-col flex-shrink-0 p-4 overflow-y-auto">
        <OptimizationPanel atsScoreBefore={atsScoreBefore} isPaidUnlocked={unlocked && !isFreeTemplate} onUnlockClick={handleUnlockClick} />
      </aside>
      )}
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
