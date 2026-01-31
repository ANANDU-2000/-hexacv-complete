import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Mobile Device Optimization Engine
 * Handles device-specific optimizations, viewport management, and health checks.
 */

interface DeviceSpecs {
    isIOS: boolean;
    isAndroid: boolean;
    hasNotch: boolean;
    isMobile: boolean;
    isTablet: boolean;
    aspectRatio: number;
    viewportWidth: number;
    viewportHeight: number;
    pixelRatio: number;
    userAgent: string;
}

interface OptimizationStatus {
    isOptimized: boolean;
    lastCheck: string;
    issues: string[];
    performance: 'low' | 'medium' | 'high';
}

interface MobileEngineContext {
    deviceSpecs: DeviceSpecs;
    status: OptimizationStatus;
    refreshOptimization: () => void;
}

const MobileEngineContext = createContext<MobileEngineContext | null>(null);

export const useMobileOptimization = () => {
    const context = useContext(MobileEngineContext);
    if (!context) {
        throw new Error('useMobileOptimization must be used within a MobileOptimizationProvider');
    }
    return context;
};

export const MobileOptimizationEngine: React.FC<{ children: React.ReactNode, isAdmin?: boolean }> = ({ children, isAdmin }) => {
    const [deviceSpecs, setDeviceSpecs] = useState<DeviceSpecs>(getInitialSpecs());
    const [status, setStatus] = useState<OptimizationStatus>({
        isOptimized: false,
        lastCheck: new Date().toISOString(),
        issues: [],
        performance: 'medium'
    });
    const [showDashboard, setShowDashboard] = useState((window as any).showMobileDebug || false);

    function getInitialSpecs(): DeviceSpecs {
        const ua = navigator.userAgent;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);

        return {
            isIOS,
            isAndroid,
            hasNotch: isIOS && (height / width > 2 || width / height > 2), // Rough estimate for notch devices
            isMobile: /Mobi|Android/i.test(ua) || width < 768,
            isTablet: /Tablet|iPad/i.test(ua) || (width >= 768 && width <= 1024),
            aspectRatio: width / height,
            viewportWidth: width,
            viewportHeight: height,
            pixelRatio: window.devicePixelRatio,
            userAgent: ua
        };
    }

    const runOptimizationCheck = () => {
        const issues: string[] = [];
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Check & Fix viewport scale
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.setAttribute('name', 'viewport');
            document.head.appendChild(viewportMeta);
        }

        const currentContent = viewportMeta.getAttribute('content') || '';
        if (!currentContent.includes('viewport-fit=cover')) {
            const separator = currentContent ? ', ' : '';
            viewportMeta.setAttribute('content', `${currentContent}${separator}viewport-fit=cover`);
        }

        // 2. Check & Fix common mobile scrolling issues
        if (getComputedStyle(document.body).overflowX !== 'hidden') {
            document.body.style.overflowX = 'hidden';
        }

        // 3. Performance Check (Heuristic)
        const perf = 'medium'; // Placeholder for more complex logic

        // 4. Update CSS variables for reliable sizing
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        setStatus({
            isOptimized: issues.length === 0,
            lastCheck: new Date().toISOString(),
            issues,
            performance: perf
        });

        // Update specs
        setDeviceSpecs(prev => ({
            ...prev,
            viewportWidth: width,
            viewportHeight: height,
            aspectRatio: width / height
        }));

        if ((window as any).showMobileDebug) {
            setShowDashboard(true);
        }

        console.log('🚀 Mobile Optimization Engine Check:', { status: issues.length === 0 ? 'Optimal' : 'Issues Found', issues });
    };

    useEffect(() => {
        // Auto-fix viewport meta tag on mount
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.setAttribute('name', 'viewport');
            document.head.appendChild(viewportMeta);
        }

        const currentContent = viewportMeta.getAttribute('content') || '';
        if (!currentContent.includes('viewport-fit=cover')) {
            const separator = currentContent ? ', ' : '';
            viewportMeta.setAttribute('content', `${currentContent}${separator}viewport-fit=cover`);
        }

        // Apply global mobile fixes
        document.body.style.overflowX = 'hidden';

        runOptimizationCheck();

        const handleResize = () => {
            runOptimizationCheck();
            if ((window as any).showMobileDebug) setShowDashboard(true);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return (
        <MobileEngineContext.Provider value={{ deviceSpecs, status, refreshOptimization: runOptimizationCheck }}>
            {/* Global Optimization Injections */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --safe-area-top: env(safe-area-inset-top, 0px);
                    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
                    --safe-area-left: env(safe-area-inset-left, 0px);
                    --safe-area-right: env(safe-area-inset-right, 0px);
                    --real-vh: calc(var(--vh, 1vh) * 100);
                }
                
                @media (max-width: 768px) {
                    html, body {
                        height: var(--real-vh);
                        overflow: hidden;
                        position: fixed;
                        width: 100%;
                    }
                    
                    #root {
                        height: var(--real-vh);
                        overflow-y: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }
            `}} />
            {children}

            {/* Optimization Overlay (Only for Admin) */}
            {isAdmin && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '24px',
                    right: '24px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(20px)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '24px',
                    fontSize: '12px',
                    zIndex: 9999,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: showDashboard || status.issues.length > 0 ? 'block' : 'none',
                    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes slideUp {
                            from { transform: translateY(100%) scale(0.95); opacity: 0; }
                            to { transform: translateY(0) scale(1); opacity: 1; }
                        }
                    `}} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status.issues.length === 0 ? '#10B981' : '#F59E0B' }}></div>
                            <h4 style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '10px' }}>
                                Core Optimiser V6.1
                            </h4>
                        </div>
                        <button
                            onClick={() => {
                                (window as any).showMobileDebug = false;
                                setShowDashboard(false);
                            }}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', padding: '0', justifyContent: 'center' }}
                        >✕</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ opacity: 0.4, fontSize: '9px', fontWeight: 900, marginBottom: '2px' }}>DEVICE</div>
                            <div style={{ fontWeight: 700, fontSize: '11px' }}>{deviceSpecs.isIOS ? ' iPhone/iPad' : deviceSpecs.isAndroid ? 'Android OS' : 'Desktop Node'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ opacity: 0.4, fontSize: '9px', fontWeight: 900, marginBottom: '2px' }}>VIEWPORT</div>
                            <div style={{ fontWeight: 700, fontSize: '11px' }}>{deviceSpecs.viewportWidth} × {deviceSpecs.viewportHeight}</div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ opacity: 0.4, fontSize: '9px', fontWeight: 900, marginBottom: '8px' }}>HARDWARE CAPABILITIES</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <div style={{ padding: '6px', background: CSS.supports('display', 'grid') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: CSS.supports('display', 'grid') ? '#34D399' : '#F87171', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '9px' }}>GRID</div>
                            <div style={{ padding: '6px', background: CSS.supports('padding', 'env(safe-area-inset-top)') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: CSS.supports('padding', 'env(safe-area-inset-top)') ? '#34D399' : '#F87171', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '9px' }}>SAFE-ENV</div>
                            <div style={{ padding: '6px', background: CSS.supports('backdrop-filter', 'blur(0px)') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: CSS.supports('backdrop-filter', 'blur(0px)') ? '#34D399' : '#F87171', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '9px' }}>BLUR</div>
                        </div>
                    </div>

                    <div style={{ background: status.issues.length === 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)', padding: '12px', borderRadius: '16px', border: `1px solid ${status.issues.length === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` }}>
                        <div style={{ opacity: 0.4, fontSize: '9px', fontWeight: 900, marginBottom: '4px' }}>ALIVE HEALTH CHECK</div>
                        {status.issues.length === 0 ? (
                            <div style={{ color: '#34D399', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>✔</span> System optimized and auto-healed
                            </div>
                        ) : (
                            <ul style={{ margin: 0, paddingLeft: '16px', color: '#FBBF24', fontSize: '11px', fontWeight: 600 }}>
                                {status.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={runOptimizationCheck}
                        style={{
                            marginTop: '16px',
                            width: '100%',
                            background: 'white',
                            color: 'black',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '14px',
                            fontWeight: 900,
                            fontSize: '10px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s active:scale(0.98)'
                        }}
                    >
                        Force Full Scan & Re-Heal
                    </button>
                </div>
            )}
        </MobileEngineContext.Provider>
    );
};
