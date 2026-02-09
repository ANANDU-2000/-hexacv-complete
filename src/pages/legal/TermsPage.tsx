import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-2xl mx-auto prose prose-gray">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to HexaCV</Link>
      <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
      <section className="mt-6 text-gray-700 space-y-4">
        <p><strong>Service description.</strong> HexaCV provides an ATS-optimized resume builder and an optional paid service to improve resume wording for ATS (\"ATS Optimized Version\"). The service is provided as-is for creating and downloading resume documents.</p>
        <p><strong>No job guarantee.</strong> We do not guarantee employment, interviews, or any specific outcome from using our resume tools. Resume quality and hiring decisions depend on many factors outside our control.</p>
        <p><strong>Payment terms.</strong> Payment for the ATS Optimized Version is one-time (₹49). Payment is processed via PayU. By completing payment you agree to these terms and our refund policy.</p>
        <p className="text-sm text-gray-500 mt-8"><Link to="/contact" className="text-blue-600 hover:underline">Contact</Link> · <Link to="/privacy" className="text-blue-600 hover:underline">Privacy</Link> · <Link to="/refund" className="text-blue-600 hover:underline">Refund</Link></p>
      </section>
    </div>
  </div>
);
