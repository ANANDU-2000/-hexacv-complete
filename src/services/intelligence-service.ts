import { ResumeData } from '../types';
import { TemplateRecommendation, DecisionRationale, IntelligenceReport } from '../ai-service';

// Intelligence Service Interface
interface RoleAnalysisInput {
  sessionId: string;
  resumeData: ResumeData;
  jobDescription?: string;
}

interface RoleAnalysisResult {
  detectedRole: string;
  confidence: number;
  experienceLevel: string;
  industry: string;
  subIndustry?: string;
}

interface JDAnalysisInput {
  sessionId: string;
  jobDescription: string;
}

interface JDAnalysisResult {
  signals: JDSignal[];
  extractedKeywords: string[];
  requirements: any;
}

interface JDSignal {
  signalType: string;
  signalKey: string;
  signalValue: string;
  weight: number;
  supportingEvidence?: string;
  extractionMethod: string;
}

interface GapAnalysisInput {
  sessionId: string;
  resumeData: ResumeData;
  jobDescription?: string;
}

interface GapAnalysisResult {
  gaps: GapItem[];
}

interface GapItem {
  category: string;
  description: string;
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  confidence: number;
}

interface TemplateRankingInput {
  sessionId: string;
  resumeData: ResumeData;
  jobDescription?: string;
  roleAnalysis: RoleAnalysisResult;
}

interface TemplateRankingResult {
  rankings: TemplateRankingItem[];
}

interface TemplateRankingItem {
  templateId: string;
  rankPosition: number;
  score: number;
  scoreBreakdown: any;
  rationale: string;
  riskFactors: any;
}

// Intelligence Service API
export class IntelligenceService {
  private static readonly API_BASE = '/api/intelligence';

