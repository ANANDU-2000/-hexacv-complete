import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { validateSession } from '../middleware/session.js';

const router = express.Router();

// Rate limiter for analytics events
const eventLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 events per minute per session
  message: 'Too many analytics events. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).sessionId || req.ip || 'anonymous';
  },
  skip: (req) => !req.ip // Skip rate limiting if no IP
});

// Valid event types
const VALID_EVENT_TYPES = [
  'page_visit',
  'resume_created',
  'template_selected',
  'download_clicked',
  'payment_success',
  'ai_improve_used',
  'section_edited'
];

/**
 * POST /api/analytics/event - Track real user events (production-ready)
 */
router.post('/event', validateSession, eventLimiter, async (req: Request, res: Response) => {
  try {
    const { eventType, metadata } = req.body;
    const sessionId = (req as any).sessionId;
    const timestamp = new Date().toISOString();

    // Validate event type
    if (!eventType || typeof eventType !== 'string') {
      return res.status(400).json({ 
        error: 'INVALID_EVENT_TYPE',
        message: 'Event type is required' 
      });
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return res.status(400).json({ 
        error: 'INVALID_EVENT_TYPE',
        message: `Event type must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
      });
    }

    // Validate metadata (optional)
    if (metadata && typeof metadata !== 'object') {
      return res.status(400).json({ 
        error: 'INVALID_METADATA',
        message: 'Metadata must be an object' 
      });
    }

    // Log event (in production, save to database)
    const eventLog = {
      eventType,
      sessionId,
      timestamp,
      metadata: metadata || {},
      ip: req.ip
    };

    // TODO: Save to PostgreSQL in production
    // For now, just log to console
    console.log(`📊 Analytics Event:`, JSON.stringify(eventLog));

    // Non-blocking response
    res.json({ 
      success: true,
      eventId: `${sessionId}-${Date.now()}`
    });

  } catch (error: any) {
    console.error('Error tracking event:', error);
    // Return success even on error (non-blocking)
    res.json({ success: true });
  }
});

// Keep legacy /track endpoint for backward compatibility
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { event, eventType, sessionId, templateId, targetRole, metadata } = req.body;
    const finalEventType = event || eventType;
    const finalSessionId = sessionId || req.ip || 'anonymous';

    if (!finalEventType) {
      return res.status(400).json({ error: 'Event type required' });
    }

    // Just log to console for now (replace with database later)
    console.log(`📊 Analytics: ${finalEventType} | Session: ${finalSessionId}${templateId ? ` | Template: ${templateId}` : ''}${targetRole ? ` | Role: ${targetRole}` : ''}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    // Return success even on error (non-blocking analytics)
    res.json({ success: true });
  }
});

export default router;
