// Core interfaces moved from types.ts
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

export interface UserSession {
    sessionId: string;
    createdAt: number;
    expiresAt: number;
    isPaid: boolean;
    paymentAttemptId?: string;
    downloadCount: number;
}

export interface ResumeData {
    id: string; // Same as sessionId

    // Core Data
    basics: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
        github?: string;
        website?: string;
        targetRole: string;
        targetRoleCategory?: string;
        experienceLevel?: ExperienceLevel;
        targetMarket?: TargetMarket;
        includePhoto?: boolean;
        photoUrl?: string; // Base64 or URL
    };

    summary: string;

    // Arrays
    experience: Experience[];
    education: Education[];
    projects: Project[];
    skills: string[]; // Can be string[] or { category: string, items: string[] }[]
    certifications?: any[];
    languages?: string[];
    achievements: Achievement[];

    // ATS Context
    jobDescription?: string;
    atsMetrics?: {
        score: number;
        missingKeywords: string[];
    };

    // Metadata
    lastUpdated?: number;

    // Legacy compatibility (optional)
    photoUrl?: string;
    includePhoto?: boolean;
}

export interface AIAnalysisResult {
    score: number;
    keywords: string[];
    missingKeywords: string[];
    feedback: string[];
}

export type TargetMarket = 'india' | 'us' | 'uk' | 'eu' | 'gulf' | 'remote';
export type ExperienceLevel = 'fresher' | '1-3' | '3-5' | '5-8' | '8+';

export interface PaymentRecord {
    orderId: string;
    sessionId: string;
    templateId: string;
    amount: number;
    status: 'pending' | 'verified' | 'unlocked' | 'failed';
    paymentId?: string;
    timestamp: number;
}

export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    category: 'professional' | 'technical' | 'executive';
    price?: number;
    priceLabel?: string;
    enabled?: boolean;
    features?: string[];
    page: {
        width: number;
        height: number;
        padding: { top: number; right: number; bottom: number; left: number };
        margins: { section: number; entry: number };
    };
    typography: {
        fontFamily: string;
        sizes: { name: number; sectionTitle: number; jobTitle: number; body: number; caption: number };
        weights: { name: number; sectionTitle: number; jobTitle: number; body: number };
        lineHeights: { tight: number; normal: number; relaxed: number };
    };
    layout: {
        headerStyle: 'centered' | 'left' | 'sidebar';
        columns: 1 | 2;
        sectionOrder: string[];
    };
    rules: {
        maxBulletsPerRole: number;
        bulletMinLength: number;
        dateAlignment: 'left' | 'right';
        sectionTitleCase: 'uppercase' | 'capitalize' | 'lowercase';
        includeSectionDividers: boolean;
    };
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
        divider: string;
    };
    masterPrompt: string;
}
