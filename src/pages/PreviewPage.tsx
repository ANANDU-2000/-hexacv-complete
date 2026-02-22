import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResumeData } from '../core/types';
import { resumeDataToNormalized } from '../core/normalizedResume';
import { DocumentPreview } from '../ui/document';
import { printDocumentPreview } from '../core/delivery/generatePDFFromDocument';
import { TemplateList } from '../ui/templates/TemplateList';
import { SoftLockModal } from '../ui/preview/SoftLockModal';
import { DownloadFeedbackModal } from '../components/DownloadFeedbackModal';
import { AVAILABLE_TEMPLATES } from '../core/delivery/templates';
import { getSessionId } from '../api-service';
import { checkUnlockStatus } from '../core/payment/checkUnlock';
import { createOrderAndPay } from '../core/payment/createOrder';
import { useIsMobile } from '../hooks/useIsMobile';
import { trackPDFDownloaded, trackPaymentInitiated, trackPaymentCompleted, trackPaymentFailed, trackFunnelStep } from '../analytics/googleAnalytics';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FileDown, ArrowLeft, Sparkles } from 'lucide-react';

const FREE_TEMPLATE_ID = AVAILABLE_TEMPLATES[0]?.id ?? 'template1free';
const A4_PX_HEIGHT = 1123;
const A4_PX_WIDTH = 794;
const A4_PAGE_MARGIN = 24; /* .page margin-bottom */

interface PreviewPageProps {
  data: ResumeData;
  onBack: () => void;
  /** When user clicks "Done" after download feedback — go to homepage */
  onGoHome?: () => void;
}

type PaymentBanner = 'verifying' | 'verified' | 'delayed' | 'failed' | null;

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

