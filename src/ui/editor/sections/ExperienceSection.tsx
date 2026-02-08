import React from 'react';
import { ResumeData } from '../../../core/types';

interface ExperienceSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ data, onChange }) => {
  const experiences = data.experience || [];

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
    onChange({
      experience: [
        ...experiences,
        { id: Date.now().toString(), company: '', position: '', startDate: '', endDate: '', highlights: [] }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const next = experiences.filter((_, i) => i !== index);
    onChange({ experience: next });
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Experience</h2>
        <button type="button" onClick={addExperience} className="px-3 py-1 bg-blue-600 text-white rounded">+ Add Experience</button>
      </div>
      {experiences.map((exp, index) => (
        <div key={exp.id || index} className="border border-gray-200 p-4 rounded space-y-3 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Company"
              value={exp.company || ''}
              onChange={(e) => updateExperience(index, 'company', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              placeholder="Role / Position"
              value={exp.position || ''}
              onChange={(e) => updateExperience(index, 'position', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Start (e.g. Jan 2022)"
              value={exp.startDate || ''}
              onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
            <input
              placeholder="End (e.g. Present)"
              value={exp.endDate || ''}
              onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>
          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Bullet points</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => addBullet(index)} className="text-sm px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">+ Add bullet</button>
                <button type="button" className="text-sm px-2 py-1 text-gray-600 hover:bg-gray-100 rounded border border-gray-300">Improve bullets</button>
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
                    className="text-gray-400 hover:text-red-600 p-1"
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
          <div className="flex justify-end">
            <button type="button" onClick={() => removeExperience(index)} className="text-sm text-gray-500 hover:text-red-600">Remove experience</button>
          </div>
        </div>
      ))}
    </div>
  );
};
