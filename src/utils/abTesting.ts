/**
 * A/B TESTING FRAMEWORK
 * 
 * Simple client-side A/B testing for conversion optimization.
 * Features:
 * - Persistent variant assignment
 * - Multiple experiment support
 * - Conversion tracking
 * - Statistical helpers
 */

import { trackExperimentAssigned, trackExperimentConversion } from '../analytics/googleAnalytics';

// ============== TYPES ==============
export type Variant = 'A' | 'B';

export interface Experiment {
  name: string;
  variants: {
    A: string;
    B: string;
  };
  description?: string;
}

export interface ExperimentResult {
  variant: Variant;
  value: string;
}

interface ExperimentData {
  variant: Variant;
  assignedAt: string;
  converted: boolean;
  conversionType?: string;
}

// ============== PREDEFINED EXPERIMENTS ==============
export const EXPERIMENTS: Record<string, Experiment> = {
  // CTA Button Text
  cta_button_text: {
    name: 'cta_button_text',
    variants: {
      A: 'Start Building Now',
      B: 'Create Free Resume'
    },
    description: 'Test which CTA text drives more clicks'
  },
  
  // Template Pricing Display
  template_pricing: {
    name: 'template_pricing',
    variants: {
      A: 'Improve wording for ATS – ₹49 one-time',
      B: 'One-time ₹49 • No auto-debit'
    },
    description: 'Test which pricing display drives more purchases'
  },
  
  // Feature Explanation Style
  feature_explanation: {
    name: 'feature_explanation',
    variants: {
      A: 'bullet_list',
      B: 'video_demo'
    },
    description: 'Test bullet points vs video demo for feature explanation'
  },
  
  // Keyword Extractor Position
  keyword_extractor_position: {
    name: 'keyword_extractor_position',
    variants: {
      A: 'step_1',
      B: 'step_2'
    },
    description: 'Test keyword extractor before or during resume editing'
  },
  
  // Download Button Color
  download_button_color: {
    name: 'download_button_color',
    variants: {
      A: 'emerald',
      B: 'blue'
    },
    description: 'Test download button color for conversions'
  },
  
  // Hero Headline
  hero_headline: {
    name: 'hero_headline',
    variants: {
      A: 'Build ATS-Friendly Resumes for Free',
      B: 'Create Your Perfect Resume in 2 Minutes'
    },
    description: 'Test which headline drives more engagement'
  },
  
  // Social Proof Display
  social_proof: {
    name: 'social_proof',
    variants: {
      A: 'counter',
      B: 'testimonials'
    },
    description: 'Test counter vs testimonials for social proof'
  },
  
  // Template Preview Size
  template_preview_size: {
    name: 'template_preview_size',
    variants: {
      A: 'small',
      B: 'large'
    },
    description: 'Test template preview card sizes'
  }
};

// ============== CORE FUNCTIONS ==============

/**
 * Get storage key for experiment
 */
const getStorageKey = (experimentName: string): string => {
  return `experiment_${experimentName}`;
};

/**
 * Get experiment data from storage
 */
