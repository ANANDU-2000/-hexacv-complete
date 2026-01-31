import { ResumeData } from './types';

// Define the categorization interface
export interface ResumeCategorization {
  primaryCategory: 'Tech' | 'Non-Tech' | 'Creative' | 'Fresher';
  specificRole: string;
  experienceLevel: 'Intern' | 'Fresher' | 'Mid' | 'Senior';
  industryType: string;
  confidence: number;
  explanation: string;
}

// Tech role keywords
const TECH_KEYWORDS = [
  'engineer', 'developer', 'programmer', 'software', 'data scientist', 
  'ml engineer', 'ai', 'devops', 'full stack', 'front end', 'back end',
  'mobile developer', 'ios developer', 'android developer', 'game developer',
  'cloud engineer', 'sre', 'site reliability', 'data analyst', 'data engineer',
  'cybersecurity', 'information security', 'qa engineer', 'test engineer',
  'automation', 'sdet', 'product manager', 'ux/ui', 'ui designer', 'ux researcher',
  'web developer', 'react', 'angular', 'node.js', 'python', 'java', 'go', 'rust',
  'machine learning', 'artificial intelligence', 'computer vision', 'nlp',
  'robotics', 'embedded systems', 'firmware', 'systems engineer', 'platform engineer'
];

// Non-tech role keywords
const NON_TECH_KEYWORDS = [
  'sales', 'marketing', 'hr', 'human resources', 'finance', 'operations', 
  'legal', 'consulting', 'business analyst', 'project manager', 'account manager',
  'recruiter', 'talent acquisition', 'customer success', 'support', 'operations',
  'business development', 'growth', 'strategy', 'product marketing', 'demand generation',
  'field marketing', 'account executive', 'bdr', 'sdr', 'sales development',
  'content marketing', 'social media', 'seo', 'sem', 'ppc', 'brand manager',
  'controller', 'cfo', 'treasury', 'fp&a', 'risk analyst', 'credit analyst',
  'investment analyst', 'equity research', 'portfolio manager', 'asset manager',
  'compliance', 'regulatory affairs', 'privacy officer', 'contract manager'
];

// Creative role keywords
const CREATIVE_KEYWORDS = [
  'designer', 'ux/ui', 'creative', 'artist', 'content writer', 'video editor',
  'motion graphics', 'graphic designer', 'visual designer', 'interaction designer',
  'product designer', 'creative director', 'art director', 'copywriter',
  'content creator', 'photographer', 'videographer', 'illustrator', 'animator',
  '3d artist', '3d modeler', 'motion designer', 'brand designer', 'typography',
  'editor', 'content strategist', 'storyteller', 'creative producer', 'artistic',
  'multimedia', 'digital art', 'concept artist', 'ui artist', 'environment artist'
];

// Fresher/entry-level keywords
const FRESHER_KEYWORDS = [
  'intern', 'trainee', 'fresher', 'graduate', 'entry-level', 'campus', 
  'student', 'junior', 'associate', 'beginner', 'starter', 'new grad',
  'fresh graduate', 'recent graduate', 'entry', 'rookie', 'novice'
];

// Industry keywords
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  'IT/Tech': ['software', 'technology', 'startup', 'tech', 'it', 'information technology', 'saas', 'paas', 'iaas'],
  'Healthcare': ['medical', 'hospital', 'pharmaceutical', 'biotech', 'healthcare', 'clinic', 'health', 'bio'],
  'Finance': ['bank', 'financial', 'investment', 'insurance', 'fintech', 'banking', 'wealth management', 'trading'],
  'Education': ['school', 'university', 'college', 'education', 'academic', 'learning', 'training', 'institute'],
  'Retail': ['retail', 'store', 'shop', 'commerce', 'e-commerce', 'mall', 'consumer goods', 'brand'],
  'Automotive': ['automotive', 'car', 'vehicle', 'auto', 'transportation', 'motor', 'dealership'],
  'Manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'assembly', 'plant', 'goods'],
  'Media': ['media', 'publishing', 'news', 'journalism', 'broadcast', 'entertainment', 'film', 'tv'],
  'Consulting': ['consulting', 'advisory', 'professional services', 'management consulting', 'strategy consulting'],
  'Government': ['government', 'public sector', 'municipal', 'federal', 'state', 'civil services', 'public administration']
};

