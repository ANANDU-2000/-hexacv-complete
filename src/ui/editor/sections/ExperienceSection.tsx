import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeData } from '../../../core/types';

interface ExperienceSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ data, onChange }) => {
  const experiences = data.experience || [];
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const updateExperience = (index: number, field: string, value: unknown) => {
    const newExp = [...experiences];
    const prev = newExp[index] || { id: '', company: '', position: '', startDate: '', endDate: '', highlights: [] };
    newExp[index] = { ...prev, [field]: value };
    onChange({ experience: newExp });
  };

  const updateHighlight = (expIndex: number, bulletIndex: number, value: string) => {
    const exp = experiences[expIndex];
    if (!exp) return;
    const highlights = [...(exp.highlights || [])];
    while (highlights.length <= bulletIndex) highlights.push('');
    highlights[bulletIndex] = value;
    updateExperience(expIndex, 'highlights', highlights);
  };

  const addBullet = (expIndex: number) => {
    const exp = experiences[expIndex];
    if (!exp) return;
    const highlights = [...(exp.highlights || []), ''];
    updateExperience(expIndex, 'highlights', highlights);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const exp = experiences[expIndex];
    if (!exp) return;
    const highlights = (exp.highlights || []).filter((_, i) => i !== bulletIndex);
    updateExperience(expIndex, 'highlights', highlights);
  };

  const addExperience = () => {
    const next = [
      ...experiences,
      { id: Date.now().toString(), company: '', position: '', startDate: '', endDate: '', highlights: [] }
    ];
    onChange({ experience: next });
    setExpandedIndex(next.length - 1);
  };

  const removeExperience = (index: number) => {
    const next = experiences.filter((_, i) => i !== index);
    onChange({ experience: next });
    if (expandedIndex >= next.length && next.length > 0) setExpandedIndex(Math.max(0, next.length - 1));
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Experience</h2>
        <button type="button" onClick={addExperience} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium min-h-[44px]">+ Add Experience</button>
      </div>
      {experiences.map((exp, index) => {
        const isExpanded = expandedIndex === index;
        const title = [exp.position || 'Role', exp.company || 'Company'].filter(Boolean).join(' · ') || `Experience ${index + 1}`;
        return (
          <div key={exp.id || index} className="border border-gray-200 rounded bg-gray-50/50 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleExpanded(index)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px]"
              aria-expanded={isExpanded}
            >
              <span className="truncate">{title}</span>
              <span className="shrink-0 text-gray-500" aria-hidden>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </button>
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-base"
                  />
                  <input
                    placeholder="Role / Position"
                    value={exp.position || ''}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Start (e.g. Jan 2022)"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-base"
                  />
                  <input
                    placeholder="End (e.g. Present)"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    className="border border-gray-300 p-2 rounded w-full text-base"
                  />
                </div>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700">Bullet points</span>
                    <span className="flex gap-2">
                      <button type="button" onClick={() => addBullet(index)} className="text-sm px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded min-h-[44px]">+ Add bullet</button>
                      <button type="button" className="text-sm px-2 py-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-300 min-h-[44px]">Improve bullets</button>
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 ml-1">
                    {(exp.highlights || []).map((bullet, bIdx) => (
                      <li key={bIdx} className="flex gap-2 items-start">
                        <span className="text-gray-400 mt-1.5 text-xs flex-shrink-0">•</span>
                        <input
                          placeholder="e.g. Built RAG pipeline using LangChain; improved latency by 40%"
                          value={bullet}
                          onChange={(e) => updateHighlight(index, bIdx, e.target.value)}
                          className="flex-1 border border-gray-300 p-2 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(index, bIdx)}
                          className="text-gray-400 hover:text-red-600 p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label="Remove bullet"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  {(exp.highlights || []).length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">Add 3–5 bullets with impact and keywords for better ATS.</p>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => removeExperience(index)} className="text-sm text-gray-500 hover:text-red-600 min-h-[44px] px-2">Remove experience</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
