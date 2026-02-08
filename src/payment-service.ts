/**
 * Thin payment wrapper: session ID + unlock status from API only.
 * Uses unified session ID (hexacv_session_id) for payment, unlock, and draft.
 */

import { getSessionId } from './api-service';
import { checkUnlockStatus } from './core/payment/checkUnlock';

export function getCurrentSessionId(): string {
  return getSessionId();
}

/**
 * Check if a template is unlocked for the current user (from backend).
 */
export async function checkTemplateUnlockStatus(
  templateId: string,
  sessionId?: string
): Promise<boolean> {
  const session = sessionId || getCurrentSessionId();
  return checkUnlockStatus(session, templateId, { cache: true });
}

/**
 * Check unlock status for multiple templates.
 */
export async function checkAllTemplateUnlockStatus(
  templateIds: string[]
): Promise<Record<string, boolean>> {
  const sessionId = getCurrentSessionId();
  const results: Record<string, boolean> = {};
  await Promise.all(
    templateIds.map(async (templateId) => {
      results[templateId] = await checkTemplateUnlockStatus(templateId, sessionId);
    })
  );
  return results;
}

export type PaymentStatus = 'none' | 'pending' | 'unlocked';

/**
 * Get payment status for a template (unlocked = from API; pending = show message to wait for webhook).
 */
export async function getPaymentStatus(templateId: string): Promise<PaymentStatus> {
  const unlocked = await checkTemplateUnlockStatus(templateId);
  if (unlocked) return 'unlocked';
  return 'none';
}
