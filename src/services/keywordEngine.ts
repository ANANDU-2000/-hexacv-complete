/**
 * KEYWORD EXTRACTION ENGINE
 * 
 * Pure rule-based keyword extraction with optional AI enhancement
 * No fake scores, no predictions, honest outputs only
 */

// Comprehensive skill dictionaries
const TECHNICAL_SKILLS = [
  // Programming Languages
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
  // Frontend
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui', 'chakra',
  // Backend
  'node.js', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring', 'spring boot', '.net', 'asp.net', 'rails', 'laravel', 'gin', 'fiber',
  // Databases
  'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'graphql',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions', 'gitlab ci', 'circleci',
  // AI/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision', 'llm', 'rag', 'langchain', 'huggingface', 'transformers',
  // Data
  'data analysis', 'data science', 'data engineering', 'etl', 'spark', 'hadoop', 'airflow', 'kafka', 'tableau', 'power bi', 'looker', 'dbt',
  // Mobile
  'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic',
  // Tools
  'git', 'jira', 'confluence', 'figma', 'sketch', 'postman', 'swagger', 'linux', 'unix', 'vim', 'vscode'
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving', 'problem-solving', 'critical thinking', 'analytical', 'detail-oriented', 'detail oriented',
  'project management', 'time management', 'agile', 'scrum', 'kanban', 'stakeholder management', 'cross-functional', 'mentoring', 'coaching',
  'presentation', 'negotiation', 'conflict resolution', 'adaptability', 'creativity', 'innovation', 'strategic thinking', 'decision making'
];

const ROLE_KEYWORDS = [
  'software engineer', 'software developer', 'frontend', 'front-end', 'backend', 'back-end', 'full stack', 'fullstack', 'devops', 'sre', 'site reliability',
  'data scientist', 'data analyst', 'data engineer', 'ml engineer', 'machine learning engineer', 'ai engineer',
  'product manager', 'project manager', 'scrum master', 'tech lead', 'engineering manager', 'architect', 'solution architect',
  'qa engineer', 'test engineer', 'automation engineer', 'security engineer', 'cloud engineer', 'platform engineer'
];

const BUSINESS_TERMS = [
  'revenue', 'roi', 'kpi', 'metrics', 'growth', 'optimization', 'efficiency', 'scalability', 'performance', 'reliability',
  'compliance', 'gdpr', 'hipaa', 'soc2', 'pci', 'security', 'audit', 'governance',
  'b2b', 'b2c', 'saas', 'startup', 'enterprise', 'stakeholder', 'customer', 'user experience', 'ux'
];

export interface ExtractedKeywords {
  skills: string[];
  tools: string[];
  technologies: string[];
  softSkills: string[];
  roleKeywords: string[];
  businessTerms: string[];
  allKeywords: string[];
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  category: 'skill' | 'tool' | 'soft' | 'role' | 'business';
}

export interface ComparisonResult {
  matched: KeywordMatch[];
  missing: KeywordMatch[];
  overused: string[];
  matchedCount: number;
  totalKeywords: number;
}

/**
 * Extract keywords from job description text
 * Pure rule-based extraction - no AI, no fake scores
 */
