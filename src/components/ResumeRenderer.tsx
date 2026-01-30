
import React from 'react';
import { TemplateRenderer } from '../template-renderer';
import { ResumeData, TemplateConfig } from '../types';

interface ResumeRendererProps {
    data: ResumeData;
    config: TemplateConfig;
    scale?: number;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data, config, scale = 1 }) => {
    return (
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <TemplateRenderer
                templateId={config.id}
                resumeData={data}
            />
        </div>
    );
};

export default ResumeRenderer;
