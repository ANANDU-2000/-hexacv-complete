import type { TemplateConfig } from '@hexaresume/shared-types'

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, modern design perfect for tech professionals',
    price: 0,
    isActive: true,
    badge: 'FREE',
    bestFor: ['Software Engineer', 'Data Scientist', 'Product Manager'],
    supportsPhoto: false,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Engineering', 'Tech', 'Product'],
    htmlFilePath: '/templates/modern.html'
  },
  {
    id: 'professional',
    name: 'Professional Photo Resume',
    description: 'Modern template with photo - stand out from the crowd',
    price: 99,
    isActive: true,
    badge: 'PREMIUM',
    bestFor: ['Mid Level', 'Senior', 'Executive'],
    supportsPhoto: true,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Engineering', 'Business', 'Design'],
    htmlFilePath: '/templates/professional.html'
  },
  {
    id: 'executive',
    name: 'Executive Resume',
    description: 'Premium template for leadership positions',
    price: 99,
    isActive: true,
    badge: 'PREMIUM',
    bestFor: ['Senior', 'Executive'],
    supportsPhoto: false,
    atsSafe: true,
    layout: 'two-column',
    roleFamilies: ['Executive', 'Management'],
    htmlFilePath: '/templates/executive.html'
  },
]

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