// Experience level keywords
const EXPERIENCE_LEVEL_KEYWORDS = {
  'Intern': ['intern', 'internship', 'trainee', 'student', 'campus'],
  'Fresher': ['fresher', 'entry-level', 'entry', 'new grad', 'recent graduate', '0-1 year'],
  'Mid': ['senior', 'lead', 'principal', 'manager', 'sr.', '3-5 years', 'mid-level', 'experienced'],
  'Senior': ['senior', 'lead', 'principal', 'architect', 'director', 'vp', 'cto', '5+ years', 'expert']
};

/**
 * Analyzes resume data and categorizes it into role category, experience level, and industry type
 */
const categorizeResume = (resumeData: ResumeData): ResumeCategorization => {
  const { basics, summary, experience, skills, projects, education } = resumeData;
  
  // Combine all text for analysis
  const allText = [
    basics.targetRole.toLowerCase(),
    summary.toLowerCase(),
    ...experience.map(e => `${e.position} ${e.company} ${e.highlights.join(' ')}`),
    ...skills,
    ...projects.map(p => p.description),
    ...education.map(edu => `${edu.institution} ${edu.degree} ${edu.field || ''}`)
  ].join(' ');

  // Detect primary role category
  let primaryCategory: ResumeCategorization['primaryCategory'] = 'Tech';
  let categoryConfidence = 0;
  
  // Check for tech keywords
  const techMatches = TECH_KEYWORDS.filter(keyword => 
    allText.includes(keyword.toLowerCase())
  ).length;
  
  // Check for non-tech keywords
  const nonTechMatches = NON_TECH_KEYWORDS.filter(keyword => 
    allText.includes(keyword.toLowerCase())
  ).length;
  
  // Check for creative keywords
  const creativeMatches = CREATIVE_KEYWORDS.filter(keyword => 
    allText.includes(keyword.toLowerCase())
  ).length;
  
  // Check for fresher keywords
  const fresherMatches = FRESHER_KEYWORDS.filter(keyword => 
    allText.includes(keyword.toLowerCase())
  ).length;
  
  // Determine primary category based on matches
  const categoryScores = {
    tech: techMatches,
    nonTech: nonTechMatches,
    creative: creativeMatches,
    fresher: fresherMatches
  };
  
  const maxCategory = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0];
  const maxScore = maxCategory[1];
  
  if (maxScore === 0) {
    // If no clear match, determine based on target role
    const targetRole = basics.targetRole.toLowerCase();
    
    if (TECH_KEYWORDS.some(kw => targetRole.includes(kw))) primaryCategory = 'Tech';
    else if (NON_TECH_KEYWORDS.some(kw => targetRole.includes(kw))) primaryCategory = 'Non-Tech';
    else if (CREATIVE_KEYWORDS.some(kw => targetRole.includes(kw))) primaryCategory = 'Creative';
    else if (FRESHER_KEYWORDS.some(kw => targetRole.includes(kw))) primaryCategory = 'Fresher';
    else primaryCategory = 'Non-Tech'; // Default
    
    categoryConfidence = 70; // Lower confidence since we're guessing
  } else {
    // Assign category based on highest score
    if (maxCategory[0] === 'tech') primaryCategory = 'Tech';
    else if (maxCategory[0] === 'nonTech') primaryCategory = 'Non-Tech';
    else if (maxCategory[0] === 'creative') primaryCategory = 'Creative';
    else primaryCategory = 'Fresher';
    
    // Calculate confidence based on ratio of matches
    const totalMatches = techMatches + nonTechMatches + creativeMatches + fresherMatches;
    categoryConfidence = Math.min(100, Math.floor((maxScore / totalMatches) * 100));
  }

  // Identify specific role
  const targetRole = basics.targetRole || 'Not specified';
  const specificRole = normalizeRole(targetRole);

  // Determine experience level
  let experienceLevel: ResumeCategorization['experienceLevel'] = 'Fresher';
  let expLevelConfidence = 0;
  
  // Calculate years of experience based on education and work history
  const yearsOfExperience = calculateYearsOfExperience(resumeData);
  
  if (yearsOfExperience <= 0.5) {
    experienceLevel = 'Fresher';
    expLevelConfidence = 90;
  } else if (yearsOfExperience <= 2) {
    experienceLevel = 'Fresher';
    expLevelConfidence = 80;
  } else if (yearsOfExperience <= 5) {
    experienceLevel = 'Mid';
    expLevelConfidence = 85;
  } else {
    experienceLevel = 'Senior';
    expLevelConfidence = 80;
  }
  
  // Check for intern positions specifically
  if (experience.some(exp => 
    EXPERIENCE_LEVEL_KEYWORDS.Intern.some(keyword => 
      exp.position.toLowerCase().includes(keyword)
    )
  )) {
    experienceLevel = 'Intern';
    expLevelConfidence = 95;
  }

  // Determine industry type
  let industryType = 'General';
  let industryConfidence = 0;
  
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const matches = keywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    ).length;
    
    if (matches > 0) {
      industryType = industry;
      industryConfidence = Math.min(100, matches * 20); // Increase confidence with more matches
      break;
    }
  }
  
  // If no industry matched, try to infer from company names
  if (industryType === 'General') {
    const companyNames = experience.map(exp => exp.company.toLowerCase());
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      for (const company of companyNames) {
        if (keywords.some(keyword => company.includes(keyword))) {
          industryType = industry;
          industryConfidence = 70;
          break;
        }
      }
      if (industryConfidence > 0) break;
    }
  }

  // Calculate overall confidence as average of all confidences
  const overallConfidence = Math.round((categoryConfidence + expLevelConfidence + industryConfidence) / 3);

  return {
    primaryCategory,
    specificRole,
    experienceLevel,
    industryType,
    confidence: overallConfidence,
    explanation: `Detected as ${primaryCategory} role (${experienceLevel} level) in ${industryType} industry based on skills and experience patterns`
  };
};

