// Education Agent
// Generates "why this matters" explanations at every step
// Rule-based - no LLM needed

import { RuleBasedAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, EducationContent } from '../shared/types';

// Education content library
const EDUCATION_LIBRARY: Record<string, EducationContent> = {
  // Step 1: Target Role + Market
  'target-role': {
    stepId: 'target-role',
    whyAsked: 'Your target role determines how we analyze and optimize your resume. Different roles have different expectations.',
    recruiterBehavior: 'Recruiters spend 2-3 seconds checking if your current title matches the role they\'re hiring for. A mismatch means instant rejection.',
    impact: 'Choosing the right target role increases your shortlist probability by 40%.',
    tip: 'If you\'re switching careers, we\'ll focus on transferable skills and explain the transition.'
  },
  'target-market': {
    stepId: 'target-market',
    whyAsked: 'Resume expectations vary by geography. Indian recruiters expect skills-first, US recruiters prefer summary-first.',
    recruiterBehavior: 'Format preferences are culturally ingrained. Using the wrong format signals unfamiliarity with local norms.',
    impact: 'Market-appropriate formatting increases response rates by 25%.',
    tip: 'For India, keep it skills-focused. For US/UK, lead with your professional summary.'
  },
  'experience-level': {
    stepId: 'experience-level',
    whyAsked: 'Your experience level determines the optimal section order. Freshers need education-first, seniors need experience-first.',
    recruiterBehavior: 'Recruiters scan for experience level in the first 3 seconds. Mismatched expectations lead to rejection.',
    impact: 'Correct section ordering for your level improves scan success by 35%.',
    tip: 'Be honest about your level - applying for roles 2+ levels up rarely works.'
  },

  // Step 2: Upload/JD
  'upload-resume': {
    stepId: 'upload-resume',
    whyAsked: 'We analyze your existing resume to identify what\'s working and what needs improvement.',
    recruiterBehavior: 'Recruiters compare your resume against hundreds of others. Small formatting issues or weak bullets stand out.',
    impact: 'Understanding your current state helps us make targeted improvements.',
    tip: 'Upload your most recent version - even if it\'s rough. We\'ll help fix it.'
  },
  'job-description': {
    stepId: 'job-description',
    whyAsked: 'The JD contains exact keywords that ATS systems scan for. Without it, we can only do general optimization.',
    recruiterBehavior: 'ATS filters resumes by keyword match. Missing even one required keyword can get you filtered out.',
    impact: 'JD-aligned resumes get 3x more callbacks than generic ones.',
    tip: 'No JD? We\'ll generate a market-realistic one based on your target role.'
  },

  // Step 3: Reality Check
  'reality-check': {
    stepId: 'reality-check',
    whyAsked: 'We show you exactly what recruiters see - the good, the bad, and what blocks interviews.',
    recruiterBehavior: 'Recruiters make shortlist decisions in 6-8 seconds. They scan for red flags, not perfection.',
    impact: 'Knowing your weaknesses lets you fix them before applying.',
    tip: 'Focus on blockers first, then warnings. Green items are already working for you.'
  },
  'role-alignment': {
    stepId: 'role-alignment',
    whyAsked: 'Title match is the first filter. If your current role doesn\'t match the target, recruiters may skip you.',
    recruiterBehavior: 'Recruiters scan job titles first. "Software Engineer" applying to "Product Manager" raises questions.',
    impact: 'Strong role alignment increases shortlist probability by 50%.',
    tip: 'If switching roles, your summary must explain the transition clearly.'
  },
  'skill-coverage': {
    stepId: 'skill-coverage',
    whyAsked: 'ATS systems scan for exact keyword matches. Missing required skills = automatic rejection.',
    recruiterBehavior: 'Recruiters mentally tick off required skills as they scan. Missing 2+ required skills often means rejection.',
    impact: 'Covering 80%+ of required skills dramatically improves your chances.',
    tip: 'Only add skills you actually have. Fake skills get caught in interviews.'
  },
  'context-quality': {
    stepId: 'context-quality',
    whyAsked: 'Listing skills isn\'t enough. Recruiters want to see skills USED with measurable impact.',
    recruiterBehavior: 'Hiring managers skip resumes that just list skills. They want proof of application.',
    impact: 'Context-rich bullets with metrics get 2x more interview callbacks.',
    tip: 'Every bullet should answer: What did you do? How? What was the impact?'
  },
  'experience-weight': {
    stepId: 'experience-weight',
    whyAsked: 'Recent, relevant experience matters more than old roles. Recency signals current capability.',
    recruiterBehavior: 'Recruiters weight recent experience 3x more than older roles.',
    impact: 'Highlighting recent, relevant work increases response rates.',
    tip: 'If your recent work is less relevant, focus on transferable skills.'
  },
  'structure-readability': {
    stepId: 'structure-readability',
    whyAsked: 'Recruiters scan for 6-8 seconds. Dense text or poor formatting = instant skip.',
    recruiterBehavior: 'Visual hierarchy guides the eye. Bullets should be 15-25 words, easily scannable.',
    impact: 'Clean formatting increases read-through rate by 40%.',
    tip: 'Use white space generously. One-column layouts parse better in ATS.'
  },

  // Step 4: Fixes Explained
  'fixes-explained': {
    stepId: 'fixes-explained',
    whyAsked: 'Every change has a reason. We explain WHY each fix matters so you learn for future applications.',
    recruiterBehavior: 'Small improvements compound. Fixing 5 small issues can double your response rate.',
    impact: 'Understanding the "why" helps you write better resumes yourself.',
    tip: 'Focus on high-impact fixes first. You don\'t need to fix everything.'
  },
  'add-metrics': {
    stepId: 'add-metrics',
    whyAsked: 'Numbers prove impact. "Improved performance" means nothing. "Improved performance by 40%" is memorable.',
    recruiterBehavior: 'Hiring managers remember specific numbers. Vague claims are forgotten instantly.',
    impact: 'Bullets with metrics get 2x more attention than those without.',
    tip: 'If you don\'t have exact numbers, use ranges or estimates with "~" prefix.'
  },
  'remove-buzzwords': {
    stepId: 'remove-buzzwords',
    whyAsked: 'Buzzwords like "synergized" and "leveraged" signal fake-AI or empty content.',
    recruiterBehavior: 'Experienced recruiters immediately spot buzzword-stuffed resumes. It signals dishonesty.',
    impact: 'Removing buzzwords makes your resume more authentic and trustworthy.',
    tip: 'Replace buzzwords with specific actions: "Collaborated with" not "Synergized".'
  },

  // Step 5: Rewrite Options
  'rewrite-options': {
    stepId: 'rewrite-options',
    whyAsked: 'Free version fixes grammar. Paid version transforms bullets with JD alignment and metrics.',
    recruiterBehavior: 'Quality of writing matters. Well-written bullets signal professionalism.',
    impact: 'AI-enhanced bullets can improve keyword match by 30-40%.',
    tip: 'Paid rewrite is worth it if you\'re applying to 10+ jobs with this resume.'
  },
  'free-vs-paid': {
    stepId: 'free-vs-paid',
    whyAsked: 'Both versions produce ATS-safe resumes. The difference is content optimization depth.',
    recruiterBehavior: 'Recruiters notice the difference between generic and tailored resumes.',
    impact: 'Paid version typically improves keyword match by 25-35%.',
    tip: 'For your first 2-3 applications, free is fine. For serious job hunts, consider paid.'
  },

  // Step 6: Preview
  'final-preview': {
    stepId: 'final-preview',
    whyAsked: 'See exactly what recruiters will see. Check formatting, spacing, and overall impression.',
    recruiterBehavior: 'First impression is visual. A clean, well-formatted resume signals attention to detail.',
    impact: 'Visual polish contributes to 20% of first-impression scoring.',
    tip: 'View on both desktop and mobile. Many recruiters review on phones.'
  },

  // Step 7: Download + Checklist
  'download-checklist': {
    stepId: 'download-checklist',
    whyAsked: 'Your resume is only one piece of the puzzle. Success requires strategy.',
    recruiterBehavior: 'Recruiters value candidates who follow up professionally and apply strategically.',
    impact: 'Following a checklist increases interview probability by 30%.',
    tip: 'Tailor each application. One resume for all jobs doesn\'t work.'
  },
  'apply-within-24h': {
    stepId: 'apply-within-24h',
    whyAsked: 'Jobs receive 50% of applications in the first 24-48 hours.',
    recruiterBehavior: 'Early applicants get more attention. Late applicants compete with a larger pool.',
    impact: 'Applying within 24 hours increases response rate by 50%.',
    tip: 'Set up job alerts for your target role to catch new postings early.'
  }
};

