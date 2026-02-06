
import { TemplateConfig as BaseTemplateConfig } from './template-config';

export type TabId = 'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements' | 'target-jd';

// ============================================
// DOCUMENT LAYER - Pure printable data only
// These interfaces define what appears on the resume PDF
// NO UI state, NO editor preferences
// ============================================

export interface DocumentBasics {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
}

export interface ResumeDocument {
    basics: DocumentBasics;
    summary: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
    skills: string[];
    achievements: Achievement[];
}

// ============================================
// EDITOR LAYER - UI state only (never exported)
// These are preferences and states used during editing
// ============================================

export interface EditorState {
    jobDescription?: string;
    targetRole?: string;
    photoUrl?: string;
    includePhoto?: boolean;
    atsMetrics?: {
        score: number;
        missingKeywords: string[];
    };
}

// ============================================
// APPLICATION STATE - Combines document + editor
// ============================================

export interface ApplicationState {
    document: ResumeDocument;
    editorState: EditorState;
    selectedTemplateId: string;
}

// ============================================
// ADAPTER FUNCTIONS - Backward compatibility
// ============================================

/**
 * Convert legacy ResumeData to new ResumeDocument
 * Strips out UI-only fields for clean document export
 */
export function toResumeDocument(data: ResumeData): ResumeDocument {
    return {
        basics: {
            fullName: data.basics.fullName,
            email: data.basics.email,
            phone: data.basics.phone,
            location: data.basics.location,
            linkedin: data.basics.linkedin,
            github: data.basics.github,
        },
        summary: data.summary,
        experience: data.experience,
        education: data.education,
        projects: data.projects,
        skills: data.skills,
        achievements: data.achievements,
    };
}

/**
 * Extract EditorState from legacy ResumeData
 */
export function toEditorState(data: ResumeData): EditorState {
    return {
        jobDescription: data.jobDescription,
        targetRole: data.basics.targetRole,
        photoUrl: data.photoUrl,
        includePhoto: data.includePhoto,
        atsMetrics: data.atsMetrics,
    };
}

/**
 * Convert new types back to legacy ResumeData
 * For backward compatibility with existing components
 */
export function toLegacyResumeData(doc: ResumeDocument, editor: EditorState): ResumeData {
    return {
        basics: {
            ...doc.basics,
            targetRole: editor.targetRole || '',
        },
        summary: doc.summary,
        experience: doc.experience,
        education: doc.education,
        projects: doc.projects,
        skills: doc.skills,
        achievements: doc.achievements,
        jobDescription: editor.jobDescription,
        atsMetrics: editor.atsMetrics,
        photoUrl: editor.photoUrl,
        includePhoto: editor.includePhoto,
    };
}

// ============================================
// LEGACY TYPES - Keep for backward compatibility
// ============================================

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
    highlights?: string[];
    startDate?: string;
    endDate?: string;
    tech?: string[];
    githubLink?: string;
}

export interface Achievement {
    id: string;
    description: string;
}

export interface ResumeData {
    basics: {
        fullName: string;
        targetRole: string;
        targetRoleCategory?: string;
        targetMarket?: string;
        experienceLevel?: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
        github?: string;
    };
    summary: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
    skills: string[];
    achievements: Achievement[];
    jobDescription?: string;
    atsMetrics?: {
        score: number;
        missingKeywords: string[];
    };
    photoUrl?: string; // For compatibility
    includePhoto?: boolean; // User preference to include photo in resume
}

export interface UserSessionInsight {
    sessionId: string;
    detectedRoleCategory: string;
    detectedSpecificRole: string;
    experienceLevel: string;
    industryType: string;
    jdKeywords: string[];
    recommendedTemplates: string[];
    selectedTemplate: string;
    atsScoreRange: [number, number];
    sessionStatus: 'drop' | 'export' | 'complete';
    stepReached: 'editor' | 'template' | 'finalize';
    timestamp: Date;
}

export interface TemplateConfig extends BaseTemplateConfig {
    price?: number;
    priceLabel?: string;
    enabled?: boolean;
    badge?: string; // Added for Step2AlignDesign
    features?: string[];
}
