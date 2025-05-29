
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { EmptyStates } from "./EmptyStates";
import { useMessageGrouping } from "../hooks/useMessageGrouping";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Tables<"messages">[];
  isLoading: boolean;
  error: Error | null;
  currentUserId?: string;
}

export const MessageList = ({ messages, isLoading, error, currentUserId }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const groupedMessages = useMessageGrouping(messages);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
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
              <DateSeparator date={group.date} />
              <div className="space-y-2">
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.user_id === currentUserId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {/* Fade-Effekt am unteren Rand */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#222625] to-transparent pointer-events-none" />
    </div>
  );
};
