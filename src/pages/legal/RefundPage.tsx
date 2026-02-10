import React from 'react';
import { Link } from 'react-router-dom';
import { SiteFooter } from '../../components/SiteFooter';

export const RefundPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <div className="max-w-2xl mx-auto py-12 px-4 flex-1 prose prose-gray">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to HexaCV</Link>
      <h1 className="text-2xl font-bold text-gray-900">Refund Policy</h1>
      <section className="mt-6 text-gray-700 space-y-4">
        <p>Due to the instant digital nature of resume generation, refunds are not offered once the service has been delivered (e.g. after you have downloaded the premium PDF).</p>
        <p>For payment issues, failed transactions, or duplicate charges, please <Link to="/contact" className="text-blue-600 hover:underline">contact support</Link> with your transaction details.</p>
        <p className="text-sm text-gray-500 mt-8"><Link to="/contact" className="text-blue-600 hover:underline">Contact</Link> · <Link to="/pricing" className="text-blue-600 hover:underline">Pricing</Link> · <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> · <Link to="/privacy" className="text-blue-600 hover:underline">Privacy</Link></p>
      </section>
    </div>
    <SiteFooter />
  </div>
);
