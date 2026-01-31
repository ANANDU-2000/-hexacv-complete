import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
    id: string;
    label: string;
    shortLabel?: string;
}

interface StepperProps {
    steps: StepItem[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    variant?: 'horizontal' | 'vertical';
    allowNavigation?: boolean;
}

export function Stepper({ 
    steps, 
    currentStep, 
    onStepClick, 
    variant = 'horizontal',
    allowNavigation = true 
}: StepperProps) {
    const handleStepClick = (index: number) => {
        if (allowNavigation && onStepClick && index <= currentStep) {
            onStepClick(index);
        }
    };

    if (variant === 'vertical') {
        return (
            <div className="flex flex-col gap-0">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isFuture = index > currentStep;
                    
                    return (
                        <div key={step.id} className="flex items-start gap-4">
                            {/* Step indicator with line */}
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => handleStepClick(index)}
                                    disabled={!allowNavigation || isFuture}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                                        transition-all duration-bw ease-bw-smooth
                                        ${isCompleted 
                                            ? 'bg-bw-black text-white cursor-pointer' 
                                            : isActive 
                                                ? 'bg-bw-black text-white ring-4 ring-bw-gray-200' 
                                                : 'bg-bw-gray-100 text-bw-gray-400 cursor-not-allowed'
                                        }
                                        ${allowNavigation && !isFuture ? 'hover:ring-4 hover:ring-bw-gray-200' : ''}
                                    `}
                                >
                                    {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                                </button>
                                
                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <div className={`w-0.5 h-12 transition-colors duration-bw ${
                                        isCompleted ? 'bg-bw-black' : 'bg-bw-gray-200'
                                    }`} />
                                )}
                            </div>
                            
                            {/* Step label */}
                            <div className="pt-2">
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    isActive ? 'text-bw-gray-400' : 'text-bw-gray-300'
                                }`}>
                                    Step {index + 1}
                                </span>
                                <p className={`text-sm font-bold mt-0.5 ${
                                    isCompleted || isActive ? 'text-bw-black' : 'text-bw-gray-400'
                                }`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal variant (default)
    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Progress line background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-bw-gray-200 mx-8" />
                
                {/* Progress line active */}
                <div 
                    className="absolute top-5 left-0 h-0.5 bg-bw-black mx-8 transition-all duration-500 ease-bw-smooth"
                    style={{ 
                        width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 64px)`,
                        maxWidth: 'calc(100% - 64px)'
                    }}
                />
                
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isFuture = index > currentStep;
                    
                    return (
                        <div 
                            key={step.id} 
                            className="flex flex-col items-center relative z-10"
                        >
                            {/* Step circle */}
                            <button
                                onClick={() => handleStepClick(index)}
                                disabled={!allowNavigation || isFuture}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                    transition-all duration-bw ease-bw-smooth bg-white
                                    ${isCompleted 
                                        ? 'bg-bw-black text-white cursor-pointer' 
                                        : isActive 
                                            ? 'bg-bw-black text-white ring-4 ring-bw-gray-100' 
                                            : 'border-2 border-bw-gray-200 text-bw-gray-400 cursor-not-allowed'
                                    }
                                    ${allowNavigation && !isFuture ? 'hover:scale-110' : ''}
                                `}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                            </button>
                            
                            {/* Step label */}
                            <span className={`
                                mt-3 text-xs font-medium text-center max-w-[100px] leading-tight
                                transition-colors duration-bw
                                ${isCompleted || isActive ? 'text-bw-black' : 'text-bw-gray-400'}
                            `}>
                                {step.shortLabel || step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Compact stepper for mobile
export function CompactStepper({ 
    steps, 
    currentStep 
}: { 
    steps: StepItem[]; 
    currentStep: number;
}) {
    return (
        <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
                <div
                    key={index}
                    className={`
                        h-1.5 rounded-full transition-all duration-bw ease-bw-smooth
                        ${index === currentStep 
                            ? 'w-8 bg-bw-black' 
                            : index < currentStep 
                                ? 'w-1.5 bg-bw-black' 
                                : 'w-1.5 bg-bw-gray-200'
                        }
                    `}
                />
            ))}
            <span className="ml-3 text-xs font-medium text-bw-gray-500">
                {currentStep + 1} / {steps.length}
            </span>
        </div>
    );
}

export default Stepper;
