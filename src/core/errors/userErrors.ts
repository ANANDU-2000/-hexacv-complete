export class AppError extends Error {
    constructor(public message: string, public code: string, public userMessage: string) {
        super(message);
        this.name = 'AppError';
    }
}

export class PaymentError extends AppError {
    constructor(message: string, userMessage: string = 'Payment verification failed. Please try again.') {
        super(message, 'PAYMENT_FAILED', userMessage);
        this.name = 'PaymentError';
    }
}

export class AIError extends AppError {
    constructor(message: string, userMessage: string = 'AI service is temporarily unavailable. Please try again.') {
        super(message, 'AI_SERVICE_ERROR', userMessage);
        this.name = 'AIError';
    }
}

export class SessionError extends AppError {
    constructor(message: string) {
        super(message, 'SESSION_EXPIRED', 'Your session has expired. Please refresh the page.');
        this.name = 'SessionError';
    }
}
