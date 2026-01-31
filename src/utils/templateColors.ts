import { TEMPLATES } from '../templates';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

export function getTemplateColors(templateId: string): ColorScheme {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template || !template.colorScheme) {
    return { primary: '#000000', secondary: '#666666', accent: '#0066cc' };
  }
  return template.colorScheme;
}
