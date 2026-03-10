'use client';

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChatPanel } from './ChatPanel';
import { cn } from '@/lib/utils/cn';

export interface ChatWidgetHandle {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface ChatWidgetProps {
  className?: string;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const ChatWidget = forwardRef<ChatWidgetHandle, ChatWidgetProps>(
  function ChatWidget({ className }, ref) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(generateSessionId);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    useImperativeHandle(ref, () => ({ open, close, toggle }), [open, close, toggle]);

    return (
      <div className={cn('fixed bottom-6 right-6 z-40', className)}>
        {/* Chat panel */}
        <div className="absolute bottom-16 right-0 mb-2">
          <ChatPanel
            isOpen={isOpen}
            onClose={close}
            sessionId={sessionId}
          />
        </div>

        {/* Floating button */}
        <button
          onClick={toggle}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105',
            isOpen
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gold-400 hover:bg-gold-500 chat-pulse'
          )}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);
