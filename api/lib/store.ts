/**
 * Orders and unlocks store.
 * In production, replace with InsForge DB (PostgREST) using INSFORGE_SERVICE_KEY.
 */

export interface OrderRow {
  txnid: string;
  sessionId: string;
  templateId: string;
  amount: number; // in INR (rupees)
  amountPaise: number;
  email: string;
  phone?: string;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
  verifiedAt?: string;
}

export interface UnlockRow {
  sessionId: string;
  templateId: string;
  orderTxnid: string;
  unlockedAt: string;
}

const orders = new Map<string, OrderRow>();
const unlocks = new Map<string, UnlockRow>(); // key = `${sessionId}:${templateId}`

function unlockKey(sessionId: string, templateId: string): string {
  return `${sessionId}:${templateId}`;
}

export function insertOrder(order: OrderRow): void {
  orders.set(order.txnid, order);
}

export function getOrderByTxnid(txnid: string): OrderRow | undefined {
  return orders.get(txnid);
}

export function setOrderVerified(txnid: string): void {
  const o = orders.get(txnid);
  if (o) {
    o.status = 'verified';
    o.verifiedAt = new Date().toISOString();
  }
}

export function addUnlock(sessionId: string, templateId: string, orderTxnid: string): void {
  const key = unlockKey(sessionId, templateId);
  unlocks.set(key, {
    sessionId,
    templateId,
    orderTxnid,
    unlockedAt: new Date().toISOString(),
  });
}

export function isUnlocked(sessionId: string, templateId: string): boolean {
  return unlocks.has(unlockKey(sessionId, templateId));
}