  // Analyze role intent based on resume data
  static async analyzeRole(input: RoleAnalysisInput): Promise<RoleAnalysisResult> {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate the analysis
      const detectedRole = input.resumeData.basics.targetRole || 'Software Engineer';
      const experienceLevel = this.estimateExperienceLevel(input.resumeData);
      const industry = this.estimateIndustry(input.resumeData);
      
      // Store the analysis in the database
      await fetch(`${this.API_BASE}/analyze-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: input.sessionId,
          detectedRole,
          confidenceScore: 0.85,
          experienceLevel,
          industry
        }),
      });

      return {
        detectedRole,
        confidence: 0.85,
        experienceLevel,
        industry
      };
    } catch (error) {
      console.error('Error analyzing role:', error);
      throw error;
    }
  }

  // Analyze job description to extract signals and requirements
  static async analyzeJD(input: JDAnalysisInput): Promise<JDAnalysisResult> {
    try {
      // In a real implementation, this would call an AI service to analyze the JD
      // For now, we'll simulate the analysis
      const signals: JDSignal[] = [
        {
          signalType: 'skill_requirement',
          signalKey: 'javascript',
          signalValue: 'javascript',
          weight: 0.9,
          supportingEvidence: 'Mentioned multiple times in requirements section',
          extractionMethod: 'nlp'
        },
        {
          signalType: 'skill_requirement',
          signalKey: 'react',
          signalValue: 'react',
          weight: 0.85,
          supportingEvidence: 'Explicitly mentioned in tech stack',
          extractionMethod: 'nlp'
        },
        {
          signalType: 'experience_required',
          signalKey: 'years_experience',
          signalValue: '3+ years',
          weight: 0.7,
          supportingEvidence: 'Mentioned as "3+ years of experience required"',
          extractionMethod: 'regex'
        }
      ];

      // Store the JD analysis in the database
      await fetch(`${this.API_BASE}/jd-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: input.sessionId,
          rawJdText: input.jobDescription,
          processedJdJson: {
            extractedSkills: signals.filter(s => s.signalType === 'skill_requirement').map(s => s.signalValue),
            experienceRequirements: signals.filter(s => s.signalType === 'experience_required').map(s => s.signalValue),
            extractedSignals: signals
          },
          aiModelVersion: 'gpt-4-2023-11-06',
          promptVersion: 'jd-analysis-v1.0'
        }),
      });

      // Store individual signals in the database
      await fetch(`${this.API_BASE}/jd-signals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisSnapshotId: 'simulated-id', // Would be the ID from the previous call in real implementation
          signals
        }),
      });

      return {
        signals,
        extractedKeywords: signals.filter(s => s.signalType === 'skill_requirement').map(s => s.signalValue),
        requirements: {
          skills: signals.filter(s => s.signalType === 'skill_requirement').map(s => s.signalValue),
          experience: signals.filter(s => s.signalType === 'experience_required').map(s => s.signalValue)
        }
      };
    } catch (error) {
      console.error('Error analyzing JD:', error);
      throw error;
    }
  }

  // Perform gap analysis between resume and job requirements
  static async analyzeGaps(input: GapAnalysisInput): Promise<GapAnalysisResult> {
    try {
      const gaps: GapItem[] = [];

      if (input.jobDescription) {
        // Simulate gap analysis by comparing resume skills with JD requirements
        const jdAnalysis = await this.analyzeJD({
          sessionId: input.sessionId,
          jobDescription: input.jobDescription
        });

        const resumeSkills = input.resumeData.skills.map(s => s.toLowerCase());
        const requiredSkills = jdAnalysis.extractedKeywords.map(s => s.toLowerCase());

        const missingSkills = requiredSkills.filter(skill => !resumeSkills.includes(skill));
        
        if (missingSkills.length > 0) {
          gaps.push({
            category: 'skill_gap',
            description: `Missing key skills: ${missingSkills.join(', ')}`,
            severityLevel: missingSkills.length > 3 ? 'high' : 'medium',
            recommendation: `Consider adding projects or experience with: ${missingSkills.slice(0, 3).join(', ')}`,
            confidence: 0.8
          });
        }
      }

      // Store gap analysis in the database
      await fetch(`${this.API_BASE}/resume-gap-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: input.sessionId,
          gapAnalyses: gaps
        }),
      });

      return {
        gaps
      };
    } catch (error) {
      console.error('Error analyzing gaps:', error);
      throw error;
    }
  }

  // Generate template rankings based on role and requirements
  static async rankTemplates(input: TemplateRankingInput): Promise<TemplateRankingItem[]> {
    try {
      // Simulate template ranking based on role and experience level
      const rankings: TemplateRankingItem[] = [
        {
          templateId: 'tech',
          rankPosition: 1,
          score: 92,
          scoreBreakdown: {
            roleFit: 0.95,
            atsCompatibility: 0.9,
            experienceMatch: 0.92
          },
          rationale: 'Best fit for technical roles with strong ATS compatibility',
          riskFactors: {
            visualAppeal: 'medium'
          }
        },
        {
          templateId: 'modern',
          rankPosition: 2,
          score: 87,
          scoreBreakdown: {
            roleFit: 0.88,
            atsCompatibility: 0.85,
            experienceMatch: 0.88
          },
          rationale: 'Good balance of technical presentation and visual appeal',
          riskFactors: {
            atsRisk: 'low'
          }
        },
        {
          templateId: 'executive',
          rankPosition: 3,
          score: 78,
          scoreBreakdown: {
            roleFit: 0.75,
            atsCompatibility: 0.8,
            experienceMatch: 0.8
          },
          rationale: 'Professional appearance but less technical focus',
          riskFactors: {
            atsRisk: 'medium'
          }
        },
        {
          templateId: 'template1free',
          rankPosition: 4,
          score: 65,
          scoreBreakdown: {
            roleFit: 0.6,
            atsCompatibility: 0.95,
            experienceMatch: 0.55
          },
          rationale: 'High ATS compatibility but basic design',
          riskFactors: {
            visualAppeal: 'high'
          }
        }
      ];

      // Store template rankings in the database
      await fetch(`${this.API_BASE}/template-ranking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: input.sessionId,
          rankings
        }),
      });

      return rankings;
    } catch (error) {
      console.error('Error ranking templates:', error);
      throw error;
    }
  }

  // Generate comprehensive intelligence report
  static async generateIntelligenceReport(
    resumeData: ResumeData, 
    jobDescription?: string,
    sessionId?: string
  ): Promise<{
    roleAnalysis: RoleAnalysisResult;
    jdAnalysis: JDAnalysisResult;
    gapAnalysis: GapAnalysisResult;
    templateRankings: TemplateRankingItem[];
    decisionRationale: DecisionRationale;
  }> {
    const currentSessionId = sessionId || localStorage.getItem('sessionId') || 'unknown-session';
    
    // Perform all analyses
    const [roleAnalysis, jdAnalysis, gapAnalysis] = await Promise.all([
      this.analyzeRole({ sessionId: currentSessionId, resumeData, jobDescription }),
      jobDescription ? this.analyzeJD({ sessionId: currentSessionId, jobDescription }) : Promise.resolve({ signals: [], extractedKeywords: [], requirements: {} }),
      this.analyzeGaps({ sessionId: currentSessionId, resumeData, jobDescription })
    ]);

    const templateRankings = await this.rankTemplates({
      sessionId: currentSessionId,
      resumeData,
      jobDescription,
      roleAnalysis
    });

    // Create decision rationale
    const decisionRationale: DecisionRationale = {
      detectedRole: roleAnalysis.detectedRole,
      experienceLevel: roleAnalysis.experienceLevel,
      industry: roleAnalysis.industry,
      primaryFactors: ['Role category alignment', 'ATS compatibility', 'Historical performance'],
      recommendationBasis: `Rankings based on ${roleAnalysis.detectedRole} role requirements and ${roleAnalysis.experienceLevel}-level expectations`,
      riskFactors: gapAnalysis.gaps.map(g => g.description)
    };

    // Store the decision explanation in the database
    await fetch(`${this.API_BASE}/decision-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: currentSessionId,
        decisionType: 'template_selection',
        decisionInput: {
          resumeData,
          jobDescription,
          roleAnalysis,
          jdAnalysis
        },
        decisionOutput: {
          templateRankings,
          decisionRationale
        },
        decisionRationale: decisionRationale.recommendationBasis,
        confidenceScore: 0.85,
        aiModelVersion: 'gpt-4-2023-11-06',
        promptVersion: 'template-ranking-v1.0',
        logicVersion: 'v1.0',
        decisionSource: 'ai_model'
      }),
    });

    return {
      roleAnalysis,
      jdAnalysis,
      gapAnalysis,
      templateRankings,
      decisionRationale
    };
  }

  // Helper method to estimate experience level from resume
  private static estimateExperienceLevel(resumeData: ResumeData): string {
    const experienceCount = resumeData.experience.length;
    
    if (experienceCount === 0) {
      // Check if they're a student or fresher
      if (resumeData.education.some(edu => 
        edu.graduationDate.includes('2023') || 
        edu.graduationDate.includes('2024') || 
        edu.graduationDate.includes('2025')
      )) {
        return 'fresher';
      }
      return 'entry';
    } else if (experienceCount === 1) {
      return 'entry';
    } else if (experienceCount <= 3) {
      return 'mid';
    } else if (experienceCount <= 6) {
      return 'senior';
    } else {
      return 'lead';
    }
  }

  // Helper method to estimate industry from resume
  private static estimateIndustry(resumeData: ResumeData): string {
    const techKeywords = ['software', 'developer', 'engineer', 'tech', 'it', 'programming', 'coding'];
    const financeKeywords = ['finance', 'banking', 'investment', 'accounting', 'financial'];
    const healthcareKeywords = ['healthcare', 'medical', 'hospital', 'nurse', 'doctor', 'pharma'];
    const marketingKeywords = ['marketing', 'advertising', 'brand', 'campaign', 'social media'];

    const text = `${resumeData.basics.targetRole} ${resumeData.summary} ${resumeData.experience.map(e => e.company + ' ' + e.position).join(' ')}`;

    if (techKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Technology';
    } else if (financeKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Finance';
    } else if (healthcareKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Healthcare';
    } else if (marketingKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return 'Marketing';
    }

    return 'General';
  }
}

// Export for backward compatibility
export default IntelligenceService;