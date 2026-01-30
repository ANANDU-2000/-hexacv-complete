// ATS Reality Matcher Agent
// Creates honest reality panels - NO FAKE ATS SCORES

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput, JDAnalysis } from '../shared/types';
import {
  RealityAnalysis,
  RealityPanel,
  RealityItem,
  OverallAssessment,
  PanelStatus,
  ItemStatus,
  PANEL_EDUCATION_NOTES
} from '../../reality-matching-types';

export class ATSRealityMatcherAgent extends BaseAgent {
  constructor() {
    super('ats_reality_matcher', '', 'groq'); // No system prompt - rule-based analysis
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const resume = input.data.parsedResume as Record<string, unknown> || input.data.resume || input.data;
    const jdAnalysis = input.data.jdAnalysis as JDAnalysis;
    const targetRole = input.data.targetRole as string || '';

    // Analyze each panel
    const roleAlignment = this.analyzeRoleAlignment(resume, jdAnalysis, targetRole);
    const skillCoverage = this.analyzeSkillCoverage(resume, jdAnalysis);
    const contextQuality = this.analyzeContextQuality(resume);
    const experienceWeight = this.analyzeExperienceWeight(resume, jdAnalysis);
    const structureReadability = this.analyzeStructureReadability(resume);

    // Calculate overall assessment
    const overallAssessment = this.calculateOverallAssessment({
      roleAlignment,
      skillCoverage,
      contextQuality,
      experienceWeight,
      structureReadability
    }, targetRole);

    const analysis: RealityAnalysis = {
      panels: {
        roleAlignment,
        skillCoverage,
        contextQuality,
        experienceWeight,
        structureReadability
      },
      overallAssessment,
      timestamp: new Date(),
      analysisVersion: '1.0.0'
    };

    return this.createSuccessOutput(
      analysis,
      0, // No LLM tokens used - rule-based
      'groq',
      Date.now() - start
    );
  }

  /**
   * Panel 1: Role Alignment
   * Check title match, seniority, career trajectory
   */
  private analyzeRoleAlignment(
    resume: Record<string, unknown>,
    jdAnalysis: JDAnalysis | undefined,
    targetRole: string
  ): RealityPanel {
    const items: RealityItem[] = [];
    const basics = resume.basics as Record<string, string> || {};
    const experience = resume.experience as any[] || [];
    const currentRole = experience[0]?.position || '';

    // Check title match
    const titleMatch = this.calculateTitleMatch(currentRole, targetRole);
    if (titleMatch >= 0.7) {
      items.push({
        status: 'ok',
        label: 'Title Match',
        explanation: `Your current role "${currentRole}" aligns well with target "${targetRole}"`,
        impact: 'pass_filter'
      });
    } else if (titleMatch >= 0.4) {
      items.push({
        status: 'warning',
        label: 'Partial Title Match',
        explanation: `"${currentRole}" partially matches "${targetRole}" - consider highlighting relevant aspects`,
        impact: 'hurts_shortlist',
        fixSuggestion: `Update your summary to bridge "${currentRole}" to "${targetRole}"`
      });
    } else {
      items.push({
        status: 'blocker',
        label: 'Title Mismatch',
        explanation: `"${currentRole}" doesn't match "${targetRole}" - recruiters may filter you out`,
        impact: 'blocks_interview',
        fixSuggestion: 'Consider roles that bridge your current experience to your target'
      });
    }

    // Check seniority match
    const userSeniority = this.detectSeniority(experience);
    const targetSeniority = jdAnalysis?.seniorityLevel || 'mid';
    
    if (userSeniority === targetSeniority) {
      items.push({
        status: 'ok',
        label: 'Seniority Match',
        explanation: `Your experience level matches the ${targetSeniority} requirement`,
        impact: 'pass_filter'
      });
    } else if (this.isSeniorityClose(userSeniority, targetSeniority)) {
      items.push({
        status: 'warning',
        label: 'Seniority Gap',
        explanation: `You're ${userSeniority} level, job wants ${targetSeniority} - might be a stretch`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Emphasize leadership/ownership in your bullets'
      });
    } else {
      items.push({
        status: 'blocker',
        label: 'Seniority Mismatch',
        explanation: `You're ${userSeniority} level applying for ${targetSeniority} role - significant gap`,
        impact: 'blocks_interview',
        fixSuggestion: 'Consider stepping-stone roles first'
      });
    }

    // Check career trajectory
    if (experience.length >= 2) {
      const hasProgression = this.detectProgression(experience);
      if (hasProgression) {
        items.push({
          status: 'ok',
          label: 'Career Progression',
          explanation: 'Your career shows upward trajectory - positive signal',
          impact: 'pass_filter'
        });
      }
    }

    const status = this.calculatePanelStatus(items);
    return {
      panelId: 'roleAlignment',
      title: 'Role Alignment',
      status,
      items,
      educationNote: PANEL_EDUCATION_NOTES.roleAlignment
    };
  }

