// Market Reality Agent
// Analyzes Indian job market for target role

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, MarketReality, UserProfile } from '../shared/types';
import { createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const MARKET_REALITY_SYSTEM_PROMPT = `You are a labor market analyst for the Indian job market (2024-2026).

Provide REALISTIC market intelligence for job seekers. No false hope.

Output JSON:
{
  "roleTitle": "exact market title",
  "demandLevel": "high|medium|low",
  "saturation": "oversaturated|balanced|undersupplied",
  "typicalRequirements": {
    "yearsExperience": "X-Y years",
    "education": ["B.Tech", "relevant degree"],
    "mustHaveSkills": ["skill1", "skill2"],
    "niceToHaveSkills": ["skill3"]
  },
  "fresherReality": {
    "isHiring": true|false,
    "competitionLevel": "brutal|high|medium|low",
    "alternativeTitles": ["Associate", "Trainee"],
    "expectedSalary": "₹X-Y LPA"
  },
  "switcherChallenges": ["specific obstacles if pivoting to this role"],
  "honestAdvice": "brutal truth about applicant's chances",
  "realisticRoles": ["roles this person could actually get"]
}

RULES:
- Use real Indian market data (Naukri, LinkedIn India trends)
- If role doesn't hire freshers, SAY IT
- No false hope - hiring reality over encouragement
- Include salary expectations for Indian market`;

// Indian market role database (offline reference)
const INDIAN_MARKET_DATA: Record<string, Partial<MarketReality>> = {
  'software engineer': {
    roleTitle: 'Software Engineer',
    demandLevel: 'high',
    saturation: 'oversaturated',
    typicalRequirements: {
      yearsExperience: '2-4 years',
      education: ['B.Tech', 'B.E.', 'BCA', 'MCA'],
      mustHaveSkills: ['JavaScript', 'Python/Java', 'SQL', 'Git'],
      niceToHaveSkills: ['React', 'Node.js', 'AWS', 'Docker']
    },
    fresherReality: {
      isHiring: true,
      competitionLevel: 'brutal',
      alternativeTitles: ['Associate Software Engineer', 'Software Developer', 'Trainee Engineer'],
      expectedSalary: '₹4-8 LPA'
    },
    switcherChallenges: ['Need portfolio projects', 'Coding assessments', 'DSA knowledge expected'],
    honestAdvice: 'Fresher market is extremely competitive. Strong DSA and projects are essential. Campus placements are primary route.'
  },
  'data scientist': {
    roleTitle: 'Data Scientist',
    demandLevel: 'high',
    saturation: 'balanced',
    typicalRequirements: {
      yearsExperience: '2-5 years',
      education: ['B.Tech', 'M.Tech', 'MSc Statistics', 'MBA (Analytics)'],
      mustHaveSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics'],
      niceToHaveSkills: ['Deep Learning', 'NLP', 'Spark', 'Cloud ML']
    },
    fresherReality: {
      isHiring: false,
      competitionLevel: 'brutal',
      alternativeTitles: ['Data Analyst', 'ML Engineer (Associate)', 'Business Analyst'],
      expectedSalary: '₹6-12 LPA'
    },
    switcherChallenges: ['Requires strong math background', 'Kaggle/portfolio projects needed', 'MS/PhD preferred'],
    honestAdvice: 'Very few fresher positions. Start as Data Analyst or ML Associate. Strong portfolio and Kaggle rankings help.'
  },
  'product manager': {
    roleTitle: 'Product Manager',
    demandLevel: 'medium',
    saturation: 'balanced',
    typicalRequirements: {
      yearsExperience: '3-6 years',
      education: ['MBA', 'B.Tech'],
      mustHaveSkills: ['Product Strategy', 'Stakeholder Management', 'Analytics', 'Roadmap Planning'],
      niceToHaveSkills: ['SQL', 'Wireframing', 'A/B Testing', 'Agile']
    },
    fresherReality: {
      isHiring: false,
      competitionLevel: 'high',
      alternativeTitles: ['Associate Product Manager', 'Product Analyst', 'Business Analyst'],
      expectedSalary: '₹10-20 LPA'
    },
    switcherChallenges: ['MBA from top-tier preferred', 'Need domain expertise', 'Case study interviews'],
    honestAdvice: 'PM roles rarely hire freshers. APM programs are competitive (IIM/IIT preferred). Start in adjacent role first.'
  },
  'frontend developer': {
    roleTitle: 'Frontend Developer',
    demandLevel: 'high',
    saturation: 'oversaturated',
    typicalRequirements: {
      yearsExperience: '1-3 years',
      education: ['B.Tech', 'BCA', 'Self-taught accepted'],
      mustHaveSkills: ['JavaScript', 'React/Angular/Vue', 'HTML/CSS', 'Git'],
      niceToHaveSkills: ['TypeScript', 'Next.js', 'Testing', 'Performance Optimization']
    },
    fresherReality: {
      isHiring: true,
      competitionLevel: 'high',
      alternativeTitles: ['Junior Frontend Developer', 'UI Developer', 'Web Developer'],
      expectedSalary: '₹3-6 LPA'
    },
    switcherChallenges: ['Portfolio is essential', 'Coding tests common', 'Framework expertise needed'],
    honestAdvice: 'More accessible than backend. Strong portfolio with 3-5 projects can compensate for lack of experience.'
  },
  'backend developer': {
    roleTitle: 'Backend Developer',
    demandLevel: 'high',
    saturation: 'balanced',
    typicalRequirements: {
      yearsExperience: '2-4 years',
      education: ['B.Tech', 'B.E.', 'MCA'],
      mustHaveSkills: ['Node.js/Python/Java', 'SQL', 'REST APIs', 'Git'],
      niceToHaveSkills: ['Docker', 'AWS', 'Microservices', 'Redis']
    },
    fresherReality: {
      isHiring: true,
      competitionLevel: 'high',
      alternativeTitles: ['Junior Backend Developer', 'Software Developer', 'API Developer'],
      expectedSalary: '₹4-7 LPA'
    },
    switcherChallenges: ['System design knowledge needed', 'Database expertise expected', 'Scalability questions common'],
    honestAdvice: 'Good demand but DSA is must. Focus on one language deeply rather than knowing many superficially.'
  },
  'devops engineer': {
    roleTitle: 'DevOps Engineer',
    demandLevel: 'high',
    saturation: 'undersupplied',
    typicalRequirements: {
      yearsExperience: '2-5 years',
      education: ['B.Tech', 'B.E.'],
      mustHaveSkills: ['Linux', 'Docker', 'CI/CD', 'AWS/Azure/GCP'],
      niceToHaveSkills: ['Kubernetes', 'Terraform', 'Ansible', 'Monitoring']
    },
    fresherReality: {
      isHiring: false,
      competitionLevel: 'medium',
      alternativeTitles: ['Junior DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'],
      expectedSalary: '₹6-12 LPA'
    },
    switcherChallenges: ['Needs production experience', 'Certifications help', 'On-call expectations'],
    honestAdvice: 'High demand but requires real infra experience. Start with cloud certifications. Very few fresher positions.'
  },
  'business analyst': {
    roleTitle: 'Business Analyst',
    demandLevel: 'medium',
    saturation: 'balanced',
    typicalRequirements: {
      yearsExperience: '1-4 years',
      education: ['MBA', 'B.Tech', 'BBA'],
      mustHaveSkills: ['SQL', 'Excel', 'Requirements Gathering', 'Documentation'],
      niceToHaveSkills: ['JIRA', 'Agile', 'Tableau', 'Product Sense']
    },
    fresherReality: {
      isHiring: true,
      competitionLevel: 'high',
      alternativeTitles: ['Associate Business Analyst', 'Junior BA', 'Data Analyst'],
      expectedSalary: '₹4-8 LPA'
    },
    switcherChallenges: ['Domain knowledge helps', 'Communication skills key', 'Structured thinking needed'],
    honestAdvice: 'Good entry point for product/consulting aspirants. SQL and communication skills are must-haves.'
  }
};

export class MarketRealityAgent extends BaseAgent {
  constructor() {
    super('market_reality', MARKET_REALITY_SYSTEM_PROMPT, 'gemini');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const targetRole = input.data.targetRole as string || '';
    const userProfile = input.data.userProfile as UserProfile;

    if (!targetRole) {
      return this.createErrorOutput('Target role is required for market analysis');
    }

    // Try to find in offline database first
    const offlineData = this.findOfflineData(targetRole);
    
    if (offlineData) {
      // Customize based on user profile
      const customized = this.customizeForUser(offlineData, userProfile);
      return this.createSuccessOutput(
        customized,
        0,
        'groq',
        Date.now() - start
      );
    }

    // If not in offline database, use LLM
    try {
      const client = createLLMClient(input.context.costBudget);
      
      const prompt = `Analyze the Indian job market for this role:

ROLE: ${targetRole}
USER EXPERIENCE: ${userProfile?.experienceYears || 'unknown'} years
USER TYPE: ${userProfile?.userType || 'unknown'}
CURRENT ROLE: ${userProfile?.currentRole || 'Not specified'}

Provide realistic market intelligence for Indian job market. Be honest about challenges.`;

      const response = await client.complete(prompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'gemini',
        isPaid: input.context.isPaidUser,
        maxTokens: 1500,
        jsonMode: true
      });

      const parsed = parseJsonFromLLM<MarketReality>(response.content);

      if (parsed) {
        return this.createSuccessOutput(
          parsed,
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      // Fallback to generic response
      return this.createSuccessOutput(
        this.createGenericResponse(targetRole),
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('Market analysis LLM failed, using generic', error);
      return this.createSuccessOutput(
        this.createGenericResponse(targetRole),
        0,
        'groq',
        Date.now() - start
      );
    }
  }

  /**
   * Find role in offline database
   */
  private findOfflineData(targetRole: string): Partial<MarketReality> | null {
    const roleL = targetRole.toLowerCase();
    
    // Direct match
    if (INDIAN_MARKET_DATA[roleL]) {
      return INDIAN_MARKET_DATA[roleL];
    }

    // Partial match
    for (const [key, data] of Object.entries(INDIAN_MARKET_DATA)) {
      if (roleL.includes(key) || key.includes(roleL)) {
        return data;
      }
    }

    // Synonym matching
    const synonyms: Record<string, string> = {
      'sde': 'software engineer',
      'swe': 'software engineer',
      'developer': 'software engineer',
      'programmer': 'software engineer',
      'data analyst': 'business analyst',
      'ml engineer': 'data scientist',
      'ai engineer': 'data scientist',
      'react developer': 'frontend developer',
      'angular developer': 'frontend developer',
      'vue developer': 'frontend developer',
      'node developer': 'backend developer',
      'java developer': 'backend developer',
      'python developer': 'backend developer',
      'cloud engineer': 'devops engineer',
      'sre': 'devops engineer',
      'pm': 'product manager'
    };

    for (const [synonym, canonical] of Object.entries(synonyms)) {
      if (roleL.includes(synonym)) {
        return INDIAN_MARKET_DATA[canonical];
      }
    }

    return null;
  }

  /**
   * Customize market data based on user profile
   */
  private customizeForUser(data: Partial<MarketReality>, profile?: UserProfile): MarketReality {
    const result: MarketReality = {
      roleTitle: data.roleTitle || 'Unknown Role',
      demandLevel: data.demandLevel || 'medium',
      saturation: data.saturation || 'balanced',
      typicalRequirements: data.typicalRequirements || {
        yearsExperience: '2-4 years',
        education: ['Bachelor\'s degree'],
        mustHaveSkills: [],
        niceToHaveSkills: []
      },
      fresherReality: data.fresherReality || {
        isHiring: false,
        competitionLevel: 'high',
        alternativeTitles: [],
        expectedSalary: '₹4-8 LPA'
      },
      switcherChallenges: data.switcherChallenges || [],
      honestAdvice: data.honestAdvice || 'Research the specific company and role requirements.',
      realisticRoles: []
    };

    // Add realistic roles based on user type
    if (profile) {
      if (profile.userType === 'fresher') {
        result.realisticRoles = result.fresherReality.alternativeTitles || [];
        result.honestAdvice = `${result.honestAdvice} As a fresher, focus on ${result.fresherReality.alternativeTitles.join(' or ')}.`;
      } else if (profile.isSwitcher) {
        result.honestAdvice = `${result.honestAdvice} Career switch challenges: ${result.switcherChallenges.join(', ')}.`;
        result.realisticRoles = this.suggestRealisticRoles(profile, result);
      } else {
        result.realisticRoles = [result.roleTitle];
      }
    }

    return result;
  }

  /**
   * Suggest realistic roles for switchers
   */
  private suggestRealisticRoles(profile: UserProfile, market: MarketReality): string[] {
    const suggestions: string[] = [];
    
    // If target role doesn't hire freshers and user is inexperienced in target domain
    if (!market.fresherReality.isHiring && profile.experienceYears < 3) {
      suggestions.push(...market.fresherReality.alternativeTitles);
    }
    
    // Add the target role if experienced enough
    if (profile.experienceYears >= 2) {
      suggestions.push(market.roleTitle);
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Create generic response for unknown roles
   */
  private createGenericResponse(targetRole: string): MarketReality {
    return {
      roleTitle: targetRole,
      demandLevel: 'medium',
      saturation: 'balanced',
      typicalRequirements: {
        yearsExperience: '2-4 years',
        education: ['Bachelor\'s degree in relevant field'],
        mustHaveSkills: ['Domain knowledge', 'Communication', 'Problem-solving'],
        niceToHaveSkills: ['Industry certifications', 'Advanced tools']
      },
      fresherReality: {
        isHiring: true,
        competitionLevel: 'high',
        alternativeTitles: [`Junior ${targetRole}`, `Associate ${targetRole}`],
        expectedSalary: '₹4-10 LPA'
      },
      switcherChallenges: ['Domain expertise needed', 'May require certifications', 'Entry-level start possible'],
      honestAdvice: 'Research specific company requirements. Network actively. Build portfolio demonstrating relevant skills.',
      realisticRoles: [targetRole, `Junior ${targetRole}`]
    };
  }
}
