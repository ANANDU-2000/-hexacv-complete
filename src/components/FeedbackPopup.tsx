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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-bw-black/60 backdrop-blur-sm animate-bw-fade-in">
            <div
                className="bg-bw-white rounded-bw-modal shadow-bw-modal border border-bw-border w-full max-w-[380px] mx-4 p-8 animate-bw-fade-up relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-bw-gray-400 hover:text-bw-black transition-all duration-bw rounded-full hover:bg-bw-surface"
                >
                    <span className="text-xl">×</span>
                </button>

                {/* Title */}
                <h3 className="text-center text-lg font-bold text-bw-black mb-1">
                    How was your experience?
                </h3>
                <p className="text-center text-sm text-bw-gray-500 mb-6">
                    Your feedback helps us improve
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-1.5 mb-6">
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
                    <p className="text-center text-sm font-medium text-bw-gray-700 mb-5 animate-bw-fade-in">
                        {rating === 1 && 'Needs Improvement'}
                        {rating === 2 && 'Okay'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent!'}
                    </p>
                )}

                {/* Message Input */}
                <div className="space-y-2 mb-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your feedback (optional)"
                        className="w-full px-4 py-3 border border-bw-border rounded-bw-input outline-none focus:border-bw-black focus:ring-2 focus:ring-bw-gray-100 text-sm resize-none h-24 transition-all duration-bw"
                    />
                </div>

                {/* Name Input */}
                <div className="space-y-2 mb-6">
                    <label className="text-xs font-semibold text-bw-gray-600">Your Name (optional)</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-bw-border rounded-bw-input outline-none focus:border-bw-black focus:ring-2 focus:ring-bw-gray-100 text-sm transition-all duration-bw"
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
                        className="flex-1 py-3 border border-bw-border text-bw-gray-600 rounded-bw-input font-semibold text-sm hover:bg-bw-surface hover:border-bw-gray-300 transition-all duration-bw"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1 py-3 bg-bw-black text-white rounded-bw-input font-semibold text-sm hover:bg-bw-gray-800 transition-all duration-bw disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPopup;
