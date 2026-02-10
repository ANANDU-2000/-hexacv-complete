/**
 * Shown after PDF download. Optional feedback; Stay (remain on preview) or Done (go home).
 */
import React, { useState } from 'react';
import { feedbackService } from '../services/feedback';

interface DownloadFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  wasPaid?: boolean;
}

export const DownloadFeedbackModal: React.FC<DownloadFeedbackModalProps> = ({
  open,
  onClose,
  onDone,
  wasPaid = false,
}) => {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [gotWhatLookingFor, setGotWhatLookingFor] = useState<boolean | null>(null);

  if (!open) return null;

  const saveFeedback = () => {
    if (rating > 0 || message.trim()) {
      feedbackService.addFeedback({
        author: userName.trim() || 'Anonymous',
        content: message.trim() || `Rating: ${rating}/5${wasPaid && gotWhatLookingFor !== null ? ` | Got what looking for: ${gotWhatLookingFor}` : ''}`,
        rating: rating || undefined,
      });
    }
  };

  const handleStay = () => {
    saveFeedback();
    onClose();
  };

  const handleDone = () => {
    saveFeedback();
    onClose();
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[360px] p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-feedback-title"
      >
        <h2 id="download-feedback-title" className="text-lg font-bold text-gray-900 mb-1 text-center">
          Thanks for downloading!
        </h2>
        <p className="text-sm text-gray-500 mb-4 text-center">You’re one step closer to more callbacks. Quick feedback (optional)</p>

        {/* Star rating — centered, touch-friendly, no overflow on mobile */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-0.5 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label={`${star} star`}
            >
              <span className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your feedback (optional)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 mb-4"
        />

        {wasPaid && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Did you get what you were looking for?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGotWhatLookingFor(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${gotWhatLookingFor === true ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setGotWhatLookingFor(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${gotWhatLookingFor === false ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' : 'bg-gray-100 text-gray-600 border-2 border-transparent'}`}
              >
                No
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStay}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
            >
              Stay
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
