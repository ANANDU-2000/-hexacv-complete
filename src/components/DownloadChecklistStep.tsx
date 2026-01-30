// Download Checklist Step Component
// Step 7: Post-download checklist with apply strategy tips

import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Circle,
  ExternalLink,
  Share2,
  MessageSquare,
  RefreshCw,
  Rocket,
  Target,
  Clock,
  Users,
  AlertTriangle,
  PartyPopper
} from 'lucide-react';

interface DownloadChecklistStepProps {
  onDownloadAgain: () => void;
  onStartNew: () => void;
  onShareFeedback: () => void;
  resumeName: string;
}

const CHECKLIST_ITEMS = [
  {
    id: 'tailor',
    text: 'Tailor resume for EACH job (change 2-3 bullets per application)',
    tip: 'Generic resumes get ignored. Customize top 3 bullets for each role.'
  },
  {
    id: 'filename',
    text: 'Save as "FirstName_LastName_Role.pdf" (not "Resume.pdf")',
    tip: 'Recruiters download hundreds of "Resume.pdf" files. Stand out.'
  },
  {
    id: 'proofread',
    text: 'Proofread 3 times (typos = instant rejection)',
    tip: 'Read it backwards. Ask a friend. Typos signal carelessness.'
  },
  {
    id: 'linkedin',
    text: 'Match your LinkedIn headline to your resume target role',
    tip: 'Recruiters cross-check. Inconsistency raises red flags.'
  },
  {
    id: 'apply-early',
    text: 'Apply within 24 hours of job posting',
    tip: '50% higher response rate for early applicants.'
  },
  {
    id: 'follow-up',
    text: 'Follow up after 1 week with recruiter on LinkedIn',
    tip: 'Polite follow-up shows genuine interest. Keep it brief.'
  }
];

const APPLY_TIPS = {
  dos: [
    { icon: Clock, text: 'Apply within 24 hours of job posting (50% higher response)' },
    { icon: Users, text: 'Connect with recruiters before applying' },
    { icon: Target, text: 'Focus on roles you\'re 70%+ qualified for' },
    { icon: MessageSquare, text: 'Write personalized cover letters for top 3 choices' }
  ],
  donts: [
    { text: 'Spray & pray (200 applications with same resume)' },
    { text: 'Apply to jobs you\'re <50% qualified for' },
    { text: 'Use the same resume for different role types' },
    { text: 'Ignore job posting requirements/instructions' }
  ]
};

export function DownloadChecklistStep({
  onDownloadAgain,
  onStartNew,
  onShareFeedback,
  resumeName
}: DownloadChecklistStepProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const completedCount = checkedItems.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <PartyPopper className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Downloaded!</h1>
          <p className="text-gray-600">
            Saved as <span className="font-mono bg-gray-100 px-2 py-1 rounded">{resumeName}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Pre-Apply Checklist</span>
            <span className="text-sm text-gray-500">{completedCount}/{totalCount} completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Before You Apply
          </h2>
          <ul className="space-y-4">
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-start gap-3 text-left group"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className={`font-medium ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.text}
                      </span>
                      <p className="text-sm text-gray-500 mt-0.5">{item.tip}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Apply Strategy */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* DOs */}
          <div className="bg-emerald-50 rounded-xl p-5">
            <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              DO This
            </h3>
            <ul className="space-y-3">
              {APPLY_TIPS.dos.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
                  <tip.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>

          {/* DON'Ts */}
          <div className="bg-red-50 rounded-xl p-5">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              DON'T Do This
            </h3>
            <ul className="space-y-3">
              {APPLY_TIPS.donts.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                  <span className="text-red-400">✗</span>
                  {tip.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-blue-50 rounded-xl p-5 mb-8">
          <h3 className="font-bold text-blue-900 mb-3">Bonus Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResourceLink 
              text="LinkedIn Optimization" 
              href="https://www.linkedin.com/pulse/how-optimize-your-linkedin-profile"
            />
            <ResourceLink 
              text="Email Follow-up Templates" 
              href="https://www.themuse.com/advice/how-to-follow-up-on-a-job-application"
            />
            <ResourceLink 
              text="Interview Prep Guide" 
              href="https://www.glassdoor.com/Interview/index.htm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onDownloadAgain}
            className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Again
          </button>
          <button
            onClick={onStartNew}
            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Start New Resume
          </button>
        </div>

        {/* Feedback CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={onShareFeedback}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2 mx-auto"
          >
            <MessageSquare className="w-4 h-4" />
            Share your feedback to help us improve
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourceLink({ text, href }: { text: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
    >
      {text}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export default DownloadChecklistStep;
