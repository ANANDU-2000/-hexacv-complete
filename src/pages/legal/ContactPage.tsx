import React from 'react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← Back to HexaCV</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact</h1>
      <dl className="space-y-3 text-gray-700">
        <div>
          <dt className="text-sm font-medium text-gray-500">Legal name</dt>
          <dd>Anandu Krishna PA</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Address</dt>
          <dd>Vatnappally PO, Kerala, India</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd><a href="mailto:support@hexacv.online" className="text-blue-600 hover:underline">support@hexacv.online</a></dd>
        </div>
      </dl>
      <p className="text-sm text-gray-500 mt-8"><Link to="/pricing" className="text-blue-600 hover:underline">Pricing</Link> · <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link> · <Link to="/privacy" className="text-blue-600 hover:underline">Privacy</Link> · <Link to="/refund" className="text-blue-600 hover:underline">Refund</Link></p>
    </div>
  </div>
);
