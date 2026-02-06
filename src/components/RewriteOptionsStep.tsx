// Rewrite Options Step Component
// Step 5: Side-by-side comparison of Free vs Paid rewrite

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  X,
  Sparkles,
  FileText,
  Crown,
  Info
} from 'lucide-react';

interface RewriteOptionsStepProps {
  onContinue: (selectedOption: 'free' | 'paid') => void;
  onBack: () => void;
  isPaidUser: boolean;
}

// Example bullets for comparison
const COMPARISON_EXAMPLES = [
  {
    free: 'Worked on building the API for payment feature using Node.js',
    paid: 'Architected payment API using Node.js and PostgreSQL, processing ~₹50L monthly transactions with 99.9% uptime'
  },
  {
    free: 'Improved system performance and fixed bugs',
    paid: 'Optimized database queries reducing API response time by 40%, supporting 10K+ daily active users'
  },
  {
    free: 'Led team to deliver project on time',
    paid: 'Led 4-member team to deliver checkout system 2 weeks ahead of schedule, reducing cart abandonment by 15%'
  }
];

export function RewriteOptionsStep({
  onContinue,
  onBack,
  isPaidUser
}: RewriteOptionsStepProps) {
  const [selectedOption, setSelectedOption] = useState<'free' | 'paid'>('free');
  const [activeExample, setActiveExample] = useState(0);

  const handleContinue = () => {
    onContinue(selectedOption);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Choose Your Version</h1>
            <p className="text-gray-600">Compare free grammar fixes vs AI-enhanced rewrite</p>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Version */}
          <div 
            onClick={() => setSelectedOption('free')}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
              selectedOption === 'free' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedOption === 'free' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">Free Version</h3>
                <p className="text-gray-500">Grammar fixes only</p>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-4">₹0</div>

            <ul className="space-y-3 mb-6">
              <FeatureItem included text="Fix grammar & spelling" />
              <FeatureItem included text="Correct tech name formatting" />
              <FeatureItem included text="ATS-safe structure" />
              <FeatureItem included={false} text="JD keyword optimization" />
              <FeatureItem included={false} text="Metric additions" />
              <FeatureItem included={false} text="Impact-driven rewriting" />
            </ul>

            <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
              Good for: Quick fixes, simple applications
            </div>
          </div>

          {/* Paid Version */}
          <div 
            onClick={() => setSelectedOption('paid')}
            className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all ${
              selectedOption === 'paid' 
                ? 'border-black bg-amber-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {selectedOption === 'paid' && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              RECOMMENDED
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">AI-Enhanced</h3>
                <p className="text-gray-500">Full optimization</p>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-4">
              ₹49
              <span className="text-sm font-normal text-gray-500 ml-2">one-time</span>
            </div>

            <ul className="space-y-3 mb-6">
              <FeatureItem included text="Everything in Free" />
              <FeatureItem included text="JD keyword integration" />
              <FeatureItem included text="Metric inference (~% improvements)" />
              <FeatureItem included text="Action verb optimization" />
              <FeatureItem included text="STAR format bullets" />
              <FeatureItem included text="Recruiter-tested language" />
            </ul>

            <div className="text-sm text-amber-800 bg-amber-100 rounded-lg p-3">
              Good for: Serious job search, 10+ applications
            </div>
          </div>
        </div>

        {/* Live Example Comparison */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              See the Difference
            </h3>
            <div className="flex gap-2">
              {COMPARISON_EXAMPLES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveExample(idx)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    activeExample === idx 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Free version example */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Free Version</div>
              <p className="text-gray-700">{COMPARISON_EXAMPLES[activeExample].free}</p>
            </div>

            {/* Paid version example */}
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-sm font-medium text-amber-600 mb-2">AI-Enhanced</div>
              <p className="text-gray-700">{COMPARISON_EXAMPLES[activeExample].paid}</p>
            </div>
          </div>
        </div>

        {/* Honest Pricing Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Honest pricing:</strong> The free version is perfectly usable. 
              The paid version adds ~30% more keyword matches and professional metrics. 
              Worth it if applying to competitive roles or 10+ positions.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Continue with {selectedOption === 'paid' ? 'AI-Enhanced' : 'Free'} Version
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      {included ? (
        <Check className="w-5 h-5 text-emerald-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      )}
      <span className={included ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </li>
  );
}

export default RewriteOptionsStep;
