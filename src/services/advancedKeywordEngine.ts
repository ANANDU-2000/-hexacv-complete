/**
 * ADVANCED KEYWORD ENGINE
 * 
 * Enhanced keyword extraction with:
 * - N-gram analysis (1-3 word phrases)
 * - Skill normalization (synonyms, acronyms)
 * - Industry-specific parsing
 * - Weighted keyword scoring
 */

// ============== SKILL NORMALIZATION DICTIONARY ==============
// Maps canonical skill names to all variations
export const SKILL_SYNONYMS: Record<string, string[]> = {
  // Programming Languages
  'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015', 'es2020', 'es2021', 'es2022', 'vanilla js', 'vanilla javascript'],
  'typescript': ['ts', 'typescript', 'type script'],
  'python': ['python', 'python3', 'py', 'python 3'],
  'java': ['java', 'java8', 'java11', 'java17', 'jdk', 'j2ee', 'jee'],
  'c#': ['c#', 'csharp', 'c sharp', '.net c#'],
  'c++': ['c++', 'cpp', 'cplusplus', 'c plus plus'],
  'go': ['go', 'golang', 'go lang'],
  'rust': ['rust', 'rustlang', 'rust lang'],
  'ruby': ['ruby', 'rb'],
  'php': ['php', 'php7', 'php8'],
  'swift': ['swift', 'swift ui', 'swiftui'],
  'kotlin': ['kotlin', 'kt'],
  'scala': ['scala'],
  'r': ['r', 'r lang', 'rlang', 'r programming'],
  
  // Frontend Frameworks
  'react': ['react', 'reactjs', 'react.js', 'react js', 'react 18'],
  'angular': ['angular', 'angularjs', 'angular.js', 'angular 2+', 'ng'],
  'vue': ['vue', 'vuejs', 'vue.js', 'vue 3', 'vue3'],
  'svelte': ['svelte', 'sveltejs', 'sveltekit'],
  'next.js': ['next', 'nextjs', 'next.js', 'next js'],
  'nuxt': ['nuxt', 'nuxtjs', 'nuxt.js'],
  'gatsby': ['gatsby', 'gatsbyjs'],
  
  // Backend Frameworks
  'node.js': ['node', 'nodejs', 'node.js', 'node js'],
  'express': ['express', 'expressjs', 'express.js'],
  'django': ['django', 'django rest', 'drf'],
  'flask': ['flask'],
  'fastapi': ['fastapi', 'fast api'],
  'spring': ['spring', 'spring boot', 'springboot', 'spring framework'],
  'asp.net': ['asp.net', 'aspnet', 'asp net', '.net core', 'dotnet core', '.net 6', '.net 7', '.net 8'],
  'rails': ['rails', 'ruby on rails', 'ror'],
  'laravel': ['laravel', 'laravel php'],
  
  // Databases
  'postgresql': ['postgresql', 'postgres', 'psql', 'pg'],
  'mysql': ['mysql', 'mariadb'],
  'mongodb': ['mongodb', 'mongo', 'mongoose'],
  'redis': ['redis'],
  'elasticsearch': ['elasticsearch', 'elastic search', 'es', 'elk'],
  'dynamodb': ['dynamodb', 'dynamo db', 'aws dynamodb'],
  'cassandra': ['cassandra', 'apache cassandra'],
  'oracle': ['oracle', 'oracle db', 'oracle database', 'pl/sql', 'plsql'],
  'sql server': ['sql server', 'mssql', 'ms sql', 'microsoft sql'],
  
  // Cloud Platforms
  'aws': ['aws', 'amazon web services', 'amazon aws', 'ec2', 's3', 'lambda'],
  'azure': ['azure', 'microsoft azure', 'ms azure'],
  'gcp': ['gcp', 'google cloud', 'google cloud platform', 'gce'],
  'heroku': ['heroku'],
  'vercel': ['vercel'],
  'netlify': ['netlify'],
  'digitalocean': ['digitalocean', 'digital ocean', 'do'],
  
  // DevOps & Tools
  'docker': ['docker', 'dockerfile', 'docker compose', 'docker-compose'],
  'kubernetes': ['kubernetes', 'k8s', 'kube', 'kubectl', 'helm'],
  'terraform': ['terraform', 'tf', 'hcl'],
  'ansible': ['ansible'],
  'jenkins': ['jenkins', 'jenkins ci'],
  'github actions': ['github actions', 'gh actions', 'gha'],
  'gitlab ci': ['gitlab ci', 'gitlab ci/cd', 'gitlab pipelines'],
  'circleci': ['circleci', 'circle ci'],
  'ci/cd': ['ci/cd', 'cicd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery'],
  
  // AI/ML
  'machine learning': ['machine learning', 'ml', 'ml/ai'],
  'deep learning': ['deep learning', 'dl', 'neural networks', 'nn'],
  'artificial intelligence': ['artificial intelligence', 'ai'],
  'tensorflow': ['tensorflow', 'tf', 'keras'],
  'pytorch': ['pytorch', 'torch'],
  'scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
  'pandas': ['pandas', 'pd'],
  'numpy': ['numpy', 'np'],
  'natural language processing': ['nlp', 'natural language processing', 'text mining'],
  'computer vision': ['computer vision', 'cv', 'opencv', 'image processing'],
  'large language models': ['llm', 'large language models', 'gpt', 'chatgpt', 'langchain'],
  
  // Data Tools
  'apache spark': ['spark', 'apache spark', 'pyspark'],
  'apache kafka': ['kafka', 'apache kafka'],
  'apache airflow': ['airflow', 'apache airflow'],
  'hadoop': ['hadoop', 'hdfs', 'mapreduce'],
  'tableau': ['tableau'],
  'power bi': ['power bi', 'powerbi', 'pbi'],
  'looker': ['looker'],
  'dbt': ['dbt', 'data build tool'],
  
  // Testing
  'jest': ['jest'],
  'mocha': ['mocha'],
  'cypress': ['cypress'],
  'selenium': ['selenium', 'selenium webdriver'],
  'playwright': ['playwright'],
  'pytest': ['pytest', 'py.test'],
  'junit': ['junit', 'junit5'],
  
  // Version Control
  'git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
  
  // Agile/Process
  'agile': ['agile', 'agile methodology', 'agile development'],
  'scrum': ['scrum', 'scrum master', 'sprint'],
  'kanban': ['kanban', 'kanban board'],
  'jira': ['jira', 'atlassian jira'],
  'confluence': ['confluence', 'atlassian confluence'],
  
  // API
  'rest api': ['rest', 'rest api', 'restful', 'restful api'],
  'graphql': ['graphql', 'graph ql', 'apollo graphql'],
  'grpc': ['grpc', 'grpc api'],
  'websocket': ['websocket', 'websockets', 'ws', 'socket.io'],
  
  // Security
  'oauth': ['oauth', 'oauth2', 'oauth 2.0'],
  'jwt': ['jwt', 'json web token', 'json web tokens'],
  'ssl/tls': ['ssl', 'tls', 'ssl/tls', 'https'],
  'owasp': ['owasp', 'owasp top 10'],
};

