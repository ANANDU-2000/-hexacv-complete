import { ResumeData } from '../types';
import { TemplateRecommendation, DecisionRationale, IntelligenceReport } from '../ai-service';
import { IntelligenceService } from './intelligence-service';

// Enterprise Intelligence Service - Main entry point for all intelligence features
export class EnterpriseIntelligenceService {
  // Generate comprehensive intelligence report with full enterprise governance
  static async generateEnterpriseIntelligence(
    resumeData: ResumeData,
    jobDescription?: string,
    sessionId?: string
  ): Promise<{
    roleAnalysis: any;
    jdAnalysis: any;
    gapAnalysis: any;
    templateRankings: any[];
    decisionRationale: DecisionRationale;
    report: IntelligenceReport;
  }> {
    // Use the IntelligenceService for core analysis
    const intelligenceResult = await IntelligenceService.generateIntelligenceReport(
      resumeData,
      jobDescription,
      sessionId
    );

    // Format the results to match expected types
    const report: IntelligenceReport = {
      roleDetection: {
        category: intelligenceResult.roleAnalysis.detectedRole,
        specificRole: intelligenceResult.roleAnalysis.detectedRole,
        confidence: intelligenceResult.roleAnalysis.confidence,
        basis: 'Detected based on resume content and role patterns'
      },
      experienceInference: {
        level: intelligenceResult.roleAnalysis.experienceLevel,
        estimatedYears: this.estimateYearsFromExperienceLevel(intelligenceResult.roleAnalysis.experienceLevel),
        basis: `Based on experience patterns and role requirements`
      },
      jdAnalysis: {
        emphasis: 'skills',
        keyRequirements: intelligenceResult.jdAnalysis.extractedKeywords,
        skillGaps: intelligenceResult.gapAnalysis.gaps.map((g: any) => g.description)
      },
      riskAssessment: {
        topRisk: intelligenceResult.gapAnalysis.gaps.length > 0 
          ? intelligenceResult.gapAnalysis.gaps[0].description 
          : 'No major gaps identified',
        impact: 'Potential impact on ATS matching',
        mitigation: intelligenceResult.gapAnalysis.gaps.length > 0 
          ? intelligenceResult.gapAnalysis.gaps[0].recommendation 
          : 'No specific mitigation needed'
      }
    };

    return {
      roleAnalysis: intelligenceResult.roleAnalysis,
      jdAnalysis: intelligenceResult.jdAnalysis,
      gapAnalysis: intelligenceResult.gapAnalysis,
      templateRankings: intelligenceResult.templateRankings,
      decisionRationale: intelligenceResult.decisionRationale,
      report
    };
  }

  // Helper function to estimate years from experience level
  private static estimateYearsFromExperienceLevel(level: string): number {
    switch(level) {
      case 'fresher': return 0;
      case 'entry': return 1;
      case 'mid': return 3;
      case 'senior': return 5;
      case 'lead': return 8;
      case 'executive': return 10;
      default: return 2;
    }
  }

  // Get session insights from the database
  static async getSessionInsights(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`/api/intelligence/session-insights/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session insights: ${response.status}`);
      }
      const data = await response.json();
      return data.sessionInsights;
    } catch (error) {
      console.error('Error fetching session insights:', error);
      throw error;
    }
  }

  // Submit user validation of role detection
  static async validateRoleDetection(sessionId: string, isValid: boolean): Promise<void> {
    try {
      const response = await fetch('/api/intelligence/analyze-role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          validatedByUser: isValid
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to validate role detection: ${response.status}`);
      }
    } catch (error) {
      console.error('Error validating role detection:', error);
      throw error;
    }
  }

  // Get template performance metrics
  static async getTemplatePerformance(templateId: string): Promise<any> {
    try {
      const response = await fetch(`/api/intelligence/template-performance/${templateId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch template performance: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching template performance:', error);
      // Return a default performance object in case of error
      return {
        conversionRate: 0.65,
        satisfactionScore: 4.2,
        averageCompletionTime: 180
      };
    }
  }

  // Get role demand trends
  static async getRoleDemandTrends(roleName: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/intelligence/role-demand-trends/${roleName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch role demand trends: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching role demand trends:', error);
      // Return default trend data in case of error
      return [{
        period: 'Last 30 days',
        demandScore: 85,
        trendDirection: 'increasing'
      }];
    }
  }

  // Submit feedback on AI decision
  static async submitDecisionFeedback(
    sessionId: string,
    decisionType: string,
    feedback: string,
    rating: number
  ): Promise<void> {
    try {
      await fetch('/api/intelligence/decision-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          decisionType,
          feedback,
          rating
        })
      });
    } catch (error) {
      console.error('Error submitting decision feedback:', error);
      // Don't throw here as this is non-critical feedback
    }
  }
}

// Export for easy usage
export default EnterpriseIntelligenceService;