/**
 * Normalizes role names to standard categories
 */
const normalizeRole = (role: string): string => {
  const lowerRole = role.toLowerCase();
  
  // Common role mappings
  const roleMappings: Record<string, string> = {
    'software engineer': 'Software Engineer',
    'frontend developer': 'Frontend Developer',
    'backend developer': 'Backend Developer',
    'full stack developer': 'Full Stack Developer',
    'data scientist': 'Data Scientist',
    'data engineer': 'Data Engineer',
    'product manager': 'Product Manager',
    'ux designer': 'UX Designer',
    'ui designer': 'UI Designer',
    'product designer': 'Product Designer',
    'sales manager': 'Sales Manager',
    'marketing manager': 'Marketing Manager',
    'hr manager': 'HR Manager',
    'business analyst': 'Business Analyst',
    'project manager': 'Project Manager',
    'devops engineer': 'DevOps Engineer',
    'qa engineer': 'QA Engineer',
    'technical lead': 'Technical Lead',
    'team lead': 'Team Lead',
    'engineering manager': 'Engineering Manager',
    'senior software engineer': 'Senior Software Engineer',
    'junior software engineer': 'Junior Software Engineer',
    'intern': 'Intern',
    'fresher': 'Fresher',
    'student': 'Student'
  };

  // Check for exact matches first
  const normalizedRole = roleMappings[lowerRole];
  if (normalizedRole) return normalizedRole;

  // Check for partial matches
  for (const [key, value] of Object.entries(roleMappings)) {
    if (lowerRole.includes(key) || key.includes(lowerRole.split(' ')[0])) {
      return value;
    }
  }

  // Return original role with proper capitalization if no match
  return role.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Calculates years of experience based on resume data
 */
const calculateYearsOfExperience = (resumeData: ResumeData): number => {
  // For now, we'll use a simplified calculation
  // In a real implementation, we would parse dates and calculate actual years
  
  // Count number of experience entries as a proxy for experience
  const expCount = resumeData.experience.length;
  
  // Estimate based on number of roles and education
  let estimatedYears = 0;
  
  if (expCount === 0) {
    // No experience, likely a fresher or student
    estimatedYears = 0;
  } else if (expCount === 1) {
    // Single role - could be 0-2 years
    estimatedYears = 1;
  } else if (expCount === 2) {
    // Two roles - likely 2-4 years
    estimatedYears = 2.5;
  } else if (expCount <= 4) {
    // 3-4 roles - likely 3-6 years
    estimatedYears = 4;
  } else {
    // More roles - likely 5+ years
    estimatedYears = 6;
  }
  
  // Add to estimate if education suggests seniority
  const hasAdvancedDegree = resumeData.education.some(edu => 
    edu.degree.toLowerCase().includes('master') || 
    edu.degree.toLowerCase().includes('phd')
  );
  
  if (hasAdvancedDegree) {
    estimatedYears += 1.5; // Advanced degrees often correlate with more experience
  }
  
  return estimatedYears;
};

/**
 * Extracts keywords from job description
 */
const extractKeywordsFromJD = (jobDescription: string): string[] => {
  // Simple keyword extraction - in a real implementation, this would use NLP
  const text = jobDescription.toLowerCase();
  
  // Look for common skill patterns in job descriptions
  const skillPatterns = [
    /proficiency in ([^.,]+)/gi,
    /experience with ([^.,]+)/gi,
    /knowledge of ([^.,]+)/gi,
    /familiarity with ([^.,]+)/gi,
    /skills in ([^.,]+)/gi,
    /experience in ([^.,]+)/gi,
    /technologies?: ([^.,]+)/gi,
    /tools?: ([^.,]+)/gi,
    /requirements?: ([^.,]+)/gi,
    /qualifications?: ([^.,]+)/gi
  ];
  
  const keywords: string[] = [];
  
  // Extract keywords based on patterns
  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const phrase = match[1].trim();
      
      // Split by commas and 'and' to get individual skills
      const potentialSkills = phrase
        .split(/[,;&]| and | or /)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 2 && skill.length < 50); // Filter out very short or long phrases
      
      keywords.push(...potentialSkills);
    }
  }
  
  // Also extract technical skills that appear frequently in job descriptions
  const techSkills = [
    'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node.js', 'sql',
    'mongodb', 'postgresql', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'agile', 'scrum', 'ci/cd', 'git', 'html', 'css', 'sass', 'typescript',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', '.net', 'c#', 'c++',
    'machine learning', 'data science', 'ai', 'nlp', 'computer vision',
    'seo', 'analytics', 'crm', 'salesforce', 'sap', 'tableau', 'power bi'
  ];
  
  for (const skill of techSkills) {
    if (text.includes(skill)) {
      keywords.push(skill);
    }
  }
  
  // Remove duplicates and return
  return Array.from(new Set(keywords.map(kw => kw.trim())))
    .filter(kw => kw.length > 0)
    .slice(0, 20); // Limit to top 20 keywords
};

