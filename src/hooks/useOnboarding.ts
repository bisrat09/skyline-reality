'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AgentConfig, AgentListing, OnboardingStep } from '@/types/agent';
import { ONBOARDING_STEPS } from '@/types/agent';
import { isValidPhone } from '@/lib/utils/validators';

export type FormData = Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>;

const INITIAL_FORM_DATA: FormData = {
  name: '',
  brokerage: '',
  phone: '',
  chatGreeting: '',
  listings: [],
  calLink: '',
};

const SESSION_KEY = 'onboarding_agent_id';

function generateListingId(): string {
  return `listing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedId = sessionStorage.getItem(SESSION_KEY);
    if (savedId) {
      fetch(`/api/onboarding?id=${encodeURIComponent(savedId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.agent) {
            const agent = data.agent as AgentConfig;
            setAgentId(savedId);
            setFormData({
              name: agent.name,
              brokerage: agent.brokerage,
              phone: agent.phone,
              chatGreeting: agent.chatGreeting,
              listings: agent.listings,
              calLink: agent.calLink,
            });
            // Determine which step to resume at
            if (!agent.chatGreeting) setCurrentStep('greeting');
            else if (agent.listings.length === 0) setCurrentStep('listings');
            else if (!agent.calLink) setCurrentStep('calendar');
            else setCurrentStep('preview');
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const addListing = useCallback(() => {
    const newListing: AgentListing = {
      id: generateListingId(),
      name: '',
      address: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
    };
    setFormData((prev) => ({
      ...prev,
      listings: [...prev.listings, newListing],
    }));
  }, []);

  const updateListing = useCallback(
    (id: string, field: keyof AgentListing, value: string | number) => {
      setFormData((prev) => ({
        ...prev,
        listings: prev.listings.map((l) =>
          l.id === id ? { ...l, [field]: value } : l
        ),
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`listing_${id}_${field}`];
        delete next['listings'];
        return next;
      });
    },
    []
  );

  const removeListing = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      listings: prev.listings.filter((l) => l.id !== id),
    }));
  }, []);

  const validateStep = useCallback(
    (step: OnboardingStep): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 'profile':
          if (!formData.name.trim() || formData.name.trim().length < 2)
            newErrors.name = 'Name is required (min 2 characters)';
          if (!formData.brokerage.trim() || formData.brokerage.trim().length < 2)
            newErrors.brokerage = 'Brokerage is required';
          if (!isValidPhone(formData.phone))
            newErrors.phone = 'Valid phone number is required (10 digits)';
          break;

        case 'greeting':
          if (!formData.chatGreeting.trim() || formData.chatGreeting.trim().length < 10)
            newErrors.chatGreeting = 'Greeting is required (min 10 characters)';
          if (formData.chatGreeting.length > 500)
            newErrors.chatGreeting = 'Greeting must be under 500 characters';
          break;

        case 'listings':
          if (formData.listings.length === 0)
            newErrors.listings = 'Add at least one listing';
          for (const listing of formData.listings) {
            if (!listing.name.trim())
              newErrors[`listing_${listing.id}_name`] = 'Name is required';
            if (!listing.address.trim())
              newErrors[`listing_${listing.id}_address`] = 'Address is required';
            if (!listing.price || listing.price <= 0)
              newErrors[`listing_${listing.id}_price`] = 'Price must be greater than 0';
          }
          break;

        case 'calendar':
          if (!formData.calLink.trim())
            newErrors.calLink = 'Calendar link is required';
          else if (
            !formData.calLink.includes('cal.com') &&
            !formData.calLink.includes('calendly.com')
          )
            newErrors.calLink = 'Link must be a Cal.com or Calendly URL';
          break;

        case 'preview':
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const goNext = useCallback(async () => {
    if (!validateStep(currentStep)) return;

    setIsSaving(true);
    try {
      if (currentStep === 'profile' && !agentId) {
        // Create agent
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            brokerage: formData.brokerage.trim(),
            phone: formData.phone.trim(),
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setErrors({ _api: data.error || 'Failed to save' });
          return;
        }
        setAgentId(data.agentId);
        sessionStorage.setItem(SESSION_KEY, data.agentId);
      } else if (agentId && currentStep !== 'preview') {
        // Update agent
        const updates: Record<string, unknown> = {};
        switch (currentStep) {
          case 'profile':
            updates.name = formData.name.trim();
            updates.brokerage = formData.brokerage.trim();
            updates.phone = formData.phone.trim();
            break;
          case 'greeting':
            updates.chatGreeting = formData.chatGreeting.trim();
            break;
          case 'listings':
            updates.listings = formData.listings;
            break;
          case 'calendar':
            updates.calLink = formData.calLink.trim();
            break;
        }

        const res = await fetch(`/api/onboarding/${agentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!data.success) {
          setErrors({ _api: data.error || 'Failed to save' });
          return;
        }
      }

      // Advance to next step
      const idx = ONBOARDING_STEPS.indexOf(currentStep);
      if (idx < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(ONBOARDING_STEPS[idx + 1]);
      }
    } catch {
      setErrors({ _api: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, formData, agentId, validateStep]);

  const goBack = useCallback(() => {
    const idx = ONBOARDING_STEPS.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(ONBOARDING_STEPS[idx - 1]);
      setErrors({});
    }
  }, [currentStep]);

  const stepIndex = ONBOARDING_STEPS.indexOf(currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  return {
    currentStep,
    formData,
    agentId,
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
  };
}
