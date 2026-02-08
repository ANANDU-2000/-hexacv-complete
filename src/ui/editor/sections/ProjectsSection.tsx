import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResumeData } from '../../../core/types';

interface ProjectsSectionProps {
  data: ResumeData;
  onChange: (data: Partial<ResumeData>) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ data, onChange }) => {
  const projects = data.projects || [];
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const updateProject = (index: number, field: string, value: unknown) => {
    const newProj = [...projects];
    newProj[index] = { ...newProj[index], [field]: value };
    onChange({ projects: newProj });
  };

  const addProject = () => {
    const next = [...projects, { id: Date.now().toString(), name: '', description: '', highlights: [] }];
    onChange({ projects: next });
    setExpandedIndex(next.length - 1);
  };

  const removeProject = (index: number) => {
    const next = projects.filter((_, i) => i !== index);
    onChange({ projects: next });
    if (expandedIndex >= next.length && next.length > 0) setExpandedIndex(next.length - 1);
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Projects</h2>
        <button type="button" onClick={addProject} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium min-h-[44px]">+ Add Project</button>
      </div>
      {projects.map((proj, index) => {
        const isExpanded = expandedIndex === index;
        const title = proj.name?.trim() || `Project ${index + 1}`;
        return (
          <div key={proj.id || index} className="border border-gray-200 rounded bg-gray-50/50 overflow-hidden">
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
                <input
                  placeholder="Project Name"
                  value={proj.name || ''}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-base"
                />
                <textarea
                  placeholder="Description"
                  value={proj.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded min-h-[80px] text-base"
                />
                <div className="flex justify-end pt-2">
                  <button type="button" onClick={() => removeProject(index)} className="text-sm text-gray-500 hover:text-red-600 min-h-[44px] px-2">Remove project</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
