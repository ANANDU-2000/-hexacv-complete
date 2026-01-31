// Resume Templates Module
// SINGLE FREE TEMPLATE - No paid templates, no premium features

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

// SINGLE FREE TEMPLATE - This is the ONLY template, FREE FOREVER
export const TEMPLATES: TemplateStyle[] = [
    {
        id: 'template1free',
        name: 'Free ATS Template',
        description: 'Clean, ATS-safe, keyword-aligned resume - FREE FOREVER',
        price: 0,
        category: 'professional',
        headerStyle: 'classic',
        colorScheme: {
            primary: '#000000',
            secondary: '#000000',
            accent: '#0066cc'
        },
        config: TEMPLATE_CONFIGS.template1free
    }
];

// Default template - always returns the free template
export const DEFAULT_TEMPLATE = TEMPLATES[0];

export const getTemplate = (id: string): TemplateStyle | undefined => {
    // Always return the free template regardless of ID
    return TEMPLATES[0];
};

export const getTemplateClass = (id: string): string => {
    return 'template1free';
};
