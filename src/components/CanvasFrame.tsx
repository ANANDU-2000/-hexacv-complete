/**
 * CanvasFrame Component
 * Fixed-dimension, non-scrollable document canvas for resume rendering
 * Enforces A4 dimensions (794x1123px at 96 DPI)
 */

import React from 'react';

interface CanvasFrameProps {
    children: React.ReactNode;
    scale?: number;
}

/**
 * Canvas frame that enforces fixed document dimensions
 * Used for both template card preview (scaled) and right-side preview (full size)
 */
export const CanvasFrame: React.FC<CanvasFrameProps> = ({ children, scale = 1 }) => {
    const width = 794;
    const height = 1123;

    return (
        <div style={{
            width: `${width * scale}px`,
            height: `${height * scale}px`,
            background: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: 'none',
            margin: '0 auto',
            flexShrink: 0,
            boxSizing: 'border-box'
        }}>
            <div style={{
                width: `${width}px`,
                height: `${height}px`,
                background: '#FFFFFF',
                overflow: 'hidden',
                boxSizing: 'border-box',
                display: 'block',
                transform: scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: 'top left'
            }}>
                {children}
            </div>
        </div>
    );
};

/**
 * Scaled canvas frame for template card previews
 * Applies 0.35 scale transformation for card display
 */
export const ScaledCanvasFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const baseWidth = 794;
    const baseHeight = 1123;
    const scale = 0.35;
    
    return (
        <div style={{
            width: `${baseWidth * scale}px`,
            height: `${baseHeight * scale}px`,
            overflow: 'hidden',
            position: 'relative',
            background: '#F3F4F6',
            flexShrink: 0
        }}>
            <div style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                background: '#FFFFFF',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}>
                {children}
            </div>
        </div>
    );
};
