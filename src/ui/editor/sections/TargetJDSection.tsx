import React, { useState, useMemo } from 'react';
import { ResumeData, ExperienceLevel, TargetMarket } from '../../../core/types';
import { COMMON_ROLES } from '../../../constants/roles';

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'fresher', label: 'Fresher (0–1 yr)' },
  { value: '1-3', label: 'Junior (1–3)' },
  { value: '3-5', label: 'Mid (3–5)' },
  { value: '5-8', label: 'Senior (5–8)' },
  { value: '8+', label: 'Lead (8+)' },
];

const TARGET_MARKETS: { value: TargetMarket; label: string }[] = [
  { value: 'india', label: '🇮🇳 India' },
  { value: 'gulf', label: '🇦🇪 Gulf' },
  { value: 'us', label: '🌍 US / UK / Global' },
  { value: 'remote', label: '🌍 Remote' },
];

interface TargetJDSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

const JD_MIN_WORDS = 50;
const JD_WARN_WORDS = 150;

export const TargetJDSection: React.FC<TargetJDSectionProps> = ({ data, onChange }) => {
  const [roleFocus, setRoleFocus] = useState(false);

  const basics = data.basics || {};
  const roleValue = basics.targetRole || '';
  const jd = data.jobDescription || '';
  const wordCount = jd.trim() ? jd.trim().split(/\s+/).length : 0;

  const suggestions = useMemo(() => {
    const q = roleValue.trim().toLowerCase();
    if (!q || q.length < 2) return COMMON_ROLES.slice(0, 12);
    return COMMON_ROLES.filter((r) => r.toLowerCase().includes(q)).slice(0, 12);
  }, [roleValue]);

  const handleRoleChange = (value: string) => {
    onChange({ basics: { ...basics, targetRole: value } });
  };

  const handleSelectRole = (role: string) => {
    onChange({ basics: { ...basics, targetRole: role } });
    setRoleFocus(false);
  };

  const setBasics = (patch: Partial<typeof basics>) => {
    onChange({ basics: { ...basics, ...patch } });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Let’s tailor your resume</h2>
      <p className="text-sm text-gray-600">Target role, experience level, and market help us give you better ATS and wording suggestions.</p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Software Engineer, Data Analyst, AI Engineer"
            value={roleValue}
            onChange={(e) => handleRoleChange(e.target.value)}
            onFocus={() => setRoleFocus(true)}
            onBlur={() => setTimeout(() => setRoleFocus(false), 200)}
            className="w-full border border-gray-300 p-2 rounded"
          />
          {roleFocus && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((r) => (
                <li
                  key={r}
                  role="option"
                  onMouseDown={() => handleSelectRole(r)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select
            value={basics.experienceLevel || ''}
            onChange={(e) => setBasics({ experienceLevel: (e.target.value || undefined) as ExperienceLevel })}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">Select</option>
            {EXPERIENCE_LEVELS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Market</label>
          <select
            value={basics.targetMarket || ''}
            onChange={(e) => setBasics({ targetMarket: (e.target.value || undefined) as TargetMarket })}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">Select</option>
            {TARGET_MARKETS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (optional but recommended)</label>
        <textarea
          placeholder="Paste the job description you are applying for (used only for ATS analysis)."
          value={jd}
          onChange={(e) => onChange({ jobDescription: e.target.value })}
          className="w-full border border-gray-300 p-2 rounded min-h-[140px] text-sm"
          rows={6}
        />
        {jd.trim() && (
          <p className={`text-xs mt-1 ${wordCount < JD_MIN_WORDS ? 'text-amber-600' : wordCount < JD_WARN_WORDS ? 'text-amber-600' : 'text-green-600'}`}>
            {wordCount < JD_MIN_WORDS
              ? `Very short (${wordCount} words). Paste full JD for better ATS scoring.`
              : wordCount < JD_WARN_WORDS
                ? `${wordCount} words. Longer JD improves keyword matching.`
                : `JD parsed (${wordCount} words). ATS score is active.`}
          </p>
        )}
        {!jd.trim() && (
          <p className="text-xs text-gray-500 mt-1">No JD → ATS score will only use structure, not keyword match.</p>
        )}
      </div>
    </div>
  );
};
