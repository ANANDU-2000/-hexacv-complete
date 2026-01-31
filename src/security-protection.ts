/**
 * SECURITY PROTECTION MODULE
 * Comprehensive security measures for resume builder
 * 
 * IMPORTANT: This module provides DETERRENCE, not absolute protection.
 * True screenshot blocking is impossible, but we make copying difficult.
 * 
 * Features:
 * - Source code protection (disable inspect)
 * - Path hacking prevention (tokenized URLs)
 * - Preview protection (watermarks, blur)
 * - Screenshot deterrence (dynamic overlays)
 * - Copy prevention (text selection disabled)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SecurityConfig {
    enableDevToolsProtection: boolean;
    enableRightClickProtection: boolean;
    enableTextSelectionProtection: boolean;
    enableDynamicWatermark: boolean;
    enableCopyProtection: boolean;
    enableKeyboardShortcutProtection: boolean;
    watermarkText?: string;
    watermarkOpacity: number;
}

export interface DownloadToken {
    token: string;
    userId: string;
    templateId: string;
    createdAt: number;
    expiresAt: number;
    used: boolean;
    downloadCount: number;
    maxDownloads: number;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
    enableDevToolsProtection: true,
    enableRightClickProtection: true,
    enableTextSelectionProtection: true,
    enableDynamicWatermark: true,
    enableCopyProtection: true,
    enableKeyboardShortcutProtection: true,
    watermarkText: 'PREVIEW',
    watermarkOpacity: 0.15
};

// ═══════════════════════════════════════════════════════════════
// SECURITY MANAGER CLASS
// ═══════════════════════════════════════════════════════════════

class SecurityManager {
    private config: SecurityConfig = DEFAULT_SECURITY_CONFIG;
    private protectionsActive: boolean = false;
    private eventListeners: { event: string; handler: EventListener }[] = [];
    
    /**
     * Configure security settings
     */
    configure(config: Partial<SecurityConfig>): void {
        this.config = { ...this.config, ...config };
    }
    
    /**
     * Activate all protections
     */
    activateProtections(): void {
        if (this.protectionsActive) return;
        
        if (typeof window === 'undefined') return;
        
        if (this.config.enableRightClickProtection) {
            this.enableRightClickProtection();
        }
        
        if (this.config.enableKeyboardShortcutProtection) {
            this.enableKeyboardShortcutProtection();
        }
        
        if (this.config.enableTextSelectionProtection) {
            this.enableTextSelectionProtection();
        }
        
        if (this.config.enableCopyProtection) {
            this.enableCopyProtection();
        }
        
        if (this.config.enableDevToolsProtection) {
            this.enableDevToolsProtection();
        }
        
        this.protectionsActive = true;
    }
    
    /**
     * Deactivate all protections
     */
    deactivateProtections(): void {
        if (!this.protectionsActive) return;
        
        // Remove all event listeners
        for (const { event, handler } of this.eventListeners) {
            document.removeEventListener(event, handler);
            window.removeEventListener(event, handler);
        }
        
        this.eventListeners = [];
        this.protectionsActive = false;
    }
    
    // ─────────────────────────────────────────────────────────────
    // RIGHT CLICK PROTECTION
    // ─────────────────────────────────────────────────────────────
    
    private enableRightClickProtection(): void {
        const handler = (e: Event) => {
            const target = e.target as HTMLElement;
            // Only prevent on protected elements
            if (target.closest('[data-protected]') || target.closest('.preview-container')) {
                e.preventDefault();
                return false;
            }
        };
        
        document.addEventListener('contextmenu', handler);
        this.eventListeners.push({ event: 'contextmenu', handler });
    }
    
    // ─────────────────────────────────────────────────────────────
    // KEYBOARD SHORTCUT PROTECTION
    // ─────────────────────────────────────────────────────────────
    
    private enableKeyboardShortcutProtection(): void {
        const handler = (e: KeyboardEvent) => {
            // Block common inspect/copy shortcuts on protected elements
            const blockedCombinations = [
                { ctrl: true, key: 'u' },      // View source
                { ctrl: true, key: 's' },      // Save
                { ctrl: true, shift: true, key: 'i' },  // Dev tools
                { ctrl: true, shift: true, key: 'j' },  // Console
                { ctrl: true, shift: true, key: 'c' },  // Inspect element
                { key: 'F12' }                 // Dev tools
            ];
            
            const activeElement = document.activeElement as HTMLElement;
            const isProtectedArea = activeElement?.closest('[data-protected]') || 
                                   activeElement?.closest('.preview-container');
            
            if (!isProtectedArea) return;
            
            for (const combo of blockedCombinations) {
                const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true;
                const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
                const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();
                
                if (ctrlMatch && shiftMatch && keyMatch) {
                    e.preventDefault();
                    return false;
                }
            }
        };
        
        document.addEventListener('keydown', handler as EventListener);
        this.eventListeners.push({ event: 'keydown', handler: handler as EventListener });
    }
    
    // ─────────────────────────────────────────────────────────────
    // TEXT SELECTION PROTECTION
    // ─────────────────────────────────────────────────────────────
    
    private enableTextSelectionProtection(): void {
        const handler = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-protected]') || target.closest('.preview-container')) {
                e.preventDefault();
                return false;
            }
        };
        
        document.addEventListener('selectstart', handler);
        this.eventListeners.push({ event: 'selectstart', handler });
    }
    
    // ─────────────────────────────────────────────────────────────
    // COPY PROTECTION
    // ─────────────────────────────────────────────────────────────
    
    private enableCopyProtection(): void {
        const handler = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-protected]') || target.closest('.preview-container')) {
                e.preventDefault();
                
                // Optional: Show message to user
                console.info('Copy protection: Content is protected');
                return false;
            }
        };
        
        document.addEventListener('copy', handler);
        this.eventListeners.push({ event: 'copy', handler });
    }
    
    // ─────────────────────────────────────────────────────────────
    // DEV TOOLS DETECTION (DETERRENCE ONLY)
    // ─────────────────────────────────────────────────────────────
    
    private enableDevToolsProtection(): void {
        // Note: This is deterrence only. Determined users can bypass.
        // We use multiple detection methods for better coverage.
        
        let devtoolsOpen = false;
        
        // Method 1: Size-based detection
        const checkDevtools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    this.onDevToolsDetected();
                }
            } else {
                devtoolsOpen = false;
            }
        };
        
        // Check periodically
        const intervalId = setInterval(checkDevtools, 1000);
        
        // Clean up on deactivation
        this.eventListeners.push({ 
            event: 'devtools-check', 
            handler: (() => clearInterval(intervalId)) as unknown as EventListener 
        });
    }
    
    private onDevToolsDetected(): void {
        // Log the detection (for analytics)
        console.info('Developer tools detected');
        
        // Optional: Add visual indicator or warning
        // We don't break functionality, just add deterrence
    }
}