/**
 * Recommends templates based on categorization
 */
const recommendTemplates = (categorization: ResumeCategorization): string[] => {
  // Template recommendations based on role category and experience level
  const recommendations: string[] = [];
  
  // Tech roles
  if (categorization.primaryCategory === 'Tech') {
    if (categorization.experienceLevel === 'Senior') {
      recommendations.push('tech', 'modern', 'executive', 'professional');
    } else if (categorization.experienceLevel === 'Mid') {
      recommendations.push('tech', 'modern', 'professional', 'classic');
    } else {
      recommendations.push('tech', 'modern', 'minimal', 'classic');
    }
  }
  // Creative roles
  else if (categorization.primaryCategory === 'Creative') {
    if (categorization.experienceLevel === 'Senior') {
      recommendations.push('elegant', 'modern', 'executive', 'creative-pro');
    } else {
      recommendations.push('elegant', 'modern', 'creative-pro', 'minimal');
    }
  }
  // Non-tech roles
  else if (categorization.primaryCategory === 'Non-Tech') {
    if (categorization.experienceLevel === 'Senior') {
      recommendations.push('executive', 'professional', 'classic', 'elegant');
    } else {
      recommendations.push('professional', 'classic', 'elegant', 'modern');
    }
  }
  // Fresher roles
  else {
    recommendations.push('modern', 'minimal', 'classic', 'compact');
  }
  
  // Add industry-specific templates if applicable
  if (categorization.industryType === 'IT/Tech') {
    recommendations.unshift('tech'); // Prioritize tech template
  } else if (categorization.industryType === 'Healthcare') {
    recommendations.unshift('professional', 'clean'); // Prioritize clean, professional
  } else if (categorization.industryType === 'Finance') {
    recommendations.unshift('executive', 'professional'); // Prioritize formal templates
  }
  
  // Remove duplicates while preserving order
  return Array.from(new Set(recommendations)).slice(0, 5);
};

