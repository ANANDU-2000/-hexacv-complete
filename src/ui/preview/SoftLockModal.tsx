import React from 'react';

interface SoftLockModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  loading?: boolean;
}

const BULLETS = [
  'Stronger action verbs',
  'Better keyword alignment',
  'Recruiter-ready bullets',
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
        <h2 id="soft-lock-title" className="text-lg font-bold text-gray-900 mb-4">
          Unlock Premium ATS Rewrite
        </h2>
        <ul className="list-none space-y-2 mb-4">
          {BULLETS.map((text, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600" aria-hidden>✔</span>
              {text}
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600 mb-6">
          ₹49 — One time. No account required.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Redirecting…' : 'Continue to Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};
