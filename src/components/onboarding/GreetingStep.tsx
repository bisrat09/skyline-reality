'use client';

import type { FormData } from '@/hooks/useOnboarding';

interface GreetingStepProps {
  formData: FormData;
  errors: Record<string, string>;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

const DEFAULT_GREETING =
  "Hi there! I'm your AI assistant for {brokerage}. I can help you find properties, answer questions about neighborhoods, or schedule a showing. How can I help you today?";

export function GreetingStep({ formData, errors, updateField }: GreetingStepProps) {
  const charCount = formData.chatGreeting.length;
  const suggestion = DEFAULT_GREETING.replace('{brokerage}', formData.brokerage || 'our agency');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Customize your chatbot greeting</h2>
        <p className="text-sm text-gray-500 mt-1">
          This is the first message visitors see when they open the chat.
        </p>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Greeting Message
        </label>
        <textarea
          className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 min-h-[120px] resize-y ${
            errors.chatGreeting
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-navy-500 focus:ring-navy-500'
          }`}
          placeholder="Enter your chatbot's greeting message..."
          value={formData.chatGreeting}
          onChange={(e) => updateField('chatGreeting', e.target.value)}
        />
        <div className="flex justify-between mt-1">
          {errors.chatGreeting ? (
            <p className="text-sm text-red-500">{errors.chatGreeting}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs ${charCount > 500 ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/500
          </span>
        </div>
      </div>

      {!formData.chatGreeting && (
        <button
          type="button"
          onClick={() => updateField('chatGreeting', suggestion)}
          className="text-sm text-compass-600 hover:text-compass-700 underline"
        >
          Use suggested greeting
        </button>
      )}
    </div>
  );
}
