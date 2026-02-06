// Section Priority Agent
// Determines locked section order based on user type
// This is a RULE-BASED agent - no LLM needed

import { RuleBasedAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, UserType, SectionPriority, SECTION_ORDER_BY_TYPE } from '../shared/types';

const SECTION_ORDER_REASONING: Record<UserType, string> = {
  'fresher': 'As a fresher with limited work experience, recruiters prioritize your education credentials and project work. Your academic achievements and hands-on projects demonstrate your potential better than sparse work history.',
  '1-3yrs': 'With 1-3 years of experience, recruiters want to see your technical skills immediately, followed by how you\'ve applied them in real work. Projects and education support your growing expertise.',
  '3-5yrs': 'At mid-level, your work experience speaks loudest. Recruiters scan for progression, impact, and leadership signals. Skills section confirms your toolkit, while projects show initiative beyond day job.',
  'switcher': 'As a career switcher, your summary must immediately explain your transition. Transferable skills bridge your old and new domains. Relevant experience, even if tangential, validates your pivot.'
};

export class SectionPriorityAgent extends RuleBasedAgent {
  constructor() {
    super('section_priority');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    // Extract user profile from input
    const userProfile = input.data.userProfile as { userType?: UserType } || {};
    const userType = userProfile.userType || this.inferUserType(input.data);

    // Get section order for this user type
    const scanOrder = SECTION_ORDER_BY_TYPE[userType] || SECTION_ORDER_BY_TYPE['1-3yrs'];
    const reasoning = SECTION_ORDER_REASONING[userType] || SECTION_ORDER_REASONING['1-3yrs'];

    // Free users have locked order, paid users can customize
    const locked = !input.context.isPaidUser;

    const priority: SectionPriority = {
      userType,
      scanOrder,
      reasoning,
      locked
    };

    return this.createSuccessOutput(
      priority,
      0, // No tokens used - rule-based
      'groq', // Placeholder
      Date.now() - start
    );
  }

  /**
   * Infer user type from input data if not provided
   */
  private inferUserType(data: Record<string, unknown>): UserType {
    // Try to get from various input paths
    const parsedResume = data.parsedResume as Record<string, unknown> || data;
    const experience = parsedResume.experience as any[] || [];
    const targetRole = data.targetRole as string || '';
    
    // Calculate experience years
    let totalMonths = 0;
    for (const exp of experience) {
      const startDate = this.parseDate(exp.startDate || exp.start);
      const endDate = exp.endDate?.toLowerCase() === 'present' || exp.end?.toLowerCase() === 'present'
        ? new Date()
        : this.parseDate(exp.endDate || exp.end);

      if (startDate && endDate) {
        const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        totalMonths += Math.max(0, months);
      }
    }

    const years = totalMonths / 12;

    // Check for career switch
    if (this.detectSwitch(experience, targetRole)) {
      return 'switcher';
    }

    // Classify by years
    if (years < 1) return 'fresher';
    if (years < 3) return '1-3yrs';
    return '3-5yrs';
  }

  /**
   * Detect if user is switching careers
   */
  private detectSwitch(experience: any[], targetRole: string): boolean {
    if (!targetRole || experience.length === 0) return false;

    const currentRole = experience[0]?.position || experience[0]?.role || '';
    const targetDomain = this.getDomain(targetRole);
    const currentDomain = this.getDomain(currentRole);

    return targetDomain !== currentDomain && 
           targetDomain !== 'general' && 
           currentDomain !== 'general';
  }

  /**
   * Get domain from role title
   */
  private getDomain(role: string): string {
    const r = role.toLowerCase();
    if (/engineer|developer|programmer|software|data|ml|ai|devops/.test(r)) return 'tech';
    if (/sales|business development|account executive/.test(r)) return 'sales';
    if (/marketing|brand|seo|content/.test(r)) return 'marketing';
    if (/hr|human resource|recruiter|talent/.test(r)) return 'hr';
    if (/finance|accounting|treasury/.test(r)) return 'finance';
    if (/product manager|pm/.test(r)) return 'product';
    if (/design|ux|ui|creative/.test(r)) return 'design';
    return 'general';
  }

  /**
   * Parse date string
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    if (dateStr.toLowerCase() === 'present') return new Date();
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Try MM/YYYY format
    const match = dateStr.match(/(\d{1,2})\/(\d{4})/);
    if (match) return new Date(parseInt(match[2]), parseInt(match[1]) - 1);

    return null;
  }
}
