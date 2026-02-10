/**
 * ENHANCED GOOGLE ANALYTICS SERVICE
 * 
 * Comprehensive event tracking for:
 * - Resume creation flow
 * - Tool usage
 * - Conversion funnel
 * - Engagement metrics
 * - Custom dimensions
 */

// ============== EVENT TYPES ==============
type GAEventName =
  // Page & Session
  | 'page_view'
  | 'session_start'
  // Resume Creation Flow
  | 'resume_started'
  | 'resume_uploaded'
  | 'resume_downloaded'
  | 'section_completed'
  | 'template_selected'
  | 'pdf_downloaded'
  // Tool Usage
  | 'jd_keywords_extracted'
  | 'keyword_extraction'
  | 'ats_check_completed'
  | 'bullet_improved'
  | 'resume_analyzed'
  // Editor Events
  | 'editor_opened'
  | 'preview_opened'
  | 'photo_uploaded'
  | 'photo_removed'
  // Conversion Funnel
  | 'funnel_step'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  // Engagement
  | 'time_on_page'
  | 'scroll_depth'
  | 'feature_used'
  | 'cta_clicked'
  // A/B Testing
  | 'experiment_assigned'
  | 'experiment_conversion'
  // Errors
  | 'error_occurred';

// ============== CUSTOM DIMENSIONS ==============
export type UserType = 'new' | 'returning';
export type ResumeLength = 'short' | 'medium' | 'long';
export type TemplateChoice = 'free' | 'professional' | 'premium';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface CustomDimensions {
  user_type?: UserType;
  resume_length?: ResumeLength;
  template_choice?: TemplateChoice;
  device_type?: DeviceType;
}

// ============== EVENT INTERFACES ==============
interface AnalyticsEvent {
  event: GAEventName;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface FunnelStepParams {
  step: 1 | 2 | 3 | 4 | 5;
  step_name: string;
  action: 'enter' | 'exit' | 'complete';
}

interface SectionCompletedParams {
  section: 'basics' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements';
  field_count?: number;
}

interface TemplateSelectedParams {
  template_id: string;
  template_name: string;
  is_paid: boolean;
  price?: number;
}

interface PDFDownloadedParams {
  template_id: string;
  has_photo: boolean;
  page_count: number;
  word_count?: number;
}

interface KeywordExtractionParams {
  jd_length: number;
  keywords_found: number;
  category?: string;
}

interface ATSCheckParams {
  score: number;
  grade: string;
  issues_count: number;
}

interface BulletImprovedParams {
  count: number;
  section: string;
}

interface ScrollDepthParams {
  percent: 25 | 50 | 75 | 100;
  page: string;
}

interface TimeOnPageParams {
  duration_seconds: number;
  page: string;
}

interface FeatureUsedParams {
  feature_name: string;
  context?: string;
}

interface PaymentParams {
  template_id: string;
  amount: number;
  currency: string;
}

// ============== SESSION MANAGEMENT ==============
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('hexacv_session');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('hexacv_session', sessionId);
  }
  return sessionId;
};

const isNewUser = (): boolean => {
  const hasVisited = localStorage.getItem('hexacv_returning');
  if (!hasVisited) {
    localStorage.setItem('hexacv_returning', 'true');
    return true;
  }
  return false;
};

const getDeviceType = (): DeviceType => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// ============== CORE TRACKING FUNCTIONS ==============

/**
 * Track event to Google Analytics 4
 */
const trackToGA4 = (
  eventName: GAEventName,
  params?: Record<string, any>,
  dimensions?: CustomDimensions
) => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...params,
        ...dimensions,
        session_id: getSessionId(),
        device_type: getDeviceType(),
        user_type: isNewUser() ? 'new' : 'returning'
      });
    }
  } catch (e) {
    console.warn('GA4 tracking failed:', e);
  }
};

/**
 * Track event locally for stats display
 */
const trackLocally = (event: GAEventName, metadata?: Record<string, any>) => {
  try {
    const events: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem('hexacv_analytics') || '[]'
    );

    events.push({
      event,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      metadata
    });

    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }

    localStorage.setItem('hexacv_analytics', JSON.stringify(events));
  } catch (e) {
    // Silent fail
  }
};

