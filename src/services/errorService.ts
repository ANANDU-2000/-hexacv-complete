/**
 * ERROR NOTIFICATION SERVICE
 * User-friendly error handling with retry logic
 */

export type ErrorType = 'network' | 'ai' | 'pdf' | 'payment' | 'validation' | 'generic';

export interface ErrorNotification {
    type: ErrorType;
    title: string;
    message: string;
    action?: {
        label: string;
        handler: () => void;
    };
    dismissible: boolean;
}

/**
 * Get user-friendly error notification based on error type
 */
export function getErrorNotification(
    type: ErrorType,
    error: Error | string,
    retryHandler?: () => void
): ErrorNotification {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    switch (type) {
        case 'network':
            return {
                type: 'network',
                title: 'Connection Error',
                message: 'Unable to connect. Check your internet connection and try again.',
                action: retryHandler ? {
                    label: 'Retry',
                    handler: retryHandler
                } : undefined,
                dismissible: true
            };
            
        case 'ai':
            return {
                type: 'ai',
                title: 'AI Service Unavailable',
                message: 'AI rewrite service is temporarily unavailable. Your original content will be used.',
                action: retryHandler ? {
                    label: 'Try Again',
                    handler: retryHandler
                } : undefined,
                dismissible: true
            };
            
        case 'pdf':
            return {
                type: 'pdf',
                title: 'PDF Generation Failed',
                message: 'Unable to generate PDF. Please check your resume content and try again.',
                action: retryHandler ? {
                    label: 'Retry Download',
                    handler: retryHandler
                } : undefined,
                dismissible: true
            };
            
        case 'payment':
            return {
                type: 'payment',
                title: 'Payment Failed',
                message: errorMessage || 'Payment could not be processed. Please try again or contact support.',
                action: retryHandler ? {
                    label: 'Retry Payment',
                    handler: retryHandler
                } : undefined,
                dismissible: true
            };
            
        case 'validation':
            return {
                type: 'validation',
                title: 'Incomplete Resume',
                message: errorMessage || 'Please complete all required fields before continuing.',
                action: undefined,
                dismissible: true
            };
            
        default:
            return {
                type: 'generic',
                title: 'Something Went Wrong',
                message: errorMessage || 'An unexpected error occurred. Please try again.',
                action: retryHandler ? {
                    label: 'Retry',
                    handler: retryHandler
                } : undefined,
                dismissible: true
            };
    }
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError!;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: any): boolean {
    return (
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.message?.includes('timeout') ||
        error.name === 'TypeError' ||
        !navigator.onLine
    );
}

/**
 * Sanitize error message for user display (no stack traces)
 */
export function sanitizeErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    // Remove stack traces and technical details
    const message = error.message || 'Unknown error';
    return message.split('\n')[0].slice(0, 200);
}

/**
 * Log error for debugging (development only)
 */
export function logError(context: string, error: any): void {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    }
    
    // TODO: Send to error tracking service in production (Sentry, etc.)
}
