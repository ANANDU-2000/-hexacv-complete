/**
 * INTEGRATION EXAMPLE
 * 
 * Shows how to integrate the new HARD TRUTH fixes into existing components
 */

import React, { useState, useEffect } from 'react';
import { getRoleMarketIntelligence } from '../services/roleMarketIntelligenceService';
import { validateUserCV, ValidationResult } from '../services/honestValidationService';
import { rewriteWithConstraints, fixGrammarOnly, suggestSkillGaps } from '../services/honestAIRewriteService';

/**
 * Example: Integrate into RoleMarketStep
 */
export function RoleMarketStepExample() {
  const [role, setRole] = useState('Data Analyst');
  const [market, setMarket] = useState<'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote'>('india');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | '1-3' | '3-5' | '5-8' | '8+'>('1-3');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load intelligence when role/market/exp changes
  useEffect(() => {
    if (role && market && experienceLevel) {
      setLoading(true);
      getRoleMarketIntelligence(role, market, experienceLevel)
        .then(data => {
          setIntelligence(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load intelligence:', err);
          setLoading(false);
        });
    }
  }, [role, market, experienceLevel]);

  return (
    <div>
      <h2>Role Market Intelligence</h2>
      {loading && <p>Loading market intelligence...</p>}
      {intelligence && (
        <div>
          <h3>Core Skills Expected:</h3>
          <ul>
            {intelligence.coreSkills.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          
          <h3>Common Tools:</h3>
          <ul>
            {intelligence.commonTools.map((tool: string) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          
          <h3>⚠️ Avoid These Claims:</h3>
          <ul>
            {intelligence.avoidClaims.map((claim: string) => (
              <li key={claim}>{claim}</li>
            ))}
          </ul>
          
          <h3>✅ Appropriate Titles:</h3>
          <ul>
            {intelligence.appropriateTitles.map((title: string) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Integrate validation into Editor
 */
export function EditorWithValidationExample() {
  const [resumeData, setResumeData] = useState({
    targetRole: 'Data Analyst',
    targetMarket: 'india' as const,
    experienceLevel: '1-3' as const,
    experience: [{
      position: 'AI Project Lead', // ⚠️ This will trigger a warning
      company: 'Freelance',
      bullets: ['Led team of 10 engineers', 'Managed budget of ₹50L'] // ⚠️ These will trigger warnings
    }]
  });
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Validate when data changes
  useEffect(() => {
    validateUserCV(resumeData)
      .then(result => {
        setValidation(result);
      })
      .catch(err => {
        console.error('Validation failed:', err);
      });
  }, [resumeData]);

  return (
    <div>
      <h2>Resume Editor with Validation</h2>
      
      {validation && (
        <div>
          <p>Validation Score: {validation.score}/100</p>
          <p>Valid: {validation.isValid ? '✅' : '❌'}</p>
          
          {validation.warnings.length > 0 && (
            <div>
              <h3>⚠️ Warnings:</h3>
              {validation.warnings.map((warning, i) => (
                <div key={i} style={{
                  padding: '10px',
                  margin: '5px',
                  backgroundColor: warning.type === 'error' ? '#fee' : '#ffe',
                  border: `1px solid ${warning.type === 'error' ? '#f00' : '#fa0'}`
                }}>
                  <strong>{warning.field}:</strong> {warning.message}
                  {warning.fix && <p>💡 Fix: {warning.fix}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Integrate honest AI rewrite
 */
export function AIRewriteExample() {
  const [originalText, setOriginalText] = useState('Built dashboard using Excel');
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRewrite = async () => {
    setLoading(true);
    const result = await rewriteWithConstraints({
      mode: 'rewrite',
      role: 'Data Analyst',
      market: 'india',
      experienceLevel: '1-3',
      jdKeywords: ['SQL', 'Python', 'Power BI'],
      originalText
    });
    setRewriteResult(result);
    setLoading(false);
  };

  const handleGrammarOnly = async () => {
    setLoading(true);
    const result = await fixGrammarOnly(originalText, {
      role: 'Data Analyst',
      experienceLevel: '1-3'
    });
    setRewriteResult(result);
    setLoading(false);
  };

  return (
    <div>
      <h2>Honest AI Rewrite</h2>
      
      <textarea
        value={originalText}
        onChange={(e) => setOriginalText(e.target.value)}
        placeholder="Enter bullet point to rewrite"
      />
      
      <div>
        <button onClick={handleGrammarOnly} disabled={loading}>
          Fix Grammar Only
        </button>
        <button onClick={handleRewrite} disabled={loading}>
          Rewrite with Constraints
        </button>
      </div>
      
      {loading && <p>Rewriting...</p>}
      
      {rewriteResult && (
        <div>
          <h3>Result:</h3>
          <p><strong>Original:</strong> {rewriteResult.original}</p>
          <p><strong>Rewritten:</strong> {rewriteResult.rewritten}</p>
          
          {rewriteResult.changes.length > 0 && (
            <div>
              <h4>Changes:</h4>
              <ul>
                {rewriteResult.changes.map((change: string, i: number) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}
          
          {rewriteResult.warnings.length > 0 && (
            <div style={{ backgroundColor: '#ffe', padding: '10px' }}>
              <h4>⚠️ Warnings:</h4>
              <ul>
                {rewriteResult.warnings.map((warning: string, i: number) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p>Confidence: {Math.round(rewriteResult.confidence * 100)}%</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Skill gap suggestions
 */
export function SkillGapExample() {
  const [resumeText, setResumeText] = useState('I have experience with Excel and basic SQL.');
  const [suggestions, setSuggestions] = useState<any>(null);

  const handleSuggest = async () => {
    const result = await suggestSkillGaps(
      resumeText,
      ['Python', 'Power BI', 'Tableau', 'Machine Learning'],
      await getRoleMarketIntelligence('Data Analyst', 'india', '1-3')
    );
    setSuggestions(result);
  };

  return (
    <div>
      <h2>Skill Gap Suggestions</h2>
      
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Enter your resume text"
      />
      
      <button onClick={handleSuggest}>Suggest Skills to Learn</button>
      
      {suggestions && (
        <div>
          <h3>Missing Skills:</h3>
          <ul>
            {suggestions.missingSkills.map((skill: string, i: number) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
          
          <h3>💡 Suggestions:</h3>
          <ul>
            {suggestions.suggestions.map((suggestion: string, i: number) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
          
          {suggestions.learningResources && (
            <div>
              <h3>📚 Learning Resources:</h3>
              <ul>
                {suggestions.learningResources.map((resource: string, i: number) => (
                  <li key={i}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
