/**
 * HONEST VALIDATION SERVICE
 * 
 * Implements STEP 3 from CORRECT CORE LOGIC:
 * - Validates experience vs titles
 * - Prevents fake claims
 * - Warns user about mismatches
 * - Builds trust through transparency
 * 
 * This replaces weak validation with production-level checks.
 */

import { getRoleMarketIntelligence } from './roleMarketIntelligenceService';

export interface ValidationWarning {
  type: 'error' | 'warning' | 'suggestion';
  field: string;
  message: string;
  fix?: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  score: number; // 0-100
}

/**
 * Validate user CV before rewrite
 */
export async function validateUserCV(
  resumeData: {
    targetRole?: string;
    targetMarket?: 'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote';
    experienceLevel?: 'fresher' | '1-3' | '3-5' | '5-8' | '8+';
    experience?: Array<{
      position?: string;
      company?: string;
      startDate?: string;
      endDate?: string;
      bullets?: string[];
    }>;
    summary?: string;
  }
): Promise<ValidationResult> {
  
  const warnings: ValidationWarning[] = [];
  
  if (!resumeData.targetRole || !resumeData.experienceLevel) {
    return {
      isValid: false,
      warnings: [{
        type: 'error',
        field: 'targetRole',
        message: 'Target role and experience level are required for validation'
      }],
      score: 0
    };
  }
  
  // Get role market intelligence
  const intelligence = await getRoleMarketIntelligence(
    resumeData.targetRole,
    resumeData.targetMarket || 'india',
    resumeData.experienceLevel
  );
  
  // Validate experience titles
  if (resumeData.experience && resumeData.experience.length > 0) {
    for (const exp of resumeData.experience) {
      if (exp.position) {
        const titleWarnings = validateTitleAgainstExperience(
          exp.position,
          resumeData.experienceLevel,
          intelligence
        );
        warnings.push(...titleWarnings);
      }
      
      // Validate bullets for inappropriate claims
      if (exp.bullets) {
        for (const bullet of exp.bullets) {
          const bulletWarnings = validateBulletAgainstExperience(
            bullet,
            resumeData.experienceLevel,
            intelligence
          );
          warnings.push(...bulletWarnings);
        }
      }
    }
  }
  
  // Validate summary
  if (resumeData.summary) {
    const summaryWarnings = validateSummaryAgainstExperience(
      resumeData.summary,
      resumeData.experienceLevel,
      intelligence
    );
    warnings.push(...summaryWarnings);
  }
  
  // Calculate score
  const errorCount = warnings.filter(w => w.type === 'error').length;
  const warningCount = warnings.filter(w => w.type === 'warning').length;
  const score = Math.max(0, 100 - (errorCount * 20) - (warningCount * 10));
  
  return {
    isValid: errorCount === 0,
    warnings,
    score
  };
}

/**
 * Validate title against experience level
 */
function validateTitleAgainstExperience(
  title: string,
  experienceLevel: string,
  intelligence: any
): ValidationWarning[] {
  
  const warnings: ValidationWarning[] = [];
  const titleLower = title.toLowerCase();
  
  // Check for leadership titles at junior levels
  if (experienceLevel === 'fresher' || experienceLevel === '1-3') {
    const leadershipTitles = ['lead', 'manager', 'director', 'head', 'chief', 'vp', 'principal', 'architect'];
    for (const term of leadershipTitles) {
      if (titleLower.includes(term)) {
        warnings.push({
          type: 'warning',
          field: 'position',
          message: `Title "${title}" may raise questions for ${experienceLevel} experience level. Recruiters may ask about team size and scope.`,
          fix: `Consider: ${intelligence.appropriateTitles[0] || 'Software Engineer'}`
        });
        break;
      }
    }
  }
  
  // Check if title is in appropriate list
  const isAppropriate = intelligence.appropriateTitles.some((at: string) =>
    titleLower.includes(at.toLowerCase())
  );
  
  if (!isAppropriate && intelligence.appropriateTitles.length > 0) {
    warnings.push({
      type: 'suggestion',
      field: 'position',
      message: `Title "${title}" may not match typical ${experienceLevel} level roles.`,
      fix: `Consider: ${intelligence.appropriateTitles.join(' or ')}`
    });
  }
  
  return warnings;
}

/**
 * Validate bullet point against experience level
 */
