import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { EmptyStates } from "./EmptyStates";
import { useMessageGrouping } from "../hooks/useMessageGrouping";

interface Message {
  id: string;
  content: string;
  project_id: string;
  sender_id: string;
  created_at: string;
  sender_full_name: string | null;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | undefined;
  lastSentMessageId?: string; // Neue Prop für die letzte gesendete Nachricht
}

export const MessageList = ({ 
  messages, 
  isLoading, 
  error, 
  currentUserId,
  lastSentMessageId 
}: MessageListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { groupedMessages } = useMessageGrouping(messages);

  // Regel 3: App-Start - Scrolle beim ersten Laden zum Ende
  useEffect(() => {
    if (!isLoading && messages.length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isLoading, messages.length > 0]); // Nur beim ersten Laden

  // Regel 1 & 2: Autoscroll bei neuen Nachrichten
  useEffect(() => {
    if (!scrollContainerRef.current || messages.length === 0) return;

    const container = scrollContainerRef.current;
    const lastMessage = messages[messages.length - 1];
    const isOwnMessage = lastMessage.sender_id === currentUserId;

    // Regel 1: Eigene Nachrichten - IMMER scrollen
    if (isOwnMessage && lastSentMessageId === lastMessage.id) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      return;
    }

    // Regel 2: Fremde Nachrichten - nur scrollen wenn am Ende (innerhalb 100px)
    if (!isOwnMessage) {
      const isAtBottom = (container.scrollTop + container.clientHeight) >= 
                        (container.scrollHeight - 100);
      
      if (isAtBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, currentUserId, lastSentMessageId]);

  // Show empty states if needed
  const emptyState = (
    <EmptyStates 
      isLoading={isLoading}
      error={error}
      hasMessages={messages.length > 0}
    />
  );

  if (isLoading || error || messages.length === 0) {
    return emptyState;
  }

  return (
    <div className="relative h-full flex flex-col">
      <div 
        ref={scrollContainerRef}
        className="space-y-3 overflow-y-auto h-full hide-scrollbar flex-1"
      >
        {groupedMessages.map(({ message, isFirstInSequence, showDateSeparator }) => {
          const isSentByMe = message.sender_id === currentUserId;
          
          return (
            <div key={message.id}>
              {showDateSeparator && (
                <DateSeparator date={message.created_at} />
              )}
              
              <MessageBubble
                message={message}
                isCurrentUser={isSentByMe}
                isFirstInSequence={isFirstInSequence}
                showTimestamp={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};