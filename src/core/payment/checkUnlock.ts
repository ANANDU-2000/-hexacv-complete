/**
 * Check template unlock status from backend (single source of truth).
 * Optionally cache in localStorage to avoid repeated requests.
 */

const API_BASE = typeof window !== 'undefined' ? '' : '';

export async function checkUnlockStatus(
  sessionId: string,
  templateId: string,
  options?: { cache?: boolean }
): Promise<boolean> {
  const useCache = options?.cache !== false;
  const cacheKey = `unlocked_templates_${sessionId}`;

  try {
    const res = await fetch(
      `${API_BASE}/api/templates/unlock-status?template=${encodeURIComponent(templateId)}&session=${encodeURIComponent(sessionId)}`
    );
    const data = await res.json().catch(() => ({}));
    const unlocked = data.unlocked === true;

    if (useCache && unlocked) {
      try {
        const list: string[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        if (!list.includes(templateId)) {
          list.push(templateId);
          localStorage.setItem(cacheKey, JSON.stringify(list));
        }
      } catch {
        // ignore cache errors
      }
    }

    return unlocked;
  } catch {
    // Fallback: check local cache only (e.g. after webhook already ran and we cached)
    if (useCache) {
      try {
        const list: string[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        return list.includes(templateId);
      } catch {
        return false;
      }
    }
    return false;
  }
}
