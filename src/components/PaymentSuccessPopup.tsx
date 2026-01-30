import React from 'react';

interface PaymentSuccessPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    templateName: string;
    amount: number;
}

const PaymentSuccessPopup: React.FC<PaymentSuccessPopupProps> = ({ 
    isOpen, 
    onClose, 
    onDownload, 
    templateName, 
    amount 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-bw-black/60 backdrop-blur-sm animate-bw-fade-in">
            <div 
                className="bg-bw-white rounded-bw-modal shadow-bw-modal border border-bw-border w-[380px] p-8 animate-bw-fade-up relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-bw-black rounded-full flex items-center justify-center shadow-bw-card">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-center text-xl font-bold text-bw-black mb-2">
                    Payment Successful
                </h3>

                {/* Amount Badge */}
                <div className="flex justify-center mb-4">
                    <span className="bg-bw-surface text-bw-black px-4 py-1.5 rounded-full text-sm font-semibold border border-bw-border">
                        ₹{amount} Paid
                    </span>
                </div>

                {/* Message */}
                <p className="text-center text-sm text-bw-gray-600 mb-6">
                    <span className="font-semibold text-bw-black">{templateName}</span> template has been unlocked. 
                    You can now download your premium resume.
                </p>

                {/* Download Now Button */}
                <button
                    onClick={() => {
                        onDownload();
                        onClose();
                    }}
                    className="w-full py-3.5 bg-bw-black text-white rounded-bw-input font-semibold text-sm hover:bg-bw-gray-800 transition-all duration-bw shadow-bw-soft hover:shadow-bw-card"
                >
                    Download Now
                </button>

                {/* Later Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 mt-3 text-bw-gray-500 font-medium text-sm hover:text-bw-black transition-all duration-bw"
                >
                    Download Later
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPopup;