  /**
   * Panel 2: Skill Coverage
   * Required skills present/missing, noise skills
   */
  private analyzeSkillCoverage(
    resume: Record<string, unknown>,
    jdAnalysis: JDAnalysis | undefined
  ): RealityPanel {
    const items: RealityItem[] = [];
    const resumeSkills = (resume.skills as string[] || []).map(s => s.toLowerCase());
    
    // Also extract skills from experience bullets
    const experience = resume.experience as any[] || [];
    const bulletText = experience.flatMap(e => e.highlights || e.bullets || []).join(' ').toLowerCase();
    
    if (!jdAnalysis) {
      items.push({
        status: 'warning',
        label: 'No JD to Compare',
        explanation: 'Without a job description, we can only check general skill quality',
        impact: 'hurts_shortlist',
        fixSuggestion: 'Add a job description for better skill matching analysis'
      });
      
      return {
        panelId: 'skillCoverage',
        title: 'Skill Coverage',
        status: 'warning',
        items,
        educationNote: PANEL_EDUCATION_NOTES.skillCoverage
      };
    }

    const requiredSkills = jdAnalysis.requirements?.mustHave || jdAnalysis.atsKeywords?.slice(0, 8) || [];
    const preferredSkills = jdAnalysis.requirements?.preferred || jdAnalysis.atsKeywords?.slice(8, 15) || [];

    // Check required skills
    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];
    
    for (const skill of requiredSkills) {
      const skillL = skill.toLowerCase();
      if (resumeSkills.includes(skillL) || bulletText.includes(skillL)) {
        matchedRequired.push(skill);
      } else {
        missingRequired.push(skill);
      }
    }

    if (matchedRequired.length > 0) {
      items.push({
        status: 'ok',
        label: `Required Skills Found (${matchedRequired.length}/${requiredSkills.length})`,
        explanation: `Found: ${matchedRequired.slice(0, 5).join(', ')}${matchedRequired.length > 5 ? '...' : ''}`,
        impact: 'pass_filter'
      });
    }

    if (missingRequired.length > 0) {
      const status: ItemStatus = missingRequired.length > requiredSkills.length / 2 ? 'blocker' : 'warning';
      items.push({
        status,
        label: `Missing Required Skills (${missingRequired.length})`,
        explanation: `Missing: ${missingRequired.slice(0, 4).join(', ')}`,
        impact: status === 'blocker' ? 'blocks_interview' : 'hurts_shortlist',
        fixSuggestion: `Add these skills to your resume if you have them: ${missingRequired.slice(0, 3).join(', ')}`
      });
    }

    // Check for noise skills
    const noiseSkills = this.detectNoiseSkills(resumeSkills, requiredSkills, preferredSkills);
    if (noiseSkills.length > 3) {
      items.push({
        status: 'warning',
        label: `Noise Skills (${noiseSkills.length})`,
        explanation: `Skills not relevant to this role: ${noiseSkills.slice(0, 3).join(', ')}`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Remove irrelevant skills to keep focus on what matters for this role'
      });
    }

