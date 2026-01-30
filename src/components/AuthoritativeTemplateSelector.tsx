import React from 'react';
import { TemplateRecommendation } from '../ai-service';
import { TemplateConfig } from '../types';

interface AuthoritativeTemplateSelectorProps {
  recommendations: TemplateRecommendation[];
  onSelect: (templateId: string, config: TemplateConfig) => void;
  selectedTemplate?: string;
}

const AuthoritativeTemplateSelector: React.FC<AuthoritativeTemplateSelectorProps> = ({ 
  recommendations, 
  onSelect,
  selectedTemplate
}) => {
  // Mock template configs for demonstration
  const templateConfigs: Record<string, TemplateConfig> = {
    tech: {
      id: 'tech',
      name: 'Career Accelerator',
      description: 'Optimized for technical roles with prominent skills section',
      category: 'technical',
      page: {
        width: 794,
        height: 1123,
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        margins: { section: 12, entry: 10 },
      },
      typography: {
        fontFamily: "'Inter', sans-serif",
        sizes: { name: 20, sectionTitle: 12, jobTitle: 10.5, body: 10, caption: 8.5 },
        weights: { name: 700, sectionTitle: 700, jobTitle: 600, body: 400 },
        lineHeights: { tight: 1.15, normal: 1.35, relaxed: 1.5 },
      },
      layout: {
        headerStyle: 'left',
        columns: 2,
        sectionOrder: ['skills', 'experience', 'projects', 'education', 'certifications'],
      },
      rules: {
        maxBulletsPerRole: 4,
        bulletMinLength: 40,
        dateAlignment: 'right',
        sectionTitleCase: 'uppercase',
        includeSectionDividers: false,
      },
      colorScheme: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#2563eb',
        divider: '#e5e7eb',
      },
      masterPrompt: `Optimize resume for technical role screening:
- Place technical skills at top (languages, frameworks, tools)
- Highlight project impact with metrics (latency reduction, user growth)
- Use technical terminology accurately
- Include GitHub/portfolio links prominently
- Format projects with: Name → Tech Stack → Outcome
- Quantify scale (users, data volume, request throughput)
- DO NOT add technologies not actually used
- DO NOT exaggerate technical complexity
- DO NOT claim senior-level contributions for junior work`,
    },
    modern: {
      id: 'modern',
      name: 'Market Differentiator',
      description: 'Balanced approach with good technical presentation',
      category: 'technical',
      page: {
        width: 794,
        height: 1123,
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        margins: { section: 12, entry: 10 },
      },
      typography: {
        fontFamily: "'Inter', sans-serif",
        sizes: { name: 20, sectionTitle: 12, jobTitle: 10.5, body: 10, caption: 8.5 },
        weights: { name: 700, sectionTitle: 700, jobTitle: 600, body: 400 },
        lineHeights: { tight: 1.15, normal: 1.35, relaxed: 1.5 },
      },
      layout: {
        headerStyle: 'left',
        columns: 2,
        sectionOrder: ['skills', 'experience', 'projects', 'education', 'certifications'],
      },
      rules: {
        maxBulletsPerRole: 4,
        bulletMinLength: 40,
        dateAlignment: 'right',
        sectionTitleCase: 'uppercase',
        includeSectionDividers: false,
      },
      colorScheme: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#2563eb',
        divider: '#e5e7eb',
      },
      masterPrompt: `Optimize resume for technical role screening:
- Place technical skills at top (languages, frameworks, tools)
- Highlight project impact with metrics (latency reduction, user growth)
- Use technical terminology accurately
- Include GitHub/portfolio links prominently
- Format projects with: Name → Tech Stack → Outcome
- Quantify scale (users, data volume, request throughput)
- DO NOT add technologies not actually used
- DO NOT exaggerate technical complexity
- DO NOT claim senior-level contributions for junior work`,
    },
    executive: {
      id: 'executive',
      name: 'Industry Standard',
      description: 'Professional appearance but less technical focus',
      category: 'executive',
      page: {
        width: 794,
        height: 1123,
        padding: { top: 56, right: 56, bottom: 56, left: 56 },
        margins: { section: 24, entry: 16 },
      },
      typography: {
        fontFamily: "'Georgia', serif",
        sizes: { name: 24, sectionTitle: 14, jobTitle: 12, body: 11, caption: 10 },
        weights: { name: 700, sectionTitle: 700, jobTitle: 600, body: 400 },
        lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.7 },
      },
      layout: {
        headerStyle: 'centered',
        columns: 1,
        sectionOrder: ['profile', 'experience', 'education', 'certifications'],
      },
      rules: {
        maxBulletsPerRole: 3,
        bulletMinLength: 60,
        dateAlignment: 'right',
        sectionTitleCase: 'capitalize',
        includeSectionDividers: true,
      },
      colorScheme: {
        primary: '#1a1a1a',
        secondary: '#444444',
        accent: '#000000',
        divider: '#cccccc',
      },
      masterPrompt: `Condense resume to leadership highlights:
- Focus on team size, budget, strategic decisions
- Remove technical implementation details
- Emphasize business outcomes (revenue, growth, efficiency)
- Use past tense for all roles (even current)
- Keep bullets under 100 characters (concise authority)
- Omit skills section (implied by experience)
- DO NOT add leadership claims without evidence
- DO NOT inflate team sizes or budget numbers
- DO NOT fabricate strategic initiatives`,
    },
    template1free: {
      id: 'template1free',
      name: 'Entry Optimizer',
      description: 'Basic ATS compatibility with minimal optimization',
      category: 'professional',
      page: {
        width: 794,
        height: 1123,
        padding: { top: 32, right: 28, bottom: 28, left: 28 },
        margins: { section: 14, entry: 10 },
      },
      typography: {
        fontFamily: "'Inter', Arial, Helvetica, sans-serif",
        sizes: { name: 26, sectionTitle: 13, jobTitle: 12, body: 11, caption: 10.5 },
        weights: { name: 700, sectionTitle: 700, jobTitle: 600, body: 400 },
        lineHeights: { tight: 1.3, normal: 1.45, relaxed: 1.6 },
      },
      layout: {
        headerStyle: 'left',
        columns: 1,
        sectionOrder: ['profile', 'experience', 'skills', 'projects', 'education', 'certifications'],
      },
      rules: {
        maxBulletsPerRole: 4,
        bulletMinLength: 50,
        dateAlignment: 'right',
        sectionTitleCase: 'uppercase',
        includeSectionDividers: true,
      },
      colorScheme: {
        primary: '#000000',
        secondary: '#000000',
        accent: '#0066cc',
        divider: '#000000',
      },
      masterPrompt: `Rewrite resume content for maximum ATS compatibility:
- Use standard section names (EXPERIENCE, SKILLS, EDUCATION)
- Start bullets with strong action verbs
- Quantify achievements with specific metrics
- Remove personal pronouns
- Keep bullets concise (50-120 characters)
- Maintain reverse chronological order
- DO NOT add fabricated experience
- DO NOT inflate responsibilities
- DO NOT extend employment dates`,
    }
  };

  return (
    <div className="authoritative-template-selector">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">System Recommendations</h3>
        <p className="text-sm text-gray-600">
          Based on your profile and job requirements, our system recommends these strategic outcomes
        </p>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div 
            key={rec.rank}
            className={`border rounded-lg p-4 transition-all duration-200 ${
              selectedTemplate === rec.templateId 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-4">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {rec.rank}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">
                      {rec.rank === 1 ? (
                        <span className="inline-flex items-center">
                          {rec.templateId} <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">RECOMMENDED</span>
                        </span>
                      ) : (
                        rec.templateId
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">{rec.score}%</div>
                    <div className="text-xs text-gray-500">MATCH</div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center text-sm">
                  <span className="text-gray-600">Confidence: </span>
                  <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${rec.confidence}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-gray-600">{rec.confidence}%</span>
                </div>
                
                {rec.tradeOffs.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">TRADE-OFFS:</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.tradeOffs.map((tradeoff, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tradeoff}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onSelect(rec.templateId, templateConfigs[rec.templateId])}
                className={`px-4 py-2 rounded-md font-medium ${
                  rec.rank === 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {rec.rank === 1 ? 'SELECT AS RECOMMENDED' : 'SELECT OPTION'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthoritativeTemplateSelector;