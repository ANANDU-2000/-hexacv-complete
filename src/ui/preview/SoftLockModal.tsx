import React from 'react';

interface SoftLockModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  loading?: boolean;
}

const VALUE_BULLETS = [
  'Tailored to your exact job role',
  'Optimized for ATS screening',
  'Strong action verbs & metrics',
  'No subscription. Pay once.',
];

export const SoftLockModal: React.FC<SoftLockModalProps> = ({
  open,
  onClose,
  onContinue,
  loading = false,
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
          Advanced ATS Rewrite — ₹49 (one-time)
        </h2>
        <ul className="list-none space-y-2 mb-4">
          {VALUE_BULLETS.map((text, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
              <span className="text-green-600 shrink-0" aria-hidden>✔</span>
              {text}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Unlock Advanced Rewrite — ₹49'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Continue with Free Version
          </button>
        </div>
      </div>
    </div>
  );
};