// ============== INDUSTRY-SPECIFIC KEYWORDS ==============
export const INDUSTRY_KEYWORDS: Record<string, {
  technical: string[];
  tools: string[];
  concepts: string[];
  certifications: string[];
}> = {
  tech: {
    technical: [
      'microservices', 'distributed systems', 'scalability', 'high availability',
      'load balancing', 'caching', 'message queues', 'event-driven', 'serverless',
      'containerization', 'orchestration', 'api gateway', 'service mesh',
      'data structures', 'algorithms', 'system design', 'design patterns',
      'object-oriented', 'functional programming', 'test-driven development', 'tdd',
      'clean code', 'solid principles', 'dry', 'kiss'
    ],
    tools: [
      'vs code', 'intellij', 'postman', 'swagger', 'grafana', 'prometheus',
      'datadog', 'splunk', 'new relic', 'sentry', 'pagerduty'
    ],
    concepts: [
      'code review', 'pair programming', 'technical debt', 'refactoring',
      'performance optimization', 'security best practices', 'documentation'
    ],
    certifications: [
      'aws certified', 'azure certified', 'google cloud certified',
      'kubernetes certified', 'ckad', 'cka', 'terraform certified'
    ]
  },
  marketing: {
    technical: [
      'seo', 'sem', 'ppc', 'cpc', 'cpm', 'ctr', 'conversion rate', 'a/b testing',
      'marketing automation', 'lead generation', 'content marketing', 'email marketing',
      'social media marketing', 'influencer marketing', 'affiliate marketing',
      'brand awareness', 'customer acquisition', 'retention', 'churn'
    ],
    tools: [
      'google analytics', 'google ads', 'facebook ads', 'hubspot', 'marketo',
      'mailchimp', 'salesforce', 'hootsuite', 'buffer', 'semrush', 'ahrefs',
      'moz', 'canva', 'adobe creative suite'
    ],
    concepts: [
      'roi', 'roas', 'customer journey', 'funnel optimization', 'persona',
      'market research', 'competitive analysis', 'campaign management'
    ],
    certifications: [
      'google analytics certified', 'google ads certified', 'hubspot certified',
      'facebook blueprint', 'hootsuite certified'
    ]
  },
  finance: {
    technical: [
      'financial modeling', 'valuation', 'dcf', 'npv', 'irr', 'roi',
      'p&l', 'balance sheet', 'cash flow', 'budgeting', 'forecasting',
      'variance analysis', 'cost accounting', 'management accounting',
      'financial reporting', 'consolidation', 'intercompany'
    ],
    tools: [
      'excel', 'bloomberg terminal', 'factset', 'capital iq', 'refinitiv',
      'sap', 'oracle financials', 'quickbooks', 'xero', 'netsuite',
      'hyperion', 'anaplan', 'adaptive insights'
    ],
    concepts: [
      'gaap', 'ifrs', 'sox compliance', 'audit', 'internal controls',
      'risk management', 'credit analysis', 'due diligence', 'm&a'
    ],
    certifications: [
      'cpa', 'cfa', 'cma', 'cia', 'acca', 'frm', 'series 7', 'series 63'
    ]
  },
  healthcare: {
    technical: [
      'clinical workflows', 'patient care', 'diagnosis', 'treatment planning',
      'medical records', 'ehr', 'emr', 'health informatics', 'telemedicine',
      'medical coding', 'icd-10', 'cpt', 'medical billing', 'claims processing'
    ],
    tools: [
      'epic', 'cerner', 'meditech', 'allscripts', 'athenahealth',
      'practice fusion', 'kareo', 'drchrono'
    ],
    concepts: [
      'hipaa', 'patient privacy', 'clinical trials', 'fda regulations',
      'quality assurance', 'patient safety', 'care coordination',
      'population health', 'value-based care'
    ],
    certifications: [
      'rn', 'bsn', 'msn', 'np', 'pa', 'md', 'do', 'rhia', 'rhit',
      'ccs', 'cpc', 'cphims'
    ]
  },
  sales: {
    technical: [
      'pipeline management', 'lead qualification', 'prospecting', 'cold calling',
      'account management', 'territory management', 'sales forecasting',
      'quota attainment', 'deal closure', 'negotiation', 'contract management'
    ],
    tools: [
      'salesforce', 'hubspot crm', 'pipedrive', 'zoho crm', 'outreach',
      'salesloft', 'gong', 'chorus', 'linkedin sales navigator', 'zoominfo'
    ],
    concepts: [
      'b2b', 'b2c', 'saas sales', 'enterprise sales', 'inside sales',
      'solution selling', 'consultative selling', 'value selling',
      'customer success', 'upselling', 'cross-selling'
    ],
    certifications: [
      'salesforce certified', 'hubspot sales certified', 'sandler training',
      'spin selling', 'challenger sale'
    ]
  },
  operations: {
    technical: [
      'process optimization', 'lean', 'six sigma', 'kaizen', 'continuous improvement',
      'supply chain', 'logistics', 'inventory management', 'procurement',
      'vendor management', 'quality control', 'capacity planning'
    ],
    tools: [
      'sap', 'oracle', 'microsoft dynamics', 'workday', 'servicenow',
      'monday.com', 'asana', 'smartsheet', 'tableau', 'power bi'
    ],
    concepts: [
      'kpi', 'sla', 'throughput', 'cycle time', 'lead time', 'bottleneck',
      'root cause analysis', 'pareto analysis', 'process mapping'
    ],
    certifications: [
      'pmp', 'six sigma green belt', 'six sigma black belt', 'lean certified',
      'cscp', 'cpim', 'cpsm'
    ]
  }
};

