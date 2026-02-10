import React from 'react';

interface SoftLockModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  loading?: boolean;
  error?: string | null;
}

const VALUE_BULLETS = [
  'Resumes that match job keywords get more callbacks',
  'Bullets rewritten to your job description',
  'ATS-friendly wording + stronger action verbs',
  'One-time ₹49. No subscription.',
];

export const SoftLockModal: React.FC<SoftLockModalProps> = ({
  open,
  onClose,
  onContinue,
  loading = false,
  error = null,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soft-lock-title"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 id="soft-lock-title" className="text-lg font-bold text-gray-900 mb-2">
          Get more callbacks — keyword-matched wording
        </h2>
        <p className="text-sm text-gray-700 mb-3">
          We rewrite your bullets to match the job description keywords so ATS shortlists you. One-time ₹49; no subscription.
        </p>
        <ul className="list-none space-y-2 mb-4">
          {VALUE_BULLETS.map((text, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
              <span className="text-green-600 shrink-0" aria-hidden>✔</span>
              {text}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mb-2">
          Secure PayU payment. No login required. Unlock is confirmed only after payment success.
        </p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          <strong>Tip:</strong> Use a valid UPI ID (e.g. yourname@paytm or yourname@ybl). Don&apos;t use Back or Refresh during payment — your resume is saved if you return.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onContinue}
            disabled={loading || !!error}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? 'Redirecting to payment…' : error ? 'Try again' : 'Pay ₹49 — get keyword-matched wording'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Stay with my current wording
          </button>
        </div>
      </div>
    </div>
  );
};