/**
 * Saves categorized insights locally (no backend)
 */
const saveCategorizedInsights = async (insights: {
  sessionId: string;
  detectedRoleCategory: string;
  detectedSpecificRole: string;
  experienceLevel: string;
  industryType: string;
  jdKeywords: string[];
  recommendedTemplates: string[];
  selectedTemplate: string;
  atsScoreRange: [number, number];
  sessionStatus: 'drop' | 'export' | 'complete';
  stepReached: 'editor' | 'template' | 'finalize';
  timestamp: Date;
}) => {
  try {
    // Store locally only - no backend calls (zero cost)
    const stored = JSON.parse(localStorage.getItem('hexacv_insights') || '[]');
    stored.push({
      ...insights,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 entries
    if (stored.length > 50) stored.splice(0, stored.length - 50);
    localStorage.setItem('hexacv_insights', JSON.stringify(stored));
    return { success: true };
  } catch (error) {
    // Silently fail to avoid disrupting the user experience
    return { success: false, error: (error as Error).message };
  }
};

export {
  categorizeResume,
  saveCategorizedInsights,
  extractKeywordsFromJD,
  recommendTemplates
};

/**
 * Enhanced categorization with intelligence visibility
 */
export interface IntelligenceVisibility {
  roleDetection: {
    detected: string;
    confidence: number;
    basis: string;
  };
  experienceLevel: {
    inferred: string;
    confidence: number;
    basis: string;
  };
  industryType: {
    identified: string;
    confidence: number;
    basis: string;
  };
  jdEmphasis: {
    primary: string;
    secondary: string;
    basis: string;
  };
  riskFactors: string[];
}

/**
 * Generate intelligence visibility report for Step-2 UX
 */
export const generateIntelligenceReport = (resumeData: ResumeData, jobDescription?: string): IntelligenceVisibility => {
  const categorization = categorizeResume(resumeData);
  
  // Analyze job description if provided
  let jdEmphasis = {
    primary: 'skills',
    secondary: 'experience',
    basis: 'Default emphasis'
  };
  
  if (jobDescription) {
    const jdKeywords = extractKeywordsFromJD(jobDescription);
    const skillKeywords = jdKeywords.filter(kw => TECH_KEYWORDS.some(tech => kw.toLowerCase().includes(tech)));
    const experienceKeywords = jdKeywords.filter(kw => 
      NON_TECH_KEYWORDS.some(nontech => kw.toLowerCase().includes(nontech)) ||
      FRESHER_KEYWORDS.some(fresher => kw.toLowerCase().includes(fresher))
    );
    
    if (skillKeywords.length > experienceKeywords.length) {
      jdEmphasis = {
        primary: 'skills',
        secondary: 'experience',
        basis: `Job description emphasizes ${skillKeywords.length} technical skills vs ${experienceKeywords.length} experience terms`
      };
    } else {
      jdEmphasis = {
        primary: 'experience',
        secondary: 'skills',
        basis: `Job description emphasizes ${experienceKeywords.length} experience terms vs ${skillKeywords.length} technical skills`
      };
    }
  }
  
  // Identify risk factors
  const riskFactors: string[] = [];
  
  // Check for skill gaps
  if (resumeData.skills.length < 5) {
    riskFactors.push('Limited skill set may reduce ATS matching');
  }
  
  // Check for experience gaps
  if (resumeData.experience.length === 0 && categorization.experienceLevel !== 'Fresher') {
    riskFactors.push('No work experience listed despite non-fresher categorization');
  }
  
  // Check for education gaps
  if (resumeData.education.length === 0 && categorization.experienceLevel === 'Fresher') {
    riskFactors.push('No education information for fresher profile');
  }
  
  return {
    roleDetection: {
      detected: `${categorization.specificRole} (${categorization.primaryCategory})`,
      confidence: categorization.confidence,
      basis: categorization.explanation
    },
    experienceLevel: {
      inferred: categorization.experienceLevel,
      confidence: categorization.confidence,
      basis: `Based on work history patterns and role requirements`
    },
    industryType: {
      identified: categorization.industryType,
      confidence: 75, // Estimated confidence
      basis: `Inferred from company names and role context`
    },
    jdEmphasis: jdEmphasis,
    riskFactors
  };
};