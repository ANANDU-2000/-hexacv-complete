import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Site-wide footer for PayU / merchant verification: legal name, address, and pricing must be visible on the website.
 */
export const SiteFooter: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <footer
    className="bg-slate-100 border-t border-slate-200 text-slate-700"
    role="contentinfo"
    aria-label="Legal and contact information"
  >
    <div className={compact ? 'py-4 px-4' : 'py-6 px-4 lg:px-8'}>
      <div className={`max-w-4xl mx-auto ${compact ? 'space-y-2 text-sm' : 'space-y-4'}`}>
        <div className={compact ? 'flex flex-wrap items-center gap-x-4 gap-y-1' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'}>
          <div>
            <span className="font-medium text-slate-500">Legal name</span>
            <p className="text-slate-800 font-medium">ANANDUKRISHNA P A</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Address</span>
            <p className="text-slate-800">Vatanappally, Thrissur, Kerala 680614, India</p>
          </div>
          <div>
            <span className="font-medium text-slate-500">Pricing</span>
            <p className="text-slate-800">
              <Link to="/pricing" className="text-blue-600 hover:underline font-medium">₹49 one-time</Link> for ATS wording improvement
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link to="/contact" className="text-blue-600 hover:underline">Contact</Link>
          <Link to="/pricing" className="text-blue-600 hover:underline">Pricing</Link>
          <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link>
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy</Link>
          <Link to="/refund" className="text-blue-600 hover:underline">Refund</Link>
        </div>
      </div>
    </div>
  </footer>
);
