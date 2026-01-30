/**
 * ANALYTICS TRACKING SERVICE
 * Client-side event tracking for user behavior metrics
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export type AnalyticsEvent = 
    | 'page_view'
    | 'editor_loaded'
    | 'resume_created'
    | 'template_viewed'
    | 'template_selected'
    | 'pdf_downloaded'
    | 'payment_initiated'
    | 'payment_completed'
    | 'ai_rewrite_used';

interface EventMetadata {
    [key: string]: any;
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

/**
 * Get or create user ID (persistent across sessions)
 */
function getUserId(): string {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
}

/**
 * Track analytics event
 */
export async function trackEvent(
    eventType: AnalyticsEvent,
    metadata?: EventMetadata
): Promise<void> {
    try {
        const sessionId = getSessionId();
        const userId = getUserId();

        await fetch(`${API_BASE_URL}/api/analytics/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventType,
                userId,
                sessionId,
                templateId: metadata?.templateId || null,
                metadata: metadata ? JSON.stringify(metadata) : null
            })
        });
    } catch (error) {
        // Silent fail - don't block user experience
        console.warn('Analytics tracking failed:', error);
    }
}

/**
 * Track page view
 */
export function trackPageView(page: string): void {
    trackEvent('page_view', { page });
}

/**
 * Track editor interaction
 */
export function trackEditorLoaded(platform: 'desktop' | 'mobile'): void {
    trackEvent('editor_loaded', { platform });
}

/**
 * Track resume creation
 */
export function trackResumeCreated(resumeData: { role?: string; sectionsCount: number }): void {
    trackEvent('resume_created', resumeData);
}

/**
 * Track template selection
 */
export function trackTemplateSelected(templateId: string, templateName: string): void {
    trackEvent('template_selected', { templateId, templateName });
}

/**
 * Track PDF download
 */
export function trackPDFDownload(templateId: string, isPaid: boolean): void {
    trackEvent('pdf_downloaded', { templateId, isPaid });
}

/**
 * Track payment
 */
export function trackPayment(templateId: string, amount: number, status: 'initiated' | 'completed'): void {
    const eventType = status === 'initiated' ? 'payment_initiated' : 'payment_completed';
    trackEvent(eventType, { templateId, amount });
}

/**
 * Track AI rewrite usage
 */
export function trackAIRewrite(feature: 'bullet' | 'summary', templateId: string): void {
    trackEvent('ai_rewrite_used', { feature, templateId });
}