function validateBulletAgainstExperience(
  bullet: string,
  experienceLevel: string,
  intelligence: any
): ValidationWarning[] {
  
  const warnings: ValidationWarning[] = [];
  const bulletLower = bullet.toLowerCase();
  
  // Check for avoided claims
  for (const avoid of intelligence.avoidClaims) {
    if (bulletLower.includes(avoid.toLowerCase())) {
      warnings.push({
        type: 'warning',
        field: 'bullet',
        message: `Bullet contains "${avoid}" which may raise questions at ${experienceLevel} level.`,
        fix: 'Consider removing or softening this claim.'
      });
    }
  }
  
  // Check for leadership claims at junior levels
  if (experienceLevel === 'fresher' || experienceLevel === '1-3') {
    const leadershipTerms = [
      'led team of', 'managed team', 'spearheaded', 'drove strategy',
      'orchestrated', 'directed', 'oversaw', 'supervised'
    ];
    
    for (const term of leadershipTerms) {
      if (bulletLower.includes(term)) {
        warnings.push({
          type: 'warning',
          field: 'bullet',
          message: `Leadership claim "${term}" may not match ${experienceLevel} experience level.`,
          fix: 'Use collaborative language: "Collaborated with team" instead of "Led team"'
        });
        break;
      }
    }
  }
  
  // Check for unrealistic metrics
  if (experienceLevel === 'fresher') {
    const unrealisticMetrics = [
      'saved ₹10L', 'reduced costs by ₹50L', 'managed budget of',
      'scaled to 1M users', 'increased revenue by ₹1Cr'
    ];
    
    for (const metric of unrealisticMetrics) {
      if (bulletLower.includes(metric)) {
        warnings.push({
          type: 'warning',
          field: 'bullet',
          message: `Large metric "${metric}" may seem unrealistic for fresher level.`,
          fix: 'Use smaller, more believable metrics or remove if not accurate.'
        });
      }
    }
  }
  
  return warnings;
}

/**
 * Validate summary against experience level
 */
function validateSummaryAgainstExperience(
  summary: string,
  experienceLevel: string,
  intelligence: any
): ValidationWarning[] {
  
  const warnings: ValidationWarning[] = [];
  const summaryLower = summary.toLowerCase();
  
  // Check for avoided claims in summary
  for (const avoid of intelligence.avoidClaims) {
    if (summaryLower.includes(avoid.toLowerCase())) {
      warnings.push({
        type: 'warning',
        field: 'summary',
        message: `Summary contains "${avoid}" which may raise questions.`,
        fix: 'Consider removing or rephrasing.'
      });
    }
  }
  
  // Check for experience level mismatch
  if (experienceLevel === 'fresher') {
    const seniorTerms = ['senior', 'lead', 'experienced', 'expert', 'veteran', 'seasoned'];
    for (const term of seniorTerms) {
      if (summaryLower.includes(term)) {
        warnings.push({
          type: 'warning',
          field: 'summary',
          message: `Summary uses "${term}" which doesn't match fresher level.`,
          fix: 'Use fresher-appropriate language: "Eager to learn", "Passionate about"'
        });
      }
    }
  }
  
  return warnings;
}

/**
 * Validate years of experience claimed vs selected
 */
export function validateExperienceYears(
  selectedLevel: 'fresher' | '1-3' | '3-5' | '5-8' | '8+',
  actualYears: number
): ValidationWarning[] {
  
  const warnings: ValidationWarning[] = [];
  
  const levelRanges: Record<string, { min: number; max: number }> = {
    'fresher': { min: 0, max: 1 },
    '1-3': { min: 1, max: 3 },
    '3-5': { min: 3, max: 5 },
    '5-8': { min: 5, max: 8 },
    '8+': { min: 8, max: 999 }
  };
  
  const range = levelRanges[selectedLevel];
  if (!range) return warnings;
  
  if (actualYears < range.min) {
    warnings.push({
      type: 'warning',
      field: 'experienceLevel',
      message: `You selected "${selectedLevel}" but your experience shows ${actualYears} years. This mismatch may confuse recruiters.`,
      fix: `Select "${getLevelForYears(actualYears)}" or update your experience dates.`
    });
  } else if (actualYears > range.max && range.max < 999) {
    warnings.push({
      type: 'warning',
      field: 'experienceLevel',
      message: `You selected "${selectedLevel}" but your experience shows ${actualYears} years. You may be underselling yourself.`,
      fix: `Consider selecting "${getLevelForYears(actualYears)}"`
    });
  }
  
  return warnings;
}

function getLevelForYears(years: number): string {
  if (years < 1) return 'fresher';
  if (years < 3) return '1-3';
  if (years < 5) return '3-5';
  if (years < 8) return '5-8';
  return '8+';
}
