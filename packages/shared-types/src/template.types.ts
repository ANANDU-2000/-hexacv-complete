// Template Configuration Types
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  badge?: string;
  bestFor: string[];
  supportsPhoto: boolean;
  atsSafe: boolean;
  layout: 'single-column' | 'two-column' | 'modern' | 'executive';
  roleFamilies: string[];
  previewImageUrl?: string;
  htmlFilePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateAccessCheck {
  hasAccess: boolean;
  reason: 'free_template' | 'payment_required' | 'payment_verified';
  price?: number;
}