export function extractKeywordsFromJD(text: string): ExtractedKeywords {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/[\s,;.!?()\[\]{}'"]+/).filter(w => w.length > 1);
  
  const found = {
    skills: new Set<string>(),
    tools: new Set<string>(),
    technologies: new Set<string>(),
    softSkills: new Set<string>(),
    roleKeywords: new Set<string>(),
    businessTerms: new Set<string>()
  };

  // Match technical skills (also categorize as tools/technologies)
  TECHNICAL_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.skills.add(skill);
      // Categorize
      if (['docker', 'kubernetes', 'git', 'jenkins', 'terraform', 'ansible', 'jira', 'confluence', 'figma', 'postman'].some(t => skill.includes(t))) {
        found.tools.add(skill);
      } else {
        found.technologies.add(skill);
      }
    }
  });

  // Match soft skills
  SOFT_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.softSkills.add(skill);
    }
  });

  // Match role keywords
  ROLE_KEYWORDS.forEach(role => {
    const regex = new RegExp(`\\b${role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.roleKeywords.add(role);
    }
  });

  // Match business terms
  BUSINESS_TERMS.forEach(term => {
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) {
      found.businessTerms.add(term);
    }
  });

  // Extract years of experience patterns
  const expPatterns = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/gi) || [];
  
  const allKeywords = [
    ...found.skills,
    ...found.softSkills,
    ...found.roleKeywords,
    ...found.businessTerms
  ];

  return {
    skills: Array.from(found.skills),
    tools: Array.from(found.tools),
    technologies: Array.from(found.technologies),
    softSkills: Array.from(found.softSkills),
    roleKeywords: Array.from(found.roleKeywords),
    businessTerms: Array.from(found.businessTerms),
    allKeywords: [...new Set(allKeywords)]
  };
}

/**
 * Compare resume against job description keywords
 * Returns matched, missing, and overused keywords
 */
export function compareResumeToJD(resumeText: string, jdKeywords: ExtractedKeywords): ComparisonResult {
  const lowerResume = resumeText.toLowerCase();
  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];
  
  // Check each keyword category
  const checkKeyword = (keyword: string, category: KeywordMatch['category']) => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const isFound = regex.test(lowerResume);
    const match: KeywordMatch = { keyword, found: isFound, category };
    if (isFound) {
      matched.push(match);
    } else {
      missing.push(match);
    }
  };

  jdKeywords.skills.forEach(k => checkKeyword(k, 'skill'));
  jdKeywords.softSkills.forEach(k => checkKeyword(k, 'soft'));
  jdKeywords.roleKeywords.forEach(k => checkKeyword(k, 'role'));
  jdKeywords.businessTerms.forEach(k => checkKeyword(k, 'business'));

  // Find overused words (appears 5+ times)
  const wordCounts: Record<string, number> = {};
  const resumeWords = lowerResume.split(/\s+/);
  resumeWords.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  const overused = Object.entries(wordCounts)
    .filter(([word, count]) => count >= 5 && !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'been'].includes(word))
    .map(([word]) => word);

  return {
    matched,
    missing,
    overused,
    matchedCount: matched.length,
    totalKeywords: matched.length + missing.length
  };
}

/**
 * Analyze job description for role type and seniority
 */
export interface JDAnalysis {
  roleType: string;
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'unknown';
  senioritySignals: string[];
  coreSkills: string[];
  niceToHave: string[];
  responsibilities: string[];
}

export function analyzeJobDescription(text: string): JDAnalysis {
  const lowerText = text.toLowerCase();
  
  // Detect role type
  let roleType = 'General';
  if (/frontend|front-end|react|angular|vue|ui/i.test(text)) roleType = 'Frontend Developer';
  else if (/backend|back-end|api|server|microservice/i.test(text)) roleType = 'Backend Developer';
  else if (/full.?stack|fullstack/i.test(text)) roleType = 'Full Stack Developer';
  else if (/data\s*scientist|machine\s*learning|ml\s*engineer|ai\s*engineer/i.test(text)) roleType = 'ML/AI Engineer';
  else if (/data\s*analyst|analytics|bi\s*analyst/i.test(text)) roleType = 'Data Analyst';
  else if (/data\s*engineer|etl|pipeline/i.test(text)) roleType = 'Data Engineer';
  else if (/devops|sre|infrastructure|platform/i.test(text)) roleType = 'DevOps/Platform Engineer';
  else if (/product\s*manager|pm\b/i.test(text)) roleType = 'Product Manager';
  else if (/qa|quality|test\s*engineer|automation/i.test(text)) roleType = 'QA Engineer';
  else if (/security|cybersecurity|infosec/i.test(text)) roleType = 'Security Engineer';

  // Detect seniority
  let seniorityLevel: JDAnalysis['seniorityLevel'] = 'unknown';
  const senioritySignals: string[] = [];
  
  if (/\bsenior\b|\bsr\.?\b|\bstaff\b|\bprincipal\b/i.test(text)) {
    seniorityLevel = 'senior';
    senioritySignals.push('Title contains senior/staff/principal');
  } else if (/\blead\b|\bmanager\b|\bdirector\b|\bhead\s+of\b/i.test(text)) {
    seniorityLevel = 'lead';
    senioritySignals.push('Leadership role indicated');
  } else if (/\bjunior\b|\bentry\b|\bgraduate\b|\bintern\b|\b0-2\s*years?\b/i.test(text)) {
    seniorityLevel = 'entry';
    senioritySignals.push('Entry-level indicators');
  } else if (/\b[3-5]\+?\s*years?\b/i.test(text)) {
    seniorityLevel = 'mid';
    senioritySignals.push('3-5 years experience required');
  } else if (/\b[6-9]\+?\s*years?\b|\b10\+?\s*years?\b/i.test(text)) {
    seniorityLevel = 'senior';
    senioritySignals.push('6+ years experience required');
  }

  // Additional signals
  if (/mentor|coach|guide\s+team/i.test(text)) senioritySignals.push('Mentorship responsibilities');
  if (/architect|design\s+system|technical\s+direction/i.test(text)) senioritySignals.push('Architecture responsibilities');
  if (/cross-functional|stakeholder/i.test(text)) senioritySignals.push('Cross-functional collaboration');

  // Extract core skills (required section)
  const coreSkills: string[] = [];
  const niceToHave: string[] = [];
  
  const keywords = extractKeywordsFromJD(text);
  
  // Check if skills appear in "required" vs "nice to have" sections
  const requiredSection = text.match(/required|must\s+have|minimum|essential/gi);
  const niceSection = text.match(/nice\s+to\s+have|preferred|bonus|plus/gi);
  
  keywords.skills.forEach(skill => {
    // Simple heuristic: if skill appears before "nice to have", it's core
    const skillIndex = lowerText.indexOf(skill);
    const niceIndex = lowerText.search(/nice\s+to\s+have|preferred|bonus/i);
    
    if (niceIndex > 0 && skillIndex > niceIndex) {
      niceToHave.push(skill);
    } else {
      coreSkills.push(skill);
    }
  });

  // Extract responsibilities (bullet points with action verbs)
  const responsibilities: string[] = [];
  const bullets = text.match(/[•\-\*]\s*[A-Z][^•\-\*\n]+/g) || [];
  bullets.slice(0, 5).forEach(bullet => {
    const cleaned = bullet.replace(/^[•\-\*]\s*/, '').trim();
    if (cleaned.length > 10 && cleaned.length < 200) {
      responsibilities.push(cleaned);
    }
  });

  return {
    roleType,
    seniorityLevel,
    senioritySignals,
    coreSkills: coreSkills.slice(0, 15),
    niceToHave: niceToHave.slice(0, 10),
    responsibilities
  };
}

/**
 * Check resume sections and structure
 */
export interface SectionCheck {
  section: string;
  present: boolean;
  warning?: string;
}

export interface StructureAnalysis {
  sections: SectionCheck[];
  warnings: string[];
  suggestions: string[];
}

export function checkResumeStructure(text: string): StructureAnalysis {
  const lowerText = text.toLowerCase();
  const sections: SectionCheck[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for standard sections
  const sectionPatterns: Array<{ name: string; patterns: RegExp[]; required: boolean }> = [
    { name: 'Contact Information', patterns: [/email|phone|linkedin|@|\.com/i], required: true },
    { name: 'Summary/Objective', patterns: [/summary|objective|profile|about/i], required: false },
    { name: 'Experience', patterns: [/experience|employment|work\s*history/i], required: true },
    { name: 'Education', patterns: [/education|degree|university|college|bachelor|master/i], required: true },
    { name: 'Skills', patterns: [/skills|technologies|technical|competencies/i], required: true },
    { name: 'Projects', patterns: [/projects|portfolio/i], required: false },
    { name: 'Certifications', patterns: [/certification|certified|certificate/i], required: false }
  ];

  sectionPatterns.forEach(({ name, patterns, required }) => {
    const present = patterns.some(p => p.test(text));
    sections.push({ 
      section: name, 
      present,
      warning: !present && required ? `Missing ${name} section` : undefined
    });
    
    if (!present && required) {
      warnings.push(`Missing ${name} section - most ATS systems expect this`);
    }
  });

  // Check for common ATS issues
  if (/\.(jpg|jpeg|png|gif|bmp)/i.test(text)) {
    warnings.push('Images detected - ATS cannot read embedded images');
  }
  
  if (text.includes('|') && (text.match(/\|/g) || []).length > 10) {
    warnings.push('Heavy use of pipe characters - may cause ATS parsing issues');
  }

  if (/[^\x00-\x7F]/.test(text) && (text.match(/[^\x00-\x7F]/g) || []).length > 5) {
    warnings.push('Special characters detected - some ATS may not parse correctly');
  }

  // Check for tables (multiple consecutive tabs/spaces)
  if (/\t{2,}|\s{4,}/g.test(text)) {
    suggestions.push('Complex formatting detected - consider using simple single-column layout');
  }

  // Length check
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) {
    suggestions.push('Resume appears short - consider adding more detail');
  } else if (wordCount > 1000) {
    suggestions.push('Resume appears long - consider condensing to 1-2 pages');
  }

  // Check for dates
  if (!/\b(19|20)\d{2}\b/.test(text)) {
    warnings.push('No dates found - include dates for experience and education');
  }

  return { sections, warnings, suggestions };
}

/**
 * Improve a resume bullet point (rule-based, no AI)
 * STRICT: Same meaning, same experience level, no fabrication
 */
export function improveBullet(bullet: string, targetRole?: string): { original: string; improved: string; changes: string[] } {
  let improved = bullet.trim();
  const changes: string[] = [];
  
  // Remove leading bullet characters
  improved = improved.replace(/^[\-\•\*\○\◦]\s*/, '');
  
  // Capitalize first letter
  if (improved[0] && improved[0] !== improved[0].toUpperCase()) {
    improved = improved[0].toUpperCase() + improved.slice(1);
    changes.push('Capitalized first letter');
  }
  
  // Replace weak verbs with stronger alternatives (same meaning)
  const verbReplacements: Record<string, string> = {
    'worked on': 'Contributed to',
    'helped with': 'Supported',
    'was responsible for': 'Managed',
    'was in charge of': 'Led',
    'did': 'Performed',
    'made': 'Created',
    'used': 'Utilized',
    'got': 'Achieved'
  };
  
  Object.entries(verbReplacements).forEach(([weak, strong]) => {
    const regex = new RegExp(`^${weak}\\b`, 'i');
    if (regex.test(improved)) {
      improved = improved.replace(regex, strong);
      changes.push(`Replaced "${weak}" with "${strong}"`);
    }
  });
  
  // Ensure starts with action verb
  const actionVerbs = ['Led', 'Developed', 'Created', 'Built', 'Designed', 'Implemented', 'Managed', 'Achieved', 'Improved', 'Reduced', 'Increased', 'Delivered', 'Coordinated', 'Analyzed', 'Supported', 'Maintained'];
  const startsWithAction = actionVerbs.some(verb => improved.toLowerCase().startsWith(verb.toLowerCase()));
  
  if (!startsWithAction && !improved.match(/^[A-Z][a-z]+ed\b/)) {
    // Only suggest, don't auto-change
    changes.push('Consider starting with a strong action verb');
  }
  
  // Remove filler words
  const fillerPatterns = [
    /\bvarious\b/gi,
    /\bbasically\b/gi,
    /\bactually\b/gi,
    /\bjust\b/gi,
    /\breally\b/gi
  ];
  
  fillerPatterns.forEach(pattern => {
    if (pattern.test(improved)) {
      improved = improved.replace(pattern, '').replace(/\s+/g, ' ');
      changes.push('Removed filler word');
    }
  });
  
  // Clean up extra spaces
  improved = improved.replace(/\s+/g, ' ').trim();
  
  // Ensure ends with period
  if (improved && !improved.match(/[.!?]$/)) {
    improved += '.';
  }

  return {
    original: bullet,
    improved,
    changes: changes.length > 0 ? changes : ['No significant changes needed']
  };
}
