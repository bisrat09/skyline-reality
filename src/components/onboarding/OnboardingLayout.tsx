'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { StepIndicator } from './StepIndicator';
import { ProfileStep } from './ProfileStep';
import { GreetingStep } from './GreetingStep';
import { ListingsStep } from './ListingsStep';
import { CalendarStep } from './CalendarStep';
import { PreviewStep } from './PreviewStep';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_STEPS } from '@/types/agent';

export function OnboardingLayout() {
  const {
    currentStep,
    formData,
    errors,
    isSaving,
    isLoading,
    stepIndex,
    isFirstStep,
    isLastStep,
    updateField,
    addListing,
    updateListing,
    removeListing,
    goNext,
    goBack,
  } = useOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <a href="/">
            <Logo />
          </a>
          <p className="text-sm text-gray-500 mt-2">Set up your AI chatbot in 5 minutes</p>
        </div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step content */}
        <Card className="p-6 mb-6">
          {currentStep === 'profile' && (
            <ProfileStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 'greeting' && (
            <GreetingStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 'listings' && (
            <ListingsStep
              formData={formData}
              errors={errors}
              addListing={addListing}
              updateListing={updateListing}
              removeListing={removeListing}
            />
          )}
          {currentStep === 'calendar' && (
            <CalendarStep formData={formData} errors={errors} updateField={updateField} />
          )}
          {currentStep === 'preview' && <PreviewStep formData={formData} />}

          {/* API error */}
          {errors._api && (
            <p className="mt-4 text-sm text-red-500 text-center">{errors._api}</p>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {!isFirstStep && (
              <Button variant="secondary" onClick={goBack} disabled={isSaving}>
                Back
              </Button>
            )}
          </div>

          <span className="text-xs text-gray-400">
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
          </span>

          <Button variant="compass" onClick={goNext} isLoading={isSaving}>
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
