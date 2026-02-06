import React, { useState } from 'react';

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: { rating: number; message: string; userName: string }) => void;
    templateName?: string;
    onRedirect?: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose, onSubmit, onRedirect }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ rating, message, userName });
            onClose();

            if (onRedirect) {
                setTimeout(() => {
                    onRedirect();
                }, 500);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            onClose();
            if (onRedirect) {
                setTimeout(() => {
                    onRedirect();
                }, 500);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarIcon = ({ filled, onClick, onHover, onLeave }: { filled: boolean; onClick: () => void; onHover: () => void; onLeave: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            className="focus:outline-none transition-transform duration-150 hover:scale-110"
        >
            <svg
                className={`w-8 h-8 transition-colors duration-150 ${filled ? 'text-bw-black' : 'text-bw-gray-200'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] mx-4 p-7 animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                    <span className="text-xl leading-none">×</span>
                </button>

                {/* Title */}
                <h3 className="text-center text-lg font-bold text-gray-900 mb-1">
                    How was your experience?
                </h3>
                <p className="text-center text-sm text-gray-500 mb-6">
                    Your feedback helps us improve
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                            key={star}
                            filled={star <= (hoveredRating || rating)}
                            onClick={() => setRating(star)}
                            onHover={() => setHoveredRating(star)}
                            onLeave={() => setHoveredRating(0)}
                        />
                    ))}
                </div>

                {/* Rating Labels */}
                {rating > 0 && (
                    <p className="text-center text-sm font-medium text-gray-600 mb-5 animate-in fade-in duration-200">
                        {rating === 1 && 'Needs Improvement'}
                        {rating === 2 && 'Okay'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent!'}
                    </p>
                )}

                {/* Message Input */}
                <div className="mb-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your feedback (optional)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 text-sm resize-none h-24 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                </div>

                {/* Name Input */}
                <div className="mb-6">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Your Name (optional)</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            if (onRedirect) {
                                setTimeout(() => {
                                    onRedirect();
                                }, 300);
                            }
                        }}
                        className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1 py-3 bg-black text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
