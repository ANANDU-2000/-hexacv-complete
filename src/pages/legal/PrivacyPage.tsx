import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-2xl mx-auto prose prose-gray">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to HexaCV</Link>
      <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
      <section className="mt-6 text-gray-700 space-y-4">
        <p><strong>No resume data stored.</strong> We do not store your resume content on our servers for marketing or long-term retention. Data used during the session is for generating your resume and PDF only.</p>
        <p><strong>No resale of data.</strong> We do not sell, rent, or share your resume or personal data to third parties for advertising or other commercial use.</p>
        <p><strong>AI processing.</strong> Resume rewrite and optimization may use AI services to improve content. Processed text is not used to train models or retained beyond the request.</p>
        <p className="text-sm text-gray-500 mt-8"><Link to="/contact" className="text-blue-600 hover:underline">Contact</Link> · <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> · <Link to="/refund" className="text-blue-600 hover:underline">Refund</Link></p>
      </section>
    </div>
  </div>
);
