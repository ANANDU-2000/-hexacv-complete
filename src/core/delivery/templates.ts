import { TemplateConfig } from '../types';
import { BASIC_TEMPLATE } from '../../templates/free/basic';
import { ADVANCED_TEMPLATE } from '../../templates/paid/premium';

/** Only two modes: Free ATS Resume + ATS Optimized Version (₹49 wording improvement). */
export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
    BASIC_TEMPLATE,
    ADVANCED_TEMPLATE,
];


export const getTemplateById = (id: string): TemplateConfig | undefined => {
    return AVAILABLE_TEMPLATES.find(t => t.id === id);
};
