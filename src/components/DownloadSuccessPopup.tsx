import React from 'react';

interface DownloadSuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
}

const DownloadSuccessPopup: React.FC<DownloadSuccessPopupProps> = ({ isOpen, onClose, onContinue }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[320px] p-6 animate-in zoom-in-95 duration-300"
                style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Success Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-center text-lg font-black text-slate-900 mb-2">
                    Resume Downloaded Successfully!
                </h3>

                {/* Message */}
                <p className="text-center text-sm text-slate-600 mb-6">
                    Your professional resume is ready. Good luck with your job search!
                </p>

                {/* Continue Button */}
                <button
                    onClick={() => {
                        onContinue();
                        onClose();
                    }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                >
                    Continue
                </button>

                {/* Close Button (X) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default DownloadSuccessPopup;
