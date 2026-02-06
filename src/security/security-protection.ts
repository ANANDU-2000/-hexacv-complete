// Security Protection Service for HexaCV
// Frontend-only security measures

// ============== RATE LIMITING ==============

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

export const checkRateLimit = (
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetTime - now 
    };
  }

  record.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - record.count, 
    resetIn: record.resetTime - now 
  };
};

// AI API rate limits
export const AI_RATE_LIMITS = {
  gemini: { maxRequests: 60, windowMs: 60000 },  // 60/min
  groq: { maxRequests: 30, windowMs: 60000 },    // 30/min
  parse: { maxRequests: 10, windowMs: 60000 },   // 10/min for resume parsing
};

// ============== INPUT SANITIZATION ==============

// Sanitize text input to prevent XSS
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#96;')
    .trim();
};

// Sanitize URL
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.toLowerCase().trim();
  
  return emailRegex.test(cleaned) ? cleaned : '';
};

// Sanitize phone
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Keep only digits, +, -, (, ), and spaces
  return phone.replace(/[^\d+\-() ]/g, '').trim();
};

// ============== BOT DETECTION ==============

// Simple bot detection (not foolproof, but helps)
export const detectBot = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const suspicious = [
    // No user agent
    !navigator.userAgent,
    // Headless browser indicators
    navigator.webdriver,
    (window as any).phantom,
    (window as any).__nightmare,
    // No plugins (common in headless)
    navigator.plugins?.length === 0,
    // No languages
    !navigator.languages?.length,
  ];
  
  return suspicious.filter(Boolean).length >= 2;
};

// ============== HONEYPOT ==============

// Honeypot field name (hidden field that bots fill)
export const HONEYPOT_FIELD = 'website_url_hp';

export const checkHoneypot = (value: string | undefined): boolean => {
  // If honeypot field has value, it's likely a bot
  return !value || value.trim() === '';
};

// ============== CONTENT SECURITY ==============

// Check for suspicious content patterns
export const checkSuspiciousContent = (text: string): {
  isSuspicious: boolean;
  reasons: string[];
} => {
  const reasons: string[] = [];
  
  if (!text) return { isSuspicious: false, reasons: [] };
  
  // Check for script injection attempts
  if (/<script/i.test(text)) {
    reasons.push('Script tags detected');
  }
  
  // Check for event handlers
  if (/on\w+\s*=/i.test(text)) {
    reasons.push('Event handlers detected');
  }
  
  // Check for javascript: protocol
  if (/javascript:/i.test(text)) {
    reasons.push('JavaScript protocol detected');
  }
  
  // Check for data: URLs (potential XSS)
  if (/data:/i.test(text)) {
    reasons.push('Data URL detected');
  }
  
  // Check for excessive length (DoS attempt)
  if (text.length > 50000) {
    reasons.push('Content too long');
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};

// ============== RECOMMENDED CSP ==============

// Content Security Policy recommendations for index.html
export const RECOMMENDED_CSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://www.google-analytics.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s+/g, ' ').trim();

// ============== SECURITY HEADERS ==============

// Recommended security headers (for Vercel config or meta tags)
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// ============== EXPORTS ==============

export default {
  checkRateLimit,
  AI_RATE_LIMITS,
  sanitizeText,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  detectBot,
  checkHoneypot,
  checkSuspiciousContent,
  HONEYPOT_FIELD,
  RECOMMENDED_CSP,
  SECURITY_HEADERS,
};
