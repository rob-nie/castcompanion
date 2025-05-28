import { useRef, useEffect, useState } from "react";
import { differenceInMinutes, differenceInDays, format } from "date-fns";
import { de } from "date-fns/locale";
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

  // Funktion zum Scrollen zum Ende der Liste
  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
  };

  // Beim initialen Laden sofort zur neuesten Nachricht springen
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitialScrolled) {
      // Verwende setTimeout um sicherzustellen, dass das DOM vollständig gerendert ist
      setTimeout(() => {
        scrollToBottom(false); // false = kein smooth scrolling (direkter Sprung)
        setHasInitialScrolled(true);
      }, 0);
    }
  }, [messages.length, isLoading, hasInitialScrolled]);

  // Bei neuen Nachrichten nur scrollen wenn der Benutzer bereits nahe am unteren Rand ist
  useEffect(() => {
    if (!isLoading && messages.length > 0 && hasInitialScrolled && shouldScrollToBottom) {
      scrollToBottom(true); // true = smooth scrolling für bessere UX
    }
  }, [messages.length, isLoading, hasInitialScrolled, shouldScrollToBottom]);

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
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten vorhanden.</p>
      </div>
    );
  }

  // Formatierung des Datums für die Datumstrenner
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return "Heute";
    } else if (isYesterday) {
      return "Gestern";
    } else {
      return format(date, "dd.MM.yyyy", { locale: de });
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="space-y-3 overflow-y-auto h-full hide-scrollbar"
    >
      {messages.map((message, index) => {
        // Check if this message is the first from this sender in a sequence
        const isFirstInSequence = index === 0 || 
          messages[index - 1].sender_id !== message.sender_id;
        
        // Prüfen, ob wir einen Zeitstempel anzeigen sollen
        const showTimestamp = true; // Wir zeigen den Zeitstempel jetzt immer an
        
        // Prüfen, ob wir einen Datumstrenner anzeigen sollen
        let showDateSeparator = false;
        if (index === 0) {
          showDateSeparator = true; // Erste Nachricht bekommt immer einen Datumstrenner
        } else {
          const currentDate = new Date(message.created_at);
          const previousDate = new Date(messages[index - 1].created_at);
          
          // Wenn sich das Datum geändert hat, zeigen wir einen Datumstrenner an
          showDateSeparator = differenceInDays(currentDate, previousDate) !== 0;
        }
        
        const isSentByMe = message.sender_id === currentUserId;
        
        return (
          <div key={message.id} className="space-y-3">
            {/* Datumstrenner */}
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <div className="px-3 py-1 text-xs rounded-full bg-[#DAE5E2] dark:bg-[#5E6664] text-[#7A9992] dark:text-[#CCCCCC]">
                  {formatDateHeader(message.created_at)}
                </div>
              </div>
            )}
            
            {/* Nachrichtenbubble */}
            <MessageBubble
              message={message}
              isCurrentUser={isSentByMe}
              isFirstInSequence={isFirstInSequence}
              showTimestamp={showTimestamp}
            />
          </div>
        );
      })}
      {/* Unsichtbarer Div für auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};
