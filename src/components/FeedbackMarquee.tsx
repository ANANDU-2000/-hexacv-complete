import React, { useEffect, useState } from 'react';

interface FeedbackItem {
    id: string;
    rating: number;
    message: string;
    userName: string;
    createdAt: string;
}

interface FeedbackMarqueeProps {
    feedbacks?: FeedbackItem[];
}

// Default feedbacks for initial display (will be replaced with real data from API)
const defaultFeedbacks: FeedbackItem[] = [];

const FeedbackMarquee: React.FC<FeedbackMarqueeProps> = ({ feedbacks: propFeedbacks }) => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(propFeedbacks || defaultFeedbacks);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch approved feedbacks from API
    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiBase}/api/feedback/approved`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.feedbacks && data.feedbacks.length > 0) {
                        setFeedbacks(data.feedbacks);
                    }
                }
            } catch (error) {
                console.log('Using default feedbacks');
            }
        };

        if (!propFeedbacks) {
            fetchFeedbacks();
        }
    }, [propFeedbacks]);

    // Don't render if no feedbacks
    if (feedbacks.length === 0) return null;

    // Double the feedbacks for seamless infinite scroll
    const displayFeedbacks = [...feedbacks, ...feedbacks];

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );

    const getInitials = (name: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
            'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    return (
        <div 
            className="w-full overflow-hidden bg-gradient-to-r from-white via-slate-50 to-white border-y border-slate-100"
            style={{ height: '56px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className={`flex items-center h-full ${isPaused ? '' : 'animate-marquee'}`}
                style={{
                    animation: isPaused ? 'none' : 'marquee 30s linear infinite',
                    width: 'fit-content'
                }}
            >
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                `}</style>
                
                {displayFeedbacks.map((feedback, index) => (
                    <div 
                        key={`${feedback.id}-${index}`}
                        className="flex items-center gap-3 px-6 shrink-0"
                        style={{ minWidth: 'max-content' }}
                    >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full ${getAvatarColor(feedback.userName)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                            {getInitials(feedback.userName)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex items-center gap-2">
                            <StarRating rating={feedback.rating} />
                            <p className="text-[13px] text-slate-700 font-medium truncate max-w-[200px]">
                                "{feedback.message}"
                            </p>
                            <span className="text-[11px] text-slate-400">
                                — {feedback.userName || 'Anonymous'}
                            </span>
                        </div>
                        
                        {/* Separator */}
                        <div className="w-px h-4 bg-slate-200 ml-3" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackMarquee;