// ═══════════════════════════════════════════════════════════════
// WATERMARK GENERATOR
// ═══════════════════════════════════════════════════════════════

export interface WatermarkOptions {
    text: string;
    opacity: number;
    fontSize: number;
    color: string;
    rotation: number;
    density: 'low' | 'medium' | 'high';
    includeUserId?: boolean;
    userId?: string;
}

const DEFAULT_WATERMARK_OPTIONS: WatermarkOptions = {
    text: 'PREVIEW',
    opacity: 0.15,
    fontSize: 24,
    color: '#000000',
    rotation: -30,
    density: 'medium'
};

/**
 * Generate CSS for dynamic watermark overlay
 */
export function generateWatermarkCSS(options: Partial<WatermarkOptions> = {}): string {
    const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
    
    // Create watermark text
    let watermarkText = opts.text;
    if (opts.includeUserId && opts.userId) {
        watermarkText = `${opts.text} - ${opts.userId}`;
    }
    
    // Calculate spacing based on density
    const spacing = opts.density === 'low' ? 300 : opts.density === 'medium' ? 200 : 150;
    
    return `
        .watermark-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
        }
        
        .watermark-overlay::before {
            content: '${watermarkText}';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${opts.rotation}deg);
            font-size: ${opts.fontSize}px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            color: ${opts.color};
            opacity: ${opts.opacity};
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 10px;
        }
        
        /* Repeated watermark pattern */
        .watermark-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 200%;
            background-image: repeating-linear-gradient(
                ${opts.rotation}deg,
                transparent,
                transparent ${spacing / 2}px,
                rgba(0, 0, 0, ${opts.opacity}) ${spacing / 2}px,
                rgba(0, 0, 0, ${opts.opacity}) ${spacing}px
            );
            transform: translate(-25%, -25%);
            pointer-events: none;
        }
    `;
}

