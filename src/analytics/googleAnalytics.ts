// Simple Frontend Analytics Service
// Tracks events locally + sends to Google Analytics 4
// NO backend, NO user data storage, NO cookies (except GA)

// GA4 Event Types
type GAEventName = 
  | 'page_view'
  | 'resume_started'
  | 'resume_uploaded'
  | 'resume_downloaded'
  | 'jd_keywords_extracted'
  | 'editor_opened'
  | 'preview_opened';

interface AnalyticsEvent {
  event: GAEventName;
  timestamp: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

// Get or create session ID (stored in sessionStorage, not localStorage)
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('hexacv_session');
  if (!sessionId) {
    sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('hexacv_session', sessionId);
  }
  return sessionId;
};

// Track event to Google Analytics 4
const trackToGA4 = (eventName: GAEventName, params?: Record<string, any>) => {
  try {
    // Check if gtag is available (GA4 loaded)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...params,
        session_id: getSessionId()
      });
    }
  } catch (e) {
    console.warn('GA4 tracking failed:', e);
  }
};

// Track event locally (for simple stats display)
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
    
    // Keep only last 1000 events (privacy + storage)
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('hexacv_analytics', JSON.stringify(events));
  } catch (e) {
    // Silent fail - analytics should never break the app
  }
};

// Public tracking function
export const trackEvent = (
  eventName: GAEventName,
  metadata?: Record<string, any>
): void => {
  // Track to GA4
  trackToGA4(eventName, metadata);
  
  // Track locally for stats
  trackLocally(eventName, metadata);
};

// Get aggregate stats (for display)
export const getLocalStats = (): {
  totalResumes: number;
  totalDownloads: number;
  totalSessions: number;
  keywordExtractions: number;
} => {
  try {
    const events: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem('hexacv_analytics') || '[]'
    );
    
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    
    return {
      totalResumes: events.filter(e => e.event === 'resume_started' || e.event === 'resume_uploaded').length,
      totalDownloads: events.filter(e => e.event === 'resume_downloaded').length,
      totalSessions: uniqueSessions,
      keywordExtractions: events.filter(e => e.event === 'jd_keywords_extracted').length
    };
  } catch (e) {
    return {
      totalResumes: 0,
      totalDownloads: 0,
      totalSessions: 0,
      keywordExtractions: 0
    };
  }
};

// Clear local analytics (for privacy)
export const clearLocalAnalytics = (): void => {
  localStorage.removeItem('hexacv_analytics');
  sessionStorage.removeItem('hexacv_session');
};

// Track page view on load
export const initAnalytics = (): void => {
  trackEvent('page_view');
};
