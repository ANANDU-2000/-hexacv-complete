import React from 'react';
import { TemplateConfig } from '../../core/types';

interface TemplateListProps {
  templates: TemplateConfig[];
  selectedTemplateId: string;
  onSelect: (id: string) => void;
  freeTemplateId: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
  freeTemplateId,
}) => {
  return (
    <nav className="flex flex-col gap-1" aria-label="Templates">
      {templates.map((t) => {
        const isFree = t.id === freeTemplateId;
        const isSelected = selectedTemplateId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`text-left px-4 py-3 rounded-lg flex items-center justify-between gap-2 border transition-colors ${
              isSelected
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
            }`}
            aria-current={isSelected ? 'true' : undefined}
          >
            <span className="font-medium truncate">{t.name}</span>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded ${
                isFree ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isFree ? 'FREE' : '₹49 one-time'}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
