import express from 'express';

const router = express.Router();

// Hardcoded templates (replace with database later)
const TEMPLATES = [
  {
    id: 'template1free',
    name: 'Classic Resume (Free)',
    description: 'Clean, professional template perfect for any industry',
    price: 0,
    badge: 'FREE',
    bestFor: ['Entry Level', 'Mid Level', 'Senior'],
    supportsPhoto: false,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Engineering', 'Business', 'Design', 'Marketing'],
    previewImageUrl: '/templates/template1free.html'
  },
  {
    id: 'professional',
    name: 'Professional Photo Resume',
    description: 'Modern template with photo - stand out from the crowd',
    price: 99,
    badge: 'PREMIUM',
    bestFor: ['Mid Level', 'Senior', 'Executive'],
    supportsPhoto: true,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Engineering', 'Business', 'Design'],
    previewImageUrl: '/templates/professional.html'
  },
  {
    id: 'modern',
    name: 'Modern Resume',
    description: 'Contemporary design with clean aesthetics',
    price: 99,
    badge: 'PREMIUM',
    bestFor: ['All Levels'],
    supportsPhoto: false,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Tech', 'Design', 'Marketing'],
    previewImageUrl: '/templates/modern.html'
  },
  {
    id: 'executive',
    name: 'Executive Resume',
    description: 'Premium template for leadership positions',
    price: 99,
    badge: 'PREMIUM',
    bestFor: ['Senior', 'Executive'],
    supportsPhoto: false,
    atsSafe: true,
    layout: 'single-column',
    roleFamilies: ['Executive', 'Management'],
    previewImageUrl: '/templates/executive.html'
  }
];

// GET /api/templates - Fetch all active templates
router.get('/', async (req, res) => {
  try {
    res.json({ templates: TEMPLATES });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/access/:templateId - Check template access
router.get('/access/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const sessionId = req.cookies.sessionId || req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Find template
    const template = TEMPLATES.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Free templates are always accessible
    if (template.price === 0) {
      return res.json({ hasAccess: true, reason: 'free_template' });
    }

    // For paid templates - in production, check orders
    // For now, return false (requires payment)
    return res.json({ 
      hasAccess: false, 
      reason: 'payment_required',
      price: template.price 
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

export default router;
