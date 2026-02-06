/**
 * ANALYTICS TRACKING SERVICE
 * Client-side event tracking for user behavior metrics
 * Frontend-only - NO backend calls (zero cost)
 */

import { trackEvent as trackGA4Event } from '../analytics/googleAnalytics';

export type AnalyticsEvent = 
    | 'page_view'
    | 'editor_loaded'
    | 'resume_created'
    | 'template_viewed'
    | 'template_selected'
    | 'pdf_downloaded'
    | 'ai_rewrite_used';

interface EventMetadata {
    [key: string]: any;
}

/**
 * Track analytics event (frontend-only, sends to GA4)
 */
export async function trackEvent(
    eventType: AnalyticsEvent,
    metadata?: EventMetadata
): Promise<void> {
    try {
        // Map to GA4 event names
        const ga4EventMap: Record<string, string> = {
            'page_view': 'page_view',
            'editor_loaded': 'editor_opened',
            'resume_created': 'resume_started',
            'template_viewed': 'preview_opened',
            'template_selected': 'preview_opened',
            'pdf_downloaded': 'resume_downloaded',
            'ai_rewrite_used': 'jd_keywords_extracted'
        };
        
        const ga4Event = ga4EventMap[eventType] || eventType;
        trackGA4Event(ga4Event as any, metadata);
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
export function trackPDFDownload(templateId: string, isPaid: boolean = false): void {
    trackEvent('pdf_downloaded', { templateId, isPaid });
}

/**
 * Track AI rewrite usage
 */
export function trackAIRewrite(feature: 'bullet' | 'summary', templateId: string): void {
    trackEvent('ai_rewrite_used', { feature, templateId });
}
