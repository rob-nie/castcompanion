
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { EmptyStates } from "./EmptyStates";
import { useMessageGrouping } from "../hooks/useMessageGrouping";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useRef, useState } from "react";

interface MessageListProps {
  messages: Tables<"messages">[];
  isLoading: boolean;
  error: Error | string | null;
  currentUserId?: string;
}

export const MessageList = ({ messages, isLoading, error, currentUserId }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { groupedMessages } = useMessageGrouping(messages);
  const [showBottomFade, setShowBottomFade] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Check if we need to show bottom fade
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 10;
    setShowBottomFade(!isNearBottom && scrollHeight > clientHeight);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        // Initial check
        const fakeEvent = { target: scrollContainer } as unknown as Event;
        handleScroll(fakeEvent);
        
        return () => {
          scrollContainer.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [messages]);

  if (isLoading) {
    return <EmptyStates.Loading />;
  }

  if (error) {
    return <EmptyStates.Error error={error} />;
  }

  if (messages.length === 0) {
    return <EmptyStates.NoMessages />;
  }

  return (
    <div className="relative h-full">
      <ScrollArea className="h-full hide-scrollbar" ref={scrollAreaRef}>
        <div className="space-y-2 p-1">
          {groupedMessages.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`}>
              {group.showDateSeparator && <DateSeparator date={group.message.created_at} />}
              <MessageBubble
                key={group.message.id}
                message={group.message}
                isCurrentUser={group.message.sender_id === currentUserId}
                isFirstInSequence={group.isFirstInSequence}
                showTimestamp={true}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* Dynamic fade effect */}
      {showBottomFade && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)'
          }}
        />
      )}
    </div>
  );
};
