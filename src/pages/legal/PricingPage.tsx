import React from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../../components/SiteFooter';

export const PricingPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="max-w-2xl mx-auto py-12 px-4 flex-1">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to HexaCV</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h1>
      <p className="text-lg font-medium text-gray-800 mb-2">Improve wording for ATS – ₹49 (one-time)</p>
      <p className="text-gray-600">No subscription. Pay once. Get JD-aligned resume rewrite and premium template.</p>
      <p className="text-sm text-gray-500 mt-4">For refund, terms, and contact details, see the links below.</p>
    </div>
    <SiteFooter />
  </div>
);
