import React from 'react';
import { IntelligenceReport, generateAuthoritativeRecommendations, TemplateRecommendation } from '../ai-service';
import { IntelligenceVisibility, generateIntelligenceReport } from '../resume-categorization-service';
import { ResumeData } from '../types';
import { IntelligenceService } from '../services/intelligence-service';

interface IntelligenceVisibilityPanelProps {
  resumeData: ResumeData;
  jobDescription?: string;
  onRecommendationSelect: (recommendation: TemplateRecommendation) => void;
}

const IntelligenceVisibilityPanel: React.FC<IntelligenceVisibilityPanelProps> = ({ 
  resumeData, 
  jobDescription,
  onRecommendationSelect 
}) => {
  // Generate intelligence report
  const intelligenceReport: IntelligenceVisibility = generateIntelligenceReport(resumeData, jobDescription);

  // Generate authoritative recommendations using enterprise intelligence
  const generateRecommendations = async () => {
    try {
      const apiService = await import('../api-service.js').then(module => module.ApiService);
      
      const result = await apiService.getTemplateRecommendations(
        resumeData,
        jobDescription
      );
      
      // Display the top recommendation prominently
      if (result.recommendations.length > 0) {
        onRecommendationSelect(result.recommendations[0]);
      }
      
      return result;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return null;
    }
  };

  const [recommendationResult, setRecommendationResult] = React.useState<{ recommendations: TemplateRecommendation[], rationale: any, report: any } | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    const result = await generateRecommendations();
    setRecommendationResult(result);
    setLoading(false);
  };

  React.useEffect(() => {
    handleGenerateRecommendations();
  }, []);

  return (
    <div className="intelligence-visibility-panel bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Intelligence Report</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Detection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">DETECTED</span>
            Role Analysis
          </h4>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{intelligenceReport.roleDetection.detected}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {intelligenceReport.roleDetection.confidence}% | Basis: {intelligenceReport.roleDetection.basis}
          </p>
        </div>
        
        {/* Experience Level */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">INFERRED</span>
            Experience Level
          </h4>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{intelligenceReport.experienceLevel.inferred}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {intelligenceReport.experienceLevel.confidence}% | Basis: {intelligenceReport.experienceLevel.basis}
          </p>
        </div>
        
        {/* Industry Type */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">IDENTIFIED</span>
            Industry Focus
          </h4>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{intelligenceReport.industryType.identified}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {intelligenceReport.industryType.confidence}% | Basis: {intelligenceReport.industryType.basis}
          </p>
        </div>
        
        {/* JD Emphasis */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded mr-2">ANALYZED</span>
            JD Emphasis
          </h4>
          <p className="text-sm text-gray-600">
            Primary: <span className="font-medium">{intelligenceReport.jdEmphasis.primary}</span>
          </p>
          <p className="text-sm text-gray-600">
            Secondary: <span className="font-medium">{intelligenceReport.jdEmphasis.secondary}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Basis: {intelligenceReport.jdEmphasis.basis}
          </p>
        </div>
      </div>
      
      {/* Risk Factors */}
      {intelligenceReport.riskFactors.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2">RISK</span>
            Identified Risks
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {intelligenceReport.riskFactors.map((risk, index) => (
              <li key={index} className="text-sm text-red-600">{risk}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Recommendation Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">System Recommendation</h4>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Analyzing your profile...</span>
          </div>
        ) : recommendationResult ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-blue-800">Recommended: {recommendationResult.recommendations[0].templateId} (Rank #{recommendationResult.recommendations[0].rank})</h5>
                <p className="text-sm text-blue-700 mt-1">{recommendationResult.recommendations[0].reason}</p>
                <p className="text-xs text-blue-600 mt-1">Confidence: {recommendationResult.recommendations[0].confidence}% | Score: {recommendationResult.recommendations[0].score}/100</p>
                
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-700">Trade-offs:</p>
                  <ul className="list-disc pl-5 text-xs text-gray-600">
                    {recommendationResult.recommendations[0].tradeOffs.map((tradeoff: string, index: number) => (
                      <li key={index}>{tradeoff}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-1">Alternative Options:</p>
              <div className="flex flex-wrap gap-2">
                {recommendationResult.recommendations.slice(1).map((rec: TemplateRecommendation, index: number) => (
                  <button
                    key={rec.rank}
                    onClick={() => onRecommendationSelect(rec)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      index === 0 
                        ? 'bg-gray-100 text-gray-800 border border-gray-300' 
                        : index === 1 
                          ? 'bg-gray-50 text-gray-700 border border-gray-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {rec.templateId} (#{rec.rank})
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Generating recommendations...</p>
        )}
      </div>
      
      {/* Rationale */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="font-semibold text-gray-700 mb-2">Decision Rationale</h4>
        <p className="text-sm text-gray-600">
          This recommendation is based on your detected role category, experience level, and the requirements of the job description.
          The system evaluates ATS compatibility, role fit, and historical performance to provide the optimal template for your profile.
        </p>
      </div>
    </div>
  );
};

export default IntelligenceVisibilityPanel;