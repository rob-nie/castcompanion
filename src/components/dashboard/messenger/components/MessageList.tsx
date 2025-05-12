
import { useRef, useEffect, useState } from "react";
import { differenceInMinutes } from "date-fns";
import { MessageBubble } from "./MessageBubble";
import type { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  // Function to check if user is near the bottom of the scroll area
  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // pixels from bottom to trigger auto-scroll
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distanceFromBottom <= threshold;
  };

  // Handle scroll events to determine if we should auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      setShouldScrollToBottom(isNearBottom());
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to bottom on initial load and when new messages arrive
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // If this is the initial load or user is near bottom, scroll to bottom
      if (!hasInitialScrolled || shouldScrollToBottom) {
        scrollToBottom();
        if (!hasInitialScrolled) {
          setHasInitialScrolled(true);
        }
      }
    }
  }, [messages, isLoading, hasInitialScrolled, shouldScrollToBottom]);

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
      className="space-y-3"
      ref={scrollContainerRef}
      style={{ overflowY: 'auto', height: '100%', paddingRight: '8px' }}
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
