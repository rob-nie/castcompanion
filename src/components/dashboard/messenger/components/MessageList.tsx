
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
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  
  // Funktion zur Überprüfung, ob der Benutzer nahe am unteren Rand des Scroll-Bereichs ist
  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // Pixel vom unteren Rand, die Auto-Scroll auslösen
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distanceFromBottom <= threshold;
  };

  // Überwache Scroll-Events, um zu bestimmen, ob auto-scrolling erfolgen soll
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

  // Beim initialen Laden sofort zur neuesten Nachricht springen (ohne Animation)
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitialScrolled) {
      scrollToBottom(false); // false = kein smooth scrolling (direkter Sprung)
      setHasInitialScrolled(true);
    }
  }, [messages, isLoading, hasInitialScrolled]);

  // Bei neuen Nachrichten prüfen, ob gescrollt werden soll
  useEffect(() => {
    if (!isLoading && messages.length > 0 && hasInitialScrolled) {
      // Nur scrollen wenn der Benutzer bereits nahe am unteren Rand ist
      if (shouldScrollToBottom) {
        scrollToBottom(true); // true = smooth scrolling für bessere UX
      }
    }
  }, [messages, isLoading, hasInitialScrolled, shouldScrollToBottom]);

  // Funktion zum Scrollen zum Ende der Liste
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
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
