/**
 * AI FAILOVER SERVICE
 * Automatic switching between AI and Rule-Based modes
 * 
 * PRINCIPLE: The app NEVER stops working
 * 
 * This module provides:
 * - AI health checking
 * - Automatic failover to rule-based mode
 * - Seamless mode switching
 * - User notification without disruption
 */

import { analyzeResumeOffline, ATSAnalysisResult, ResumeInput } from './rule-based-ats-engine';
import { findRoleKnowledge } from './offline-role-library';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ServiceMode = 'ai' | 'rule-based' | 'hybrid';

export interface ServiceStatus {
    mode: ServiceMode;
    aiAvailable: boolean;
    lastAiCheck: Date | null;
    aiFailureCount: number;
    message: string;
}

export interface FailoverConfig {
    maxRetries: number;
    retryDelayMs: number;
    healthCheckIntervalMs: number;
    fallbackThreshold: number;  // Number of failures before fallback
    aiTimeoutMs: number;
}

export interface ServiceResult<T> {
    success: boolean;
    data: T | null;
    mode: ServiceMode;
    message: string;
    usedFallback: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: FailoverConfig = {
    maxRetries: 2,
    retryDelayMs: 1000,
    healthCheckIntervalMs: 60000,  // 1 minute
    fallbackThreshold: 3,
    aiTimeoutMs: 30000  // 30 seconds
};

// ═══════════════════════════════════════════════════════════════
// SERVICE STATE
// ═══════════════════════════════════════════════════════════════

class FailoverService {
    private status: ServiceStatus = {
        mode: 'hybrid',
        aiAvailable: true,  // Assume available initially
        lastAiCheck: null,
        aiFailureCount: 0,
        message: 'Service initialized'
    };
    
    private config: FailoverConfig = DEFAULT_CONFIG;
    private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
    
    // Listeners for status changes
    private statusListeners: ((status: ServiceStatus) => void)[] = [];
    
    // ─────────────────────────────────────────────────────────────
    // CONFIGURATION
    // ─────────────────────────────────────────────────────────────
    
    configure(config: Partial<FailoverConfig>): void {
        this.config = { ...this.config, ...config };
    }
    
    // ─────────────────────────────────────────────────────────────
    // STATUS MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    
    getStatus(): ServiceStatus {
        return { ...this.status };
    }
    
    onStatusChange(listener: (status: ServiceStatus) => void): () => void {
        this.statusListeners.push(listener);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }
    
    private updateStatus(updates: Partial<ServiceStatus>): void {
        this.status = { ...this.status, ...updates };
        this.notifyListeners();
    }
    
    private notifyListeners(): void {
        for (const listener of this.statusListeners) {
            try {
                listener(this.getStatus());
            } catch (e) {
                console.error('Status listener error:', e);
            }
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // AI HEALTH CHECKING
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Check if AI service is available
     * This should be called before AI operations
     */
    async checkAIHealth(): Promise<boolean> {
        try {
            // Simulated health check - replace with actual AI endpoint
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            // Try a simple AI call
            // In real implementation, this would call your AI service health endpoint
            const isHealthy = await this.pingAIService(controller.signal);
            
            clearTimeout(timeoutId);
            
            if (isHealthy) {
                this.updateStatus({
                    aiAvailable: true,
                    lastAiCheck: new Date(),
                    aiFailureCount: 0,
                    mode: 'hybrid',
                    message: 'AI service available'
                });
                return true;
            } else {
                this.handleAIFailure('Health check returned unhealthy');
                return false;
            }
        } catch (error) {
            this.handleAIFailure('Health check failed');
            return false;
        }
    }
    
    private async pingAIService(_signal: AbortSignal): Promise<boolean> {
        // Placeholder for actual AI health check
        // In production, this would make a request to your AI service
        // For now, we'll simulate based on a simple check
        
        // Check if we're in a browser environment and online
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return false;
        }
        
        // Simulate AI availability (in real app, call your AI endpoint)
        return true;
    }
    
    private handleAIFailure(reason: string): void {
        const newFailureCount = this.status.aiFailureCount + 1;
        
        if (newFailureCount >= this.config.fallbackThreshold) {
            this.updateStatus({
                aiAvailable: false,
                lastAiCheck: new Date(),
                aiFailureCount: newFailureCount,
                mode: 'rule-based',
                message: `AI unavailable: ${reason}. Using rule-based optimization.`
            });
        } else {
            this.updateStatus({
                aiFailureCount: newFailureCount,
                lastAiCheck: new Date(),
                message: `AI issue detected (${newFailureCount}/${this.config.fallbackThreshold}): ${reason}`
            });
        }
    }
    
    /**
     * Start periodic health checking
     */
    startHealthMonitoring(): void {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        
        this.healthCheckTimer = setInterval(
            () => this.checkAIHealth(),
            this.config.healthCheckIntervalMs
        );
        
        // Initial check
        this.checkAIHealth();
    }
    
    /**
     * Stop periodic health checking
     */
    stopHealthMonitoring(): void {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }
    
    // ─────────────────────────────────────────────────────────────
    // OPERATION EXECUTION WITH FAILOVER
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Execute an AI operation with automatic failover
     */
    async executeWithFailover<T>(
        aiOperation: () => Promise<T>,
        fallbackOperation: () => T,
        operationName: string = 'operation'
    ): Promise<ServiceResult<T>> {
        // If AI is known to be down, skip directly to fallback
        if (!this.status.aiAvailable) {
            return this.executeFallback(fallbackOperation, operationName);
        }
        
        // Try AI operation with retries
        let lastError: Error | null = null;
        
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                // Create timeout wrapper
                const result = await this.withTimeout(
                    aiOperation(),
                    this.config.aiTimeoutMs
                );
                
                // Success - reset failure count
                this.updateStatus({
                    aiAvailable: true,
                    aiFailureCount: 0,
                    mode: 'hybrid',
                    message: 'AI service operational'
                });
                
                return {
                    success: true,
                    data: result,
                    mode: 'ai',
                    message: `${operationName} completed with AI`,
                    usedFallback: false
                };
            } catch (error) {
                lastError = error as Error;
                
                // If not last retry, wait before retrying
                if (attempt < this.config.maxRetries) {
                    await this.delay(this.config.retryDelayMs);
                }
            }
        }
        
