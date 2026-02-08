import React from 'react';
import { TemplateConfig } from '../../core/types';

interface TemplateCardProps {
    template: TemplateConfig;
    isSelected?: boolean;
    onSelect: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isSelected, onSelect }) => {
    return (
        <div
            className={`border rounded p-4 cursor-pointer hover:shadow-lg transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => onSelect(template.id)}
        >
            <h3 className="font-bold text-lg">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 capitalize">{template.category}</span>
                {template.layout.columns === 1 ? <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">Single Column</span> : <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">Two Column</span>}
            </div>
        </div>
    );
};
