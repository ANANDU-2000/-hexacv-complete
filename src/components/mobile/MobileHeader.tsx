import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface MobileHeaderProps {
    title: string;
    onBack: () => void;
    onNext?: () => void;
    nextLabel?: string;
    showNext?: boolean;
    variant?: 'light' | 'dark';
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    title,
    onBack,
    onNext,
    nextLabel = 'Next',
    showNext = true,
    variant = 'dark'
}) => {
    return (
        <div className={`mobile-app-header fixed top-0 left-0 right-0 z-[150] flex items-center justify-between transition-colors duration-200 ${variant === 'dark'
            ? 'bg-gray-900/95 border-b border-gray-700 text-white'
            : 'text-gray-900'
            }`}>
            <button
                type="button"
                onClick={onBack}
                className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border-0 active:scale-[0.97] ${variant === 'dark' ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-gray-900 hover:bg-black/10'}`}
                aria-label="Back"
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <span className="text-[13px] font-bold tracking-tight truncate max-w-[55%] px-2">
                {title}
            </span>
            {showNext && onNext ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="mobile-app-cta min-h-[44px] px-4 rounded-xl font-bold text-[13px] bg-blue-600 text-white border-0"
                >
                    {nextLabel}
                </button>
            ) : (
                <div className="min-w-[44px]" />
            )}
        </div>
    );
};
