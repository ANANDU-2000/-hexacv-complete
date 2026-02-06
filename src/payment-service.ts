/**
 * PAYMENT SERVICE - Admin-Controlled Template Unlock
 * 
 * Flow:
 * 1. User initiates payment -> Payment processed via Razorpay
 * 2. Payment success -> Record stored with 'pending' status
 * 3. Template remains locked until admin manually unlocks
 * 4. Admin reviews payment -> Sets status to 'unlocked'
 * 5. User's next page load -> Template is accessible
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Payment record interface
export interface PaymentRecord {
    oderId: string;
    sessionId: string;
    templateId: string;
    amount: number;
    status: 'pending' | 'verified' | 'unlocked';
    paymentId: string;
    email: string;
    phone: string;
    timestamp: number;
}

// Payment result interface
export interface PaymentResult {
    success: boolean;
    templateId?: string;
    paymentId?: string;
    message?: string;
    pendingApproval?: boolean;
}

// Get current session ID
export function getCurrentSessionId(): string {
    let sessionId = localStorage.getItem('user_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
}

// Generate user ID from email
export function generateUserId(email: string): string {
    return `user_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}`;
}

/**
 * Check if a template is unlocked for the current user
 * This checks the server for admin-approved unlocks
 */
export async function checkTemplateUnlockStatus(
    templateId: string,
    sessionId?: string
): Promise<boolean> {
    const session = sessionId || getCurrentSessionId();
    
    try {
        // First check server for admin-approved unlock
        const response = await fetch(`/api/templates/unlock-status?template=${templateId}&session=${session}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.unlocked === true) {
                // Cache the unlock status locally
                const unlocked = JSON.parse(localStorage.getItem(`unlocked_templates_${session}`) || '[]');
                if (!unlocked.includes(templateId)) {
                    unlocked.push(templateId);
                    localStorage.setItem(`unlocked_templates_${session}`, JSON.stringify(unlocked));
                }
                return true;
            }
        }
    } catch (error) {
        console.log('Server check failed, falling back to local storage');
    }
    
    // Fallback to local storage (for already unlocked templates)
    const unlocked = JSON.parse(localStorage.getItem(`unlocked_templates_${session}`) || '[]');
    return unlocked.includes(templateId);
}

/**
 * Check unlock status for multiple templates
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

/**
 * Record payment for admin review
 * IMPORTANT: This does NOT unlock the template immediately
 */
async function recordPaymentForReview(
    paymentRecord: PaymentRecord
): Promise<boolean> {
    try {
        const response = await fetch('/api/payments/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentRecord)
        });
        
        if (response.ok) {
            console.log('Payment recorded for admin review:', paymentRecord.paymentId);
            return true;
        }
    } catch (error) {
        console.error('Failed to record payment:', error);
    }
    
    // Store locally as backup
    const pendingPayments = JSON.parse(localStorage.getItem('pending_payments') || '[]');
    pendingPayments.push(paymentRecord);
    localStorage.setItem('pending_payments', JSON.stringify(pendingPayments));
    
    return true;
}

/**
 * Load Razorpay script dynamically
 */
function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay'));
        document.body.appendChild(script);
    });
}

/**
 * Initiate payment for a template
 * 
 * IMPORTANT: After successful payment, template is NOT immediately unlocked.
 * Admin must manually review and approve the unlock.
 */
export async function initiatePayment(
    templateId: string,
    templateName: string,
    email: string,
    phone: string
): Promise<PaymentResult> {
    const sessionId = getCurrentSessionId();
    
    // Validate inputs
    if (!email || !email.includes('@')) {
        return {
            success: false,
            message: 'Valid email is required for payment'
        };
    }
    
    try {
        // Load Razorpay script
        await loadRazorpayScript();
        
        // Get Razorpay key from environment
        const razorpayKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
        
        if (!razorpayKey) {
            console.error('Razorpay key not configured');
            return {
                success: false,
                message: 'Payment system not configured. Please contact support.'
            };
        }
        
        // Create order via backend
        let orderId = `order_${Date.now()}`;
        let amount = 4900; // Default ₹49 in paise
        
        try {
            const orderResponse = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId,
                    sessionId,
                    email
                })
            });
            
            if (orderResponse.ok) {
                const orderData = await orderResponse.json();
                orderId = orderData.orderId || orderId;
                amount = orderData.amount || amount;
            }
        } catch (e) {
            console.log('Using client-side order generation');
        }
        
        // Process payment via Razorpay
        return new Promise((resolve) => {
            const options = {
                key: razorpayKey,
                amount: amount,
                currency: 'INR',
                name: 'HexaCV',
                description: `Unlock ${templateName}`,
                order_id: orderId,
                prefill: {
                    email: email,
                    contact: phone || ''
                },
                theme: {
                    color: '#000000'
                },
                handler: async function(response: any) {
                    // Payment successful - record for admin review
                    const paymentRecord: PaymentRecord = {
                        oderId: orderId,
                        sessionId: sessionId,
                        templateId: templateId,
                        amount: amount / 100, // Convert paise to rupees
                        status: 'pending', // IMPORTANT: NOT 'unlocked'
                        paymentId: response.razorpay_payment_id,
                        email: email,
                        phone: phone || '',
                        timestamp: Date.now()
                    };
                    
                    // Record payment for admin review
                    await recordPaymentForReview(paymentRecord);
                    
                    // Store payment locally (NOT unlock)
                    const payments = JSON.parse(localStorage.getItem(`payments_${sessionId}`) || '[]');
                    payments.push({
                        templateId,
                        paymentId: response.razorpay_payment_id,
                        status: 'pending',
                        timestamp: Date.now()
                    });
                    localStorage.setItem(`payments_${sessionId}`, JSON.stringify(payments));
                    
                    resolve({
                        success: true,
                        templateId: templateId,
                        paymentId: response.razorpay_payment_id,
                        pendingApproval: true,
                        message: 'Payment successful! Your template will be unlocked after admin verification (usually within 24 hours).'
                    });
                },
                modal: {
                    ondismiss: function() {
                        resolve({
                            success: false,
                            message: 'Payment cancelled'
                        });
                    }
                }
            };
            
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        });
        
    } catch (error: any) {
        console.error('Payment error:', error);
        return {
            success: false,
            message: error.message || 'Payment failed. Please try again.'
        };
    }
}

/**
 * Check if user has a pending payment for a template
 */
export function hasPendingPayment(templateId: string): boolean {
    const sessionId = getCurrentSessionId();
    const payments = JSON.parse(localStorage.getItem(`payments_${sessionId}`) || '[]');
    return payments.some((p: any) => p.templateId === templateId && p.status === 'pending');
}

/**
 * Get payment status for a template
 */
export function getPaymentStatus(templateId: string): 'none' | 'pending' | 'unlocked' {
    const sessionId = getCurrentSessionId();
    
    // Check if unlocked
    const unlocked = JSON.parse(localStorage.getItem(`unlocked_templates_${sessionId}`) || '[]');
    if (unlocked.includes(templateId)) {
        return 'unlocked';
    }
    
    // Check if pending
    const payments = JSON.parse(localStorage.getItem(`payments_${sessionId}`) || '[]');
    const hasPending = payments.some((p: any) => p.templateId === templateId && p.status === 'pending');
    if (hasPending) {
        return 'pending';
    }
    
    return 'none';
}