/**
 * Generate watermark HTML element
 */
export function createWatermarkElement(options: Partial<WatermarkOptions> = {}): HTMLDivElement {
    const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...options };
    
    const overlay = document.createElement('div');
    overlay.className = 'watermark-overlay';
    overlay.setAttribute('data-watermark', 'true');
    
    // Create multiple watermark texts for tiling
    let watermarkText = opts.text;
    if (opts.includeUserId && opts.userId) {
        watermarkText = `${opts.text} • ${opts.userId}`;
    }
    
    // Create tiled watermarks
    const rows = opts.density === 'low' ? 3 : opts.density === 'medium' ? 5 : 8;
    const cols = opts.density === 'low' ? 3 : opts.density === 'medium' ? 5 : 8;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const span = document.createElement('span');
            span.textContent = watermarkText;
            span.style.cssText = `
                position: absolute;
                top: ${(i / rows) * 100}%;
                left: ${(j / cols) * 100}%;
                transform: rotate(${opts.rotation}deg);
                font-size: ${opts.fontSize}px;
                font-family: Arial, sans-serif;
                font-weight: bold;
                color: ${opts.color};
                opacity: ${opts.opacity};
                white-space: nowrap;
                text-transform: uppercase;
                letter-spacing: 2px;
                pointer-events: none;
                user-select: none;
            `;
            overlay.appendChild(span);
        }
    }
    
    return overlay;
}

// ═══════════════════════════════════════════════════════════════
// BLUR OVERLAY FOR UNPAID PREVIEWS
// ═══════════════════════════════════════════════════════════════

export interface BlurOverlayOptions {
    blurAmount: number;
    overlayColor: string;
    overlayOpacity: number;
    message: string;
    ctaText: string;
}

const DEFAULT_BLUR_OPTIONS: BlurOverlayOptions = {
    blurAmount: 8,
    overlayColor: '#ffffff',
    overlayOpacity: 0.7,
    message: 'Unlock full preview',
    ctaText: 'Purchase to Download'
};

/**
 * Generate blur overlay CSS
 */
export function generateBlurOverlayCSS(options: Partial<BlurOverlayOptions> = {}): string {
    const opts = { ...DEFAULT_BLUR_OPTIONS, ...options };
    
    return `
        .blur-protected {
            position: relative;
            overflow: hidden;
        }
        
        .blur-protected .preview-content {
            filter: blur(${opts.blurAmount}px);
            transition: filter 0.3s ease;
        }
        
        .blur-protected .blur-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${opts.overlayColor};
            opacity: ${opts.overlayOpacity};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }
        
        .blur-protected .blur-message {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 16px;
        }
        
        .blur-protected .blur-cta {
            padding: 12px 24px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .blur-protected .blur-cta:hover {
            background: #0052a3;
        }
    `;
}

// ═══════════════════════════════════════════════════════════════
// TOKENIZED URL GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a secure download token
 */
export function generateDownloadToken(
    userId: string,
    templateId: string,
    expirationMinutes: number = 30,
    maxDownloads: number = 3
): DownloadToken {
    const now = Date.now();
    
    // Generate random token
    const randomPart = Math.random().toString(36).substring(2, 15);
    const timestampPart = now.toString(36);
    const userPart = btoa(userId).substring(0, 8);
    
    const token = `${randomPart}${timestampPart}${userPart}`;
    
    return {
        token,
        userId,
        templateId,
        createdAt: now,
        expiresAt: now + (expirationMinutes * 60 * 1000),
        used: false,
        downloadCount: 0,
        maxDownloads
    };
}

/**
 * Validate a download token
 */
export function validateDownloadToken(
    token: DownloadToken,
    userId: string
): { valid: boolean; reason?: string } {
    // Check expiration
    if (Date.now() > token.expiresAt) {
        return { valid: false, reason: 'Token has expired' };
    }
    
    // Check user match
    if (token.userId !== userId) {
        return { valid: false, reason: 'Token does not belong to this user' };
    }
    
    // Check download limit
    if (token.downloadCount >= token.maxDownloads) {
        return { valid: false, reason: 'Download limit exceeded' };
    }
    
    return { valid: true };
}

