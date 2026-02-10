import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Professional SaaS-style footer. No personal address; trust + legal only.
 * PayU: legal/contact details remain on /contact and /terms for verification.
 */
export const SiteFooter: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <footer
    className="bg-slate-100 border-t border-slate-200 text-slate-700"
    role="contentinfo"
    aria-label="Footer"
  >
    <div className={compact ? 'py-5 px-4' : 'py-8 px-4 lg:px-8'}>
      <div className={`max-w-5xl mx-auto ${compact ? 'space-y-4' : ''}`}>
        {/* 3 columns desktop, stacked mobile */}
        <div
          className={
            compact
              ? 'grid grid-cols-1 gap-4 text-sm'
              : 'grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-sm'
          }
        >
          {/* Column 1 — Brand */}
          <div>
            <p className="font-semibold text-slate-900 mb-1">HexaCV</p>
            <p className="text-slate-600 leading-relaxed">
              ATS-safe resume builder. Built for India & Gulf job seekers.
            </p>
          </div>
          {/* Column 2 — Trust */}
          <div>
            <p className="font-semibold text-slate-900 mb-1">Trust</p>
            <ul className="text-slate-600 space-y-1 leading-relaxed">
              <li>No signup required</li>
              <li>One-time ₹49 payment (no subscription)</li>
              <li>Secure payments via PayU</li>
            </ul>
          </div>
          {/* Column 3 — Legal / Contact */}
          <div>
            <p className="font-semibold text-slate-900 mb-1">Legal</p>
            <p className="text-slate-600 leading-relaxed">
              Operated by: Anandu Krishna P A & Surag
              <br />
              Contact:{' '}
              <a
                href="mailto:support@hexacv.online"
                className="text-blue-600 hover:underline"
              >
                support@hexacv.online
              </a>
            </p>
          </div>
        </div>
        {/* Bottom strip */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>© 2026 HexaCV</span>
          <Link to="/privacy" className="hover:text-slate-700 hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-700 hover:underline">
            Terms
          </Link>
          <Link to="/refund" className="hover:text-slate-700 hover:underline">
            Refunds
          </Link>
        </div>
      </div>
    </div>
  </footer>
);
