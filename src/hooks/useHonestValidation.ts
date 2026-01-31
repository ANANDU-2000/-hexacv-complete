/**
 * Hook to integrate Honest Validation into components
 */

import { useState, useEffect } from 'react';
import { validateUserCV, ValidationResult } from '../services/honestValidationService';
import { ResumeData } from '../types';

export function useHonestValidation(resumeData: ResumeData | null) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resumeData || !resumeData.basics?.targetRole || !resumeData.basics?.experienceLevel) {
      setValidation(null);
      return;
    }

    setLoading(true);
    
    validateUserCV({
      targetRole: resumeData.basics.targetRole,
      targetMarket: (resumeData.basics.targetMarket as any) || 'india',
      experienceLevel: resumeData.basics.experienceLevel as any || '1-3',
      experience: resumeData.experience || [],
      summary: resumeData.summary
    })
      .then(result => {
        setValidation(result);
        setLoading(false);
      })
      .catch(err => {
        console.error('Validation failed:', err);
        setLoading(false);
      });
  }, [resumeData]);

  return { validation, loading };
}
