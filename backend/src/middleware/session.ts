import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// In-memory session store (replace with Redis in production)
const sessions = new Map<string, { createdAt: number; lastActivity: number }>();
const SESSION_TTL = 60 * 60 * 1000; // 1 hour

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL) {
      sessions.delete(sessionId);
      console.log(`🗑️ Cleaned up expired session: ${sessionId}`);
    }
  }
}, 10 * 60 * 1000);

/**
 * Validate session ID format (UUID v4)
 */
function isValidSessionId(sessionId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
}

/**
 * Session validation middleware
 * Checks X-Session-ID header and validates session
 */
export function validateSession(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers['x-session-id'] as string;

  // Check session ID exists
  if (!sessionId) {
    return res.status(403).json({
      error: 'SESSION_REQUIRED',
      message: 'Session ID required in X-Session-ID header'
    });
  }

  // Validate UUID format
  if (!isValidSessionId(sessionId)) {
    return res.status(403).json({
      error: 'INVALID_SESSION',
      message: 'Invalid session ID format'
    });
  }

  // Check if session exists or create new one
  let session = sessions.get(sessionId);
  const now = Date.now();

  if (!session) {
    // Create new session
    session = {
      createdAt: now,
      lastActivity: now
    };
    sessions.set(sessionId, session);
    console.log(`✅ New session created: ${sessionId}`);
  } else {
    // Check if session expired
    if (now - session.lastActivity > SESSION_TTL) {
      sessions.delete(sessionId);
      return res.status(403).json({
        error: 'SESSION_EXPIRED',
        message: 'Session expired, please refresh'
      });
    }
    
    // Update last activity
    session.lastActivity = now;
  }

  // Attach session ID to request for use in handlers
  (req as any).sessionId = sessionId;

  next();
}

/**
 * Get session count (for monitoring)
 */
export function getSessionCount(): number {
  return sessions.size;
}

/**
 * Clear all sessions (for testing)
 */
export function clearAllSessions(): void {
  sessions.clear();
}
