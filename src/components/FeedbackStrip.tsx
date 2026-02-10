/**
 * Horizontal strip of real feedback below hero — no slider, horizontal scroll.
 */
import React, { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { feedbackService, FeedbackItem } from '../services/feedback';

export const FeedbackStrip: React.FC = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    setItems(feedbackService.getFeedback().filter((t) => t.isFeatured));
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      className="w-full border-t border-slate-200 bg-slate-50/80 py-8 lg:py-10"
      aria-label="What others say"
    >
      <div className="px-4 lg:px-8">
        <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
          Real feedback
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-start lg:justify-center max-w-6xl mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="text-slate-200 w-8 h-8 mb-1" />
              <p className="text-slate-700 text-sm leading-relaxed line-clamp-3 mb-4">
                &ldquo;{item.content ?? ''}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">
                  {(item?.userName ?? item?.author ?? '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item?.userName ?? item?.author ?? 'User'}</p>
                  {item.role && (
                    <p className="text-xs text-slate-500 uppercase tracking-wide">{item.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
};
