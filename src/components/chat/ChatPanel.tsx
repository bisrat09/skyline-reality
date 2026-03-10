'use client';

import { useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { useChat } from '@/hooks/useChat';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { cn } from '@/lib/utils/cn';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  className?: string;
}

export function ChatPanel({ isOpen, onClose, sessionId, className }: ChatPanelProps) {
  const { messages, isStreaming, error, sendMessage } = useChat({ sessionId });
  const { processAndSubmit } = useLeadCapture({ sessionId });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming]);

  // Process lead capture after each assistant response completes
  useEffect(() => {
    if (!isStreaming && messages.length >= 2) {
      processAndSubmit(messages);
    }
  }, [isStreaming, messages, processAndSubmit]);

  return (
    <div
      className={cn(
        'flex flex-col w-[380px] h-[560px] max-sm:chat-panel-mobile bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 origin-bottom-right',
        isOpen
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none',
        className
      )}
    >
      <ChatHeader onClose={onClose} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-50 text-gold-500 mb-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-navy-800">Hi! I&apos;m Skyline AI</p>
            <p className="text-xs text-gray-500 mt-1">
              Ask me about properties, neighborhoods, or schedule a showing.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <ChatTypingIndicator />
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
