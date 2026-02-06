
import { A4_DIMENSIONS } from './a4-page-system';
import { TEMPLATES as BASE_TEMPLATES } from './templates';
import { TemplateConfig } from './types';

export const A4_WIDTH = A4_DIMENSIONS.WIDTH;
export const A4_HEIGHT = A4_DIMENSIONS.HEIGHT;

export const TEMPLATES: TemplateConfig[] = BASE_TEMPLATES.map(t => ({
    ...t.config!,
    features: t.features,
    price: t.price,
    priceLabel: t.price === 0 ? 'Free' : `₹${t.price}`,
    enabled: true
}));
