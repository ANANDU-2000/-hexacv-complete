import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeData } from '../../../core/types';

interface EducationSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ data, onChange }) => {
  const education = data.education || [];
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const updateEducation = (index: number, field: string, value: unknown) => {
    const newEdu = [...education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    onChange({ education: newEdu });
  };

  const addEducation = () => {
    const next = [...education, { id: Date.now().toString(), institution: '', degree: '', graduationDate: '' }];
    onChange({ education: next });
    setExpandedIndex(next.length - 1);
  };

  const removeEducation = (index: number) => {
    const next = education.filter((_, i) => i !== index);
    onChange({ education: next });
    if (expandedIndex >= next.length && next.length > 0) setExpandedIndex(next.length - 1);
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Education</h2>
        <button type="button" onClick={addEducation} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium min-h-[44px]">+ Add Education</button>
      </div>
      {education.map((edu, index) => {
        const isExpanded = expandedIndex === index;
        const title = [edu.degree, edu.institution].filter(Boolean).join(' · ') || `Education ${index + 1}`;
        return (
          <div key={edu.id || index} className="border border-gray-200 rounded bg-gray-50/50 overflow-hidden">
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
              <div className="border-t border-gray-200 p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-base"
                  />
                  <input
                    placeholder="Degree"
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-base"
                  />
                </div>
                <input
                  placeholder="Year / Graduation"
                  value={edu.graduationDate || ''}
                  onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-base"
                />
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => removeEducation(index)} className="text-sm text-gray-500 hover:text-red-600 min-h-[44px] px-2">Remove education</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