export class EducationAgent extends RuleBasedAgent {
  constructor() {
    super('education');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const stepId = input.data.stepId as string;
    const stepIds = input.data.stepIds as string[];
    const context = input.data.context as Record<string, unknown>;

    // Return single education content
    if (stepId) {
      const content = this.getEducationContent(stepId, context);
      return this.createSuccessOutput(
        { content },
        0,
        'groq',
        Date.now() - start
      );
    }

    // Return multiple education contents
    if (stepIds && Array.isArray(stepIds)) {
      const contents: Record<string, EducationContent> = {};
      for (const id of stepIds) {
        contents[id] = this.getEducationContent(id, context);
      }
      return this.createSuccessOutput(
        { contents },
        0,
        'groq',
        Date.now() - start
      );
    }

    // Return all education content
    return this.createSuccessOutput(
      { library: EDUCATION_LIBRARY },
      0,
      'groq',
      Date.now() - start
    );
  }

  /**
   * Get education content for a specific step, with optional context customization
   */
  private getEducationContent(stepId: string, context?: Record<string, unknown>): EducationContent {
    const base = EDUCATION_LIBRARY[stepId];
    
    if (!base) {
      return {
        stepId,
        whyAsked: 'This step helps optimize your resume for better results.',
        recruiterBehavior: 'Recruiters appreciate well-prepared candidates.',
        impact: 'Each improvement increases your chances.',
        tip: 'Take your time and be thorough.'
      };
    }

    // Customize based on context if provided
    if (context) {
      const customized = { ...base };

      // Customize based on user type
      const userType = context.userType as string;
      if (userType === 'fresher' && stepId === 'experience-weight') {
        customized.tip = 'As a fresher, focus on projects and internships. They count as experience.';
      }
      if (userType === 'switcher' && stepId === 'role-alignment') {
        customized.tip = 'Career switch? Lead with transferable skills and explain your motivation in the summary.';
      }

      return customized;
    }

    return base;
  }

