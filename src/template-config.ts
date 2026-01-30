/**
 * Template Configuration Schema
 * Defines structural contracts for all resume templates
 * Part of Phase 1 implementation from master-resume-system.md
 */

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'technical' | 'executive';
  page: {
    width: number;
    height: number;
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    margins: {
      section: number;
      entry: number;
    };
  };
  typography: {
    fontFamily: string;
    sizes: {
      name: number;
      sectionTitle: number;
      jobTitle: number;
      body: number;
      caption: number;
    };
    weights: {
      name: number;
      sectionTitle: number;
      jobTitle: number;
      body: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  layout: {
    headerStyle: 'centered' | 'left' | 'sidebar';
    columns: 1 | 2;
    sectionOrder: ('profile' | 'experience' | 'skills' | 'education' | 'projects' | 'certifications')[];
  };
  rules: {
    maxBulletsPerRole: number;
    bulletMinLength: number;
    dateAlignment: 'left' | 'right';
    sectionTitleCase: 'uppercase' | 'capitalize' | 'lowercase';
    includeSectionDividers: boolean;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    divider: string;
  };
  masterPrompt: string;
}

/**
 * Template 1: Classic ATS
 * Maximum ATS compatibility, single column, traditional layout
 */
export const CLASSIC_ATS_CONFIG: TemplateConfig = {
  id: 'classic',
  name: 'Classic ATS',
  description: 'Traditional single-column layout for corporate roles',
  category: 'professional',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 48,
      right: 48,
      bottom: 48,
      left: 48,
    },
    margins: {
      section: 16,
      entry: 12,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    sizes: {
      name: 22,
      sectionTitle: 13,
      jobTitle: 11,
      body: 10.5,
      caption: 9,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 600,
      body: 400,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  layout: {
    headerStyle: 'centered',
    columns: 1,
    sectionOrder: ['profile', 'experience', 'skills', 'education', 'projects', 'certifications'],
  },
  rules: {
    maxBulletsPerRole: 5,
    bulletMinLength: 50,
    dateAlignment: 'right',
    sectionTitleCase: 'uppercase',
    includeSectionDividers: true,
  },
  colorScheme: {
    primary: '#000000',
    secondary: '#555555',
    accent: '#0066cc',
    divider: '#d1d5db',
  },
  masterPrompt: `Rewrite resume content for ATS optimization:
- Prioritize keywords from job description
- Use standard section names (no creative labels)
- Start bullets with action verbs (Led, Developed, Managed)
- Quantify achievements where data exists
- Remove personal pronouns (I, me, my)
- Keep bullets 50-120 characters
- Maintain chronological order
- DO NOT add experience that doesn't exist
- DO NOT inflate job titles or responsibilities
- DO NOT extend date ranges`,
};

/**
 * Template 2: Modern Tech
 * Two-column layout, skills-first, optimized for technical roles
 */
export const MODERN_TECH_CONFIG: TemplateConfig = {
  id: 'modern',
  name: 'Modern Tech',
  description: 'Two-column layout optimized for software engineers and developers',
  category: 'technical',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
    margins: {
      section: 12,
      entry: 10,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    sizes: {
      name: 20,
      sectionTitle: 12,
      jobTitle: 10.5,
      body: 10,
      caption: 8.5,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 600,
      body: 400,
    },
    lineHeights: {
      tight: 1.15,
      normal: 1.35,
      relaxed: 1.5,
    },
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
};

/**
 * Template 1 Free: Professional Classic
 * Maximum ATS compatibility, single column, Inter font, free template
 * Designed according to template-1-build.md specification
 */
export const PROFESSIONAL_CLASSIC_CONFIG: TemplateConfig = {
  id: 'template1free',
  name: 'Professional Classic',
  description: 'ATS-optimized single-column layout with Inter font for maximum compatibility',
  category: 'professional',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 32,
      right: 28,
      bottom: 28,
      left: 28,
    },
    margins: {
      section: 14,
      entry: 10,
    },
  },
  typography: {
    fontFamily: "'Inter', Arial, Helvetica, sans-serif",
    sizes: {
      name: 26,
      sectionTitle: 13,
      jobTitle: 12,
      body: 11,
      caption: 10.5,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 600,
      body: 400,
    },
    lineHeights: {
      tight: 1.3,
      normal: 1.45,
      relaxed: 1.6,
    },
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
};

/**
 * Template 2: Professional Engineering
 * Single column, ATS-safe with optional profile image
 * Designed for Mid/Senior Engineers: Mechanical, Civil, Electrical, Mechatronics, System Engineers
 */
export const PROFESSIONAL_ENGINEERING_CONFIG: TemplateConfig = {
  id: 'template2',
  name: 'Premium ATS',
  description: 'Recruiter-grade ATS layout with premium typography and spacing',
  category: 'professional',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 28,
      right: 28,
      bottom: 28,
      left: 28,
    },
    margins: {
      section: 16,
      entry: 12,
    },
  },
  typography: {
    fontFamily: "'Inter', Arial, Helvetica, sans-serif",
    sizes: {
      name: 22,
      sectionTitle: 13.5,
      jobTitle: 11.5,
      body: 11,
      caption: 10,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 600,
      body: 400,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },
  },
  layout: {
    headerStyle: 'left',
    columns: 1,
    sectionOrder: ['profile', 'skills', 'experience', 'projects', 'education', 'certifications'],
  },
  rules: {
    maxBulletsPerRole: 4,
    bulletMinLength: 45,
    dateAlignment: 'right',
    sectionTitleCase: 'uppercase',
    includeSectionDividers: true,
  },
  colorScheme: {
    primary: '#000000',
    secondary: '#333333',
    accent: '#000000',
    divider: '#000000',
  },
  masterPrompt: `Rewrite resume content for maximum ATS compatibility:
- Use standard section names (SUMMARY, EXPERIENCE, SKILLS, EDUCATION)
- Start bullets with strong action verbs
- Quantify achievements with specific metrics
- Remove personal pronouns
- Keep bullets concise (45-110 characters)
- Maintain reverse chronological order
- DO NOT add fabricated experience
- DO NOT inflate responsibilities
- DO NOT extend employment dates`,
};

