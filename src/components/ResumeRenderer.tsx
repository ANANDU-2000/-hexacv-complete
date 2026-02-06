
import React from 'react';
import { TemplateRenderer } from '../template-renderer';
import { ResumeData, TemplateConfig } from '../types';

interface ResumeRendererProps {
    data: ResumeData;
    config: TemplateConfig;
    scale?: number;
    currentPage?: number;
    onPageCountChange?: (count: number) => void;
}

const ResumeRenderer: React.FC<ResumeRendererProps> = ({
    data,
    config,
    scale = 1,
    currentPage = 1,
    onPageCountChange
}) => {
    return (
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <TemplateRenderer
                templateId={config.id}
                resumeData={data}
                currentPage={currentPage}
                onPageCountChange={onPageCountChange}
            />
        </div>
    );
};

export default ResumeRenderer;
