// Resume Templates Module
// Updated to use template configuration schema from template-config.ts

import { TEMPLATE_CONFIGS, type TemplateConfig } from './template-config';

export interface TemplateStyle {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'professional' | 'technical' | 'executive';
    headerStyle: 'classic' | 'modern' | 'minimal';
    colorScheme: {
        primary: string;
        secondary: string;
        accent: string;
    };
    config?: TemplateConfig;
}

export const TEMPLATES: TemplateStyle[] = [
    {
        id: 'template1free',
        name: 'Free ATS Template',
        description: 'Clean, ATS-safe, keyword-aligned resume',
        price: 0,
        category: 'professional',
        headerStyle: 'classic',
        colorScheme: {
            primary: '#000000',
            secondary: '#000000',
            accent: '#0066cc'
        },
        config: TEMPLATE_CONFIGS.template1free
    },
    {
        id: 'template2',
        name: 'Premium ATS',
        description: 'Recruiter-grade ATS layout with premium spacing',
        price: 49,
        category: 'professional',
        headerStyle: 'classic',
        colorScheme: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#000000'
        },
        config: TEMPLATE_CONFIGS.template2
    }
];

export const getTemplate = (id: string): TemplateStyle | undefined => {
    return TEMPLATES.find(t => t.id === id);
};

export const getTemplateClass = (id: string): string => {
    return id;
};
