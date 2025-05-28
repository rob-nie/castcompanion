import { useRef, useEffect, useState, useCallback } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Zustandsvariablen
  const [isInitialized, setIsInitialized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Refs für Tracking
  const lastMessageCount = useRef(0);
  const userScrollTimer = useRef<NodeJS.Timeout>();
  const lastScrollPosition = useRef(0);

  // Hilfsfunktion: Ist User am Ende?
  const isAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    return distanceFromBottom <= 100; // 100px Toleranz
  }, []);

  // Hilfsfunktion: Scroll zum Ende
  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Scroll Event Handler (throttled)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentPosition = container.scrollTop;
    const { scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (currentPosition + clientHeight);

    // Erkennung von User-Scroll (nur wenn sich Position tatsächlich ändert)
    if (Math.abs(currentPosition - lastScrollPosition.current) > 5) {
      setIsUserScrolling(true);
      
      // Timer zurücksetzen
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }
      
      // Nach 3 Sekunden Inaktivität: User-Scroll deaktivieren
      userScrollTimer.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, 3000);
      
      lastScrollPosition.current = currentPosition;
    }

    // Scroll-Button und Unread-Counter verwalten
    if (distanceFromBottom <= 100) {
      // Am Ende - alles zurücksetzen
      setShowScrollButton(false);
      setUnreadCount(0);
    } else if (unreadCount > 0) {
      // Nicht am Ende und ungelesene Nachrichten - Button zeigen
      setShowScrollButton(true);
    }
  }, [unreadCount]);

  // Throttled Scroll Handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;
    const throttledHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', throttledHandler, { passive: true });
    return () => {
      container.removeEventListener('scroll', throttledHandler);
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }
    };
  }, [handleScroll]);

  // Erstes Laden - sofort zum Ende scrollen
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialized) {
      // Kurz warten bis DOM gerendert ist
      setTimeout(() => {
        scrollToBottom(false); // Ohne Animation für ersten Load
        setIsInitialized(true);
        lastMessageCount.current = messages.length;
      }, 50);
    }
  }, [messages.length, isLoading, isInitialized, scrollToBottom]);

  // Neue Nachrichten behandeln
  useEffect(() => {
    if (!isInitialized || isLoading || messages.length <= lastMessageCount.current) {
      return; // Keine neuen Nachrichten
    }

    const newMessageCount = messages.length - lastMessageCount.current;
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.sender_id === currentUserId;

    console.log(`Neue Nachrichten: ${newMessageCount}, Eigene: ${isMyMessage}, User scrollt: ${isUserScrolling}`);

    // Regel 1: Eigene Nachrichten - IMMER scrollen
    if (isMyMessage) {
      setTimeout(() => {
        scrollToBottom(true);
        setUnreadCount(0);
        setShowScrollButton(false);
      }, 100);
    }
    // Regel 2: Fremde Nachrichten - nur scrollen wenn am Ende und nicht user-scrolling
    else if (isAtBottom() && !isUserScrolling) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
    // Regel 3: Sonst Unread-Counter erhöhen
    else {
      setUnreadCount(prev => prev + newMessageCount);
      setShowScrollButton(true);
    }

    lastMessageCount.current = messages.length;
  }, [messages.length, currentUserId, isInitialized, isLoading, isAtBottom, scrollToBottom, isUserScrolling]);

  // Button Click Handler
  const handleScrollButtonClick = useCallback(() => {
    scrollToBottom(true);
    setUnreadCount(0);
    setShowScrollButton(false);
  }, [scrollToBottom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }
    };
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Nachrichten werden geladen...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Fehler: {error}</p>
      </div>
    );
  }

  // Empty State
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten vorhanden.</p>
      </div>
    );
  }

  // Hilfsfunktion für Datumsformatierung
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) return "Heute";
    if (isYesterday) return "Gestern";
    return format(date, "dd.MM.yyyy", { locale: de });
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Scroll-zu-neuen-Nachrichten Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleScrollButtonClick}
            className="bg-[#14A090] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#14A090]/90 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span>↓</span>
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
          const isFirstInSequence = index === 0 || 
            messages[index - 1].sender_id !== message.sender_id;
          
          let showDateSeparator = false;
          if (index === 0) {
            showDateSeparator = true;
          } else {
            const currentDate = new Date(message.created_at);
            const previousDate = new Date(messages[index - 1].created_at);
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
                showTimestamp={true}
              />
            </div>
          );
        })}
        
        {/* Scroll-Anker */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};