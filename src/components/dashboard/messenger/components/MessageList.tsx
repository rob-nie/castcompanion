
import { useRef, useEffect, useState } from "react";
import { differenceInMinutes } from "date-fns";
import { MessageBubble } from "./MessageBubble";
import type { Tables } from "@/integrations/supabase/types";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  // Überprüfen, ob der Benutzer in der Nähe des unteren Randes ist
  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const threshold = 150; // Pixelwert für "in der Nähe"
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Scroll-Position überwachen und entscheiden, ob automatisch gescrollt werden soll
  const handleScroll = () => {
    setShouldScrollToBottom(isNearBottom());
  };

  // Wenn neue Nachrichten geladen werden und der Benutzer am unteren Rand ist, nach unten scrollen
  useEffect(() => {
    // Nur scrollen, wenn neue Nachrichten dazugekommen sind
    if (messages.length > prevMessagesLength) {
      if (shouldScrollToBottom) {
        scrollToBottom();
      }
    }
    
    setPrevMessagesLength(messages.length);
  }, [messages, shouldScrollToBottom, prevMessagesLength]);

  // Automatisches Scrollen zu neuen Nachrichten
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Nachrichten werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Fehler: {error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten. Sende die erste!</p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3 h-full overflow-auto" 
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      {messages.map((message, index) => {
        // Check if this message is the first from this sender in a sequence
        const isFirstInSequence = index === 0 || 
          messages[index - 1].sender_id !== message.sender_id;
        
        // Check if we should show the timestamp
        let showTimestamp = true;
        if (index > 0) {
          const currentDate = new Date(message.created_at);
          const previousDate = new Date(messages[index - 1].created_at);
          const minuteDifference = differenceInMinutes(currentDate, previousDate);
          showTimestamp = minuteDifference > 2;
        }
        
        const isSentByMe = message.sender_id === currentUserId;
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={isSentByMe}
            isFirstInSequence={isFirstInSequence}
            showTimestamp={showTimestamp}
          />
        );
      })}
      {/* Unsichtbarer Div für auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};
