import React from 'react';

export type StepId = 'content' | 'ats' | 'template' | 'download';

export interface StepItem {
  id: StepId;
  label: string;
  done: boolean;
}

interface StepIndicatorProps {
  steps: StepItem[];
  currentStep: StepId;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4" role="status" aria-label="Progress">
      {steps.map((step, i) => {
        const isCurrent = step.id === currentStep;
        const isDone = step.done;
        return (
          <React.Fragment key={step.id}>
            <span
              className={`font-medium ${isCurrent ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {isDone ? '✔' : '○'} {step.label}
            </span>
            {i < steps.length - 1 && <span className="text-gray-300" aria-hidden>→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};