/**
 * Template 3: Advanced Two-Column
 * Two-column layout with profile image, modern design
 * 35% left sidebar (About, Education, Skills, Languages) / 65% right (Experience, References)
 */
export const ADVANCED_TWO_COLUMN_CONFIG: TemplateConfig = {
  id: 'template3',
  name: 'Advanced Two-Column',
  description: 'Modern two-column layout with profile image for creative and technical roles',
  category: 'technical',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 32,
      right: 32,
      bottom: 32,
      left: 32,
    },
    margins: {
      section: 20,
      entry: 16,
    },
  },
  typography: {
    fontFamily: "'Inter', Arial, Helvetica, sans-serif",
    sizes: {
      name: 28,
      sectionTitle: 13,
      jobTitle: 12,
      body: 11,
      caption: 10,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 700,
      body: 400,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.6,
    },
  },
  layout: {
    headerStyle: 'left',
    columns: 2,
    sectionOrder: ['profile', 'education', 'skills', 'experience', 'projects', 'certifications'],
  },
  rules: {
    maxBulletsPerRole: 4,
    bulletMinLength: 40,
    dateAlignment: 'right',
    sectionTitleCase: 'uppercase',
    includeSectionDividers: false,
  },
  colorScheme: {
    primary: '#2B2B2B',
    secondary: '#4A4A4A',
    accent: '#6B6B6B',
    divider: '#CFCFCF',
  },
  masterPrompt: `Optimize resume for modern two-column layout:
- Concise About Me section (3-4 sentences max)
- Skills as bullet list (6-8 items)
- Work experience with clear role/company/date structure
- Quantify achievements with metrics
- Keep descriptions paragraph-style for readability
- DO NOT add fabricated experience
- DO NOT inflate responsibilities
- DO NOT extend employment dates`,
};

/**
 * Template 3: Minimal Executive
 * Single column, serif fonts, generous spacing for leadership roles
 */
export const MINIMAL_EXECUTIVE_CONFIG: TemplateConfig = {
  id: 'minimal',
  name: 'Minimal Executive',
  description: 'Clean, spacious design for director and executive-level positions',
  category: 'executive',
  page: {
    width: 794,
    height: 1123,
    padding: {
      top: 56,
      right: 56,
      bottom: 56,
      left: 56,
    },
    margins: {
      section: 24,
      entry: 16,
    },
  },
  typography: {
    fontFamily: "'Georgia', serif",
    sizes: {
      name: 24,
      sectionTitle: 14,
      jobTitle: 12,
      body: 11,
      caption: 10,
    },
    weights: {
      name: 700,
      sectionTitle: 700,
      jobTitle: 600,
      body: 400,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.7,
    },
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
};

/**
 * Template Registry
 * Central source of truth for all template configurations
 */
export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  template1free: PROFESSIONAL_CLASSIC_CONFIG,
  template2: PROFESSIONAL_ENGINEERING_CONFIG,
  template3: ADVANCED_TWO_COLUMN_CONFIG,
  classic: CLASSIC_ATS_CONFIG,
  modern: MODERN_TECH_CONFIG,
  minimal: MINIMAL_EXECUTIVE_CONFIG,
};

/**
 * Get template configuration by ID
 */
export function getTemplateConfig(templateId: string): TemplateConfig | undefined {
  return TEMPLATE_CONFIGS[templateId];
}

/**
 * Get all available template IDs
 */
export function getAvailableTemplateIds(): string[] {
  return Object.keys(TEMPLATE_CONFIGS);
}

/**
 * Validate template configuration
 */
export function validateTemplateConfig(config: TemplateConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // A4 dimension validation
  if (config.page.width !== 794) {
    errors.push(`Invalid page width: ${config.page.width}. Must be 794px for A4.`);
  }
  if (config.page.height !== 1123) {
    errors.push(`Invalid page height: ${config.page.height}. Must be 1123px for A4.`);
  }

  // Padding validation
  const totalHorizontal = config.page.padding.left + config.page.padding.right;
  const totalVertical = config.page.padding.top + config.page.padding.bottom;
  if (totalHorizontal >= config.page.width) {
    errors.push(`Invalid horizontal padding: ${totalHorizontal}px exceeds page width.`);
  }
  if (totalVertical >= config.page.height) {
    errors.push(`Invalid vertical padding: ${totalVertical}px exceeds page height.`);
  }

  // Section order validation
  if (config.layout.sectionOrder.length === 0) {
    errors.push('Section order cannot be empty.');
  }

  // Font size validation
  if (config.typography.sizes.body < 8 || config.typography.sizes.body > 14) {
    errors.push(`Body font size ${config.typography.sizes.body}pt is outside recommended range (8-14pt).`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
