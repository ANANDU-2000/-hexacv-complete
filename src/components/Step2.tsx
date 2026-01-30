import React, { useState } from 'react';
import { ResumeData, TemplateConfig } from '../types';
import Step2Editor from './Step2Editor';
import Step2Templates from './Step2Templates';
import IntelligenceVisibilityPanel from './IntelligenceVisibilityPanel';
import { TemplateRecommendation } from '../ai-service';

interface Step2Props {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    onDataChange: (data: ResumeData) => void;
    onSelectTemplate: (template: TemplateConfig) => void;
    onNext: () => void;
    onBack: () => void;
}

const Step2: React.FC<Step2Props> = ({ data, selectedTemplate, onDataChange, onSelectTemplate, onNext, onBack }) => {
    const [subStep, setSubStep] = useState<'edit' | 'template'>('edit');

    if (subStep === 'edit') {
        return (
            <Step2Editor
                data={data}
                onChange={onDataChange}
                onNext={() => setSubStep('template')}
                onBack={onBack}
            />
        );
    }

    const handleRecommendationSelect = (recommendation: TemplateRecommendation) => {
        // Map recommendation to template config
        const templateId = recommendation.templateId;
        // In a real implementation, we would fetch the actual template config
        // For now, we'll just trigger the selection
        console.log('Selected recommendation:', recommendation);
    };

    return (
        <div>
            <IntelligenceVisibilityPanel 
                resumeData={data} 
                onRecommendationSelect={handleRecommendationSelect}
            />
            <Step2Templates
                data={data}
                selectedTemplate={selectedTemplate}
                onSelect={onSelectTemplate}
                onDataChange={onDataChange}
                onNext={onNext}
                onBack={() => setSubStep('edit')}
            />
        </div>
    );
};

export default Step2;
