// Resume Parser Agent
// VERBATIM extraction - no interpretation, no improvement

import { BaseAgent } from '../shared/agent-base';
import { AgentInput, AgentOutput } from '../shared/types';
import { LLMClient, createLLMClient, parseJsonFromLLM } from '../shared/llm-client';

const RESUME_PARSER_SYSTEM_PROMPT = `You are a VERBATIM resume data extractor.

Extract EXACTLY what is written. NO interpretation, NO improvement, NO assumptions.

Output JSON:
{
  "basics": {
    "fullName": "exact name",
    "email": "exact email",
    "phone": "exact phone",
    "location": "city, state",
    "linkedin": "URL if present",
    "github": "URL if present",
    "targetRole": "if mentioned"
  },
  "summary": "COPY COMPLETE SUMMARY - EVERY WORD verbatim",
  "experience": [
    {
      "id": "exp-1",
      "company": "EXACT company name",
      "position": "EXACT role title",
      "startDate": "MM/YYYY or YYYY",
      "endDate": "MM/YYYY or Present",
      "highlights": ["WORD FOR WORD bullet 1", "WORD FOR WORD bullet 2"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "exact school name",
      "degree": "exact degree",
      "field": "field of study",
      "graduationDate": "year"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "project name",
      "description": "FULL description verbatim",
      "githubLink": "URL if present"
    }
  ],
  "skills": ["skill1", "skill2"],
  "achievements": [
    {
      "id": "ach-1",
      "description": "achievement text"
    }
  ]
}

MANDATORY RULES:
1. COPY every word of summary - if 100 words, output 100 words
2. COPY ALL bullet points - if 8 bullets per job, output 8 bullets
3. NEVER shorten, summarize, or paraphrase
4. Use "Present" for current jobs
5. If data is unclear → mark as "[UNCLEAR: original text]"
6. Return valid JSON only`;

export class ResumeParserAgent extends BaseAgent {
  constructor() {
    super('resume_parser', RESUME_PARSER_SYSTEM_PROMPT, 'groq');
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const start = Date.now();

    const resumeText = input.data.resumeText as string || input.data.rawText as string || '';

    if (!resumeText || resumeText.length < 50) {
      return this.createErrorOutput('No resume text provided or text too short');
    }

    // Clean the text
    const cleanedText = this.cleanPDFText(resumeText);

    const prompt = `Extract resume data as JSON. CRITICAL: COPY 100% OF TEXT VERBATIM - NEVER SUMMARIZE.

RESUME TEXT:
${cleanedText.slice(0, 15000)}

Return structured JSON with all fields populated from the resume.`;

    try {
      const client = createLLMClient(input.context.costBudget);
      
      const response = await client.complete(prompt, {
        systemPrompt: this.systemPrompt,
        preferred: 'groq',
        isPaid: input.context.isPaidUser,
        maxTokens: 8000,
        temperature: 0.1 // Low temperature for accurate extraction
      });

      const parsed = parseJsonFromLLM<Record<string, unknown>>(response.content);

      if (!parsed) {
        return this.createErrorOutput('Failed to parse LLM response as JSON');
      }

      // Validate and normalize the parsed data
      const normalized = this.normalizeResumeData(parsed);

      return this.createSuccessOutput(
        normalized,
        response.tokensUsed,
        response.provider,
        Date.now() - start
      );

    } catch (error) {
      this.log('Resume parsing failed', error);
      return this.createErrorOutput(
        error instanceof Error ? error.message : 'Unknown error during parsing'
      );
    }
  }

  /**
   * Clean PDF-extracted text
   */
  private cleanPDFText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/(\d)([A-Za-z])/g, '$1 $2')
      .replace(/([A-Za-z])(\d)/g, '$1 $2')
      .replace(/  +/g, ' ')
      .trim();
  }

  /**
   * Normalize and validate parsed resume data
   */
  private normalizeResumeData(data: Record<string, unknown>): Record<string, unknown> {
    // Ensure required structure exists
    const normalized: Record<string, unknown> = {
      basics: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        targetRole: '',
        ...(data.basics as object || {})
      },
      summary: data.summary || data.profile || '',
      experience: this.normalizeExperience(data.experience as any[]),
      education: this.normalizeEducation(data.education as any[]),
      projects: this.normalizeProjects(data.projects as any[]),
      skills: this.normalizeSkills(data.skills),
      achievements: this.normalizeAchievements(data.achievements as any[]),
      jobDescription: ''
    };

    return normalized;
  }

  private normalizeExperience(experience: any[]): any[] {
    if (!Array.isArray(experience)) return [];
    
    return experience.map((exp, idx) => ({
      id: exp.id || `exp-${idx + 1}`,
      company: exp.company || exp.organization || '',
      position: exp.position || exp.role || exp.title || '',
      startDate: exp.startDate || exp.start || '',
      endDate: exp.endDate || exp.end || 'Present',
      highlights: Array.isArray(exp.highlights) ? exp.highlights : 
                  Array.isArray(exp.bullets) ? exp.bullets :
                  typeof exp.description === 'string' ? [exp.description] : []
    }));
  }

  private normalizeEducation(education: any[]): any[] {
    if (!Array.isArray(education)) return [];
    
    return education.map((edu, idx) => ({
      id: edu.id || `edu-${idx + 1}`,
      institution: edu.institution || edu.school || edu.university || '',
      degree: edu.degree || '',
      field: edu.field || edu.major || '',
      graduationDate: edu.graduationDate || edu.year || edu.endDate || ''
    }));
  }

  private normalizeProjects(projects: any[]): any[] {
    if (!Array.isArray(projects)) return [];
    
    return projects.map((proj, idx) => ({
      id: proj.id || `proj-${idx + 1}`,
      name: proj.name || proj.title || '',
      description: proj.description || '',
      githubLink: proj.githubLink || proj.link || proj.url || ''
    }));
  }

  private normalizeSkills(skills: unknown): string[] {
    if (Array.isArray(skills)) {
      // Flatten nested skill categories
      const flatSkills: string[] = [];
      for (const skill of skills) {
        if (typeof skill === 'string') {
          flatSkills.push(skill);
        } else if (typeof skill === 'object' && skill !== null) {
          const items = (skill as any).items || (skill as any).skills || [];
          if (Array.isArray(items)) {
            flatSkills.push(...items);
          }
        }
      }
      return flatSkills;
    }
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  private normalizeAchievements(achievements: any[]): any[] {
    if (!Array.isArray(achievements)) return [];
    
    return achievements.map((ach, idx) => ({
      id: ach.id || `ach-${idx + 1}`,
      description: typeof ach === 'string' ? ach : (ach.description || ach.text || '')
    }));
  }
}
