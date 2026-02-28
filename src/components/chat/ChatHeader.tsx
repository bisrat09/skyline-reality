import { cn } from '@/lib/utils/cn';

interface ChatHeaderProps {
  onClose: () => void;
  className?: string;
}

export function ChatHeader({ onClose, className }: ChatHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 bg-navy-800 text-white rounded-t-2xl',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-navy-800 text-sm font-bold">
          S
        </div>
        <div>
          <p className="text-sm font-semibold">Skyline AI</p>
          <p className="text-xs text-gray-300">Online &middot; Replies instantly</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-gray-300 hover:text-white transition-colors"
        aria-label="Close chat"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
