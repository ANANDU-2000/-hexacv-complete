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
    showNext = true
}) => {
    const handleBackClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onBack();
    };

    const handleNextClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onNext) onNext();
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-[150] bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-gray-200/50">
            {/* Back Button */}
            <button
                type="button"
                onClick={handleBackClick}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all active:bg-black/5 touch-manipulation text-black"
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {/* Title */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 text-center truncate w-full">
                    {title}
                </span>
            </div>

            {/* Action Button */}
            <div className="flex justify-end min-w-[40px]">
                {showNext && onNext ? (
                    <button
                        type="button"
                        onClick={handleNextClick}
                        className="h-9 px-5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 touch-manipulation bg-white text-black border-2 border-black shadow-sm"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {nextLabel}
                    </button>
                ) : (
                    <div className="w-10" />
                )}
            </div>
        </div>
    );
};
