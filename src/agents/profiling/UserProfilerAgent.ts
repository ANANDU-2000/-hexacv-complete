// User Profiler Agent
// Classifies user as Fresher/1-3yrs/3-5yrs/Switcher

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, UserProfile, UserType } from '../shared/types';
import { LLMClient, createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const USER_PROFILER_SYSTEM_PROMPT = `You are a hiring market specialist for India.

Classify the user into ONE category based on their resume:

1. **Fresher** (0-1 year experience)
   - Recent graduates, limited/no work experience
   - Has academic projects, internships
   - Needs: Education-first layout, project showcase

2. **1-3yrs** (Early Career)
   - Some professional experience
   - May be exploring roles or specializing
   - Needs: Skills-first, quantified impact bullets

3. **3-5yrs** (Mid-Level)
   - Multiple roles, domain expertise
   - Shows progression and ownership
   - Needs: Experience-first, leadership signals

4. **Switcher** (Career/Domain change)
   - Unrelated experience to target role
   - Pivoting to new field
   - Needs: Transferable skills focus, explain transition

Analyze:
- Total years of work experience
- Gap between current role and target role
- Academic recency (recent grad = likely fresher)
- Job hopping patterns
- Skill depth vs breadth

Output JSON:
{
  "userType": "fresher|1-3yrs|3-5yrs|switcher",
  "experienceYears": 2.5,
  "confidence": 0.85,
  "signals": ["Recent graduate (2023)", "Only internships listed"],
  "marketChallenges": ["High competition for fresher SDE roles", "May need to lower salary expectations"],
  "strengths": ["Strong projects", "Relevant tech stack"],
  "isSwitcher": false,
  "switcherContext": null
}

CRITICAL: Be honest. If someone is a fresher applying for senior roles, flag the mismatch.`;

export class UserProfilerAgent extends BaseAgent {
  constructor() {
    super('user_profiler', USER_PROFILER_SYSTEM_PROMPT, 'gemini');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    // Extract resume data from input
    const parsedResume = input.data.parsedResume as Record<string, unknown> || input.data;
    const targetRole = input.data.targetRole as string || parsedResume.targetRole as string || '';

    if (!parsedResume) {
      return this.createErrorOutput('No resume data provided');
    }

    // Build analysis prompt
    const analysisPrompt = `Analyze this resume and classify the user:

RESUME DATA:
${JSON.stringify(parsedResume, null, 2)}

TARGET ROLE: ${targetRole || 'Not specified'}

Classify the user and identify their market challenges. Return JSON only.`;

    try {
      // Use the LLM client from context or create one
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(analysisPrompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'gemini',
        isPaid: input.context.isPaidUser,
        jsonMode: true
      });

      const parsed = parseJsonFromLLM<UserProfile>(response.content);

      if (!parsed) {
        // Fallback to rule-based classification
        return this.createSuccessOutput(
          this.classifyByRules(parsedResume, targetRole),
          response.tokensUsed,
          response.provider,
          Date.now() - start
        );
      }

      return this.createSuccessOutput(
        parsed,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('LLM call failed, using rule-based fallback', error);
      // Fallback to rule-based classification
      return this.createSuccessOutput(
        this.classifyByRules(parsedResume, targetRole),
        0,
        'groq',
        Date.now() - start
      );
    }
  }

  /**
   * Rule-based classification fallback
   */
  private classifyByRules(resume: Record<string, unknown>, targetRole: string): UserProfile {
    const experience = resume.experience as any[] || [];
    const education = resume.education as any[] || [];
    
    // Calculate total experience
    let totalMonths = 0;
    for (const exp of experience) {
      const start = this.parseDate(exp.startDate);
      const end = exp.endDate?.toLowerCase() === 'present' 
        ? new Date() 
        : this.parseDate(exp.endDate);
      
      if (start && end) {
        const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        totalMonths += Math.max(0, months);
      }
    }
    
    const experienceYears = totalMonths / 12;
    
    // Determine user type
    let userType: UserType;
    if (experienceYears < 1) {
      userType = 'fresher';
    } else if (experienceYears < 3) {
      userType = '1-3yrs';
    } else if (experienceYears < 5) {
      userType = '3-5yrs';
    } else {
      userType = '3-5yrs'; // Cap at 3-5yrs for now
    }

    // Check for career switch
    const currentRole = experience[0]?.position || '';
    const isSwitcher = this.detectCareerSwitch(currentRole, targetRole);
    if (isSwitcher) {
      userType = 'switcher';
    }

    const signals: string[] = [];
    const challenges: string[] = [];
    const strengths: string[] = [];

    // Add signals based on analysis
    if (experienceYears < 1) {
      signals.push(`Limited experience (${experienceYears.toFixed(1)} years)`);
      challenges.push('High competition in entry-level market');
    }
    
    if (education.length > 0) {
      const latestEdu = education[0];
      if (latestEdu.graduationDate) {
        const gradYear = parseInt(latestEdu.graduationDate);
        const currentYear = new Date().getFullYear();
        if (currentYear - gradYear <= 2) {
          signals.push(`Recent graduate (${gradYear})`);
        }
      }
      strengths.push('Education credentials present');
    }

    if (experience.length >= 2) {
      strengths.push('Multiple work experiences');
    }

    return {
      userType,
      experienceYears: Math.round(experienceYears * 10) / 10,
      currentRole: currentRole || undefined,
      targetRole,
      targetMarket: input?.context?.targetMarket || 'india',
      confidence: 0.7, // Rule-based is less confident
      signals,
      marketChallenges: challenges,
      strengths,
      isSwitcher,
      switcherContext: isSwitcher ? {
        fromDomain: this.extractDomain(currentRole),
        toDomain: this.extractDomain(targetRole),
        transferableSkills: []
      } : undefined
    } as UserProfile;
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    // Handle "Present"
    if (dateStr.toLowerCase() === 'present') {
      return new Date();
    }
    
    // Try various formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try MM/YYYY format
    const match = dateStr.match(/(\d{1,2})\/(\d{4})/);
    if (match) {
      return new Date(parseInt(match[2]), parseInt(match[1]) - 1);
    }
    
    return null;
  }

  /**
   * Detect if user is switching careers
   */
  private detectCareerSwitch(currentRole: string, targetRole: string): boolean {
    if (!currentRole || !targetRole) return false;

    const currentDomain = this.extractDomain(currentRole);
    const targetDomain = this.extractDomain(targetRole);

    return currentDomain !== targetDomain && currentDomain !== 'general' && targetDomain !== 'general';
  }

  /**
   * Extract domain from role title
   */
  private extractDomain(role: string): string {
    const roleL = role.toLowerCase();
    
    if (/engineer|developer|programmer|software|data|ml|ai|devops|sre|qa|frontend|backend|fullstack/.test(roleL)) {
      return 'tech';
    }
    if (/sales|business development|account/.test(roleL)) {
      return 'sales';
    }
    if (/market|brand|seo|content|social media/.test(roleL)) {
      return 'marketing';
    }
    if (/hr|human resource|recruiter|talent/.test(roleL)) {
      return 'hr';
    }
    if (/finance|account|treasury|analyst/.test(roleL)) {
      return 'finance';
    }
    if (/product|pm|product manager/.test(roleL)) {
      return 'product';
    }
    if (/design|ux|ui|creative|graphic/.test(roleL)) {
      return 'design';
    }
    
    return 'general';
  }
}