// ============== N-GRAM EXTRACTION ==============
/**
 * Extract n-grams (1-3 word phrases) from text
 */
export function extractNGrams(text: string, maxN: number = 3): Map<string, number> {
  const ngrams = new Map<string, number>();
  
  // Clean and tokenize
  const cleanText = text
    .toLowerCase()
    .replace(/[^\w\s\-\.\/\+\#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(' ').filter(w => w.length > 0);
  
  // Extract n-grams for n = 1, 2, 3
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ');
      
      // Skip common stopwords for unigrams
      if (n === 1 && isStopWord(ngram)) continue;
      
      // Skip if ngram is too short
      if (ngram.length < 2) continue;
      
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }
  }
  
  return ngrams;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'also', 'now', 'here', 'there', 'then', 'once', 'always', 'never', 'ever'
]);

function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

// ============== SKILL NORMALIZATION ==============
/**
 * Normalize a skill to its canonical form
 */
export function normalizeSkill(skill: string): { canonical: string; original: string } | null {
  const lowerSkill = skill.toLowerCase().trim();
  
  for (const [canonical, variations] of Object.entries(SKILL_SYNONYMS)) {
    if (variations.some(v => v.toLowerCase() === lowerSkill)) {
      return { canonical, original: skill };
    }
  }
  
  // Return original if no match found
  return { canonical: skill, original: skill };
}

