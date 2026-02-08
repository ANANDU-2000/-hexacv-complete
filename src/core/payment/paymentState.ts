import { PaymentRecord } from '../types';

export function getUnlockedTemplates(sessionId: string): string[] {
    try {
        const unlocked = localStorage.getItem(`unlocked_templates_${sessionId}`);
        return unlocked ? JSON.parse(unlocked) : [];
    } catch {
        return [];
    }
}

export function isTemplateUnlocked(sessionId: string, templateId: string): boolean {
    const unlocked = getUnlockedTemplates(sessionId);
    return unlocked.includes(templateId);
}

export function unlockTemplate(sessionId: string, templateId: string): void {
    const unlocked = getUnlockedTemplates(sessionId);
    if (!unlocked.includes(templateId)) {
        unlocked.push(templateId);
        localStorage.setItem(`unlocked_templates_${sessionId}`, JSON.stringify(unlocked));
    }
}

export function getPendingPayments(sessionId: string): PaymentRecord[] {
    try {
        const payments = localStorage.getItem(`payments_${sessionId}`);
        return payments ? JSON.parse(payments) : [];
    } catch {
        return [];
    }
}

export function addPaymentRecord(sessionId: string, record: PaymentRecord): void {
    const payments = getPendingPayments(sessionId);
    payments.push(record);
    localStorage.setItem(`payments_${sessionId}`, JSON.stringify(payments));
}
