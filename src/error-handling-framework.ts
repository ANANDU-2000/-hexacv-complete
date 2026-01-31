/**
 * COMPREHENSIVE ERROR HANDLING FRAMEWORK
 * Graceful error handling with automatic recovery
 * 
 * PRINCIPLES:
 * - Never crash the app
 * - Always provide user-friendly messages
 * - Always have a fallback action
 * - Log for debugging but show friendly messages
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ErrorCategory = 
    | 'network'
    | 'ai_service'
    | 'validation'
    | 'payment'
    | 'parsing'
    | 'file_operation'
    | 'authentication'
    | 'authorization'
    | 'rate_limit'
    | 'unknown';

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface AppError {
    id: string;
    code: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    message: string;           // Technical message for logging
    userMessage: string;       // Friendly message for user
    timestamp: number;
    context?: Record<string, unknown>;
    stack?: string;
    recoveryAction?: RecoveryAction;
}

export interface RecoveryAction {
    type: 'retry' | 'fallback' | 'redirect' | 'reload' | 'ignore' | 'contact_support';
    description: string;
    handler?: () => void | Promise<void>;
}

export interface ErrorHandlerOptions {
    showNotification?: boolean;
    logToConsole?: boolean;
    reportToAnalytics?: boolean;
    attemptRecovery?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// USER-FRIENDLY ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════

const USER_FRIENDLY_MESSAGES: Record<string, string> = {
    // Network errors
    'network_offline': 'You appear to be offline. Please check your internet connection.',
    'network_timeout': 'The request took too long. Please try again.',
    'network_error': 'Connection error. Please check your internet and try again.',
    
    // AI service errors
    'ai_unavailable': 'AI features are temporarily unavailable. Using rule-based optimization instead.',
    'ai_timeout': 'AI is taking longer than expected. We\'ll use our built-in intelligence instead.',
    'ai_rate_limit': 'Too many requests. Please wait a moment and try again.',
    
    // Validation errors
    'validation_required': 'Please fill in all required fields.',
    'validation_format': 'Please check the format of your input.',
    'validation_length': 'Input is too long or too short.',
    
    // Payment errors
    'payment_failed': 'Payment could not be processed. Please try again or use a different payment method.',
    'payment_cancelled': 'Payment was cancelled.',
    'payment_verification_failed': 'We couldn\'t verify your payment. Please contact support if you were charged.',
    
    // File errors
    'file_too_large': 'File is too large. Please use a file under 10MB.',
    'file_invalid_type': 'Invalid file type. Please upload a PDF, DOC, or DOCX file.',
    'file_upload_failed': 'File upload failed. Please try again.',
    'file_parse_failed': 'We couldn\'t read your file. Please try a different file or enter information manually.',
    
    // Authentication errors
    'auth_required': 'Please log in to continue.',
    'auth_expired': 'Your session has expired. Please log in again.',
    'auth_invalid': 'Invalid login credentials.',
    
    // Authorization errors
    'not_authorized': 'You don\'t have permission to do this.',
    'premium_required': 'This feature requires a premium template purchase.',
    
    // Rate limit
    'rate_limited': 'Too many requests. Please wait a moment before trying again.',
    
    // Generic
    'unknown': 'Something went wrong. Please try again.',
    'try_again_later': 'Service temporarily unavailable. Please try again later.'
};

// ═══════════════════════════════════════════════════════════════
// RECOVERY ACTIONS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_RECOVERY_ACTIONS: Record<ErrorCategory, RecoveryAction> = {
    network: {
        type: 'retry',
        description: 'Check your connection and try again'
    },
    ai_service: {
        type: 'fallback',
        description: 'Using rule-based analysis instead'
    },
    validation: {
        type: 'ignore',
        description: 'Fix the highlighted fields and try again'
    },
    payment: {
        type: 'retry',
        description: 'Try again or use a different payment method'
    },
    parsing: {
        type: 'fallback',
        description: 'Enter information manually'
    },
    file_operation: {
        type: 'retry',
        description: 'Try uploading again'
    },
    authentication: {
        type: 'redirect',
        description: 'Redirecting to login'
    },
    authorization: {
        type: 'contact_support',
        description: 'Contact support if you believe this is an error'
    },
    rate_limit: {
        type: 'retry',
        description: 'Wait a moment and try again'
    },
    unknown: {
        type: 'reload',
        description: 'Refresh the page and try again'
    }
};

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER CLASS
// ═══════════════════════════════════════════════════════════════

class ErrorHandler {
    private errors: AppError[] = [];
    private maxErrorHistory: number = 100;
    private listeners: ((error: AppError) => void)[] = [];
    private notificationHandler?: (message: string, severity: ErrorSeverity) => void;
    
    // ─────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Set notification handler for showing errors to users
     */
    setNotificationHandler(handler: (message: string, severity: ErrorSeverity) => void): void {
        this.notificationHandler = handler;
    }
    
    /**
     * Add error listener
     */
    onError(listener: (error: AppError) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    // ─────────────────────────────────────────────────────────────
    // ERROR HANDLING
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Handle any error
     */
    handle(
        error: Error | string | unknown,
        category: ErrorCategory = 'unknown',
        options: ErrorHandlerOptions = {}
    ): AppError {
        const defaultOptions: ErrorHandlerOptions = {
            showNotification: true,
            logToConsole: true,
            reportToAnalytics: true,
            attemptRecovery: true
        };
        
        const opts = { ...defaultOptions, ...options };
        
        // Create AppError
        const appError = this.createAppError(error, category);
        
        // Store error
        this.storeError(appError);
        
        // Log to console
        if (opts.logToConsole) {
            this.logToConsole(appError);
        }
        
        // Show notification
        if (opts.showNotification && this.notificationHandler) {
            this.notificationHandler(appError.userMessage, appError.severity);
        }
        
        // Notify listeners
        this.notifyListeners(appError);
        
        // Report to analytics
        if (opts.reportToAnalytics) {
            this.reportToAnalytics(appError);
        }
        
        // Attempt recovery
        if (opts.attemptRecovery && appError.recoveryAction?.handler) {
            appError.recoveryAction.handler();
        }
        
        return appError;
    }
    
    /**
     * Handle error silently (no user notification)
     */
    handleSilent(error: Error | string | unknown, category: ErrorCategory = 'unknown'): AppError {
        return this.handle(error, category, { showNotification: false });
    }
    
    /**
     * Handle error and throw (for critical errors)
     */
    handleAndThrow(error: Error | string | unknown, category: ErrorCategory = 'unknown'): never {
        const appError = this.handle(error, category);
        throw new Error(appError.userMessage);
    }
    
    // ─────────────────────────────────────────────────────────────
    // ERROR CREATION
    // ─────────────────────────────────────────────────────────────
    
    private createAppError(error: Error | string | unknown, category: ErrorCategory): AppError {
        const errorMessage = this.extractErrorMessage(error);
        const errorCode = this.mapToErrorCode(errorMessage, category);
        const userMessage = this.getUserFriendlyMessage(errorCode, category);
        const severity = this.determineSeverity(category, errorCode);
        
        return {
            id: this.generateErrorId(),
            code: errorCode,
            category,
            severity,
            message: errorMessage,
            userMessage,
            timestamp: Date.now(),
            context: this.extractContext(error),
            stack: error instanceof Error ? error.stack : undefined,
            recoveryAction: this.getRecoveryAction(category, errorCode)
        };
    }
    
    private extractErrorMessage(error: Error | string | unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (error && typeof error === 'object' && 'message' in error) {
            return String((error as { message: unknown }).message);
        }
        return 'Unknown error occurred';
    }
    
    private extractContext(error: unknown): Record<string, unknown> | undefined {
        if (error && typeof error === 'object') {
            const context: Record<string, unknown> = {};
            
            if ('code' in error) context.code = error.code;
            if ('status' in error) context.status = error.status;
            if ('statusCode' in error) context.statusCode = error.statusCode;
            if ('response' in error) context.response = error.response;
            
            return Object.keys(context).length > 0 ? context : undefined;
        }
        return undefined;
    }
    
    private mapToErrorCode(message: string, category: ErrorCategory): string {
        const messageLower = message.toLowerCase();
        
        // Network errors
        if (messageLower.includes('network') || messageLower.includes('fetch')) {
            if (messageLower.includes('offline') || !navigator.onLine) return 'network_offline';
            if (messageLower.includes('timeout')) return 'network_timeout';
            return 'network_error';
        }
        
        // AI errors
        if (category === 'ai_service') {
            if (messageLower.includes('timeout')) return 'ai_timeout';
            if (messageLower.includes('rate') || messageLower.includes('limit')) return 'ai_rate_limit';
            return 'ai_unavailable';
        }
        
        // Validation errors
        if (category === 'validation') {
            if (messageLower.includes('required')) return 'validation_required';
            if (messageLower.includes('format')) return 'validation_format';
            if (messageLower.includes('length') || messageLower.includes('long') || messageLower.includes('short')) {
                return 'validation_length';
            }
        }
        
        // Payment errors
        if (category === 'payment') {
            if (messageLower.includes('cancel')) return 'payment_cancelled';
            if (messageLower.includes('verif')) return 'payment_verification_failed';
            return 'payment_failed';
        }
        
        // File errors
        if (category === 'file_operation') {
            if (messageLower.includes('size') || messageLower.includes('large')) return 'file_too_large';
            if (messageLower.includes('type') || messageLower.includes('format')) return 'file_invalid_type';
            if (messageLower.includes('upload')) return 'file_upload_failed';
            if (messageLower.includes('parse') || messageLower.includes('read')) return 'file_parse_failed';
        }
        
        // Auth errors
        if (category === 'authentication') {
            if (messageLower.includes('expired')) return 'auth_expired';
            if (messageLower.includes('invalid')) return 'auth_invalid';
            return 'auth_required';
        }
        
        if (category === 'authorization') {
            if (messageLower.includes('premium')) return 'premium_required';
            return 'not_authorized';
        }
        
        if (category === 'rate_limit') {
            return 'rate_limited';
        }
        
        return 'unknown';
    }
    
    private getUserFriendlyMessage(code: string, category: ErrorCategory): string {
        return USER_FRIENDLY_MESSAGES[code] || 
               USER_FRIENDLY_MESSAGES[category] || 
               USER_FRIENDLY_MESSAGES['unknown'];
    }
    
    private determineSeverity(category: ErrorCategory, code: string): ErrorSeverity {
        // Critical errors
        if (category === 'authentication' || category === 'authorization') {
            return 'error';
        }
        
        // Errors that affect functionality
        if (category === 'payment' || code.includes('failed')) {
            return 'error';
        }
        
        // Warnings - functionality degraded but works
        if (category === 'ai_service' || category === 'parsing') {
            return 'warning';
        }
        
        // Rate limits and validation
        if (category === 'rate_limit' || category === 'validation') {
            return 'info';
        }
        
        return 'error';
    }
    
    private getRecoveryAction(category: ErrorCategory, _code: string): RecoveryAction {
        return DEFAULT_RECOVERY_ACTIONS[category] || DEFAULT_RECOVERY_ACTIONS['unknown'];
    }
    
    private generateErrorId(): string {
        return `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
    
    // ─────────────────────────────────────────────────────────────
    // LOGGING & STORAGE
    // ─────────────────────────────────────────────────────────────
    
    private storeError(error: AppError): void {
        this.errors.push(error);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrorHistory) {
            this.errors = this.errors.slice(-this.maxErrorHistory);
        }
    }
    
    private logToConsole(error: AppError): void {
        const logMethod = error.severity === 'critical' || error.severity === 'error' 
            ? console.error 
            : error.severity === 'warning' 
                ? console.warn 
                : console.info;
        
        logMethod(`[${error.category.toUpperCase()}] ${error.message}`, {
            id: error.id,
            code: error.code,
            context: error.context,
            userMessage: error.userMessage
        });
    }
    
    private notifyListeners(error: AppError): void {
        for (const listener of this.listeners) {
            try {
                listener(error);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        }
    }
    
    private reportToAnalytics(_error: AppError): void {
        // Placeholder for analytics reporting
        // In production, send to your analytics service
    }
    
    // ─────────────────────────────────────────────────────────────
    // PUBLIC ACCESSORS
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Get recent errors
     */
    getRecentErrors(count: number = 10): AppError[] {
        return this.errors.slice(-count);
    }
    
    /**
     * Get errors by category
     */
    getErrorsByCategory(category: ErrorCategory): AppError[] {
        return this.errors.filter(e => e.category === category);
    }
    
    /**
     * Clear error history
     */
    clearErrors(): void {
        this.errors = [];
    }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const errorHandler = new ErrorHandler();

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T>(
    fn: () => Promise<T>,
    category: ErrorCategory = 'unknown',
    fallback?: T
): Promise<T> {
    return fn().catch(error => {
        errorHandler.handle(error, category);
        if (fallback !== undefined) {
            return fallback;
        }
        throw error;
    });
}

/**
 * Create a safe version of a function that never throws
 */
export function createSafeFunction<T extends (...args: unknown[]) => unknown>(
    fn: T,
    category: ErrorCategory = 'unknown',
    fallbackValue?: ReturnType<T>
): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
        try {
            const result = fn(...args);
            
            // Handle promises
            if (result instanceof Promise) {
                return result.catch(error => {
                    errorHandler.handle(error, category);
                    return fallbackValue;
                }) as ReturnType<T>;
            }
            
            return result as ReturnType<T>;
        } catch (error) {
            errorHandler.handle(error, category);
            return fallbackValue as ReturnType<T>;
        }
    }) as T;
}

/**
 * Try-catch wrapper with automatic error handling
 */
export async function trySafe<T>(
    fn: () => T | Promise<T>,
    category: ErrorCategory = 'unknown'
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
    try {
        const data = await fn();
        return { success: true, data };
    } catch (error) {
        const appError = errorHandler.handle(error, category, { showNotification: false });
        return { success: false, error: appError };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    errorHandler,
    withErrorHandling,
    createSafeFunction,
    trySafe,
    USER_FRIENDLY_MESSAGES
};
