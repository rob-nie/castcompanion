
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const previousMessageCountRef = useRef(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userScrollPaused, setUserScrollPaused] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUserScrollRef = useRef<number>(0);
  
  // Throttle scroll events to 60fps
  const throttledScrollHandler = useCallback(() => {
    let ticking = false;
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (!container) return;
          
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const clientHeight = container.clientHeight;
          const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
          
          // Check if user is near bottom (within last 2-3 messages, roughly 200px)
          const isNearBottom = distanceFromBottom <= 200;
          
          // Show scroll-to-bottom button if > 500px from bottom AND unread messages exist
          setShowScrollToBottom(distanceFromBottom > 500 && unreadCount > 0);
          
          // If user scrolled manually, pause autoscroll
          const now = Date.now();
          if (now - lastUserScrollRef.current > 100) { // Debounce user scrolls
            setUserScrollPaused(true);
            
            // Clear existing timeout
            if (userScrollTimeoutRef.current) {
              clearTimeout(userScrollTimeoutRef.current);
            }
            
            // Resume autoscroll after 4 seconds of no user interaction
            userScrollTimeoutRef.current = setTimeout(() => {
              setUserScrollPaused(false);
            }, 4000);
            
            lastUserScrollRef.current = now;
          }
          
          // Clear unread count if user is at bottom
          if (isNearBottom && unreadCount > 0) {
            setUnreadCount(0);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [unreadCount]);

  // Check if user is near bottom of conversation
  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    // Consider "near bottom" as within last 2-3 messages (roughly 200px)
    return distanceFromBottom <= 200;
  }, []);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior,
      block: 'end'
    });
  }, []);

  // Handle scroll to new messages button click
  const handleScrollToNewMessages = useCallback(() => {
    scrollToBottom('smooth');
    setUnreadCount(0);
    setShowScrollToBottom(false);
  }, [scrollToBottom]);

  // Initial scroll on load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitialScrolled) {
      setTimeout(() => {
        scrollToBottom('auto');
        setHasInitialScrolled(true);
        previousMessageCountRef.current = messages.length;
      }, 100);
    }
  }, [messages.length, isLoading, hasInitialScrolled, scrollToBottom]);

  // Handle new messages
  useEffect(() => {
    if (!isLoading && messages.length > 0 && hasInitialScrolled) {
      const hasNewMessages = messages.length > previousMessageCountRef.current;
      
      if (hasNewMessages) {
        const newMessagesCount = messages.length - previousMessageCountRef.current;
        const lastMessage = messages[messages.length - 1];
        const isMyMessage = lastMessage.sender_id === currentUserId;
        
        // Update message count
        previousMessageCountRef.current = messages.length;
        
        if (isMyMessage) {
          // Regel 2: Eigene Nachrichten - IMMER scrollen
          setTimeout(() => {
            scrollToBottom('smooth');
            setUnreadCount(0);
          }, 50);
        } else {
          // Regel 1: Neue Nachrichten
          const wasNearBottom = isNearBottom();
          
          if (wasNearBottom && !userScrollPaused) {
            // User ist am Ende und Autoscroll ist nicht pausiert - scrollen
            setTimeout(() => {
              scrollToBottom('smooth');
              setUnreadCount(0);
            }, 50);
          } else {
            // User ist weiter oben oder Autoscroll ist pausiert - Indikator zeigen
            setUnreadCount(prev => prev + newMessagesCount);
          }
        }
      }
    }
  }, [messages.length, isLoading, hasInitialScrolled, currentUserId, isNearBottom, scrollToBottom, userScrollPaused]);

  // Setup scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollHandler = throttledScrollHandler();
    container.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', scrollHandler);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [throttledScrollHandler]);

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
      {/* Regel 4: "Zurück nach unten"-Button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleScrollToNewMessages}
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
          // Check if this message is the first from this sender in a sequence
          const isFirstInSequence = index === 0 || 
            messages[index - 1].sender_id !== message.sender_id;
          
          // Prüfen, ob wir einen Zeitstempel anzeigen sollen
          const showTimestamp = true;
          
          // Prüfen, ob wir einen Datumstrenner anzeigen sollen
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