        // All AI attempts failed - use fallback
        this.handleAIFailure(lastError?.message || 'Unknown error');
        return this.executeFallback(fallbackOperation, operationName);
    }
    
    private executeFallback<T>(
        fallbackOperation: () => T,
        operationName: string
    ): ServiceResult<T> {
        try {
            const result = fallbackOperation();
            
            return {
                success: true,
                data: result,
                mode: 'rule-based',
                message: `${operationName} completed using rule-based optimization (AI unavailable)`,
                usedFallback: true
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                mode: 'rule-based',
                message: `${operationName} failed: ${(error as Error).message}`,
                usedFallback: true
            };
        }
    }
    
    private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Operation timed out'));
            }, timeoutMs);
            
            promise
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }
    
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ─────────────────────────────────────────────────────────────
    // FORCE MODE SWITCHING
    // ─────────────────────────────────────────────────────────────
    
    /**
     * Force switch to rule-based mode
     */
    forceRuleBasedMode(): void {
        this.updateStatus({
            mode: 'rule-based',
            aiAvailable: false,
            message: 'Manually switched to rule-based mode'
        });
    }
    
    /**
     * Try to restore AI mode
     */
    async tryRestoreAIMode(): Promise<boolean> {
        const isHealthy = await this.checkAIHealth();
        
        if (isHealthy) {
            this.updateStatus({
                mode: 'hybrid',
                aiAvailable: true,
                aiFailureCount: 0,
                message: 'AI mode restored'
            });
        }
        
        return isHealthy;
    }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const failoverService = new FailoverService();

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze resume with automatic failover
 */
export async function analyzeResumeWithFailover(
    input: ResumeInput,
    aiAnalyzer?: (input: ResumeInput) => Promise<ATSAnalysisResult>
): Promise<ServiceResult<ATSAnalysisResult>> {
    const fallback = () => analyzeResumeOffline(input);
    
    if (aiAnalyzer) {
        return failoverService.executeWithFailover(
            () => aiAnalyzer(input),
            fallback,
            'Resume analysis'
        );
    }
    
    // No AI analyzer provided, use rule-based directly
    return {
        success: true,
        data: fallback(),
        mode: 'rule-based',
        message: 'Resume analysis completed using rule-based optimization',
        usedFallback: true
    };
}

/**
 * Rewrite bullet with automatic failover
 */
export async function rewriteBulletWithFailover(
    bullet: string,
    targetRole: string,
    aiRewriter?: (bullet: string, role: string) => Promise<string>
): Promise<ServiceResult<string>> {
    const fallback = () => improveBulletWithRules(bullet, targetRole);
    
    if (aiRewriter) {
        return failoverService.executeWithFailover(
            () => aiRewriter(bullet, targetRole),
            fallback,
            'Bullet rewriting'
        );
    }
    
    return {
        success: true,
        data: fallback(),
        mode: 'rule-based',
        message: 'Bullet improved using rule-based optimization',
        usedFallback: true
    };
}

/**
 * Parse resume with automatic failover
 */