// ============== PUBLIC TRACKING API ==============

/**
 * Generic event tracking
 */
export const trackEvent = (
  eventName: GAEventName,
  metadata?: Record<string, any>
): void => {
  trackToGA4(eventName, metadata);
  trackLocally(eventName, metadata);
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string, pageTitle?: string): void => {
  trackEvent('page_view', {
    page_name: pageName,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
};

// ============== RESUME CREATION FLOW ==============

/**
 * Track resume upload (PDF or manual)
 */
export const trackResumeUpload = (method: 'pdf' | 'manual'): void => {
  trackEvent('resume_uploaded', { method });
};

/**
 * Track section completion
 */
export const trackSectionCompleted = (params: SectionCompletedParams): void => {
  trackEvent('section_completed', params);
};

/**
 * Track template selection
 */
export const trackTemplateSelected = (params: TemplateSelectedParams): void => {
  trackEvent('template_selected', params);
};

/**
 * Track PDF download
 */
export const trackPDFDownloaded = (params: PDFDownloadedParams): void => {
  trackEvent('pdf_downloaded', {
    ...params,
    resume_length: params.word_count 
      ? params.word_count < 300 ? 'short' 
        : params.word_count < 600 ? 'medium' 
        : 'long'
      : undefined
  });
};

// ============== TOOL USAGE ==============

/**
 * Track keyword extraction
 */
export const trackKeywordExtraction = (params: KeywordExtractionParams): void => {
  trackEvent('keyword_extraction', params);
};

/**
 * Track ATS check completion
 */
export const trackATSCheck = (params: ATSCheckParams): void => {
  trackEvent('ats_check_completed', params);
};

/**
 * Track bullet point improvement
 */
export const trackBulletImproved = (params: BulletImprovedParams): void => {
  trackEvent('bullet_improved', params);
};

// ============== CONVERSION FUNNEL ==============

const FUNNEL_STEPS = {
  1: 'landing',
  2: 'upload_resume',
  3: 'edit_resume',
  4: 'select_template',
  5: 'download_pdf'
} as const;

/**
 * Track funnel step
 */
export const trackFunnelStep = (params: FunnelStepParams): void => {
  trackEvent('funnel_step', {
    ...params,
    step_name: params.step_name || FUNNEL_STEPS[params.step]
  });
};

/**
 * Track payment initiated
 */
export const trackPaymentInitiated = (params: PaymentParams): void => {
  trackEvent('payment_initiated', params);
};

/**
 * Track payment completed
 */
export const trackPaymentCompleted = (params: PaymentParams): void => {
  trackEvent('payment_completed', params);
};

/**
 * Track payment failed
 */
export const trackPaymentFailed = (params: PaymentParams & { error?: string }): void => {
  trackEvent('payment_failed', params);
};

// ============== ENGAGEMENT METRICS ==============

/**
 * Track scroll depth
 */
export const trackScrollDepth = (params: ScrollDepthParams): void => {
  trackEvent('scroll_depth', params);
};

/**
 * Track time on page
 */
export const trackTimeOnPage = (params: TimeOnPageParams): void => {
  trackEvent('time_on_page', params);
};

/**
 * Track feature usage
 */
export const trackFeatureUsed = (params: FeatureUsedParams): void => {
  trackEvent('feature_used', params);
};

/**
 * Track CTA click
 */
export const trackCTAClick = (ctaName: string, location: string): void => {
  trackEvent('cta_clicked', { cta_name: ctaName, location });
};

// ============== A/B TESTING ==============

/**
 * Track experiment assignment
 */
export const trackExperimentAssigned = (
  experimentName: string,
  variant: 'A' | 'B'
): void => {
  trackEvent('experiment_assigned', {
    experiment_name: experimentName,
    variant
  });
};

/**
 * Track experiment conversion
 */
export const trackExperimentConversion = (
  experimentName: string,
  variant: 'A' | 'B',
  conversionType: string
): void => {
  trackEvent('experiment_conversion', {
    experiment_name: experimentName,
    variant,
    conversion_type: conversionType
  });
};

// ============== ERROR TRACKING ==============

/**
 * Track errors
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: string
): void => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    context
  });
};

// ============== ENGAGEMENT TRACKING UTILITIES ==============

let scrollDepthTracked = new Set<number>();
let pageStartTime = Date.now();

/**
 * Initialize scroll depth tracking
 */
export const initScrollTracking = (pageName: string): void => {
  scrollDepthTracked = new Set();
  
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    const milestones = [25, 50, 75, 100] as const;
    milestones.forEach(milestone => {
      if (scrollPercent >= milestone && !scrollDepthTracked.has(milestone)) {
        scrollDepthTracked.add(milestone);
        trackScrollDepth({ percent: milestone, page: pageName });
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
};

/**
 * Initialize time on page tracking
 */
export const initTimeTracking = (pageName: string): () => void => {
  pageStartTime = Date.now();
  
  const handleUnload = () => {
    const duration = Math.round((Date.now() - pageStartTime) / 1000);
    trackTimeOnPage({ duration_seconds: duration, page: pageName });
  };
  
  window.addEventListener('beforeunload', handleUnload);
  
  // Return cleanup function
  return () => {
    handleUnload();
    window.removeEventListener('beforeunload', handleUnload);
  };
};

// ============== STATS & UTILITIES ==============

/**
 * Get aggregate stats for display
 */
export const getLocalStats = (): {
  totalResumes: number;
  totalDownloads: number;
  totalSessions: number;
  keywordExtractions: number;
  avgTimeOnPage: number;
  paymentInitiated: number;
  paymentCompleted: number;
  paymentFailed: number;
} => {
  try {
    const events: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem('hexacv_analytics') || '[]'
    );

    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    
    const timeEvents = events.filter(e => e.event === 'time_on_page');
    const avgTime = timeEvents.length > 0
      ? timeEvents.reduce((sum, e) => sum + (e.metadata?.duration_seconds || 0), 0) / timeEvents.length
      : 0;

    const paymentInitiated = events.filter(e => e.event === 'payment_initiated').length;
    const paymentCompleted = events.filter(e => e.event === 'payment_completed').length;
    const paymentFailed = events.filter(e => e.event === 'payment_failed').length;

    return {
      totalResumes: events.filter(e => 
        e.event === 'resume_started' || e.event === 'resume_uploaded'
      ).length,
      totalDownloads: events.filter(e => 
        e.event === 'resume_downloaded' || e.event === 'pdf_downloaded'
      ).length,
      totalSessions: uniqueSessions,
      keywordExtractions: events.filter(e => 
        e.event === 'jd_keywords_extracted' || e.event === 'keyword_extraction'
      ).length,
      avgTimeOnPage: Math.round(avgTime),
      paymentInitiated,
      paymentCompleted,
      paymentFailed,
    };
  } catch (e) {
    return {
      totalResumes: 0,
      totalDownloads: 0,
      totalSessions: 0,
      keywordExtractions: 0,
      avgTimeOnPage: 0,
      paymentInitiated: 0,
      paymentCompleted: 0,
      paymentFailed: 0,
    };
  }
};

/**
 * Conversion rate: payment completed / payment initiated (0–1 or null if no initiated).
 */
export const getPaymentConversionRate = (): number | null => {
  const { paymentInitiated, paymentCompleted } = getLocalStats();
  if (paymentInitiated === 0) return null;
  return paymentCompleted / paymentInitiated;
};

/**
 * Clear local analytics (for privacy)
 */
export const clearLocalAnalytics = (): void => {
  localStorage.removeItem('hexacv_analytics');
  sessionStorage.removeItem('hexacv_session');
};

/**
 * Initialize analytics on app load
 */
export const initAnalytics = (): void => {
  trackEvent('page_view');
  trackEvent('session_start', {
    user_type: isNewUser() ? 'new' : 'returning',
    device_type: getDeviceType()
  });
};
