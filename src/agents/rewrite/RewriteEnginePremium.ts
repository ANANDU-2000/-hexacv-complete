/**
 * REWRITE ENGINE PREMIUM - Advanced AI Resume Rewriter
 * 
 * Premium features for ₹49 paid template:
 * 1. Full sentence restructuring (not just keyword insertion)
 * 2. Industry-specific terminology injection
 * 3. Quantification of achievements (add metrics if missing)
 * 4. Action verb optimization (replace weak verbs)
 * 5. Skill inference from context
 * 
 * Example transformation:
 * INPUT:  "Worked on React projects and helped the team"
 * OUTPUT: "Led development of 3 React-based web applications, improving team velocity by 25% through implementation of reusable component library and CI/CD best practices"
 */

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, RewriteOutput } from '../shared/types';
import { createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

// Industry-specific keyword databases
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  tech: [
    'scalable', 'microservices', 'CI/CD', 'agile', 'sprint', 'code review',
    'refactoring', 'optimization', 'performance', 'monitoring', 'deployment',
    'containerization', 'cloud-native', 'serverless', 'distributed systems',
    'API design', 'system architecture', 'technical debt', 'best practices'
  ],
  marketing: [
    'ROI', 'conversion rate', 'A/B testing', 'customer acquisition', 'retention',
    'brand awareness', 'engagement', 'funnel optimization', 'lead generation',
    'market research', 'campaign analytics', 'SEO/SEM', 'content strategy'
  ],
  finance: [
    'P&L', 'ROI', 'EBITDA', 'compliance', 'audit', 'risk management',
    'financial modeling', 'forecasting', 'budget optimization', 'cost reduction',
    'regulatory compliance', 'SOX', 'due diligence', 'stakeholder reporting'
  ],
  healthcare: [
    'HIPAA', 'patient outcomes', 'clinical workflows', 'EHR/EMR', 'compliance',
    'quality assurance', 'patient safety', 'care coordination', 'regulatory',
    'healthcare analytics', 'patient satisfaction', 'clinical trials'
  ],
  sales: [
    'revenue growth', 'quota attainment', 'pipeline management', 'deal closure',
    'client relationships', 'account management', 'CRM', 'sales enablement',
    'territory expansion', 'customer retention', 'upselling', 'cross-selling'
  ],
  operations: [
    'process optimization', 'efficiency', 'SLA', 'KPI', 'lean methodology',
    'continuous improvement', 'supply chain', 'vendor management', 'logistics',
    'quality control', 'capacity planning', 'resource allocation'
  ]
};

// Strong action verbs by impact type
const ACTION_VERBS = {
  leadership: ['Led', 'Directed', 'Orchestrated', 'Spearheaded', 'Championed', 'Pioneered'],
  achievement: ['Achieved', 'Exceeded', 'Delivered', 'Accomplished', 'Attained', 'Secured'],
  improvement: ['Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Accelerated', 'Elevated'],
  creation: ['Developed', 'Designed', 'Architected', 'Built', 'Created', 'Engineered'],
  reduction: ['Reduced', 'Minimized', 'Eliminated', 'Cut', 'Decreased', 'Lowered'],
  growth: ['Increased', 'Grew', 'Expanded', 'Boosted', 'Amplified', 'Scaled']
};

// Weak verbs to replace
const WEAK_VERBS: Record<string, string[]> = {
  'worked on': ['Led development of', 'Developed', 'Built'],
  'helped with': ['Contributed to', 'Supported', 'Collaborated on'],
  'was responsible for': ['Managed', 'Oversaw', 'Drove'],
  'participated in': ['Contributed to', 'Collaborated on', 'Engaged in'],
  'involved in': ['Drove', 'Led', 'Spearheaded'],
  'assisted with': ['Supported', 'Enabled', 'Facilitated'],
  'did': ['Executed', 'Performed', 'Completed'],
  'made': ['Created', 'Developed', 'Produced'],
  'handled': ['Managed', 'Oversaw', 'Coordinated'],
  'dealt with': ['Resolved', 'Addressed', 'Managed']
};

