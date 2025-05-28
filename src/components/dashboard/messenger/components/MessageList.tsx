
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
  const previousMessageCountRef = useRef(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastMessageIdRef = useRef<string | null>(null);
  
  // Funktion zur Überprüfung, ob der Benutzer am unteren Rand des Scroll-Bereichs ist
  const isAtBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const threshold = 50; // Toleranz für "am Ende"
    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    return distanceFromBottom <= threshold;
  };

  // Funktion zum Scrollen zum Ende der Liste
  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? "smooth" : "auto" 
    });
  };

  // Beim initialen Laden direkt zur neuesten Nachricht springen
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitialScrolled) {
      setTimeout(() => {
        scrollToBottom(false);
        setHasInitialScrolled(true);
        previousMessageCountRef.current = messages.length;
        if (messages.length > 0) {
          lastMessageIdRef.current = messages[messages.length - 1].id;
        }
      }, 0);
    }
  }, [messages.length, isLoading, hasInitialScrolled]);

  // Neue Nachrichten-Logik
  useEffect(() => {
    if (!isLoading && messages.length > 0 && hasInitialScrolled) {
      const hasNewMessages = messages.length > previousMessageCountRef.current;
      
      if (hasNewMessages) {
        const newMessages = messages.slice(previousMessageCountRef.current);
        const lastNewMessage = newMessages[newMessages.length - 1];
        const isMyMessage = lastNewMessage.sender_id === currentUserId;
        
        // Aktuelle Scroll-Position vor der neuen Nachricht überprüfen
        const wasAtBottom = isAtBottom();
        
        // Aktualisiere die Nachrichtenanzahl
        previousMessageCountRef.current = messages.length;
        lastMessageIdRef.current = lastNewMessage.id;
        
        if (isMyMessage) {
          // Eigene Nachricht: Immer scrollen
          setTimeout(() => {
            scrollToBottom(true);
            setUnreadCount(0); // Reset bei eigenen Nachrichten
          }, 50);
        } else {
          // Empfangene Nachricht
          if (wasAtBottom) {
            // War am Ende: Scrollen und keine ungelesenen Nachrichten
            setTimeout(() => {
              scrollToBottom(true);
              setUnreadCount(0);
            }, 50);
          } else {
            // War nicht am Ende: Ungelesene Nachrichten erhöhen
            setUnreadCount(prev => prev + newMessages.length);
          }
        }
      }
    }
  }, [messages.length, isLoading, hasInitialScrolled, currentUserId]);

  // Ungelesene Nachrichten zurücksetzen wenn der User manuell nach unten scrollt
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (isAtBottom() && unreadCount > 0) {
        setUnreadCount(0);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [unreadCount]);

  // Funktion zum Scrollen zu neuen Nachrichten
  const scrollToNewMessages = () => {
    scrollToBottom(true);
    setUnreadCount(0);
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
    <div className="relative h-full flex flex-col">
      {/* Ungelesene Nachrichten Hinweis */}
      {unreadCount > 0 && (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center p-2">
          <button
            onClick={scrollToNewMessages}
            className="bg-[#14A090] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#14A090]/90 transition-colors text-sm font-medium"
          >
            {unreadCount === 1 ? "1 neue Nachricht" : `${unreadCount} neue Nachrichten`}
          </button>
        </div>
      )}
      
      {/* Nachrichten Container */}
      <div 
        ref={scrollContainerRef}
        className="space-y-3 overflow-y-auto h-full hide-scrollbar flex-1"
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
    </div>
  );
};