/**
 * Generate a secure download URL with token
 */
export function generateSecureDownloadUrl(
    baseUrl: string,
    token: DownloadToken,
    additionalParams?: Record<string, string>
): string {
    const url = new URL(baseUrl);
    url.searchParams.set('token', token.token);
    url.searchParams.set('ts', token.createdAt.toString());
    
    // Add signature for validation
    const signature = generateSignature(token.token, token.createdAt);
    url.searchParams.set('sig', signature);
    
    // Add additional params
    if (additionalParams) {
        for (const [key, value] of Object.entries(additionalParams)) {
            url.searchParams.set(key, value);
        }
    }
    
    return url.toString();
}

/**
 * Simple signature generator (for client-side use only)
 * In production, use server-side signing with proper keys
 */
function generateSignature(token: string, timestamp: number): string {
    // Simple hash for demo purposes
    // In production, use HMAC with secret key on server
    const data = `${token}:${timestamp}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// ═══════════════════════════════════════════════════════════════
// CANVAS-BASED PREVIEW (SCREENSHOT DETERRENCE)
// ═══════════════════════════════════════════════════════════════

/**
 * Render content to canvas instead of DOM
 * This makes screenshots more difficult (not impossible)
 */
export function renderToCanvas(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    watermarkOptions?: Partial<WatermarkOptions>
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get element dimensions
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Use html2canvas or similar library in production
    // For now, we'll draw a placeholder
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add watermark if provided
    if (watermarkOptions) {
        const opts = { ...DEFAULT_WATERMARK_OPTIONS, ...watermarkOptions };
        
        ctx.save();
        ctx.globalAlpha = opts.opacity;
        ctx.fillStyle = opts.color;
        ctx.font = `bold ${opts.fontSize}px Arial`;
        ctx.textAlign = 'center';
        
        // Draw watermark pattern
        const spacing = 150;
        for (let y = 0; y < canvas.height + spacing; y += spacing) {
            for (let x = 0; x < canvas.width + spacing; x += spacing) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((opts.rotation * Math.PI) / 180);
                ctx.fillText(opts.text, 0, 0);
                ctx.restore();
            }
        }
        
        ctx.restore();
    }
}

// ═══════════════════════════════════════════════════════════════
// CSS INJECTION FOR PROTECTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all protection CSS
 */
export function getProtectionCSS(watermarkOptions?: Partial<WatermarkOptions>): string {
    return `
        /* Text selection protection */
        [data-protected],
        .preview-container {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
        }
        
        /* Prevent drag */
        [data-protected] img,
        .preview-container img {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
            pointer-events: none;
        }
        
        /* Prevent printing protected content */
        @media print {
            [data-protected],
            .preview-container {
                display: none !important;
            }
            
            body::after {
                content: 'Printing is disabled for protected content.';
                display: block;
                font-size: 24px;
                text-align: center;
                padding: 100px;
            }
        }
        
        /* Watermark styles */
        ${generateWatermarkCSS(watermarkOptions)}
        
        /* Blur overlay styles */
        ${generateBlurOverlayCSS()}
    `;
}

/**
 * Inject protection CSS into document
 */
export function injectProtectionCSS(watermarkOptions?: Partial<WatermarkOptions>): void {
    if (typeof document === 'undefined') return;
    
    // Check if already injected
    const existingStyle = document.getElementById('security-protection-css');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'security-protection-css';
    style.textContent = getProtectionCSS(watermarkOptions);
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

export const securityManager = new SecurityManager();

// ═══════════════════════════════════════════════════════════════
// REACT HOOKS (for integration)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook to enable security protections on a component
 * Usage: useSecurityProtection({ enableWatermark: true })
 */
export function initializeSecurityProtections(config?: Partial<SecurityConfig>): () => void {
    if (config) {
        securityManager.configure(config);
    }
    
    securityManager.activateProtections();
    injectProtectionCSS();
    
    // Return cleanup function
    return () => {
        securityManager.deactivateProtections();
    };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
    securityManager,
    generateDownloadToken,
    validateDownloadToken,
    generateSecureDownloadUrl,
    createWatermarkElement,
    generateWatermarkCSS,
    generateBlurOverlayCSS,
    getProtectionCSS,
    injectProtectionCSS,
    initializeSecurityProtections,
    renderToCanvas
};