export const PreviewPage: React.FC<PreviewPageProps> = ({ data, onBack, onGoHome }) => {
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
  const mobileViewportRef = useRef<HTMLDivElement>(null);
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const normalizedResume = useMemo(() => resumeDataToNormalized(data), [
    data.basics?.fullName,
    data.basics?.targetRole,
    data.basics?.email,
    data.basics?.phone,
    data.summary,
    JSON.stringify(data.experience ?? []),
    JSON.stringify(data.education ?? []),
    JSON.stringify(data.projects ?? []),
    JSON.stringify(data.skills ?? []),
    data.photoUrl,
  ]);

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

  // Mobile: measure viewport width for PDF-viewer scale (fit to width, no broken layout)
  useEffect(() => {
    if (!isMobile) return;
    const el = mobileViewportRef.current;
    if (!el) return;
    const update = () => setMobileViewportWidth(el.clientWidth || window.innerWidth);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile && fitScale > 0 && fitScale < 2) setPreviewScale((s) => (s === 1 ? fitScale : s));
  }, [fitScale, isMobile]);

  const setFitInView = useCallback(() => {
    setPreviewScale(fitScale);
  }, [fitScale]);

  const [mobileScale, setMobileScale] = useState(1);
  const [showTemplateSheet, setShowTemplateSheet] = useState(false);
  const [showDownloadFeedbackModal, setShowDownloadFeedbackModal] = useState(false);
  const mobileZoomRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const pinchStartRef = useRef<{ scale: number; dist: number } | null>(null);
  const [mobileViewportWidth, setMobileViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 360);

  const isFreeTemplate = selectedTemplateId === FREE_TEMPLATE_ID;
  const isLocked = !isFreeTemplate && !unlocked;

  // Conversion funnel: user reached preview (step 4)
  useEffect(() => {
    trackFunnelStep({ step: 4, step_name: 'select_template', action: 'enter' });
  }, []);

  const sessionId = getSessionId();

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
      trackPaymentFailed({ template_id: selectedTemplateId, amount: 49, currency: 'INR', error: 'user_cancelled_or_failed' });
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
              trackPaymentCompleted({ template_id: selectedTemplateId, amount: 49, currency: 'INR' });
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
        trackPDFDownloaded({
          template_id: selectedTemplateId,
          has_photo: !!(data.photoUrl ?? data.basics?.photoUrl),
          page_count: documentPageCount,
          word_count: undefined,
        });
        trackFunnelStep({ step: 5, step_name: 'download_pdf', action: 'complete' });
        setShowDownloadFeedbackModal(true);
      } else {
        setToastMessage('Preview not ready. Wait a moment and try again.');
      }
    } catch (e) {
      console.error('Download failed', e);
      setToastMessage('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  }, [isLocked, selectedTemplateId, data.photoUrl, data.basics?.photoUrl, documentPageCount]);

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
    // Save draft before redirect so Back/refresh doesn't lose resume
    try {
      localStorage.setItem(`hexacv_draft_${sessionId}`, JSON.stringify(data));
    } catch {
      // ignore quota errors
    }
    trackPaymentInitiated({ template_id: selectedTemplateId, amount: 49, currency: 'INR' });
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
        const msg = result.message || 'Payment not available. Check your connection or try again.';
        trackPaymentFailed({ template_id: selectedTemplateId, amount: 49, currency: 'INR', error: msg });
        const isUnavailable = /temporarily|unavailable|5xx|server error/i.test(msg);
        setPaymentError(isUnavailable ? 'Payment temporarily unavailable. Try again later.' : msg);
      }
      // On success, createOrderAndPay redirects to PayU so modal will unmount
    } finally {
      setPayLoading(false);
    }
  }, [sessionId, selectedTemplateId, data, data.basics?.email, data.basics?.phone]);

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
      {/* Non-blocking toast for errors */}
      {toastMessage && (
        <div
          role="alert"
          className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[300] px-4 py-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg shadow-lg flex items-center justify-between gap-3"
        >
          <span className="text-sm font-medium">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-amber-700 hover:text-amber-900 shrink-0" aria-label="Dismiss">×</button>
        </div>
      )}
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
            {paymentBanner === 'verified' && 'Unlocked. Download your PDF when ready.'}
            {paymentBanner === 'delayed' && 'Payment confirmed but delivery delayed. Please wait a moment and refresh.'}
            {paymentBanner === 'failed' && 'Payment was not completed. Try again or use the free template.'}
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
        /* Mobile: scrollable full document, fit to width, natural scroll UX */
        <div ref={mobileViewportRef} className="mobile-app flex-1 flex flex-col min-h-0 bg-gray-100 overflow-x-hidden">
          <header className="mobile-app-header shrink-0 flex items-center justify-between gap-2 px-4 min-h-[56px] safe-area-top">
            <button
              type="button"
              onClick={onBack}
              className="mobile-app-btn-secondary flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-gray-800 font-semibold"
              aria-label="Back to editor"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
              <span className="text-[15px] ml-0.5">Back</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || isLocked}
              aria-busy={downloading}
              className="mobile-app-cta min-h-[44px] px-4 flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-bold text-[14px] disabled:opacity-50"
            >
              <FileDown size={18} />
              <span>{downloading ? '…' : 'Download PDF'}</span>
            </button>
          </header>

          <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
            {/* Scrollable preview: full document, fit to width */}
            <div
              className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto px-3 sm:px-4 py-4 touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {(() => {
                const pad = 16 * 2;
                const w = Math.max(260, Math.min(mobileViewportWidth - pad, A4_PX_WIDTH));
                const scale = w / A4_PX_WIDTH;
                const totalHeight = (A4_PX_HEIGHT * totalPages + Math.max(0, totalPages - 1) * A4_PAGE_MARGIN) * scale;
                return (
                  <div
                    className="mobile-pdf-viewport w-full max-w-full mx-auto"
                    style={{
                      width: w,
                      minHeight: Math.max(400, totalHeight || 500),
                      background: '#fff',
                      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        width: A4_PX_WIDTH,
                        margin: '0 auto',
                      }}
                    >
                      <DocumentPreview
                        resume={normalizedResume}
                        options={{ tier: isLocked ? 'free' : unlocked ? 'paid' : 'free' }}
                        scale={1}
                        contentRef={documentContentRef}
                        onPagesRendered={setDocumentPageCount}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </main>

          <footer className="mobile-app-sticky shrink-0 flex items-center justify-between gap-2 py-3 px-4 safe-area-bottom border-t border-gray-200 bg-white">
            <span className="text-sm text-gray-600">
              {totalPages > 0 ? `${totalPages} page${totalPages !== 1 ? 's' : ''}` : 'Preview'}
            </span>
            {isLocked && unlockChecked && (
              <button
                type="button"
                onClick={handleUnlockClick}
                className="mobile-app-cta shrink-0 min-h-[44px] px-4 rounded-xl font-semibold text-[14px]"
              >
                Get keyword-matched wording — ₹49
              </button>
            )}
            {!isLocked || !unlockChecked ? <div className="flex-1" /> : null}
          </footer>
        </div>
      ) : (
      <div className="flex flex-1 min-h-0">
      <aside className="w-full sm:w-72 md:w-80 lg:w-[25%] lg:min-w-[200px] lg:max-w-[280px] min-w-0 bg-white border-r flex flex-col flex-shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-gray-900" aria-label="Back to editor">← Back</button>
          <button type="button" onClick={handleDownload} disabled={downloading || isLocked} aria-busy={downloading} className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{downloading ? 'Generating…' : 'Download PDF'}</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Choose Template</h2>
          <p className="text-xs text-gray-600 mb-3">
            <strong>Free:</strong> Your words, ATS-friendly layout and PDF. <strong>Paid:</strong> We match your bullets to the job description keywords so you get more callbacks — ₹49 one-time.
          </p>
          <TemplateList templates={AVAILABLE_TEMPLATES} selectedTemplateId={selectedTemplateId} onSelect={setSelectedTemplateId} freeTemplateId={FREE_TEMPLATE_ID} />
          {isLocked && unlockChecked && (
            <button type="button" onClick={handleUnlockClick} className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700">
              Get keyword-matched wording — ₹49
            </button>
          )}
          {!isLocked && !isFreeTemplate && <p className="text-xs text-green-600 mt-3">Unlocked. Download your PDF when ready.</p>}
          <p className="text-xs text-gray-500 mt-3">Free template and PDF stay free for life.</p>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 relative min-h-0" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="shrink-0 flex flex-wrap items-center gap-3 px-6 pt-4 pb-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Preview</span>
            <span className="text-xs text-gray-500">
              Preview your resume exactly as it will appear in the PDF.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={setFitInView}
              className={`px-2 py-1 text-xs font-medium rounded border ${Math.abs(previewScale - fitScale) < 0.01 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Fit to width
            </button>
            <button
              type="button"
              onClick={() => setPreviewScale(1)}
              className={`px-2 py-1 text-xs font-medium rounded border ${previewScale >= 0.99 && previewScale <= 1.01 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              Actual size (100%)
            </button>
          </div>
        </div>
        <div
          ref={previewContainerRef}
          className="flex-1 min-h-0 preview-scroll overflow-x-hidden"
          style={{ maxHeight: '100%', padding: '0 24px 24px 24px' }}
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
                resume={normalizedResume}
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
                    Match your resume to the job description keywords and get more callbacks.
                  </p>
                  <button
                    type="button"
                    onClick={handleUnlockClick}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 min-h-[44px]"
                  >
                    Get keyword-matched wording — ₹49
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="shrink-0 py-2 text-center">
            <span className="text-xs text-gray-500">Page {currentPage} / {totalPages}</span>
          </div>
        )}
      </main>
      </div>
      )}

      <SoftLockModal
        open={softLockOpen}
        onClose={() => { setSoftLockOpen(false); setPaymentError(null); }}
        onContinue={handleSoftLockContinue}
        loading={payLoading}
        error={paymentError}
      />

      <DownloadFeedbackModal
        open={showDownloadFeedbackModal}
        onClose={() => setShowDownloadFeedbackModal(false)}
        onDone={() => { setShowDownloadFeedbackModal(false); onGoHome?.(); }}
        wasPaid={!isFreeTemplate && unlocked}
      />
    </div>
  );
};
