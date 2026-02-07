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
    features?: string[];
    comingSoon?: boolean;
    locked?: boolean;
}

// TEMPLATES - Single Free Template Only
export const TEMPLATES: TemplateStyle[] = [
    {
        id: 'template1free',
        name: 'Classic ATS Resume',
        description: 'Clean single-column format. Works with all ATS systems. Simple, professional look.',
        price: 0,
        category: 'professional',
        headerStyle: 'classic',
        colorScheme: {
            primary: '#000000',
            secondary: '#000000',
            accent: '#0066cc'
        },
        config: TEMPLATE_CONFIGS.template1free,
        features: [
            'ATS-compatible formatting',
            'Single-column layout',
            'Clean professional design',
            'Standard fonts for readability',
            'Free forever'
        ]
    }
];
    }
];

// Default template
export const DEFAULT_TEMPLATE = TEMPLATES[0];

export const getTemplate = (id: string): TemplateStyle | undefined => {
    return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
};

export const getTemplateClass = (id: string): string => {
    return id || 'template1free';
};
