import React from 'react';
import { TemplateConfig } from '../../core/types';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
    templates: TemplateConfig[];
    selectedTemplateId?: string;
    onSelect: (id: string) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, selectedTemplateId, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
                <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplateId === template.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};
