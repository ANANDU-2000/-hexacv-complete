import { ResumeData } from './types';
import { TemplateRecommendation, DecisionRationale, IntelligenceReport } from './ai-service';
import { EnterpriseIntelligenceService } from './services/enterprise-intelligence-service';

// API Service for all resume intelligence operations
export class ApiService {
  // Generate authoritative template recommendations using enterprise intelligence
  static async getTemplateRecommendations(
    resumeData: ResumeData,
    jobDescription?: string
  ): Promise<{
    recommendations: TemplateRecommendation[];
    rationale: DecisionRationale;
    report: IntelligenceReport;
  }> {
    try {
      // Get session ID from local storage or create new one
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('sessionId', sessionId);
      }

      // Use enterprise intelligence service to generate recommendations
      const enterpriseResult = await EnterpriseIntelligenceService.generateEnterpriseIntelligence(
        resumeData,
        jobDescription,
        sessionId
      );

      // Convert enterprise results to the expected format
      const recommendations: TemplateRecommendation[] = enterpriseResult.templateRankings.map((ranking: any, index: number) => ({
        templateId: ranking.templateId,
        rank: ranking.rankPosition || (index + 1),
        score: ranking.score || 75,
        reason: ranking.rationale || 'Optimal for your profile',
        confidence: ranking.confidence || 0.8,
        tradeOffs: this.getTemplateTradeoffs(ranking.templateId)
      }));

      return {
        recommendations,
        rationale: enterpriseResult.decisionRationale,
        report: enterpriseResult.report
      };
    } catch (error) {
      console.error('Error generating template recommendations:', error);

      // Fallback to basic recommendations if enterprise service fails
      return this.getBasicRecommendations();
    }
  }

  // Get session-specific intelligence insights
  static async getSessionInsights(sessionId: string): Promise<any> {
    return await EnterpriseIntelligenceService.getSessionInsights(sessionId);
  }

  // Validate role detection with user feedback
  static async validateRoleDetection(sessionId: string, isValid: boolean): Promise<void> {
    await EnterpriseIntelligenceService.validateRoleDetection(sessionId, isValid);
  }

  // Submit feedback about AI decisions
  static async submitDecisionFeedback(
    sessionId: string,
    decisionType: string,
    feedback: string,
    rating: number
  ): Promise<void> {
    await EnterpriseIntelligenceService.submitDecisionFeedback(sessionId, decisionType, feedback, rating);
  }

  // Private helper methods
  private static getTemplateTradeoffs(templateId: string): string[] {
    switch (templateId) {
      case 'tech':
        return ['Less visual appeal', 'ATS-focused layout'];
      case 'modern':
        return ['Slightly complex layout', 'May confuse ATS'];
      case 'executive':
        return ['Not ATS-optimized', 'Hides technical skills'];
      case 'template1free':
        return ['Limited features', 'Generic appearance'];
      default:
        return ['Standard tradeoffs'];
    }
  }

  private static getBasicRecommendations(): {
    recommendations: TemplateRecommendation[];
    rationale: DecisionRationale;
    report: IntelligenceReport;
  } {
    // Fallback basic recommendations if enterprise service fails
    const recommendations: TemplateRecommendation[] = [
      {
        templateId: 'tech',
        rank: 1,
        score: 94,
        reason: 'Optimal for technical roles with prominent skills section',
        confidence: 0.92,
        tradeOffs: ['Less visual appeal', 'ATS-focused layout']
      },
      {
        templateId: 'modern',
        rank: 2,
        score: 87,
        reason: 'Balanced approach with good technical presentation',
        confidence: 0.85,
        tradeOffs: ['Slightly complex layout', 'May confuse ATS']
      },
      {
        templateId: 'executive',
        rank: 3,
        score: 78,
        reason: 'Professional appearance but less technical focus',
        confidence: 0.75,
        tradeOffs: ['Not ATS-optimized', 'Hides technical skills']
      },
      {
        templateId: 'template1free',
        rank: 4,
        score: 65,
        reason: 'Basic ATS compatibility with minimal optimization',
        confidence: 0.60,
        tradeOffs: ['Limited features', 'Generic appearance']
      }
    ];

    const rationale: DecisionRationale = {
      detectedRole: 'Software Engineer',
      experienceLevel: 'mid',
      industry: 'Technology',
      primaryFactors: ['Role category alignment', 'ATS compatibility', 'Historical performance'],
      recommendationBasis: 'Rankings based on technical role requirements and mid-level experience expectations',
      riskFactors: ['Insufficient technical skills coverage', 'Limited project descriptions']
    };

    const report: IntelligenceReport = {
      roleDetection: {
        category: 'Software Engineer',
        specificRole: 'Software Engineer',
        confidence: 0.85,
        basis: 'Detected based on resume content and role patterns'
      },
      experienceInference: {
        level: 'mid',
        estimatedYears: 3,
        basis: 'Based on experience patterns and role requirements'
      },
      jdAnalysis: {
        emphasis: 'skills',
        keyRequirements: ['JavaScript', 'React', 'Node.js'],
        skillGaps: ['Missing cloud experience', 'Limited leadership examples']
      },
      riskAssessment: {
        topRisk: 'Missing key technical skills',
        impact: 'Potential impact on ATS matching',
        mitigation: 'No specific mitigation needed'
      }
    };

    return { recommendations, rationale, report };
  }
}

