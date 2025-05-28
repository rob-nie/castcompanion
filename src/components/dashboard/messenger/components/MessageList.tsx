
import { useRef } from "react";
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
}

export const MessageList = ({ 
  messages, 
  isLoading, 
  error, 
  currentUserId 
}: MessageListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { groupedMessages } = useMessageGrouping(messages);

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
