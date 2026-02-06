import React, { useState, useRef, useEffect } from 'react';
import { ResumeData, TemplateConfig } from '../../types';
import MobileSectionDashboard from './MobileSectionDashboard';
import MobileSectionEditor from './MobileSectionEditor';
import MobileTemplateExport from './MobileTemplateExport';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type SliderStep = 'edit-details' | 'choose-templates';

interface MobileSliderContainerProps {
    data: ResumeData;
    selectedTemplate: TemplateConfig;
    templates?: TemplateConfig[];
    onDataChange: (data: ResumeData) => void;
    onTemplateSelect: (template: TemplateConfig) => void;
    onBack: () => void;
    onComplete: () => void; // Navigate to Step 4 (Preview)
    validationErrors?: string[];
    initialStep?: SliderStep;
}

const MobileSliderContainer: React.FC<MobileSliderContainerProps> = ({
    data,
    selectedTemplate,
    templates = [],
    onDataChange,
    onTemplateSelect,
    onBack,
    onComplete,
    validationErrors = [],
    initialStep = 'edit-details'
}) => {
    const steps: SliderStep[] = ['edit-details', 'choose-templates'];
    const [currentStep, setCurrentStep] = useState<SliderStep>(initialStep);
    const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
    const [currentTranslate, setCurrentTranslate] = useState(() => {
        const index = steps.indexOf(initialStep);
        return -index * 100;
    });

    const currentStepIndex = steps.indexOf(currentStep);

    const goToStep = (step: SliderStep) => {
        setCurrentStep(step);
        const stepIndex = steps.indexOf(step);
        const translateY = -stepIndex * 100;
        setCurrentTranslate(translateY);
    };

    // Navigate to section editor
    const navigateToSection = (sectionId: string) => {
        setCurrentSectionId(sectionId);
    };

    const navigateToDashboard = () => {
        setCurrentSectionId(null);
    };

    // Handle step navigation
    const handleEditDetailsComplete = () => {
        goToStep('choose-templates');
    };

    const handleTemplatesComplete = () => {
        onComplete(); // Go to Step 4 (Preview)
    };

    // Update translate on step change
    useEffect(() => {
        const stepIndex = steps.indexOf(currentStep);
        const translateY = -stepIndex * 100;
        setCurrentTranslate(translateY);
    }, [currentStep]);

    // Render step content
    const renderStepContent = (step: SliderStep) => {
        switch (step) {
            case 'edit-details':
                return (
                    <div className="h-full flex flex-col overflow-hidden">
                        <MobileSectionDashboard
                            data={data}
                            onNavigateToSection={navigateToSection}
                            onReorderSection={() => { }}
                            onContinue={handleEditDetailsComplete}
                            hideHeader={true}
                        />
                    </div>
                );
            case 'choose-templates':
                return (
                    <div className="h-full flex flex-col overflow-hidden">
                        <MobileTemplateExport
                            data={data}
                            selectedTemplate={selectedTemplate}
                            templates={templates}
                            onSelect={onTemplateSelect}
                            onBack={() => goToStep('edit-details')}
                            onNext={handleTemplatesComplete}
                            hideHeader={true}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-white relative">
            {/* Section Editor Overlay */}
            {currentSectionId && (
                <div className="fixed inset-0 z-[300] bg-white">
                    <MobileSectionEditor
                        sectionId={currentSectionId}
                        data={data}
                        onChange={(newData: Partial<ResumeData>) => onDataChange({ ...data, ...newData })}
                        onBack={navigateToDashboard}
                    />
                </div>
            )}

            {/* Step Indicator Navigation - Professional Compact Design */}
            <div className={`fixed top-0 left-0 right-0 z-[200] bg-white border-b border-slate-200 ${currentSectionId || currentStep === 'choose-templates' ? 'hidden' : ''} safe-area-top`}>
                <div className="px-4 py-3 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>

                        {/* Step Indicators - Compact */}
                        <div className="flex items-center gap-1.5 flex-1 justify-center px-4">
                            {steps.map((step, index) => (
                                <div key={step} className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => goToStep(step)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep === step
                                            ? 'bg-slate-900 text-white shadow-md scale-110'
                                            : 'bg-slate-200 text-slate-500'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={`h-0.5 w-6 transition-all ${currentStepIndex > index ? 'bg-slate-900' : 'bg-slate-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="w-10" /> {/* Spacer for balance */}
                    </div>

                    {/* Step Label - Single Active Label */}
                    <div className="text-center">
                        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${currentStep === 'edit-details'
                            ? 'text-slate-900'
                            : currentStep === 'choose-templates'
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}>
                            {currentStep === 'edit-details' ? 'Edit Details' : 'Choose Template'}
                        </span>
                    </div>
                </div>
            </div>

            {!currentSectionId && (
                <div
                    className="h-full relative overflow-hidden"
                    style={{
                        marginTop: currentStep === 'choose-templates' ? '0' : '135px',
                        height: currentStep === 'choose-templates' ? '100dvh' : 'calc(100vh - 135px - 85px)',
                    }}
                >
                    <div
                        className="h-full relative"
                        style={{
                            transform: `translateY(${currentTranslate}%)`,
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        {steps.map((step) => (
                            <div
                                key={step}
                                className="absolute top-0 left-0 w-full h-full"
                                style={{
                                    transform: `translateY(${steps.indexOf(step) * 100}%)`,
                                }}
                            >
                                {renderStepContent(step)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous/Next Navigation Buttons - Professional Fixed Bottom */}
            {!currentSectionId && currentStep !== 'choose-templates' && (
                <div className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-3">
                            {/* Previous Button */}
                            <button
                                onClick={() => goToStep(steps[currentStepIndex - 1])}
                                disabled={currentStepIndex === 0}
                                className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${currentStepIndex === 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                                    }`}
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                                <span>Previous</span>
                            </button>

                            {/* Next Button - Dynamic Text */}
                            <button
                                onClick={() => {
                                    if (currentStepIndex < steps.length - 1) {
                                        goToStep(steps[currentStepIndex + 1]);
                                    } else {
                                        onComplete();
                                    }
                                }}
                                className="flex-1 h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                            >
                                <span>
                                    {currentStepIndex === 0
                                        ? 'Choose Templates'
                                        : currentStepIndex === steps.length - 1
                                            ? 'Preview'
                                            : 'Next'
                                    }
                                </span>
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .safe-area-bottom {
                    padding-bottom: max(1rem, env(safe-area-inset-bottom));
                }
                .safe-area-top {
                    padding-top: env(safe-area-inset-top);
                }
            `}</style>
        </div>
    );
};

export default MobileSliderContainer;
