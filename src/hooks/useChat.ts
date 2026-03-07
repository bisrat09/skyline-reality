'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';

interface UseChatOptions {
  sessionId: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat({ sessionId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      // Build API messages from history + new message, filtering out empty ones
      const apiMessages = [
        ...messages
          .filter((m) => m.content.trim() !== '')
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ];

      try {
        abortRef.current = new AbortController();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, sessionId }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const dataLine = line.trim();
            if (!dataLine.startsWith('data: ')) continue;

            try {
              const event = JSON.parse(dataLine.slice(6));

              if (event.type === 'text_delta' && event.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + event.text,
                    };
                  }
                  return updated;
                });
              } else if (event.type === 'message_stop') {
                // Parse metadata from completed message
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    const suggestedListings = extractMarkers(last.content, 'SUGGEST_PROPERTY');
                    const bookingTriggered = extractMarkers(last.content, 'BOOK_SHOWING').length > 0;
                    updated[updated.length - 1] = {
                      ...last,
                      metadata: {
                        suggestedListings: suggestedListings.length > 0 ? suggestedListings : undefined,
                        bookingTriggered: bookingTriggered || undefined,
                      },
                    };
                  }
                  return updated;
                });
              } else if (event.type === 'error') {
                setError(event.error || 'Stream error');
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to send message');
        // Remove empty assistant message on error
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, sessionId]
  );

  const clearMessages = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearMessages };
}

/**
 * Extract marker IDs from message content.
 * Matches patterns like [SUGGEST_PROPERTY:abc123] or [BOOK_SHOWING:abc123]
 */
export function extractMarkers(content: string, markerType: string): string[] {
  const regex = new RegExp(`\\[${markerType}:([^\\]]+)\\]`, 'g');
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

/**
 * Strip marker tags from message content for display.
 */
export function stripMarkers(content: string): string {
  return content
    .replace(/\[SUGGEST_PROPERTY:[^\]]+\]/g, '')
    .replace(/\[BOOK_SHOWING:[^\]]+\]/g, '')
    .trim();
}