const getExperimentData = (experimentName: string): ExperimentData | null => {
  try {
    const stored = localStorage.getItem(getStorageKey(experimentName));
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save experiment data to storage
 */
const saveExperimentData = (experimentName: string, data: ExperimentData): void => {
  try {
    localStorage.setItem(getStorageKey(experimentName), JSON.stringify(data));
  } catch {
    // Silent fail
  }
};

/**
 * Get or assign variant for an experiment
 * Returns consistent variant for the same user
 */
export function getVariant(experimentName: string): Variant {
  // Check for existing assignment
  const existing = getExperimentData(experimentName);
  if (existing) {
    return existing.variant;
  }
  
  // Assign new variant (50/50 split)
  const variant: Variant = Math.random() < 0.5 ? 'A' : 'B';
  
  // Save assignment
  saveExperimentData(experimentName, {
    variant,
    assignedAt: new Date().toISOString(),
    converted: false
  });
  
  // Track assignment
  trackExperimentAssigned(experimentName, variant);
  
  return variant;
}

/**
 * Get variant value for a predefined experiment
 */
export function getExperimentValue(experimentName: keyof typeof EXPERIMENTS): ExperimentResult {
  const experiment = EXPERIMENTS[experimentName];
  if (!experiment) {
    console.warn(`Unknown experiment: ${experimentName}`);
    return { variant: 'A', value: '' };
  }
  
  const variant = getVariant(experimentName);
  return {
    variant,
    value: experiment.variants[variant]
  };
}

/**
 * Track conversion for an experiment
 */
export function trackConversion(
  experimentName: string,
  conversionType: string = 'default'
): void {
  const existing = getExperimentData(experimentName);
  if (!existing) {
    return; // User not in experiment
  }
  
  // Don't track duplicate conversions of same type
  if (existing.converted && existing.conversionType === conversionType) {
    return;
  }
  
  // Update experiment data
  saveExperimentData(experimentName, {
    ...existing,
    converted: true,
    conversionType
  });
  
  // Track to analytics
  trackExperimentConversion(experimentName, existing.variant, conversionType);
}

/**
 * Check if user is in a specific variant
 */
export function isInVariant(experimentName: string, variant: Variant): boolean {
  return getVariant(experimentName) === variant;
}

/**
 * Force a specific variant (for testing/debugging)
 */
export function forceVariant(experimentName: string, variant: Variant): void {
  saveExperimentData(experimentName, {
    variant,
    assignedAt: new Date().toISOString(),
    converted: false
  });
}

/**
 * Reset experiment for user (for testing)
 */
export function resetExperiment(experimentName: string): void {
  localStorage.removeItem(getStorageKey(experimentName));
}

/**
 * Reset all experiments for user
 */
export function resetAllExperiments(): void {
  Object.keys(EXPERIMENTS).forEach(name => {
    resetExperiment(name);
  });
}

/**
 * Get all active experiments for user
 */
export function getActiveExperiments(): Array<{
  name: string;
  variant: Variant;
  converted: boolean;
}> {
  const active: Array<{ name: string; variant: Variant; converted: boolean }> = [];
  
  Object.keys(EXPERIMENTS).forEach(name => {
    const data = getExperimentData(name);
    if (data) {
      active.push({
        name,
        variant: data.variant,
        converted: data.converted
      });
    }
  });
  
  return active;
}

// ============== REACT HOOKS ==============

/**
 * React hook for A/B testing
 * Usage: const { variant, value } = useExperiment('cta_button_text');
 */
export function useExperiment(experimentName: keyof typeof EXPERIMENTS): ExperimentResult {
  // Get variant on first render only
  return getExperimentValue(experimentName);
}

/**
 * React hook for custom experiment
 * Usage: const variant = useVariant('my_custom_test');
 */
export function useVariant(experimentName: string): Variant {
  return getVariant(experimentName);
}

// ============== STATISTICAL HELPERS ==============

interface ExperimentStats {
  totalParticipants: number;
  variantA: {
    participants: number;
    conversions: number;
    rate: number;
  };
  variantB: {
    participants: number;
    conversions: number;
    rate: number;
  };
  uplift: number; // % improvement of B over A
  significant: boolean; // Statistical significance (simplified)
}

/**
 * Calculate experiment statistics (for admin dashboard)
 * Note: This is simplified - real statistical significance requires more data
 */
export function calculateExperimentStats(experimentName: string): ExperimentStats | null {
  try {
    const events = JSON.parse(localStorage.getItem('hexacv_analytics') || '[]');
    
    const assignments = events.filter((e: any) => 
      e.event === 'experiment_assigned' && 
      e.metadata?.experiment_name === experimentName
    );
    
    const conversions = events.filter((e: any) => 
      e.event === 'experiment_conversion' && 
      e.metadata?.experiment_name === experimentName
    );
    
    const variantAParticipants = assignments.filter((e: any) => e.metadata?.variant === 'A').length;
    const variantBParticipants = assignments.filter((e: any) => e.metadata?.variant === 'B').length;
    const variantAConversions = conversions.filter((e: any) => e.metadata?.variant === 'A').length;
    const variantBConversions = conversions.filter((e: any) => e.metadata?.variant === 'B').length;
    
    const rateA = variantAParticipants > 0 ? variantAConversions / variantAParticipants : 0;
    const rateB = variantBParticipants > 0 ? variantBConversions / variantBParticipants : 0;
    const uplift = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;
    
    // Simplified significance check (need at least 100 participants per variant)
    const significant = variantAParticipants >= 100 && 
                       variantBParticipants >= 100 && 
                       Math.abs(uplift) > 10;
    
    return {
      totalParticipants: variantAParticipants + variantBParticipants,
      variantA: {
        participants: variantAParticipants,
        conversions: variantAConversions,
        rate: Math.round(rateA * 100)
      },
      variantB: {
        participants: variantBParticipants,
        conversions: variantBConversions,
        rate: Math.round(rateB * 100)
      },
      uplift: Math.round(uplift),
      significant
    };
  } catch {
    return null;
  }
}

// ============== UTILITY COMPONENTS ==============

/**
 * Component wrapper for A/B testing
 * Usage:
 * <ABTest experiment="cta_button_text">
 *   {(variant, value) => <Button>{value}</Button>}
 * </ABTest>
 */
export interface ABTestProps {
  experiment: keyof typeof EXPERIMENTS;
  children: (variant: Variant, value: string) => React.ReactNode;
}

// Note: Use this with React:
// export const ABTest: React.FC<ABTestProps> = ({ experiment, children }) => {
//   const { variant, value } = useExperiment(experiment);
//   return <>{children(variant, value)}</>;
// };
