
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  // Überprüfe, ob der Benutzer nahe am unteren Rand ist
  const checkIfNearBottom = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const threshold = 150; // Pixel-Abstand zum unteren Rand
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsNearBottom(nearBottom);
  };

  // Überwache Scroll-Events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', checkIfNearBottom);
    return () => {
      container.removeEventListener('scroll', checkIfNearBottom);
    };
  }, []);

  // Scroll-Logik für neue Nachrichten
  useEffect(() => {
    // Wenn neue Nachrichten geladen werden
    if (!isLoading && messages.length > prevMessagesLength) {
      // Nur scrollen wenn der Benutzer bereits am unteren Rand ist
      if (isNearBottom) {
        scrollToBottom();
      }
      // Aktualisiere die vorherige Nachrichtenlänge
      setPrevMessagesLength(messages.length);
    }
  }, [messages, isLoading, prevMessagesLength, isNearBottom]);

  // Beim ersten Laden scrollen
  useEffect(() => {
    if (!isLoading && messages.length > 0 && prevMessagesLength === 0) {
      scrollToBottom();
      setPrevMessagesLength(messages.length);
    }
  }, [isLoading, messages]);

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
    <div ref={containerRef} className="space-y-3 h-full overflow-y-auto pb-4">
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
