import { TemplateConfig } from '../../core/types';

export const BASIC_TEMPLATE: TemplateConfig = {
    id: 'template1free',
    name: 'Free ATS Resume',
    description: 'Clean resume + ATS keywords + basic rewrite. Free.',
    category: 'professional',
    page: {
        width: 794,
        height: 1123,
        padding: { top: 75, right: 68, bottom: 75, left: 68 },
        margins: { section: 14, entry: 12 },
    },
    typography: {
        fontFamily: "'Times New Roman', Times, Georgia, serif",
        sizes: { name: 18, sectionTitle: 11, jobTitle: 10.5, body: 10.5, caption: 10 },
        weights: { name: 700, sectionTitle: 700, jobTitle: 700, body: 400 },
        lineHeights: { tight: 1.25, normal: 1.3, relaxed: 1.35 },
    },
    layout: {
        headerStyle: 'centered',
        columns: 1,
        sectionOrder: ['profile', 'skills', 'experience', 'projects', 'certifications', 'education'],
    },
    rules: {
        maxBulletsPerRole: 5,
        bulletMinLength: 50,
        dateAlignment: 'right',
        sectionTitleCase: 'uppercase',
        includeSectionDividers: true,
    },
    colorScheme: {
        primary: '#000000',
        secondary: '#000000',
        accent: '#0000EE',
        divider: '#000000',
    },
    masterPrompt: 'Rewrite resume content for maximum ATS compatibility...',
};
