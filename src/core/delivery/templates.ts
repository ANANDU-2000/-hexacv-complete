import { TemplateConfig } from '../types';
import { BASIC_TEMPLATE } from '../../templates/free/basic';
import { PREMIUM_TEMPLATES } from '../../templates/paid/premium';

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
    BASIC_TEMPLATE,
    ...Object.values(PREMIUM_TEMPLATES)
];


export const getTemplateById = (id: string): TemplateConfig | undefined => {
    return AVAILABLE_TEMPLATES.find(t => t.id === id);
};