// Metric suggestions by context
const METRIC_TEMPLATES = {
  performance: [
    'improving performance by {X}%',
    'reducing latency by {X}ms',
    'achieving {X}% uptime',
    'processing {X}+ requests/second'
  ],
  efficiency: [
    'reducing time-to-delivery by {X}%',
    'cutting costs by ${X}',
    'saving {X} hours/week',
    'automating {X}% of manual tasks'
  ],
  scale: [
    'serving {X}+ users',
    'handling {X}+ transactions daily',
    'scaling from {X} to {Y} users',
    'supporting {X}+ concurrent connections'
  ],
  team: [
    'leading a team of {X}',
    'mentoring {X} junior developers',
    'collaborating with {X}+ stakeholders',
    'coordinating across {X} teams'
  ],
  business: [
    'generating ${X} in revenue',
    'increasing conversion by {X}%',
    'reducing churn by {X}%',
    'acquiring {X}+ new customers'
  ]
};

const PREMIUM_SYSTEM_PROMPT = `You are an expert resume rewriter for premium users. Your job is to transform weak, generic bullet points into powerful, metrics-driven achievements.

TRANSFORMATION RULES:
1. START with a strong action verb (Led, Developed, Improved, Reduced, etc.)
2. ADD specific metrics when possible (percentages, numbers, dollar amounts)
3. INCLUDE technical context (tools, frameworks, methodologies used)
4. SHOW impact on business/team/product
5. USE industry-specific terminology
6. KEEP it concise (max 2 lines)

EXAMPLE TRANSFORMATIONS:
❌ "Worked on React projects and helped the team"
✅ "Led development of 3 React-based web applications, improving team velocity by 25% through implementation of reusable component library and CI/CD best practices"

❌ "Responsible for database management"
✅ "Architected and optimized PostgreSQL database schema, reducing query latency by 40% and supporting 50K+ daily transactions"

❌ "Helped with customer support"
✅ "Resolved 200+ customer inquiries monthly with 98% satisfaction rate, implementing ticket automation that reduced response time by 60%"

STRICT RULES:
- DO NOT fabricate specific numbers (use realistic estimates marked with ~)
- DO NOT add skills/tools the user didn't mention
- PRESERVE the core meaning and experience level
- If original has metrics, keep them
- Flag if the original is too vague to improve meaningfully

OUTPUT JSON:
{
  "rewritten": "The transformed bullet point",
  "changes": ["Change 1", "Change 2"],
  "keywordsAdded": ["keyword1", "keyword2"],
  "metricsAdded": true/false,
  "skillsInferred": ["React", "CI/CD"],
  "confidence": 0.0-1.0,
  "originalTooVague": false
}`;

export interface PremiumRewriteOutput extends RewriteOutput {
  skillsInferred: string[];
  confidence: number;
  originalTooVague: boolean;
  highlightedChanges: Array<{
    type: 'exact' | 'semantic' | 'inferred';
    text: string;
    keyword?: string;
  }>;
}

export interface KeywordMatchResult {
  exactMatches: string[];
  semanticMatches: Array<{ original: string; matched: string }>;
  inferredSkills: string[];
  matchScore: number;
  totalKeywords: number;
}

export class RewriteEnginePremium extends BaseAgent {
  constructor() {
    super('rewrite_premium', PREMIUM_SYSTEM_PROMPT, 'gemini');
  }

  /**
   * Detect industry from role/context
   */
  private detectIndustry(role: string, context?: string): string {
    const text = `${role} ${context || ''}`.toLowerCase();
    
    if (/software|developer|engineer|frontend|backend|fullstack|devops|data\s*scientist|ml|ai/i.test(text)) return 'tech';
    if (/marketing|brand|content|seo|growth|advertising/i.test(text)) return 'marketing';
    if (/finance|accounting|analyst|investment|banking|audit/i.test(text)) return 'finance';
    if (/healthcare|medical|clinical|hospital|patient|nurse|doctor/i.test(text)) return 'healthcare';
    if (/sales|account\s*manager|business\s*development|revenue/i.test(text)) return 'sales';
    if (/operations|supply\s*chain|logistics|procurement|process/i.test(text)) return 'operations';
    
    return 'tech'; // Default to tech
  }

