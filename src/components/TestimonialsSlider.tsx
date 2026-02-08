import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Quote, Star } from 'lucide-react';
import { feedbackService, FeedbackItem } from '../services/feedback';

export const TestimonialsSlider: React.FC = () => {
    const [testimonials, setTestimonials] = useState<FeedbackItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const data = feedbackService.getFeedback().filter(t => t.isFeatured);
        setTestimonials(data);
    }, []);

    const handlers = useSwipeable({
        onSwipedLeft: () => nextSlide(),
        onSwipedRight: () => prevSlide(),
        trackMouse: true
    });

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    if (testimonials.length === 0) return null;

    return (
        <div className="w-full py-12 px-4 md:px-8 bg-[#F8F9FB]">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Loved by Job Seekers</h3>
                    <p className="text-slate-500 text-sm">Join thousands who have landed their dream roles</p>
                </div>

                <div
                    {...handlers}
                    className="relative overflow-hidden min-h-[280px] flex items-center justify-center"
                >
                    {testimonials.map((item, index) => (
                        <div
                            key={item.id}
                            className={`absolute inset-0 transition-all duration-500 ease-in-out flex flex-col items-center justify-center px-4 md:px-12 ${index === activeIndex
                                    ? 'opacity-100 translate-x-0'
                                    : index < activeIndex
                                        ? 'opacity-0 -translate-x-full'
                                        : 'opacity-0 translate-x-full'
                                }`}
                        >
                            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-3xl shadow-xl max-w-2xl w-full relative">
                                <Quote className="absolute top-4 left-4 text-black/10 w-12 h-12 -z-0" />

                                <div className="flex gap-1 mb-4 relative z-10">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <p className="text-lg md:text-xl text-slate-800 leading-relaxed italic mb-6 relative z-10">
                                    "{item.content ?? ''}"
                                </p>

                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                                        {(item.userName ?? item.author ?? '?').charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.userName ?? item.author ?? 'User'}</h4>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{item.role ?? ''}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-slate-900' : 'w-2 bg-slate-300 hover:bg-slate-400'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
