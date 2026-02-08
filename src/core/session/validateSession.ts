import { UserSession } from '../types';
import { getSession } from './createSession';
import { SessionError } from '../errors/userErrors';

export function validateSession(sessionId: string): { valid: boolean; session?: UserSession; error?: SessionError } {
    const session = getSession(sessionId);

    if (!session) {
        return { valid: false, error: new SessionError("Session not found") };
    }

    const now = Date.now();
    if (now > session.expiresAt) {
        return { valid: false, error: new SessionError("Session expired") };
    }

    return { valid: true, session };
}

export function isSessionPaid(sessionId: string): boolean {
    const result = validateSession(sessionId);
    if (!result.valid || !result.session) return false;
    return result.session.isPaid;
}