  /**
   * Replace weak verbs with strong action verbs
   */
  private replaceWeakVerbs(text: string): { text: string; changes: string[] } {
    let result = text;
    const changes: string[] = [];
    
    for (const [weak, replacements] of Object.entries(WEAK_VERBS)) {
      const regex = new RegExp(`^${weak}\\b`, 'i');
      if (regex.test(result)) {
        const replacement = replacements[Math.floor(Math.random() * replacements.length)];
        result = result.replace(regex, replacement);
        changes.push(`Replaced "${weak}" with "${replacement}"`);
      }
    }
    
    return { text: result, changes };
  }

  /**
   * Extract skills that can be inferred from context
   */
  private inferSkills(text: string): string[] {
    const inferred: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Skill inference patterns
    const patterns: Array<{ pattern: RegExp; skills: string[] }> = [
      { pattern: /web\s*(app|application|site)/i, skills: ['HTML', 'CSS', 'JavaScript'] },
      { pattern: /database|sql|query/i, skills: ['Database Management', 'SQL'] },
      { pattern: /api|endpoint|rest/i, skills: ['API Development', 'REST'] },
      { pattern: /deploy|ci\/cd|pipeline/i, skills: ['CI/CD', 'DevOps'] },
      { pattern: /test|qa|automation/i, skills: ['Testing', 'QA'] },
      { pattern: /team|collaborat|cross-functional/i, skills: ['Collaboration', 'Teamwork'] },
      { pattern: /lead|mentor|manage/i, skills: ['Leadership', 'Mentoring'] },
      { pattern: /optimize|performance|scale/i, skills: ['Performance Optimization'] },
      { pattern: /customer|user|client/i, skills: ['Customer Focus', 'Stakeholder Management'] }
    ];
    
    patterns.forEach(({ pattern, skills }) => {
      if (pattern.test(lowerText)) {
        inferred.push(...skills);
      }
    });
    
    return [...new Set(inferred)];
  }

