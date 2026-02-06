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
        <div className={`fixed top-0 left-0 right-0 z-[150] backdrop-blur-2xl border-b transition-colors duration-500 ${variant === 'dark'
            ? 'bg-black/40 border-white/10 text-white'
            : 'bg-white/80 border-gray-100 text-black'
            }`}>
            <div className={`flex items-center justify-between px-4 sm:px-5 h-[52px] sm:h-14`}>
                {/* Back Button */}
                <button
                    type="button"
                    onClick={onBack}
                    className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all active:scale-90 ${variant === 'dark' ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
                        }`}
                >
                    <ChevronLeft size={22} strokeWidth={3} className="scale-90 sm:scale-100" />
                </button>

                {/* Title */}
                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-center px-3 truncate max-w-[50%] ${variant === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                    {title}
                </span>

                {/* Action Button / Placeholder */}
                {showNext && onNext ? (
                    <button
                        type="button"
                        onClick={onNext}
                        className={`h-9 sm:h-10 px-4 sm:px-5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${variant === 'dark'
                            ? 'bg-white text-black shadow-white/5'
                            : 'bg-black text-white shadow-black/10'
                            }`}
                    >
                        {nextLabel}
                    </button>
                ) : (
                    <div className="w-9 sm:w-10" />
                )}
            </div>
        </div>
    );
};
