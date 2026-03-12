'use client';

import { Input } from '@/components/ui/Input';
import type { FormData } from '@/hooks/useOnboarding';

interface CalendarStepProps {
  formData: FormData;
  errors: Record<string, string>;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export function CalendarStep({ formData, errors, updateField }: CalendarStepProps) {
  const hasValidLink =
    formData.calLink.includes('cal.com') || formData.calLink.includes('calendly.com');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Set your booking link</h2>
        <p className="text-sm text-gray-500 mt-1">
          When a visitor wants to schedule a showing, the chatbot will use this link.
        </p>
      </div>

      <Input
        label="Cal.com or Calendly Link"
        placeholder="e.g. https://cal.com/your-name/showing"
        value={formData.calLink}
        onChange={(e) => updateField('calLink', e.target.value)}
        error={errors.calLink}
      />

      {hasValidLink && (
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-600 mb-2 font-medium">Preview</p>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-compass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">
                Visitors will be able to book at:{' '}
                <span className="text-compass-600 font-medium">{formData.calLink}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-3">
        <p className="text-xs text-blue-700">
          <strong>Don&apos;t have a booking page?</strong> Create a free one at{' '}
          <a
            href="https://cal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            cal.com
          </a>{' '}
          or{' '}
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            calendly.com
          </a>
        </p>
      </div>
    </div>
  );
}
