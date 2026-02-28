'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ChatInput({ onSend, disabled = false, className }: ChatInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={cn('flex items-end gap-2 border-t border-gray-200 p-3 bg-white rounded-b-2xl', className)}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask about properties in Seattle..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy-400 focus:border-navy-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Chat message"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white transition-colors hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </div>
  );
}
