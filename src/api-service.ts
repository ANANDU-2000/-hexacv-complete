// API Service for HexaCV - Frontend Only (Zero Backend)
// All data stored locally, no external API calls

import { ResumeData } from './types';

// Session ID management (local only)
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('hexacv_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('hexacv_session_id', sessionId);
  }
  return sessionId;
};

// Simple analytics tracking (local only, no backend)
export const trackEvent = (
  event: string,
  templateId?: string,
  targetRole?: string,
  metadata?: any
): void => {
  try {
    const events = JSON.parse(localStorage.getItem('hexacv_events') || '[]');
    events.push({
      event,
      templateId,
      targetRole,
      metadata,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    });
    // Keep only last 100 events
    if (events.length > 100) events.shift();
    localStorage.setItem('hexacv_events', JSON.stringify(events));
  } catch (e) {
    // Silent fail
  }
};

// Template recommendation - simple local logic
export interface TemplateRecommendation {
  templateId: string;
  rank: number;
  score: number;
  reason: string;
  confidence: number;
}

// Basic API service class for compatibility
export class ApiService {
  static async getTemplateRecommendations(
    resumeData: ResumeData,
    jobDescription?: string
  ): Promise<{
    recommendations: TemplateRecommendation[];
  }> {
    // Single free template - always recommend it
    return {
      recommendations: [
        {
          templateId: 'template1free',
          rank: 1,
          score: 100,
          reason: 'Free ATS-optimized template',
          confidence: 1.0
        }
      ]
    };
  }
}

export default ApiService;
