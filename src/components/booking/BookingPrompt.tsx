'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CalEmbed } from './CalEmbed';
import { cn } from '@/lib/utils/cn';

interface BookingPromptProps {
  propertyAddress?: string;
  className?: string;
}

export function BookingPrompt({ propertyAddress, className }: BookingPromptProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div
      className={cn(
        'rounded-xl border border-gold-200 bg-gold-50 p-4',
        className
      )}
    >
      {!showCalendar ? (
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            <svg className="h-8 w-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-navy-800">
            {propertyAddress
              ? `Schedule a showing for ${propertyAddress}`
              : 'Schedule a Property Showing'}
          </p>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Pick a time that works for you
          </p>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setShowCalendar(true)}
          >
            Open Calendar
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-navy-800">Select a Time</p>
            <button
              onClick={() => setShowCalendar(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
              aria-label="Close calendar"
            >
              Close
            </button>
          </div>
          <div className="h-[350px] overflow-hidden rounded-lg">
            <CalEmbed />
          </div>
        </div>
      )}
    </div>
  );
}