  /**
   * Get contextual tip for a specific situation
   */
  getContextualTip(situation: string, userType?: string): string {
    const tips: Record<string, Record<string, string>> = {
      'missing-keywords': {
        'fresher': 'Add missing keywords through projects if you don\'t have work experience.',
        '1-3yrs': 'Weave missing keywords into your experience bullets naturally.',
        '3-5yrs': 'Lead with your strongest keyword-matched experience.',
        'switcher': 'Use transferable skill keywords to bridge domains.'
      },
      'no-metrics': {
        'fresher': 'Use project metrics: lines of code, users, performance improvements.',
        '1-3yrs': 'Even estimates help: "~50 users", "reduced load time by ~30%".',
        '3-5yrs': 'At your level, metrics are expected. Use team size, budget, or impact.',
        'switcher': 'Translate metrics from your old domain to new domain language.'
      },
      'weak-bullets': {
        'fresher': 'Start with "Built", "Developed", "Created" - show you made things.',
        '1-3yrs': 'Each bullet needs: Action + Method + Result.',
        '3-5yrs': 'Show leadership: "Led", "Managed", "Drove", "Owned".',
        'switcher': 'Focus on transferable actions that apply to both domains.'
      }
    };

    const situationTips = tips[situation];
    if (!situationTips) {
      return 'Focus on specific, measurable achievements.';
    }

    return situationTips[userType || '1-3yrs'] || situationTips['1-3yrs'];
  }
}

// Export singleton instance for convenience
export const educationAgent = new EducationAgent();
