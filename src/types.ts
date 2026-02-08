

export type TabId = 'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'achievements' | 'target-jd';

// Re-export from core/types
export type {
    ResumeData,
    Experience,
    Education,
    Project,
    Achievement,
    TemplateConfig,
    ExperienceLevel,
    TargetMarket
} from './core/types';

// ============================================
// DOCUMENT LAYER - Pure printable data only
// These interfaces define what appears on the resume PDF
// NO UI state, NO editor preferences
// ============================================

import { ResumeData, Experience, Education, Project, Achievement } from './core/types';

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

export function toResumeDocument(data: ResumeData): ResumeDocument {
    return {
        basics: {
            fullName: data.basics.fullName,
            email: data.basics.email,
            phone: data.basics.phone,
            location: data.basics.location || '',
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

export function toEditorState(data: ResumeData): EditorState {
    return {
        jobDescription: data.jobDescription,
        targetRole: data.basics.targetRole,
        photoUrl: data.basics.photoUrl || data.photoUrl,
        includePhoto: data.basics.includePhoto || data.includePhoto,
        atsMetrics: data.atsMetrics,
    };
}

export function toLegacyResumeData(doc: ResumeDocument, editor: EditorState): ResumeData {
    return {
        id: '1', // Default ID
        basics: {
            ...doc.basics,
            targetRole: editor.targetRole || '',
            location: doc.basics.location || '',
            targetRoleCategory: '', // Default
            includePhoto: editor.includePhoto,
            photoUrl: editor.photoUrl,
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

