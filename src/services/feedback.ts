/**
 * Feedback service stub (local/static only until backend exists).
 * Used by AdminDashboard and TestimonialsSlider.
 */

export interface FeedbackItem {
  id: string;
  author: string;
  /** @deprecated Use author. Kept for backward compatibility. */
  userName?: string;
  role?: string;
  content: string;
  rating?: number;
  isFeatured?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = 'hexacv_feedback';

function getStored(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const feedbackService = {
  getFeedback(): FeedbackItem[] {
    const stored = getStored();
    if (stored.length > 0) return stored;
    return [
      {
        id: '1',
        author: 'Priya S.',
        role: 'Software Engineer',
        content: 'Clean templates and straightforward flow. Got my resume ready in minutes.',
        rating: 5,
        isFeatured: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        author: 'Rahul K.',
        role: 'Product Manager',
        content: 'No signup was a plus. Format worked well with our ATS.',
        rating: 5,
        isFeatured: true,
        createdAt: new Date().toISOString(),
      },
    ];
  },
  addFeedback(_item: Omit<FeedbackItem, 'id' | 'createdAt'>): void {
    const list = getStored();
    list.push({
      ..._item,
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
  toggleFeatured(id: string): void {
    const list = getStored().map((item) =>
      item.id === id ? { ...item, isFeatured: !item.isFeatured } : item
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
  deleteFeedback(id: string): void {
    const list = getStored().filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  },
  resetToProduction(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