// Export default instance
export default ApiService;

/**
 * NAMED EXPORTS for backward compatibility and payment/analytics services
 * These are used by AppNew.tsx and payment-service.ts
 */

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

import { getApiBaseUrl } from './utils/api-config';
const API_BASE = getApiBaseUrl();

export const trackEvent = async (
  event: string,
  templateId?: string,
  targetRole?: string,
  metadata?: any
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    const response = await fetch(`${API_BASE}/api/analytics-v2/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: event,
        sessionId,
        templateId,
        metadata: { ...metadata, targetRole },
        timestamp: new Date().toISOString()
      })
    });

    // Just check if it's ok, no need to parse if we don't use the result
    if (!response.ok) {
      console.warn('Analytics tracking returned non-ok status:', response.status);
    }
  } catch (error) {
    // Silent fail - network errors or backend down
    console.warn('Analytics tracking failed (backend likely down):', error);
  }
};

export const createOrder = async (templateId: string, retries: number = 2): Promise<any> => {
  const sessionId = getSessionId();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, sessionId }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create order';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
          
          // Handle specific error cases
          if (error.error === 'INVALID_TEMPLATE') {
            throw new Error('Template not found. Please refresh and try again.');
          }
          if (error.error === 'FREE_TEMPLATE') {
            throw new Error('This template is free - no payment required.');
          }
        } catch (e: any) {
          if (e.name === 'AbortError') {
            throw new Error('Request timeout - please check your internet connection and try again.');
          }
          errorMessage = `Server error (${response.status})`;
        }
        
        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(errorMessage);
        }
        
        // Retry on server errors (5xx)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      if (attempt === retries) {
        // Last attempt failed
        if (error.message) {
          throw error;
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error - please check your internet connection and try again.');
        }
        throw new Error('Payment service unavailable. Please try again later.');
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Failed to create order after multiple attempts');
};

export const verifyPayment = async (
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string,
  retries: number = 2
): Promise<any> => {
  const sessionId = getSessionId();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/api/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          sessionId
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout for verification
      });

      if (!response.ok) {
        let errorMessage = 'Payment verification failed';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
          
          // Handle specific verification errors
          if (error.error === 'INVALID_SIGNATURE') {
            throw new Error('Payment verification failed. Please contact support if payment was deducted.');
          }
        } catch (e: any) {
          if (e.name === 'AbortError') {
            throw new Error('Verification timeout - please check your internet connection.');
          }
          errorMessage = `Server error (${response.status})`;
        }
        
        // Don't retry on client errors (4xx) - these are usually permanent
        if (response.status >= 400 && response.status < 500) {
          throw new Error(errorMessage);
        }
        
        // Retry on server errors (5xx)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      if (attempt === retries) {
        if (error.message) {
          throw error;
        }
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error during verification. Payment may have succeeded - please check your account.');
        }
        throw new Error('Payment verification service unavailable. Please contact support if payment was deducted.');
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw new Error('Payment verification failed after multiple attempts');
};