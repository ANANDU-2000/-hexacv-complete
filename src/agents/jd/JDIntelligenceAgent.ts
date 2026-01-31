// JD Intelligence Agent
// Extracts from JD or generates market-realistic JD

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, JDAnalysis, JDMode, UserProfile } from '../shared/types';
import { LLMClient, createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const JD_EXTRACT_SYSTEM_PROMPT = `You are a Job Description analyzer for Indian companies.

Extract structured requirements from the provided JD:

Output JSON:
{
  "mode": "extracted",
  "requirements": {
    "mustHave": ["skill1", "skill2"],
    "preferred": ["skill3"],
    "experience": "2-4 years",
    "education": ["B.Tech", "BCA"]
  },
  "atsKeywords": ["React", "Node.js", "AWS"],
  "technicalSkills": ["React", "Node.js"],
  "softSkills": ["communication", "teamwork"],
  "redFlags": ["Unrealistic: 5 years for entry role"],
  "fresherChance": "high|low|none",
  "seniorityLevel": "junior|mid|senior|lead",
  "culturalSignals": ["startup", "corporate", "remote-friendly"]
}

Rules:
1. Extract EXACT skill names as written in JD
2. Identify seniority from title and requirements
3. Flag unrealistic requirements (e.g., "10 years React" when React is 10 years old)
4. Detect fresher-friendliness from phrases like "fresh graduates welcome"`;

const JD_GENERATE_SYSTEM_PROMPT = `You are a Job Description generator for Indian job market.

Generate a REALISTIC JD for the given role. Not aspirational - what companies ACTUALLY require.

Input: Role title, experience level, market

Output JSON:
{
  "mode": "generated",
  "generatedJD": "Full JD text here...",
  "requirements": {
    "mustHave": ["skill1", "skill2"],
    "preferred": ["skill3"],
    "experience": "2-4 years",
    "education": ["B.Tech", "BCA"]
  },
  "atsKeywords": ["React", "Node.js", "AWS"],
  "technicalSkills": ["React", "Node.js"],
  "softSkills": ["communication", "teamwork"],
  "redFlags": [],
  "fresherChance": "high|low|none",
  "seniorityLevel": "junior|mid|senior|lead",
  "culturalSignals": ["startup"]
}

Rules:
1. Use REAL Indian market requirements (not US-style)
2. Don't over-inflate requirements (3-5 skills max for must-have)
3. Match experience to role level realistically
4. Include salary range if known for Indian market
5. Mark as "generated" mode clearly`;

export class JDIntelligenceAgent extends BaseAgent {
  constructor() {
    super('jd_intelligence', JD_EXTRACT_SYSTEM_PROMPT, 'gemini');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const jdText = input.data.jdText as string || input.data.jobDescription as string;
    const targetRole = input.data.targetRole as string || '';
    const userProfile = input.data.userProfile as UserProfile;

    // Decide mode: extract or generate
    const shouldGenerate = !jdText || jdText.trim().length < 50;

    if (shouldGenerate) {
      return this.generateJD(targetRole, userProfile, input);
    } else {
      return this.extractFromJD(jdText, input);
    }
  }

  /**
   * Extract requirements from provided JD
   */
  private async extractFromJD(jdText: string, input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const prompt = `Extract requirements from this Job Description:

JD TEXT:
${jdText.slice(0, 5000)}

Return structured JSON with all requirements, skills, and keywords.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: JD_EXTRACT_SYSTEM_PROMPT,
        preferred: 'gemini',
        isPaid: input.context.isPaidUser,
        jsonMode: true,
        maxTokens: 2000
      });

      const parsed = parseJsonFromLLM<JDAnalysis>(response.content);

      if (!parsed) {
        // Fallback to rule-based extraction
        return this.createSuccessOutput(
          this.extractByRules(jdText),
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      // Ensure mode is set correctly
      parsed.mode = 'extracted';
      parsed.rawJD = jdText;

      return this.createSuccessOutput(
        parsed,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('JD extraction failed, using rule-based', error);
      return this.createSuccessOutput(
        this.extractByRules(jdText),
        0,
        'groq',
        Date.now() - start
      );
    }
  }

  /**
   * Generate a market-realistic JD
   */
  private async generateJD(
    targetRole: string,
    userProfile: UserProfile | undefined,
    input: AgentInput
  ): Promise<AgentOutput> {
    const start = Date.now();

    if (!targetRole) {
      return this.createErrorOutput('Cannot generate JD without target role');
    }

    const experienceLevel = userProfile?.userType || '1-3yrs';
    const market = input.context.targetMarket || 'india';

    const prompt = `Generate a realistic Job Description for Indian job market:

ROLE: ${targetRole}
EXPERIENCE LEVEL: ${experienceLevel}
MARKET: ${market}

Generate what a REAL Indian company would post. Not aspirational requirements.
Keep it realistic - 3-5 must-have skills, reasonable experience range.
Include typical salary range for Indian market.

Return full JD text and structured requirements as JSON.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: JD_GENERATE_SYSTEM_PROMPT,
        preferred: 'gemini',
        isPaid: input.context.isPaidUser,
        jsonMode: true,
        maxTokens: 3000
      });

      const parsed = parseJsonFromLLM<JDAnalysis>(response.content);

      if (!parsed) {
        // Fallback to template-based generation
        return this.createSuccessOutput(
          this.generateByTemplate(targetRole, experienceLevel),
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      // Ensure mode is set correctly
      parsed.mode = 'generated';

      return this.createSuccessOutput(
        parsed,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('JD generation failed, using template', error);
      return this.createSuccessOutput(
        this.generateByTemplate(targetRole, experienceLevel),
        0,
        'groq',
        Date.now() - start
      );
    }
  }

  /**
   * Rule-based JD extraction fallback
   */
  private extractByRules(jdText: string): JDAnalysis {
    const textLower = jdText.toLowerCase();
    
    // Extract skills using common patterns
    const technicalSkills = this.extractTechnicalSkills(textLower);
    const softSkills = this.extractSoftSkills(textLower);
    
    // Extract experience requirement
    const expMatch = jdText.match(/(\d+)\s*[-–to]+\s*(\d+)\s*years?/i);
    const experience = expMatch ? `${expMatch[1]}-${expMatch[2]} years` : '2-4 years';
    
    // Determine seniority
    let seniorityLevel: 'junior' | 'mid' | 'senior' | 'lead' = 'mid';
    if (/senior|sr\.|lead|principal|staff/i.test(jdText)) {
      seniorityLevel = 'senior';
    } else if (/junior|jr\.|entry|fresher|graduate/i.test(jdText)) {
      seniorityLevel = 'junior';
    }

    // Check fresher chance
    let fresherChance: 'high' | 'low' | 'none' = 'low';
    if (/fresh\s*graduate|fresher|entry[\s-]level|0-1\s*year/i.test(jdText)) {
      fresherChance = 'high';
    } else if (/5\+\s*years|senior|lead/i.test(jdText)) {
      fresherChance = 'none';
    }

    return {
      mode: 'extracted',
      rawJD: jdText,
      requirements: {
        mustHave: technicalSkills.slice(0, 5),
        preferred: technicalSkills.slice(5, 8),
        experience,
        education: ['B.Tech', 'B.E.', 'BCA', 'MCA']
      },
      atsKeywords: [...technicalSkills, ...softSkills].slice(0, 20),
      technicalSkills,
      softSkills,
      redFlags: [],
      fresherChance,
      seniorityLevel,
      culturalSignals: []
    };
  }

  /**
   * Template-based JD generation fallback
   */
  private generateByTemplate(targetRole: string, experienceLevel: string): JDAnalysis {
    const roleTemplates: Record<string, Partial<JDAnalysis>> = {
      'software engineer': {
        technicalSkills: ['JavaScript', 'Python', 'SQL', 'Git', 'REST APIs'],
        softSkills: ['communication', 'teamwork', 'problem-solving'],
        requirements: {
          mustHave: ['JavaScript', 'Python or Java', 'SQL', 'Git'],
          preferred: ['React', 'Node.js', 'AWS'],
          experience: experienceLevel === 'fresher' ? '0-1 years' : '2-4 years',
          education: ['B.Tech', 'B.E.', 'MCA']
        }
      },
      'data scientist': {
        technicalSkills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy'],
        softSkills: ['analytical thinking', 'communication', 'presentation'],
        requirements: {
          mustHave: ['Python', 'SQL', 'Machine Learning basics', 'Statistics'],
          preferred: ['TensorFlow', 'PyTorch', 'Spark'],
          experience: experienceLevel === 'fresher' ? '0-1 years' : '2-4 years',
          education: ['B.Tech', 'M.Tech', 'MSc Statistics']
        }
      },
      'product manager': {
        technicalSkills: ['Jira', 'SQL', 'Analytics tools', 'Figma basics'],
        softSkills: ['stakeholder management', 'communication', 'analytical thinking'],
        requirements: {
          mustHave: ['Product roadmap experience', 'Stakeholder management', 'Analytics'],
          preferred: ['B2B experience', 'Technical background'],
          experience: '3-5 years',
          education: ['MBA', 'B.Tech']
        }
      }
    };

    const roleKey = targetRole.toLowerCase();
    const template = Object.keys(roleTemplates).find(k => roleKey.includes(k));
    const baseTemplate = template ? roleTemplates[template] : roleTemplates['software engineer'];

    return {
      mode: 'generated',
      requirements: baseTemplate.requirements || {
        mustHave: [],
        preferred: [],
        experience: '2-4 years',
        education: ['Bachelor\'s degree']
      },
      atsKeywords: [...(baseTemplate.technicalSkills || []), ...(baseTemplate.softSkills || [])],
      technicalSkills: baseTemplate.technicalSkills || [],
      softSkills: baseTemplate.softSkills || [],
      redFlags: [],
      fresherChance: experienceLevel === 'fresher' ? 'high' : 'low',
      seniorityLevel: experienceLevel === 'fresher' ? 'junior' : 'mid',
      culturalSignals: ['startup-friendly']
    };
  }

  /**
   * Extract technical skills from text
   */
  private extractTechnicalSkills(text: string): string[] {
    const techKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas',
      'rest api', 'graphql', 'microservices', 'agile', 'scrum'
    ];

    return techKeywords.filter(skill => text.includes(skill.toLowerCase()));
  }

  /**
   * Extract soft skills from text
   */
  private extractSoftSkills(text: string): string[] {
    const softKeywords = [
      'communication', 'teamwork', 'leadership', 'problem-solving', 'analytical',
      'collaboration', 'stakeholder management', 'presentation', 'mentoring',
      'time management', 'adaptability', 'creativity', 'critical thinking'
    ];

    return softKeywords.filter(skill => text.includes(skill.toLowerCase()));
  }
}