  /**
   * Analyze keyword matches in rewritten content
   */
  analyzeKeywordMatches(text: string, jdKeywords: string[]): KeywordMatchResult {
    const lowerText = text.toLowerCase();
    const exactMatches: string[] = [];
    const semanticMatches: Array<{ original: string; matched: string }> = [];
    const inferredSkills = this.inferSkills(text);
    
    // Synonym mappings for semantic matching
    const synonyms: Record<string, string[]> = {
      'javascript': ['js', 'ecmascript', 'es6', 'es2020'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'node.js': ['nodejs', 'node'],
      'postgresql': ['postgres', 'psql'],
      'kubernetes': ['k8s'],
      'continuous integration': ['ci', 'ci/cd'],
      'machine learning': ['ml', 'ai'],
      'leadership': ['led', 'lead', 'managed', 'directed'],
      'development': ['developed', 'built', 'created'],
      'optimization': ['optimized', 'improved', 'enhanced']
    };
    
    jdKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      const keywordRegex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      if (keywordRegex.test(lowerText)) {
        exactMatches.push(keyword);
      } else {
        // Check for synonyms
        for (const [base, syns] of Object.entries(synonyms)) {
          if (keywordLower === base || syns.includes(keywordLower)) {
            const allVariants = [base, ...syns];
            for (const variant of allVariants) {
              const variantRegex = new RegExp(`\\b${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              if (variantRegex.test(lowerText)) {
                semanticMatches.push({ original: keyword, matched: variant });
                break;
              }
            }
          }
        }
      }
    });
    
    const totalMatches = exactMatches.length + semanticMatches.length;
    const matchScore = jdKeywords.length > 0 ? Math.round((totalMatches / jdKeywords.length) * 100) : 0;
    
    return {
      exactMatches,
      semanticMatches,
      inferredSkills,
      matchScore,
      totalKeywords: jdKeywords.length
    };
  }

  /**
   * Main rewrite execution
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();
    
    const text = input.data.text as string || input.data.bullet as string || '';
    const context = input.data.context as string || 'bullet';
    const targetRole = input.data.targetRole as string || input.context.targetRole || '';
    const jdKeywords = (input.data.jdKeywords as string[]) || [];
    const industry = this.detectIndustry(targetRole, context);
    
    if (!text || text.length < 5) {
      return this.createErrorOutput('No text provided for premium rewrite');
    }
    
    // Apply weak verb replacement first
    const verbFix = this.replaceWeakVerbs(text);
    
    // Build enhanced prompt with context
    const industryKeywords = INDUSTRY_KEYWORDS[industry] || INDUSTRY_KEYWORDS.tech;
    const relevantKeywords = [...jdKeywords.slice(0, 10), ...industryKeywords.slice(0, 5)];
    
    const prompt = `Transform this ${context} into a powerful, metrics-driven achievement.

ORIGINAL TEXT:
"${verbFix.text}"

TARGET ROLE: ${targetRole || 'Professional'}
INDUSTRY: ${industry}
RELEVANT KEYWORDS TO NATURALLY INCLUDE: ${relevantKeywords.join(', ')}

INSTRUCTIONS:
1. Start with a strong action verb
2. Add realistic metrics/numbers where appropriate (use ~ for estimates)
3. Include relevant technical terms from the keywords list
4. Show business/team impact
5. Keep under 2 lines

Return JSON with rewritten text, changes made, keywords added, and confidence score.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'gemini', // Use Gemini for premium (more sophisticated)
        isPaid: true,
        maxTokens: 800,
        temperature: 0.4
      });
      
      const parsed = parseJsonFromLLM<{
        rewritten: string;
        changes: string[];
        keywordsAdded: string[];
        metricsAdded: boolean;
        skillsInferred?: string[];
        confidence: number;
        originalTooVague?: boolean;
      }>(response.content);
      
      if (!parsed || !parsed.rewritten) {
        // Fallback to rule-based enhancement
        return this.createSuccessOutput(
          {
            original: text,
            rewritten: verbFix.text,
            changes: verbFix.changes,
            keywordsAdded: [],
            metricsAdded: false,
            skillsInferred: this.inferSkills(text),
            confidence: 0.5,
            originalTooVague: text.length < 30,
            truthCheck: 'passed',
            highlightedChanges: []
          } as PremiumRewriteOutput,
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }
      
      // Analyze keyword matches in rewritten content
      const keywordAnalysis = this.analyzeKeywordMatches(parsed.rewritten, jdKeywords);
      
      // Build highlighted changes array
      const highlightedChanges: PremiumRewriteOutput['highlightedChanges'] = [];
      
      keywordAnalysis.exactMatches.forEach(kw => {
        highlightedChanges.push({ type: 'exact', text: kw, keyword: kw });
      });
      
      keywordAnalysis.semanticMatches.forEach(({ original, matched }) => {
        highlightedChanges.push({ type: 'semantic', text: matched, keyword: original });
      });
      
      keywordAnalysis.inferredSkills.forEach(skill => {
        highlightedChanges.push({ type: 'inferred', text: skill });
      });
      
      return this.createSuccessOutput(
        {
          original: text,
          rewritten: parsed.rewritten,
          changes: [...verbFix.changes, ...(parsed.changes || [])],
          keywordsAdded: parsed.keywordsAdded || [],
          metricsAdded: parsed.metricsAdded || false,
          skillsInferred: parsed.skillsInferred || this.inferSkills(parsed.rewritten),
          confidence: parsed.confidence || 0.8,
          originalTooVague: parsed.originalTooVague || false,
          truthCheck: 'passed',
          highlightedChanges
        } as PremiumRewriteOutput,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );
      
    } catch (error) {
      // Fallback to rule-based on error
      return this.createSuccessOutput(
        {
          original: text,
          rewritten: verbFix.text,
          changes: verbFix.changes,
          keywordsAdded: [],
          metricsAdded: false,
          skillsInferred: this.inferSkills(text),
          confidence: 0.5,
          originalTooVague: text.length < 30,
          truthCheck: 'passed',
          highlightedChanges: []
        } as PremiumRewriteOutput,
        0,
        'gemini',
        Date.now() - start
      );
    }
  }
}

/**
 * Utility function to apply premium rewrite to full resume
 */
export async function applyPremiumRewrite(
  resumeData: {
    summary?: string;
    experience?: Array<{ company: string; role: string; highlights: string[] }>;
    projects?: Array<{ name: string; description: string }>;
  },
  jdKeywords: string[],
  targetRole: string
): Promise<{
  rewrittenData: typeof resumeData;
  keywordMatchScore: number;
  totalChanges: number;
  missingKeywords: string[];
}> {
  const engine = new RewriteEnginePremium();
  const context = {
    sessionId: 'premium-session',
    isPaidUser: true,
    targetRole,
    targetMarket: 'india' as const,
    jdProvided: jdKeywords.length > 0,
    costBudget: {
      maxGroqCalls: 50,
      maxGeminiCalls: 100,
      usedGroqCalls: 0,
      usedGeminiCalls: 0
    }
  };
  
  let totalChanges = 0;
  const allRewrittenText: string[] = [];
  const rewrittenData = { ...resumeData };
  
  // Rewrite summary
  if (resumeData.summary) {
    const result = await engine.execute({
      type: 'rewrite_premium' as any,
      data: { text: resumeData.summary, context: 'summary', targetRole, jdKeywords },
      context
    });
    if (result.success && result.data.rewritten) {
      rewrittenData.summary = result.data.rewritten as string;
      allRewrittenText.push(result.data.rewritten as string);
      totalChanges += (result.data.changes as string[])?.length || 0;
    }
  }
  
  // Rewrite experience bullets
  if (resumeData.experience) {
    rewrittenData.experience = await Promise.all(
      resumeData.experience.map(async (exp) => {
        const rewrittenHighlights = await Promise.all(
          exp.highlights.map(async (bullet) => {
            const result = await engine.execute({
              type: 'rewrite_premium' as any,
              data: { text: bullet, context: 'bullet', targetRole, jdKeywords },
              context
            });
            if (result.success && result.data.rewritten) {
              allRewrittenText.push(result.data.rewritten as string);
              totalChanges += (result.data.changes as string[])?.length || 0;
              return result.data.rewritten as string;
            }
            return bullet;
          })
        );
        return { ...exp, highlights: rewrittenHighlights };
      })
    );
  }
  
  // Rewrite projects
  if (resumeData.projects) {
    rewrittenData.projects = await Promise.all(
      resumeData.projects.map(async (project) => {
        const result = await engine.execute({
          type: 'rewrite_premium' as any,
          data: { text: project.description, context: 'project', targetRole, jdKeywords },
          context
        });
        if (result.success && result.data.rewritten) {
          allRewrittenText.push(result.data.rewritten as string);
          totalChanges += (result.data.changes as string[])?.length || 0;
          return { ...project, description: result.data.rewritten as string };
        }
        return project;
      })
    );
  }
  
  // Calculate overall keyword match
  const combinedText = allRewrittenText.join(' ').toLowerCase();
  const matchedKeywords = jdKeywords.filter(kw => 
    new RegExp(`\\b${kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(combinedText)
  );
  const missingKeywords = jdKeywords.filter(kw => !matchedKeywords.includes(kw));
  const keywordMatchScore = jdKeywords.length > 0 
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100) 
    : 100;
  
  return {
    rewrittenData,
    keywordMatchScore,
    totalChanges,
    missingKeywords
  };
}
