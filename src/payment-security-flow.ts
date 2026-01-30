/**
 * PAYMENT SECURITY FLOW
 * Secure payment verification and download protection
 * 
 * PRINCIPLE: No download before payment verification
 * 
 * Features:
 * - Token-based post-payment links
 * - Expiring download URLs
 * - Server-side verification
 * - Download tracking
 * - Rate limiting
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PaymentRecord {
    paymentId: string;
    userId: string;
    templateId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: number;
    completedAt: number | null;
    metadata: Record<string, unknown>;
}

export interface DownloadEntitlement {
    entitlementId: string;
    userId: string;
    templateId: string;
    paymentId: string;
    grantedAt: number;
    expiresAt: number | null;  // null = never expires
    downloadsUsed: number;
    maxDownloads: number;
    isActive: boolean;
}

export interface SecureDownloadLink {
    url: string;
    token: string;
    expiresAt: number;
    remainingDownloads: number;
}

export interface VerificationResult {
    verified: boolean;
    reason?: string;
    entitlement?: DownloadEntitlement;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const DOWNLOAD_LINK_EXPIRY_MINUTES = 30;
const MAX_DOWNLOADS_PER_PURCHASE = 5;
const RATE_LIMIT_DOWNLOADS_PER_HOUR = 10;

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE (Replace with database in production)
// ═══════════════════════════════════════════════════════════════

class PaymentStore {
    private payments: Map<string, PaymentRecord> = new Map();
    private entitlements: Map<string, DownloadEntitlement> = new Map();
    private downloadTokens: Map<string, {
        userId: string;
        templateId: string;
        entitlementId: string;
        createdAt: number;
        expiresAt: number;
        downloadCount: number;
    }> = new Map();
    private downloadLog: Map<string, number[]> = new Map();  // userId -> timestamps
    
    // ─────────────────────────────────────────────────────────────
    // PAYMENT RECORDS
    // ─────────────────────────────────────────────────────────────
    
    createPayment(payment: PaymentRecord): void {
        this.payments.set(payment.paymentId, payment);
    }
    
    getPayment(paymentId: string): PaymentRecord | undefined {
        return this.payments.get(paymentId);
    }
    
    updatePaymentStatus(paymentId: string, status: PaymentStatus): void {
        const payment = this.payments.get(paymentId);
        if (payment) {
            payment.status = status;
            if (status === 'completed') {
                payment.completedAt = Date.now();
            }
            this.payments.set(paymentId, payment);
        }
    }
    
    getPaymentsByUser(userId: string): PaymentRecord[] {
        return Array.from(this.payments.values())
            .filter(p => p.userId === userId);
    }
    
    // ─────────────────────────────────────────────────────────────
    // ENTITLEMENTS
    // ─────────────────────────────────────────────────────────────
    
    createEntitlement(entitlement: DownloadEntitlement): void {
        this.entitlements.set(entitlement.entitlementId, entitlement);
    }
    
    getEntitlement(entitlementId: string): DownloadEntitlement | undefined {
        return this.entitlements.get(entitlementId);
    }
    
    getEntitlementByPayment(paymentId: string): DownloadEntitlement | undefined {
        return Array.from(this.entitlements.values())
            .find(e => e.paymentId === paymentId);
    }
    
    getEntitlementsByUser(userId: string): DownloadEntitlement[] {
        return Array.from(this.entitlements.values())
            .filter(e => e.userId === userId);
    }
    
    getUserTemplateEntitlement(userId: string, templateId: string): DownloadEntitlement | undefined {
        return Array.from(this.entitlements.values())
            .find(e => e.userId === userId && e.templateId === templateId && e.isActive);
    }
    
    incrementDownloadCount(entitlementId: string): void {
        const entitlement = this.entitlements.get(entitlementId);
        if (entitlement) {
            entitlement.downloadsUsed++;
            if (entitlement.downloadsUsed >= entitlement.maxDownloads) {
                entitlement.isActive = false;
            }
            this.entitlements.set(entitlementId, entitlement);
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // DOWNLOAD TOKENS
    // ─────────────────────────────────────────────────────────────
    
    createDownloadToken(
        token: string,
        userId: string,
        templateId: string,
        entitlementId: string
    ): void {
        this.downloadTokens.set(token, {
            userId,
            templateId,
            entitlementId,
            createdAt: Date.now(),
            expiresAt: Date.now() + (DOWNLOAD_LINK_EXPIRY_MINUTES * 60 * 1000),
            downloadCount: 0
        });
    }
    
    getDownloadToken(token: string) {
        return this.downloadTokens.get(token);
    }
    
    incrementTokenDownload(token: string): void {
        const tokenData = this.downloadTokens.get(token);
        if (tokenData) {
            tokenData.downloadCount++;
            this.downloadTokens.set(token, tokenData);
        }
    }
    
    invalidateToken(token: string): void {
        this.downloadTokens.delete(token);
    }
    
    // ─────────────────────────────────────────────────────────────
    // RATE LIMITING
    // ─────────────────────────────────────────────────────────────
    
    logDownload(userId: string): void {
        const timestamps = this.downloadLog.get(userId) || [];
        timestamps.push(Date.now());
        // Keep only last hour's downloads
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentTimestamps = timestamps.filter(t => t > oneHourAgo);
        this.downloadLog.set(userId, recentTimestamps);
    }
    
    getDownloadCountLastHour(userId: string): number {
        const timestamps = this.downloadLog.get(userId) || [];
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return timestamps.filter(t => t > oneHourAgo).length;
    }
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT SECURITY SERVICE
// ═══════════════════════════════════════════════════════════════

class PaymentSecurityService {
    private store: PaymentStore = new PaymentStore();
    
    // ─────────────────────────────────────────────────────────────
    // PAYMENT PROCESSING
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Initialize a payment (before actual payment processor)
     */
    initializePayment(
        userId: string,
        templateId: string,
        amount: number,
        currency: string = 'USD'
    ): PaymentRecord {
        const paymentId = this.generatePaymentId();
        
        const payment: PaymentRecord = {
            paymentId,
            userId,
            templateId,
            amount,
            currency,
            status: 'pending',
            createdAt: Date.now(),
            completedAt: null,
            metadata: {}
        };
        
        this.store.createPayment(payment);
        return payment;
    }
    
    /**
     * Complete payment and grant entitlement
     * This should be called after payment processor confirms payment
     */
    completePayment(paymentId: string): {
        success: boolean;
        entitlement?: DownloadEntitlement;
        error?: string;
    } {
        const payment = this.store.getPayment(paymentId);
        
        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }
        
        if (payment.status !== 'pending') {
            return { success: false, error: `Payment already ${payment.status}` };
        }
        
        // Update payment status
        this.store.updatePaymentStatus(paymentId, 'completed');
        
        // Create entitlement
        const entitlement = this.grantEntitlement(
            payment.userId,
            payment.templateId,
            paymentId
        );
        
        return { success: true, entitlement };
    }
    
    /**
     * Handle payment failure
     */
    failPayment(paymentId: string, reason?: string): void {
        this.store.updatePaymentStatus(paymentId, 'failed');
        
        const payment = this.store.getPayment(paymentId);
        if (payment) {
            payment.metadata.failureReason = reason;
        }
    }
    
    /**
     * Process refund
     */
    refundPayment(paymentId: string): {
        success: boolean;
        error?: string;
    } {
        const payment = this.store.getPayment(paymentId);
        
        if (!payment) {
            return { success: false, error: 'Payment not found' };
        }
        
        if (payment.status !== 'completed') {
            return { success: false, error: 'Can only refund completed payments' };
        }
        
        // Update payment status
        this.store.updatePaymentStatus(paymentId, 'refunded');
        
        // Revoke entitlement
        const entitlement = this.store.getEntitlementByPayment(paymentId);
        if (entitlement) {
            entitlement.isActive = false;
            this.store.createEntitlement(entitlement); // Update
        }
        
        return { success: true };
    }
    
    // ─────────────────────────────────────────────────────────────
    // ENTITLEMENT MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Grant download entitlement after payment
     */
    private grantEntitlement(
        userId: string,
        templateId: string,
        paymentId: string
    ): DownloadEntitlement {
        const entitlement: DownloadEntitlement = {
            entitlementId: this.generateEntitlementId(),
            userId,
            templateId,
            paymentId,
            grantedAt: Date.now(),
            expiresAt: null, // Never expires
            downloadsUsed: 0,
            maxDownloads: MAX_DOWNLOADS_PER_PURCHASE,
            isActive: true
        };
        
        this.store.createEntitlement(entitlement);
        return entitlement;
    }
    
    /**
     * Check if user has valid entitlement
     */
    checkEntitlement(userId: string, templateId: string): VerificationResult {
        const entitlement = this.store.getUserTemplateEntitlement(userId, templateId);
        
        if (!entitlement) {
            return {
                verified: false,
                reason: 'No purchase found for this template'
            };
        }
        
        if (!entitlement.isActive) {
            return {
                verified: false,
                reason: 'Entitlement is no longer active'
            };
        }
        
        if (entitlement.expiresAt && Date.now() > entitlement.expiresAt) {
            return {
                verified: false,
                reason: 'Entitlement has expired'
            };
        }
        
        if (entitlement.downloadsUsed >= entitlement.maxDownloads) {
            return {
                verified: false,
                reason: `Download limit reached (${entitlement.maxDownloads} downloads)`
            };
        }
        
        return {
            verified: true,
            entitlement
        };
    }
    
    // ─────────────────────────────────────────────────────────────
    // SECURE DOWNLOAD LINKS
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Generate a secure, expiring download link
     */
    generateSecureDownloadLink(
        userId: string,
        templateId: string
    ): SecureDownloadLink | { error: string } {
        // Verify entitlement
        const verification = this.checkEntitlement(userId, templateId);
        
        if (!verification.verified) {
            return { error: verification.reason || 'Not entitled to download' };
        }
        
        // Check rate limit
        if (!this.checkRateLimit(userId)) {
            return { error: 'Too many download requests. Please try again later.' };
        }
        
        // Generate secure token
        const token = this.generateSecureToken();
        const expiresAt = Date.now() + (DOWNLOAD_LINK_EXPIRY_MINUTES * 60 * 1000);
        
        // Store token
        this.store.createDownloadToken(
            token,
            userId,
            templateId,
            verification.entitlement!.entitlementId
        );
        
        // Build URL
        const url = this.buildDownloadUrl(token, templateId);
        
        return {
            url,
            token,
            expiresAt,
            remainingDownloads: verification.entitlement!.maxDownloads - verification.entitlement!.downloadsUsed
        };
    }
    
    /**
     * Verify download token before serving file
     */
    verifyDownloadToken(
        token: string,
        userId: string
    ): { valid: boolean; reason?: string } {
        const tokenData = this.store.getDownloadToken(token);
        
        if (!tokenData) {
            return { valid: false, reason: 'Invalid or expired token' };
        }
        
        if (tokenData.userId !== userId) {
            return { valid: false, reason: 'Token does not belong to user' };
        }
        
        if (Date.now() > tokenData.expiresAt) {
            this.store.invalidateToken(token);
            return { valid: false, reason: 'Token has expired' };
        }
        
        // Verify entitlement still valid
        const verification = this.checkEntitlement(userId, tokenData.templateId);
        if (!verification.verified) {
            return { valid: false, reason: verification.reason };
        }
        
        return { valid: true };
    }
    
    /**
     * Record a successful download
     */
    recordDownload(token: string, userId: string): void {
        const tokenData = this.store.getDownloadToken(token);
        
        if (tokenData) {
            // Increment token download count
            this.store.incrementTokenDownload(token);
            
            // Increment entitlement download count
            this.store.incrementDownloadCount(tokenData.entitlementId);
            
            // Log for rate limiting
            this.store.logDownload(userId);
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // RATE LIMITING
    // ─────────────────────────────────────────────────────────────
    
    private checkRateLimit(userId: string): boolean {
        const downloadCount = this.store.getDownloadCountLastHour(userId);
        return downloadCount < RATE_LIMIT_DOWNLOADS_PER_HOUR;
    }
    
    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────
    
    private generatePaymentId(): string {
        return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    
    private generateEntitlementId(): string {
        return `ent_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    
    private generateSecureToken(): string {
        // Generate a cryptographically strong token
        const array = new Uint8Array(32);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            // Fallback for non-browser environments
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
        }
        
        return Array.from(array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    
    private buildDownloadUrl(token: string, templateId: string): string {
        // In production, this would be your API endpoint
        const baseUrl = '/api/download';
        return `${baseUrl}?token=${token}&template=${templateId}&ts=${Date.now()}`;
    }
    
    // ─────────────────────────────────────────────────────────────
    // PUBLIC ACCESSORS
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Get user's payment history
     */
    getUserPayments(userId: string): PaymentRecord[] {
        return this.store.getPaymentsByUser(userId);
    }
    
    /**
     * Get user's entitlements
     */
    getUserEntitlements(userId: string): DownloadEntitlement[] {
        return this.store.getEntitlementsByUser(userId);
    }
    
    /**
     * Check if user has purchased a template
     */
    hasUserPurchased(userId: string, templateId: string): boolean {
        const entitlement = this.store.getUserTemplateEntitlement(userId, templateId);
        return entitlement !== undefined && entitlement.isActive;
    }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const paymentSecurityService = new PaymentSecurityService();

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD FLOW HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Complete download flow with all security checks
 */
export async function secureDownloadFlow(
    userId: string,
    templateId: string
): Promise<{
    success: boolean;
    downloadUrl?: string;
    expiresAt?: number;
    error?: string;
}> {
    // Step 1: Check if user has purchased
    const hasPurchased = paymentSecurityService.hasUserPurchased(userId, templateId);
    
    if (!hasPurchased) {
        return {
            success: false,
            error: 'Please purchase this template first'
        };
    }
    
    // Step 2: Generate secure download link
    const linkResult = paymentSecurityService.generateSecureDownloadLink(userId, templateId);
    
    if ('error' in linkResult) {
        return {
            success: false,
            error: linkResult.error
        };
    }
    
    return {
        success: true,
        downloadUrl: linkResult.url,
        expiresAt: linkResult.expiresAt
    };
}

/**
 * Verify and serve download
 * Call this when handling download request
 */
export function verifyAndServeDownload(
    token: string,
    userId: string
): {
    authorized: boolean;
    error?: string;
} {
    // Verify token
    const verification = paymentSecurityService.verifyDownloadToken(token, userId);
    
    if (!verification.valid) {
        return {
            authorized: false,
            error: verification.reason
        };
    }
    
    // Record the download
    paymentSecurityService.recordDownload(token, userId);
    
    return { authorized: true };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    paymentSecurityService,
    secureDownloadFlow,
    verifyAndServeDownload
};
