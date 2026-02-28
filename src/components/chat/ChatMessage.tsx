import { cn } from '@/lib/utils/cn';
import { stripMarkers, extractMarkers } from '@/hooks/useChat';
import { PropertyCard } from '@/components/listings/PropertyCard';
import { BookingPrompt } from '@/components/booking/BookingPrompt';
import { seedListings } from '@/data/seedListings';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

// Build a lookup from seed listings for property card rendering
const listingsById = new Map(
  seedListings.map((l, i) => [`featured-${i + 1}`, { ...l, id: `featured-${i + 1}` }])
);

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const displayContent = isUser ? message.content : stripMarkers(message.content);
  const suggestedIds = isUser ? [] : extractMarkers(message.content, 'SUGGEST_PROPERTY');
  const bookingIds = isUser ? [] : extractMarkers(message.content, 'BOOK_SHOWING');

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] space-y-2')}>
        {/* Message bubble */}
        {displayContent && (
          <div
            className={cn(
              'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              isUser
                ? 'bg-navy-800 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            )}
          >
            {displayContent.split('\n').map((line, i) => (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Suggested property cards */}
        {suggestedIds.map((id) => {
          const listing = listingsById.get(id);
          if (!listing) return null;
          return (
            <div key={id} className="max-w-[280px]">
              <PropertyCard listing={listing} className="text-xs" />
            </div>
          );
        })}

        {/* Booking prompts */}
        {bookingIds.map((id) => {
          const listing = listingsById.get(id);
          return (
            <div key={`booking-${id}`} className="max-w-[300px]">
              <BookingPrompt propertyAddress={listing?.address} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
