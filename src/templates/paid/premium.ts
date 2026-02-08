import { TemplateConfig } from '../../core/types';

/** Single paid option: Advanced ATS Rewrite (₹49 one-time). No multiple premium templates. */
export const ADVANCED_TEMPLATE: TemplateConfig = {
    id: 'template2',
    name: 'Advanced ATS Rewrite',
    description: 'Deep JD-aligned rewrite + premium template. One-time ₹49.',
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
};

/** Legacy: kept for any code that still references template3 by id. Not shown in UI. */
export const PREMIUM_TEMPLATES: Record<string, TemplateConfig> = {
    template2: ADVANCED_TEMPLATE,
};
