/**
 * Firewall-style security middleware
 * - Global rate limit
 * - Request size limit
 * - Security headers (CSP, XSS, etc.)
 */

import rateLimit from 'express-rate-limit';

// Global API rate limit: 100 req/min per IP (stricter limits on sensitive routes)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth/admin (5 req/min)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request body size limit (already set by express.json({ limit }) in server)
export const MAX_BODY_SIZE = '500kb';
