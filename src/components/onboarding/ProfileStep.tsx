'use client';

import { Input } from '@/components/ui/Input';
import type { FormData } from '@/hooks/useOnboarding';

interface ProfileStepProps {
  formData: FormData;
  errors: Record<string, string>;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export function ProfileStep({ formData, errors, updateField }: ProfileStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tell us about yourself</h2>
        <p className="text-sm text-gray-500 mt-1">
          This information will personalize your AI chatbot.
        </p>
      </div>

      <Input
        label="Full Name"
        placeholder="e.g. Sarah Chen"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        error={errors.name}
      />

      <Input
        label="Brokerage"
        placeholder="e.g. Compass Real Estate"
        value={formData.brokerage}
        onChange={(e) => updateField('brokerage', e.target.value)}
        error={errors.brokerage}
      />

      <Input
        label="Phone Number"
        placeholder="e.g. (206) 555-1234"
        type="tel"
        value={formData.phone}
        onChange={(e) => updateField('phone', e.target.value)}
        error={errors.phone}
      />
    </div>
  );
}
