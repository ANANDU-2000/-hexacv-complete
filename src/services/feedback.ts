/**
 * feedback.ts
 * Service to handle local user feedback storage and retrieval.
 * In a production env, this would connect to a backend API.
 */

export interface FeedbackItem {
    id: string;
    userName: string;
    role: string;
    content: string;
    rating: number;
    date: string;
    isFeatured: boolean;
}

const STORAGE_KEY = 'hexacv_user_feedback';

const INITIAL_FEEDBACK: FeedbackItem[] = [
    {
        id: '1',
        userName: 'Sarah Jenkins',
        role: 'Software Engineer at Google',
        content: 'HexaCV helped me bypass the ATS at three major tech companies. The keyword extraction is a game-changer.',
        rating: 5,
        date: '2026-01-15',
        isFeatured: true
    },
    {
        id: '2',
        userName: 'Michael Chen',
        role: 'Graduate Student',
        content: 'I love that I don\'t have to create an account. It\'s fast, private, and the templates look professional.',
        rating: 5,
        date: '2026-01-20',
        isFeatured: true
    },
    {
        id: '3',
        userName: 'Jessica Williams',
        role: 'Marketing Manager',
        content: 'The bullet point improver transformed my mundane descriptions into high-impact achievements.',
        rating: 5,
        date: '2026-02-01',
        isFeatured: true
    }
];

export const feedbackService = {
    getFeedback(): FeedbackItem[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Seed initial data if empty
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK));
            return INITIAL_FEEDBACK;
        }
        return JSON.parse(stored);
    },

    submitFeedback(name: string, role: string, content: string, rating: number): FeedbackItem {
        const items = this.getFeedback();
        const newItem: FeedbackItem = {
            id: Date.now().toString(),
            userName: name || 'Anonymous',
            role: role || 'User',
            content,
            rating,
            date: new Date().toISOString().split('T')[0],
            isFeatured: false
        };
        const updated = [newItem, ...items];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newItem;
    },

    deleteFeedback(id: string) {
        const items = this.getFeedback();
        const updated = items.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    toggleFeatured(id: string) {
        const items = this.getFeedback();
        const updated = items.map(item =>
            item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    resetToProduction() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
