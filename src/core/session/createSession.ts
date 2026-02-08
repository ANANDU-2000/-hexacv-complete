import { UserSession } from '../types';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createSession(): UserSession {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    const session: UserSession = {
        sessionId,
        createdAt: now,
        expiresAt: now + SESSION_DURATION_MS,
        isPaid: false,
        downloadCount: 0
    };

    // Persist to localStorage (simplified for client-side persistence)
    try {
        localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
        localStorage.setItem('current_session_id', sessionId);
    } catch (e) {
        console.error("Failed to save session", e);
    }

    return session;
}

export function getSession(sessionId: string): UserSession | null {
    try {
        const data = localStorage.getItem(`session_${sessionId}`);
        if (!data) return null;
        return JSON.parse(data) as UserSession;
    } catch (e) {
        return null;
    }
}