/**
 * Find all variations of a skill in text
 */
export function findSkillVariations(text: string, canonicalSkill: string): string[] {
  const variations = SKILL_SYNONYMS[canonicalSkill.toLowerCase()] || [canonicalSkill];
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const variation of variations) {
    const regex = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'gi');
    if (regex.test(lowerText)) {
      found.push(variation);
    }
  }
  
  return found;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============== JOB CATEGORY DETECTION ==============
export type JobCategory = 'tech' | 'marketing' | 'finance' | 'healthcare' | 'sales' | 'operations' | 'general';

/**
 * Detect job category from job description
 */
export function categorizeJob(description: string): { category: JobCategory; confidence: number; signals: string[] } {
  const lowerDesc = description.toLowerCase();
  const signals: string[] = [];
  const scores: Record<JobCategory, number> = {
    tech: 0,
    marketing: 0,
    finance: 0,
    healthcare: 0,
    sales: 0,
    operations: 0,
    general: 0
  };
  
  // Tech signals
  const techPatterns = [
    /software|developer|engineer|programming|code|frontend|backend|fullstack|devops|sre/gi,
    /api|database|server|cloud|aws|azure|docker|kubernetes/gi,
    /react|angular|vue|node|python|java|javascript|typescript/gi,
    /machine learning|ai|data science|ml engineer/gi
  ];
  techPatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.tech += matches.length * 2;
    if (matches.length > 0) signals.push(`Tech: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Marketing signals
  const marketingPatterns = [
    /marketing|brand|campaign|seo|sem|ppc|content|social media/gi,
    /growth|acquisition|retention|conversion|funnel|analytics/gi,
    /google analytics|hubspot|mailchimp|advertising/gi
  ];
  marketingPatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.marketing += matches.length * 2;
    if (matches.length > 0) signals.push(`Marketing: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Finance signals
  const financePatterns = [
    /finance|financial|accounting|audit|tax|budget|forecast/gi,
    /p&l|balance sheet|cash flow|valuation|investment|banking/gi,
    /cpa|cfa|gaap|ifrs|sox|compliance/gi
  ];
  financePatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.finance += matches.length * 2;
    if (matches.length > 0) signals.push(`Finance: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Healthcare signals
  const healthcarePatterns = [
    /healthcare|medical|clinical|patient|hospital|pharma/gi,
    /hipaa|ehr|emr|diagnosis|treatment|nursing/gi,
    /fda|clinical trial|medical device|health informatics/gi
  ];
  healthcarePatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.healthcare += matches.length * 2;
    if (matches.length > 0) signals.push(`Healthcare: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Sales signals
  const salesPatterns = [
    /sales|selling|revenue|quota|pipeline|prospect|lead/gi,
    /account management|territory|deal|negotiation|crm/gi,
    /b2b|b2c|saas|enterprise sales|inside sales/gi
  ];
  salesPatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.sales += matches.length * 2;
    if (matches.length > 0) signals.push(`Sales: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Operations signals
  const operationsPatterns = [
    /operations|process|supply chain|logistics|procurement/gi,
    /lean|six sigma|kaizen|continuous improvement|optimization/gi,
    /inventory|vendor|quality control|kpi|sla/gi
  ];
  operationsPatterns.forEach(pattern => {
    const matches = description.match(pattern) || [];
    scores.operations += matches.length * 2;
    if (matches.length > 0) signals.push(`Operations: found ${matches.slice(0, 3).join(', ')}`);
  });
  
  // Find highest scoring category
  const maxScore = Math.max(...Object.values(scores));
  const category = (Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'general') as JobCategory;
  
  // Calculate confidence (0-1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(maxScore / totalScore * 1.5, 1) : 0.5;
  
  return { category, confidence, signals };
}

// ============== KEYWORD SCORING ==============
export interface ScoredKeyword {
  keyword: string;
  canonical: string;
  score: number;
  weight: 'required' | 'preferred' | 'nice-to-have' | 'culture';
  frequency: number;
  section: string;
}

/**
 * Score keywords by importance in job description
 */
export function scoreKeywords(jdText: string): ScoredKeyword[] {
  const lowerJD = jdText.toLowerCase();
  const scored: ScoredKeyword[] = [];
  
  // Detect sections
  const sections = detectJDSections(jdText);
  
  // Extract n-grams
  const ngrams = extractNGrams(jdText, 3);
  
  // Score each potential keyword
  for (const [ngram, frequency] of ngrams.entries()) {
    // Skip if too common or too rare
    if (frequency < 1 || ngram.length < 2) continue;
    
    // Check if it's a known skill
    const normalized = normalizeSkill(ngram);
    if (!normalized) continue;
    
    // Determine weight based on section
    let weight: ScoredKeyword['weight'] = 'nice-to-have';
    let section = 'general';
    let baseScore = 1;
    
    // Check which section the keyword appears in
    for (const [sectionName, sectionText] of Object.entries(sections)) {
      if (sectionText.toLowerCase().includes(ngram)) {
        section = sectionName;
        
        if (sectionName === 'required' || sectionName === 'must-have') {
          weight = 'required';
          baseScore = 10;
        } else if (sectionName === 'preferred' || sectionName === 'desired') {
          weight = 'preferred';
          baseScore = 5;
        } else if (sectionName === 'nice-to-have' || sectionName === 'bonus') {
          weight = 'nice-to-have';
          baseScore = 2;
        } else if (sectionName === 'culture' || sectionName === 'values') {
          weight = 'culture';
          baseScore = 1;
        }
        break;
      }
    }
    
    // Check if it's a known technical skill (boost score)
    const isKnownSkill = Object.keys(SKILL_SYNONYMS).some(
      skill => normalized.canonical.toLowerCase() === skill.toLowerCase()
    );
    if (isKnownSkill) {
      baseScore *= 1.5;
    }
    
    const finalScore = baseScore * Math.min(frequency, 3); // Cap frequency multiplier
    
    scored.push({
      keyword: ngram,
      canonical: normalized.canonical,
      score: finalScore,
      weight,
      frequency,
      section
    });
  }
  
  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  
  // Deduplicate by canonical form, keeping highest scored
  const seen = new Set<string>();
  return scored.filter(kw => {
    const key = kw.canonical.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Detect sections in job description
 */
function detectJDSections(jdText: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Common section headers
  const sectionPatterns: Array<{ name: string; pattern: RegExp }> = [
    { name: 'required', pattern: /(?:required|must[\s-]have|minimum|essential)[\s:]*(.+?)(?=(?:preferred|nice|bonus|responsibilities|about|$))/gis },
    { name: 'preferred', pattern: /(?:preferred|desired|ideal)[\s:]*(.+?)(?=(?:required|nice|bonus|responsibilities|about|$))/gis },
    { name: 'nice-to-have', pattern: /(?:nice[\s-]to[\s-]have|bonus|plus)[\s:]*(.+?)(?=(?:required|preferred|responsibilities|about|$))/gis },
    { name: 'responsibilities', pattern: /(?:responsibilities|duties|you[\s']?(?:ll|will))[\s:]*(.+?)(?=(?:required|preferred|qualifications|about|$))/gis },
    { name: 'culture', pattern: /(?:culture|values|we[\s']?(?:re|are)|about\s+us)[\s:]*(.+?)(?=(?:required|preferred|responsibilities|$))/gis }
  ];
  
  for (const { name, pattern } of sectionPatterns) {
    const match = pattern.exec(jdText);
    if (match && match[1]) {
      sections[name] = match[1].trim();
    }
  }
  
  // If no sections detected, treat entire text as general
  if (Object.keys(sections).length === 0) {
    sections['general'] = jdText;
  }
  
  return sections;
}

// ============== ADVANCED KEYWORD EXTRACTION ==============
export interface AdvancedExtractionResult {
  keywords: ScoredKeyword[];
  category: JobCategory;
  categoryConfidence: number;
  industryKeywords: string[];
  totalScore: number;
  summary: {
    required: string[];
    preferred: string[];
    niceToHave: string[];
    culture: string[];
  };
}

/**
 * Main function: Advanced keyword extraction from job description
 */
export function extractAdvancedKeywords(jdText: string): AdvancedExtractionResult {
  // Detect job category
  const { category, confidence, signals } = categorizeJob(jdText);
  
  // Score all keywords
  const scoredKeywords = scoreKeywords(jdText);
  
  // Get industry-specific keywords
  const industryData = INDUSTRY_KEYWORDS[category] || INDUSTRY_KEYWORDS.tech;
  const industryKeywords = [
    ...industryData.technical,
    ...industryData.tools,
    ...industryData.concepts,
    ...industryData.certifications
  ].filter(kw => jdText.toLowerCase().includes(kw.toLowerCase()));
  
  // Calculate total score
  const totalScore = scoredKeywords.reduce((sum, kw) => sum + kw.score, 0);
  
  // Group by weight
  const summary = {
    required: scoredKeywords.filter(kw => kw.weight === 'required').map(kw => kw.canonical),
    preferred: scoredKeywords.filter(kw => kw.weight === 'preferred').map(kw => kw.canonical),
    niceToHave: scoredKeywords.filter(kw => kw.weight === 'nice-to-have').map(kw => kw.canonical),
    culture: scoredKeywords.filter(kw => kw.weight === 'culture').map(kw => kw.canonical)
  };
  
  return {
    keywords: scoredKeywords.slice(0, 50), // Top 50 keywords
    category,
    categoryConfidence: confidence,
    industryKeywords,
    totalScore,
    summary
  };
}

/**
 * Compare resume against advanced extracted keywords
 */
export function compareResumeAdvanced(
  resumeText: string,
  extraction: AdvancedExtractionResult
): {
  matchedKeywords: ScoredKeyword[];
  missingKeywords: ScoredKeyword[];
  matchScore: number;
  weightedScore: number;
  categoryMatch: boolean;
} {
  const lowerResume = resumeText.toLowerCase();
  const matchedKeywords: ScoredKeyword[] = [];
  const missingKeywords: ScoredKeyword[] = [];
  
  for (const keyword of extraction.keywords) {
    // Check canonical form and all variations
    const variations = SKILL_SYNONYMS[keyword.canonical.toLowerCase()] || [keyword.canonical];
    const found = variations.some(v => {
      const regex = new RegExp(`\\b${escapeRegex(v)}\\b`, 'i');
      return regex.test(lowerResume);
    });
    
    if (found) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }
  
  // Calculate scores
  const totalPossibleScore = extraction.keywords.reduce((sum, kw) => sum + kw.score, 0);
  const achievedScore = matchedKeywords.reduce((sum, kw) => sum + kw.score, 0);
  
  const matchScore = extraction.keywords.length > 0
    ? Math.round((matchedKeywords.length / extraction.keywords.length) * 100)
    : 0;
  
  const weightedScore = totalPossibleScore > 0
    ? Math.round((achievedScore / totalPossibleScore) * 100)
    : 0;
  
  // Check if resume matches detected category
  const resumeCategory = categorizeJob(resumeText);
  const categoryMatch = resumeCategory.category === extraction.category;
  
  return {
    matchedKeywords,
    missingKeywords,
    matchScore,
    weightedScore,
    categoryMatch
  };
}
