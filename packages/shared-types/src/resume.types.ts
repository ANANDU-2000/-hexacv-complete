// Resume Data Types
export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}

export interface Achievement {
  id: string;
  description: string;
}

export interface ResumeBasics {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
}

export interface ATSMetrics {
  score: number;
  missingKeywords: string[];
}

export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  achievements: Achievement[];
  jobDescription?: string;
  atsMetrics?: ATSMetrics;
  photoUrl?: string;
}

// User Session Types
export interface UserSession {
  id: string;
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
  resumeId?: string;
  metadata?: Record<string, any>;
}
