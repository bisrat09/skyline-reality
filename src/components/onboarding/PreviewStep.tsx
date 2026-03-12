'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import type { FormData } from '@/hooks/useOnboarding';

interface PreviewStepProps {
  formData: FormData;
}

export function PreviewStep({ formData }: PreviewStepProps) {
  const firstListing = formData.listings[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Preview your chatbot</h2>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s how your AI assistant will look and respond.
        </p>
      </div>

      {/* Config summary */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Your Setup</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Agent</dt>
            <dd className="text-gray-900 font-medium">{formData.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Brokerage</dt>
            <dd className="text-gray-900">{formData.brokerage}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Listings</dt>
            <dd className="text-gray-900">{formData.listings.length} properties</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Booking</dt>
            <dd className="text-compass-600 text-xs truncate max-w-[200px]">{formData.calLink}</dd>
          </div>
        </dl>
      </Card>

      {/* Chat preview */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 text-white px-4 py-3 flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-compass-500 text-white text-sm font-bold">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{formData.name}&apos;s AI Assistant</p>
            <p className="text-xs text-gray-300">{formData.brokerage}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-3 bg-white min-h-[280px]">
          {/* AI greeting */}
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 px-4 py-2.5 text-sm">
              {formData.chatGreeting}
            </div>
          </div>

          {/* Simulated user message */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy-800 text-white px-4 py-2.5 text-sm">
              I&apos;m looking for a 3-bedroom home. What do you have?
            </div>
          </div>

          {/* AI response with listing */}
          <div className="flex justify-start">
            <div className="max-w-[85%] space-y-2">
              <div className="rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 px-4 py-2.5 text-sm">
                Great choice! I have some wonderful options for you. Here&apos;s one you might love:
              </div>

              {firstListing && (
                <div className="rounded-lg border border-gray-200 p-3 bg-white">
                  <p className="text-sm font-medium text-gray-900">{firstListing.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{firstListing.address}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-semibold text-compass-600">
                      {formatCurrency(firstListing.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {firstListing.bedrooms} bd · {firstListing.bathrooms} ba
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 px-4 py-2.5 text-sm">
                Would you like to schedule a showing? I can book a time that works for you.
              </div>
            </div>
          </div>
        </div>

        {/* Input (decorative) */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2">
            <span className="text-sm text-gray-400 flex-1">Type a message...</span>
            <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
        </div>
      </Card>

      <div className="rounded-lg bg-green-50 p-3 text-center">
        <p className="text-sm text-green-700 font-medium">
          Your AI chatbot is ready to go!
        </p>
        <p className="text-xs text-green-600 mt-1">
          Click &quot;Finish&quot; to complete setup.
        </p>
      </div>
    </div>
  );
}
