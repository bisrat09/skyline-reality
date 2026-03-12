'use client';

import { cn } from '@/lib/utils/cn';
import { ONBOARDING_STEPS, STEP_LABELS } from '@/types/agent';
import type { OnboardingStep } from '@/types/agent';

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIdx = ONBOARDING_STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
      {ONBOARDING_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isCompleted && 'bg-compass-500 text-white',
                  isCurrent && 'bg-compass-500 text-white ring-2 ring-compass-200',
                  !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs hidden sm:block',
                  isCurrent ? 'text-compass-600 font-medium' : 'text-gray-400'
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {idx < ONBOARDING_STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-12 mx-1',
                  idx < currentIdx ? 'bg-compass-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
