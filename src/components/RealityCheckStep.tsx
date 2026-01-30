// Reality Check Step Component
// Step 3: Shows Reality Dashboard with honest feedback (no fake ATS scores)

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { RealityDashboard } from './RealityDashboard';
import { RealityAnalysis } from '../reality-matching-types';
import {
  getRealityAnalysis,
  JDAnalysis,
  UserProfile,
  SectionPriority,
  getSectionPriority
} from '../services/agentOrchestrationService';
import { ResumeData } from '../types';

interface RealityCheckStepProps {
  resume: ResumeData;
  targetRole: string;
  jdAnalysis: JDAnalysis | null;
  userProfile: UserProfile | null;
  onContinue: (realityAnalysis: RealityAnalysis, sectionPriority: SectionPriority | null) => void;
  onBack: () => void;
  onEditResume: () => void;
}

export function RealityCheckStep({
  resume,
  targetRole,
  jdAnalysis,
  userProfile,
  onContinue,
  onBack,
  onEditResume
}: RealityCheckStepProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realityAnalysis, setRealityAnalysis] = useState<RealityAnalysis | null>(null);
  const [sectionPriority, setSectionPriority] = useState<SectionPriority | null>(null);

  // Run analysis on mount
  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert ResumeData to the format expected by the agent
      const parsedResume = {
        basics: resume.basics,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
        skills: resume.skills,
        achievements: resume.achievements
      };

      // Get reality analysis
      const analysisResult = await getRealityAnalysis(
        parsedResume,
        jdAnalysis,
        targetRole,
        { isPaidUser: false }
      );

      if (!analysisResult.success || !analysisResult.analysis) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      setRealityAnalysis(analysisResult.analysis);

      // Get section priority if we have user profile
      if (userProfile) {
        const priorityResult = await getSectionPriority(userProfile, { isPaidUser: false });
        if (priorityResult.success && priorityResult.priority) {
          setSectionPriority(priorityResult.priority);
        }
      }

    } catch (err) {
      console.error('Reality analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (realityAnalysis) {
      onContinue(realityAnalysis, sectionPriority);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Resume</h2>
          <p className="text-gray-600 max-w-md">
            We're checking role alignment, skill coverage, and recruiter readability...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={runAnalysis}
              className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reality Check</h1>
            <p className="text-gray-600">Honest analysis of your resume - no fake scores</p>
          </div>
        </div>

        {/* Section Priority Banner */}
        {sectionPriority && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Recruiter Scan Order for {sectionPriority.userType.replace('-', ' ')}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {sectionPriority.scanOrder.map((section, idx) => (
                <div key={section} className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-blue-800">{section}</span>
                  {idx < sectionPriority.scanOrder.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-blue-700">{sectionPriority.reasoning}</p>
          </div>
        )}

        {/* Reality Dashboard */}
        {realityAnalysis && (
          <RealityDashboard
            analysis={realityAnalysis}
            onContinue={handleContinue}
            onEditResume={onEditResume}
            showActions={true}
          />
        )}
      </div>
    </div>
  );
}

export default RealityCheckStep;