export async function parseResumeWithFailover(
    text: string,
    aiParser?: (text: string) => Promise<Record<string, unknown>>
): Promise<ServiceResult<Record<string, unknown>>> {
    const fallback = () => parseResumeWithRules(text);
    
    if (aiParser) {
        return failoverService.executeWithFailover(
            () => aiParser(text),
            fallback,
            'Resume parsing'
        );
    }
    
    return {
        success: true,
        data: fallback(),
        mode: 'rule-based',
        message: 'Resume parsed using rule-based extraction',
        usedFallback: true
    };
}

// ═══════════════════════════════════════════════════════════════
// RULE-BASED FALLBACK IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Improve bullet using rules (no AI)
 */
function improveBulletWithRules(bullet: string, targetRole: string): string {
    let improved = bullet.trim();
    
    // Get role-specific action verbs
    const role = findRoleKnowledge(targetRole);
    const actionVerbs = role?.actionVerbs || [
        'Achieved', 'Built', 'Created', 'Delivered', 'Developed',
        'Drove', 'Established', 'Executed', 'Generated', 'Implemented'
    ];
    
    // Rule 1: Ensure starts with action verb
    const startsWithVerb = actionVerbs.some(verb => 
        improved.toLowerCase().startsWith(verb.toLowerCase())
    );
    
    if (!startsWithVerb) {
        // Check for weak starts and replace
        const weakStarts = [
            /^responsible for /i,
            /^helped /i,
            /^assisted in /i,
            /^worked on /i,
            /^was involved in /i,
            /^participated in /i
        ];
        
        for (const pattern of weakStarts) {
            if (pattern.test(improved)) {
                // Replace with a suggested action verb
                const suggestedVerb = actionVerbs[Math.floor(Math.random() * 5)];
                improved = improved.replace(pattern, `${suggestedVerb} `);
                break;
            }
        }
    }
    
    // Rule 2: Capitalize first letter
    if (improved.length > 0) {
        improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }
    
    // Rule 3: Remove trailing periods (ATS compatibility)
    improved = improved.replace(/\.$/, '');
    
    // Rule 4: Ensure not too short
    if (improved.length < 30 && role?.metricsToHighlight) {
        improved += ` [Consider adding metrics: ${role.metricsToHighlight[0]}]`;
    }
    
    return improved;
}

/**
 * Parse resume using rules (no AI)
 */
function parseResumeWithRules(text: string): Record<string, unknown> {
    const result: Record<string, unknown> = {
        name: null,
        email: null,
        phone: null,
        skills: [],
        experience: [],
        education: [],
        warnings: []
    };
    
    // Email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
        result.email = emailMatch[0];
    }
    
    // Phone extraction
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) {
        result.phone = phoneMatch[0];
    }
    
    // Name extraction (first non-empty line that looks like a name)
    const lines = text.split('\n').filter(l => l.trim());
    for (const line of lines.slice(0, 5)) {
        const trimmed = line.trim();
        // Name heuristic: 2-4 words, proper case, no numbers or special chars
        if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(trimmed)) {
            result.name = trimmed;
            break;
        }
    }
    
    // Skills extraction (look for skills section)
    const skillsMatch = text.match(/(?:skills|technical skills|core competencies)[:\s]*([^\n]+(?:\n[^\n]+)?)/i);
    if (skillsMatch) {
        const skillsText = skillsMatch[1];
        const skills = skillsText.split(/[,|•·]/).map(s => s.trim()).filter(s => s.length > 1);
        result.skills = skills;
    }
    
    // Add warning if limited extraction
    if (!result.name) {
        (result.warnings as string[]).push('Could not detect name automatically');
    }
    
    return result;
}

// ═══════════════════════════════════════════════════════════════
// USER-FRIENDLY STATUS MESSAGES
// ═══════════════════════════════════════════════════════════════

/**
 * Get user-friendly status message
 */
export function getUserFriendlyStatus(): {
    isHealthy: boolean;
    message: string;
    details?: string;
} {
    const status = failoverService.getStatus();
    
    if (status.aiAvailable) {
        return {
            isHealthy: true,
            message: 'All features available',
            details: 'AI-powered optimization is active'
        };
    } else {
        return {
            isHealthy: true,  // Still healthy because fallback works
            message: 'Using rule-based optimization',
            details: 'AI is temporarily unavailable. All features work using our built-in intelligence.'
        };
    }
}

/**
 * Get notification message for user
 */
export function getFailoverNotification(): string | null {
    const status = failoverService.getStatus();
    
    if (!status.aiAvailable && status.aiFailureCount > 0) {
        return 'Using rule-based optimization (AI temporarily unavailable). All features work normally.';
    }
    
    return null;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    failoverService,
    analyzeResumeWithFailover,
    rewriteBulletWithFailover,
    parseResumeWithFailover,
    getUserFriendlyStatus,
    getFailoverNotification
};
