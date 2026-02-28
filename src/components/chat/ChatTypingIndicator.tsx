import { cn } from '@/lib/utils/cn';

interface ChatTypingIndicatorProps {
  className?: string;
}

export function ChatTypingIndicator({ className }: ChatTypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1 px-4 py-3', className)}>
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-navy-300 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-navy-300 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-navy-300 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="ml-2 text-xs text-gray-400">Skyline AI is typing...</span>
    </div>
  );
}
