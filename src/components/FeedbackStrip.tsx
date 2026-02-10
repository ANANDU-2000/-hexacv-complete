/**
 * Horizontal auto-scrolling feedback carousel.
 * Outcome-based copy, role + geography. No stars, no quote icons, no avatars.
 * Desktop: auto-scroll 10s, pause on hover. Mobile: swipe, one card visible.
 */
import React, { useState, useEffect, useRef } from 'react';
import { feedbackService, FeedbackItem } from '../services/feedback';

const SCROLL_INTERVAL_MS = 10000; // 10s per card
const CARD_WIDTH_DESKTOP = 360;
const CARD_GAP = 24;

export const FeedbackStrip: React.FC = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(feedbackService.getFeedback().filter((t) => t.isFeatured));
  }, []);

  // Auto-scroll (desktop): infinite loop, advance every 10s when not paused
  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const step = CARD_WIDTH_DESKTOP + CARD_GAP;
    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      let next = el.scrollLeft + step;
      if (next >= maxScroll) next = 0; // loop
      el.scrollTo({ left: next, behavior: 'smooth' });
    }, SCROLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items.length, paused]);

  if (items.length === 0) return null;

  const displayItems = [...items, ...items]; // duplicate for infinite feel

  return (
    <section
      className="w-full border-t border-slate-200 bg-slate-50/90 py-8 lg:py-10"
      aria-label="What others say"
    >
      <div className="px-4 lg:px-8 max-w-6xl mx-auto">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
          What others say
        </h3>
        <div
          ref={scrollRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 300)}
          className="feedback-carousel overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="flex gap-4 lg:gap-8 pb-2 min-w-0">
            {displayItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="feedback-card flex-shrink-0 w-[85vw] max-w-[340px] lg:w-[360px] snap-center rounded-[14px] border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <p className="text-slate-700 text-[15px] leading-relaxed mb-4">
                  {item.content}
                </p>
                <p className="text-slate-500 text-[13px]">
                  — {item?.userName ?? item?.author ?? 'User'}
                  {item.role && `, ${item.role}`}
                  {item.geography && ` (${item.geography})`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .feedback-carousel { scroll-behavior: smooth; }
        @media (min-width: 1024px) {
          .feedback-card { padding: 20px; }
        }
      `}</style>
    </section>
  );
};
