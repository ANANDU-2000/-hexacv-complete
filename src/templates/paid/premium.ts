import { TemplateConfig } from '../../core/types';

export const PREMIUM_TEMPLATES: Record<string, TemplateConfig> = {
    'template2': {
        id: 'template2',
        name: 'Premium ATS',
        description: 'Recruiter-grade ATS layout with premium typography and spacing',
        category: 'professional',
        page: {
            width: 794,
            height: 1123,
            padding: { top: 28, right: 28, bottom: 28, left: 28 },
            margins: { section: 16, entry: 12 },
        },
        typography: {
            fontFamily: "'Inter', Arial, Helvetica, sans-serif",
            sizes: { name: 22, sectionTitle: 13.5, jobTitle: 11.5, body: 11, caption: 10 },
            weights: { name: 700, sectionTitle: 700, jobTitle: 600, body: 400 },
            lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.6 },
        },
        layout: {
            headerStyle: 'left',
            columns: 1,
            sectionOrder: ['profile', 'skills', 'experience', 'projects', 'education', 'certifications'],
        },
        rules: {
            maxBulletsPerRole: 4,
            bulletMinLength: 45,
            dateAlignment: 'right',
            sectionTitleCase: 'uppercase',
            includeSectionDividers: true,
        },
        colorScheme: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#000000',
            divider: '#000000',
        },
        masterPrompt: 'Rewrite resume content for maximum ATS compatibility...',
    },
    'template3': {
        id: 'template3',
        name: 'Advanced Two-Column',
        description: 'Modern two-column layout with profile image',
        category: 'technical',
        page: {
            width: 794,
            height: 1123,
            padding: { top: 32, right: 32, bottom: 32, left: 32 },
            margins: { section: 20, entry: 16 },
        },
        typography: {
            fontFamily: "'Inter', Arial, Helvetica, sans-serif",
            sizes: { name: 28, sectionTitle: 13, jobTitle: 12, body: 11, caption: 10 },
            weights: { name: 700, sectionTitle: 700, jobTitle: 700, body: 400 },
            lineHeights: { tight: 1.2, normal: 1.5, relaxed: 1.6 },
        },
        layout: {
            headerStyle: 'left',
            columns: 2,
            sectionOrder: ['profile', 'education', 'skills', 'experience', 'projects', 'certifications'],
        },
        rules: {
            maxBulletsPerRole: 4,
            bulletMinLength: 40,
            dateAlignment: 'right',
            sectionTitleCase: 'uppercase',
            includeSectionDividers: false,
        },
        colorScheme: {
            primary: '#2B2B2B',
            secondary: '#4A4A4A',
            accent: '#6B6B6B',
            divider: '#CFCFCF',
        },
        masterPrompt: 'Optimize resume for modern two-column layout...',
    }
};