    const status = this.calculatePanelStatus(items);
    return {
      panelId: 'skillCoverage',
      title: 'Skill Coverage',
      status,
      items,
      educationNote: PANEL_EDUCATION_NOTES.skillCoverage
    };
  }

  /**
   * Panel 3: Context Quality
   * Are skills used in work or just listed?
   */
  private analyzeContextQuality(resume: Record<string, unknown>): RealityPanel {
    const items: RealityItem[] = [];
    const experience = resume.experience as any[] || [];
    const skills = resume.skills as string[] || [];
    
    // Analyze bullets for quality
    const allBullets = experience.flatMap(e => e.highlights || e.bullets || []);
    
    let bulletsWithMetrics = 0;
    let bulletsWithActionVerbs = 0;
    let genericBullets = 0;
    
    const actionVerbs = ['built', 'developed', 'led', 'created', 'implemented', 'designed', 'managed', 'improved', 'reduced', 'increased', 'launched', 'delivered', 'architected', 'optimized'];
    const genericPhrases = ['worked on', 'responsible for', 'helped with', 'assisted', 'involved in', 'participated'];
    
    for (const bullet of allBullets) {
      const bulletL = bullet.toLowerCase();
      
      // Check for metrics
      if (/\d+%|\d+x|\$\d+|₹\d+|\d+\s*(users|customers|requests|transactions)/i.test(bullet)) {
        bulletsWithMetrics++;
      }
      
      // Check for action verbs
      if (actionVerbs.some(v => bulletL.startsWith(v))) {
        bulletsWithActionVerbs++;
      }
      
      // Check for generic phrases
      if (genericPhrases.some(p => bulletL.includes(p))) {
        genericBullets++;
      }
    }
    
    const totalBullets = allBullets.length;
    const metricsRatio = totalBullets > 0 ? bulletsWithMetrics / totalBullets : 0;
    const actionVerbRatio = totalBullets > 0 ? bulletsWithActionVerbs / totalBullets : 0;
    const genericRatio = totalBullets > 0 ? genericBullets / totalBullets : 0;
    
    // Metrics quality
    if (metricsRatio >= 0.5) {
      items.push({
        status: 'ok',
        label: 'Strong Metrics',
        explanation: `${Math.round(metricsRatio * 100)}% of bullets have quantified impact - excellent`,
        impact: 'pass_filter'
      });
    } else if (metricsRatio >= 0.2) {
      items.push({
        status: 'warning',
        label: 'Limited Metrics',
        explanation: `Only ${Math.round(metricsRatio * 100)}% of bullets have numbers - add more impact data`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Add metrics like team size, % improvement, users served, or time saved'
      });
    } else {
      items.push({
        status: 'blocker',
        label: 'No Metrics',
        explanation: 'Almost no bullets have quantified impact - major red flag',
        impact: 'blocks_interview',
        fixSuggestion: 'Every bullet should answer: What was the scale? What improved? By how much?'
      });
    }
    
    // Action verb usage
    if (actionVerbRatio >= 0.7) {
      items.push({
        status: 'ok',
        label: 'Strong Action Verbs',
        explanation: 'Bullets start with impactful action verbs - professional format',
        impact: 'pass_filter'
      });
    } else if (actionVerbRatio >= 0.4) {
      items.push({
        status: 'warning',
        label: 'Inconsistent Verbs',
        explanation: 'Some bullets lack strong action verbs - weakens impact',
        impact: 'hurts_shortlist',
        fixSuggestion: 'Start each bullet with: Built, Developed, Led, Created, Implemented'
      });
    }
    
    // Generic phrases
    if (genericRatio > 0.3) {
      items.push({
        status: 'blocker',
        label: 'Generic Language',
        explanation: `${Math.round(genericRatio * 100)}% of bullets use vague phrases like "worked on" or "responsible for"`,
        impact: 'blocks_interview',
        fixSuggestion: 'Replace "Worked on X" with "Built X that achieved Y"'
      });
    }
    
    // Check if skills appear in bullets
    const skillsInContext = skills.filter(skill => 
      allBullets.some(b => b.toLowerCase().includes(skill.toLowerCase()))
    ).length;
    const skillContextRatio = skills.length > 0 ? skillsInContext / skills.length : 0;
    
    if (skillContextRatio < 0.4 && skills.length > 3) {
      items.push({
        status: 'warning',
        label: 'Skills Without Context',
        explanation: `${skills.length - skillsInContext} skills are listed but never mentioned in your experience`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Add bullets showing HOW you used each listed skill'
      });
    }

    const status = this.calculatePanelStatus(items);
    return {
      panelId: 'contextQuality',
      title: 'Context Quality',
      status,
      items,
      educationNote: PANEL_EDUCATION_NOTES.contextQuality
    };
  }

  /**
   * Panel 4: Experience Weight
   * Recency, duration, relevance
   */
  private analyzeExperienceWeight(
    resume: Record<string, unknown>,
    jdAnalysis: JDAnalysis | undefined
  ): RealityPanel {
    const items: RealityItem[] = [];
    const experience = resume.experience as any[] || [];
    
    if (experience.length === 0) {
      items.push({
        status: 'blocker',
        label: 'No Experience',
        explanation: 'No work experience listed - focus on projects instead',
        impact: 'blocks_interview',
        fixSuggestion: 'Add internships, freelance work, or significant projects'
      });
      
      return {
        panelId: 'experienceWeight',
        title: 'Experience Weight',
        status: 'blocker',
        items,
        educationNote: PANEL_EDUCATION_NOTES.experienceWeight
      };
    }
    
    // Check recency
    const mostRecent = experience[0];
    const isCurrentRole = mostRecent.endDate?.toLowerCase() === 'present' || !mostRecent.endDate;
    
    if (isCurrentRole) {
      items.push({
        status: 'ok',
        label: 'Currently Employed',
        explanation: 'Active employment is a positive signal to recruiters',
        impact: 'pass_filter'
      });
    } else {
      const endDate = new Date(mostRecent.endDate);
      const monthsGap = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsGap > 6) {
        items.push({
          status: 'warning',
          label: 'Employment Gap',
          explanation: `${Math.round(monthsGap)} months since last role - be ready to explain`,
          impact: 'hurts_shortlist',
          fixSuggestion: 'Add recent projects, certifications, or freelance work to fill the gap'
        });
      }
    }
    
    // Check for job hopping
    const shortStints = experience.filter(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate?.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
      const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return months < 12;
    }).length;
    
    if (shortStints >= 2 && experience.length >= 3) {
      items.push({
        status: 'warning',
        label: 'Job Hopping Pattern',
        explanation: `${shortStints} roles under 1 year - recruiters may question commitment`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Prepare to explain transitions positively in interviews'
      });
    }
    
    // Check relevance to target role
    const requiredExp = jdAnalysis?.requirements?.experience || '';
    const reqYears = this.parseYearsFromString(requiredExp);
    const actualYears = this.calculateTotalYears(experience);
    
    if (reqYears > 0) {
      if (actualYears >= reqYears) {
        items.push({
          status: 'ok',
          label: 'Experience Requirement Met',
          explanation: `You have ${actualYears.toFixed(1)} years, JD requires ${reqYears}+ years`,
          impact: 'pass_filter'
        });
      } else if (actualYears >= reqYears * 0.7) {
        items.push({
          status: 'warning',
          label: 'Slightly Under Experience',
          explanation: `You have ${actualYears.toFixed(1)} years, JD wants ${reqYears}+ - might work`,
          impact: 'hurts_shortlist',
          fixSuggestion: 'Emphasize quality and impact over quantity of years'
        });
      } else {
        items.push({
          status: 'blocker',
          label: 'Experience Gap',
          explanation: `You have ${actualYears.toFixed(1)} years, JD requires ${reqYears}+ - significant gap`,
          impact: 'blocks_interview',
          fixSuggestion: 'Consider roles with lower experience requirements'
        });
      }
    }

    const status = this.calculatePanelStatus(items);
    return {
      panelId: 'experienceWeight',
      title: 'Experience Weight',
      status,
      items,
      educationNote: PANEL_EDUCATION_NOTES.experienceWeight
    };
  }

  /**
   * Panel 5: Structure & Readability
   * ATS-safe formatting, section order, bullet length
   */
  private analyzeStructureReadability(resume: Record<string, unknown>): RealityPanel {
    const items: RealityItem[] = [];
    const experience = resume.experience as any[] || [];
    const summary = resume.summary as string || '';
    const skills = resume.skills as string[] || [];
    
    // Check summary length
    if (summary) {
      const wordCount = summary.split(/\s+/).length;
      if (wordCount >= 30 && wordCount <= 80) {
        items.push({
          status: 'ok',
          label: 'Summary Length',
          explanation: `${wordCount} words - optimal for recruiter scanning`,
          impact: 'pass_filter'
        });
      } else if (wordCount > 120) {
        items.push({
          status: 'warning',
          label: 'Summary Too Long',
          explanation: `${wordCount} words - recruiters may skip. Aim for 50-80 words`,
          impact: 'hurts_shortlist',
          fixSuggestion: 'Condense your summary to 2-3 impactful sentences'
        });
      } else if (wordCount < 20) {
        items.push({
          status: 'warning',
          label: 'Summary Too Short',
          explanation: `Only ${wordCount} words - add more context about your value`,
          impact: 'hurts_shortlist',
          fixSuggestion: 'Expand to include: who you are, key skills, and what you seek'
        });
      }
    } else {
      items.push({
        status: 'warning',
        label: 'No Summary',
        explanation: 'Missing professional summary - first thing recruiters read',
        impact: 'hurts_shortlist',
        fixSuggestion: 'Add a 2-3 sentence summary highlighting your value proposition'
      });
    }
    
    // Check bullet lengths
    const allBullets = experience.flatMap(e => e.highlights || e.bullets || []);
    const longBullets = allBullets.filter(b => b.split(/\s+/).length > 30);
    const shortBullets = allBullets.filter(b => b.split(/\s+/).length < 8);
    
    if (longBullets.length > allBullets.length * 0.3) {
      items.push({
        status: 'warning',
        label: 'Bullets Too Long',
        explanation: `${longBullets.length} bullets exceed 30 words - hard to scan`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Keep bullets to 15-25 words for optimal readability'
      });
    }
    
    if (shortBullets.length > allBullets.length * 0.4) {
      items.push({
        status: 'warning',
        label: 'Bullets Too Short',
        explanation: `${shortBullets.length} bullets under 8 words - lack context`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Expand short bullets with: action, method, and result'
      });
    }
    
    // Check skills section size
    if (skills.length > 20) {
      items.push({
        status: 'warning',
        label: 'Too Many Skills',
        explanation: `${skills.length} skills listed - dilutes focus and looks like stuffing`,
        impact: 'hurts_shortlist',
        fixSuggestion: 'Keep top 10-15 most relevant skills for this role'
      });
    } else if (skills.length >= 5 && skills.length <= 15) {
      items.push({
        status: 'ok',
        label: 'Focused Skills Section',
        explanation: `${skills.length} skills - good balance of breadth and focus`,
        impact: 'pass_filter'
      });
    }
    
    // Check contact info completeness
    const basics = resume.basics as Record<string, string> || {};
    const hasEmail = !!basics.email;
    const hasPhone = !!basics.phone;
    const hasLinkedIn = !!basics.linkedin;
    
    if (hasEmail && hasPhone) {
      items.push({
        status: 'ok',
        label: 'Contact Info Complete',
        explanation: 'Email and phone present - recruiters can reach you',
        impact: 'pass_filter'
      });
    } else {
      items.push({
        status: 'blocker',
        label: 'Missing Contact Info',
        explanation: `Missing: ${!hasEmail ? 'email' : ''} ${!hasPhone ? 'phone' : ''}`,
        impact: 'blocks_interview',
        fixSuggestion: 'Add email and phone number - recruiters need to contact you'
      });
    }

    const status = this.calculatePanelStatus(items);
    return {
      panelId: 'structureReadability',
      title: 'Structure & Readability',
      status,
      items,
      educationNote: PANEL_EDUCATION_NOTES.structureReadability
    };
  }

  /**
   * Calculate overall assessment from all panels
   */
  private calculateOverallAssessment(
    panels: Record<string, RealityPanel>,
    targetRole: string
  ): OverallAssessment {
    const allItems = Object.values(panels).flatMap(p => p.items);
    
    const blockers = allItems.filter(i => i.status === 'blocker');
    const warnings = allItems.filter(i => i.status === 'warning');
    const okItems = allItems.filter(i => i.status === 'ok');
    
    // Calculate shortlist chance
    let shortlistChance: 'high' | 'medium' | 'low';
    if (blockers.length >= 2) {
      shortlistChance = 'low';
    } else if (blockers.length === 1 || warnings.length >= 4) {
      shortlistChance = 'medium';
    } else {
      shortlistChance = 'high';
    }
    
    // Determine ATS pass likelihood
    const likelyToPassATS = blockers.filter(b => 
      b.impact === 'blocks_interview' && 
      (b.label.includes('Skill') || b.label.includes('Keyword'))
    ).length === 0;
    
    // Determine shortlist likelihood
    const likelyToGetShortlisted = shortlistChance !== 'low';
    
    // Extract major blockers and quick wins
    const majorBlockers = blockers.map(b => b.label);
    const quickWins = warnings
      .filter(w => w.fixSuggestion)
      .slice(0, 3)
      .map(w => w.fixSuggestion!);
    
    // Generate honest feedback
    let honestFeedback: string;
    if (shortlistChance === 'low') {
      honestFeedback = `This resume has ${blockers.length} critical issues that need fixing before applying. Focus on: ${majorBlockers.slice(0, 2).join(', ')}.`;
    } else if (shortlistChance === 'medium') {
      honestFeedback = `Your resume has potential but ${warnings.length} areas could hurt your chances. Quick fixes: ${quickWins.slice(0, 2).join('; ')}.`;
    } else {
      honestFeedback = `Strong resume! ${okItems.length} factors working in your favor. Minor improvements could increase response rate.`;
    }
    
    // Suggest realistic roles
    const realisticRoles = this.suggestRealisticRoles(panels, targetRole);

    return {
      likelyToPassATS,
      likelyToGetShortlisted,
      shortlistChance,
      majorBlockers,
      quickWins,
      honestFeedback,
      realisticRoles
    };
  }

  // ============== HELPER METHODS ==============

  private calculatePanelStatus(items: RealityItem[]): PanelStatus {
    const hasBlocker = items.some(i => i.status === 'blocker');
    const warningCount = items.filter(i => i.status === 'warning').length;
    
    if (hasBlocker) return 'blocker';
    if (warningCount >= 2) return 'warning';
    return 'strong';
  }

  private calculateTitleMatch(current: string, target: string): number {
    if (!current || !target) return 0;
    
    const currentWords = current.toLowerCase().split(/\s+/);
    const targetWords = target.toLowerCase().split(/\s+/);
    
    const matchingWords = currentWords.filter(w => 
      targetWords.some(t => t.includes(w) || w.includes(t))
    );
    
    return matchingWords.length / Math.max(currentWords.length, targetWords.length);
  }

  private detectSeniority(experience: any[]): string {
    const totalYears = this.calculateTotalYears(experience);
    const titles = experience.map(e => (e.position || '').toLowerCase());
    
    if (titles.some(t => /senior|sr\.|lead|principal|staff|architect/.test(t)) || totalYears >= 5) {
      return 'senior';
    }
    if (totalYears >= 2) return 'mid';
    if (totalYears >= 0.5) return 'junior';
    return 'fresher';
  }

  private isSeniorityClose(user: string, target: string): boolean {
    const levels = ['fresher', 'junior', 'mid', 'senior', 'lead'];
    const userIdx = levels.indexOf(user);
    const targetIdx = levels.indexOf(target);
    return Math.abs(userIdx - targetIdx) <= 1;
  }

  private detectProgression(experience: any[]): boolean {
    if (experience.length < 2) return false;
    
    const seniorityKeywords = ['intern', 'junior', 'associate', 'mid', 'senior', 'lead', 'principal', 'director', 'vp'];
    
    const titles = experience.map(e => e.position?.toLowerCase() || '');
    const levels = titles.map(t => {
      const idx = seniorityKeywords.findIndex(k => t.includes(k));
      return idx >= 0 ? idx : 3; // Default to mid-level
    });
    
    // Check if levels are generally increasing (older roles have lower levels)
    return levels[0] >= levels[levels.length - 1];
  }

  private detectNoiseSkills(resumeSkills: string[], required: string[], preferred: string[]): string[] {
    const relevantSkills = [...required, ...preferred].map(s => s.toLowerCase());
    return resumeSkills.filter(skill => 
      !relevantSkills.some(r => r.includes(skill) || skill.includes(r))
    );
  }

  private calculateTotalYears(experience: any[]): number {
    let totalMonths = 0;
    
    for (const exp of experience) {
      const start = new Date(exp.startDate);
      const end = exp.endDate?.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        totalMonths += Math.max(0, months);
      }
    }
    
    return totalMonths / 12;
  }

  private parseYearsFromString(str: string): number {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private suggestRealisticRoles(panels: Record<string, RealityPanel>, targetRole: string): string[] {
    const roles: string[] = [];
    
    // If role alignment is strong, target role is realistic
    if (panels.roleAlignment.status !== 'blocker') {
      roles.push(targetRole);
    }
    
    // Suggest adjacent roles based on common patterns
    const targetL = targetRole.toLowerCase();
    if (targetL.includes('senior') && panels.experienceWeight.status === 'blocker') {
      roles.push(targetRole.replace(/senior/i, '').trim());
    }
    if (targetL.includes('lead') && panels.roleAlignment.status !== 'strong') {
      roles.push(targetRole.replace(/lead/i, 'Senior').trim());
    }
    if (targetL.includes('engineer')) {
      roles.push(targetRole.replace(/engineer/i, 'Developer'));
    }
    
    return roles.slice(0, 3);
  }
}
