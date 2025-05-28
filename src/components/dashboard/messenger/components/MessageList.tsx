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
  
  // Einfache States
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  
  // Tracking Refs
  const lastMessageCount = useRef(0);
  const lastScrollTop = useRef(0);
  const isInitialized = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // EINFACHE scroll to bottom Funktion
  const scrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Einfach: Setze scrollTop auf maximum
    container.scrollTop = container.scrollHeight;
    console.log(`✅ Scrolled to bottom: ${container.scrollTop}`);
  }, []);

  // Prüfe ob User am Ende ist
  const isUserAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 100;
    
    console.log(`📏 Distance from bottom: ${distanceFromBottom}px, at bottom: ${atBottom}`);
    return atBottom;
  }, []);

  // Handle User Scroll
  const handleUserScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // Prüfe ob User nach oben gescrollt hat
    const hasScrolledUp = currentScrollTop < (scrollHeight - clientHeight - 100);
    
    if (hasScrolledUp !== userHasScrolledUp) {
      console.log(`🔄 User scroll state changed: ${hasScrolledUp}`);
      setUserHasScrolledUp(hasScrolledUp);
      
      // Wenn User wieder am Ende ist, Unread Counter zurücksetzen
      if (!hasScrolledUp) {
        setUnreadCount(0);
        setShowScrollButton(false);
      }
    }

    // Button anzeigen wenn User oben ist und unread messages da sind
    setShowScrollButton(hasScrolledUp && unreadCount > 0);
    
    lastScrollTop.current = currentScrollTop;
  }, [userHasScrolledUp, unreadCount]);

  // Throttled scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleUserScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', scrollHandler, { passive: true });
    return () => container.removeEventListener('scroll', scrollHandler);
  }, [handleUserScroll]);

  // Initial Load - Scroll to bottom
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !isInitialized.current) {
      console.log('🚀 Initial load - scrolling to bottom');
      
      // Warte bis Rendering fertig ist
      setTimeout(() => {
        scrollToBottom();
        isInitialized.current = true;
        lastMessageCount.current = messages.length;
      }, 100);
    }
  }, [messages.length, isLoading, scrollToBottom]);

  // Handle new messages
  useEffect(() => {
    // Nur wenn initialisiert und nicht loading
    if (!isInitialized.current || isLoading) return;
    
    const newMessageCount = messages.length - lastMessageCount.current;
    if (newMessageCount <= 0) return;

    const latestMessage = messages[messages.length - 1];
    const isMyMessage = latestMessage?.sender_id === currentUserId;
    
    console.log(`📨 ${newMessageCount} new message(s), mine: ${isMyMessage}, user scrolled up: ${userHasScrolledUp}`);

    // Update message count
    lastMessageCount.current = messages.length;

    if (isMyMessage) {
      // EIGENE Nachricht - IMMER zum Ende scrollen
      console.log('📤 My message - scrolling to bottom');
      
      // Kurz warten für DOM update, dann scrollen
      setTimeout(() => {
        scrollToBottom();
        setUnreadCount(0);
        setShowScrollButton(false);
        setUserHasScrolledUp(false); // Reset user scroll state
      }, 50);
      
    } else {
      // FREMDE Nachricht
      if (!userHasScrolledUp) {
        // User ist am Ende - zum Ende scrollen
        console.log('📥 Received message - user at bottom, scrolling');
        setTimeout(() => {
          scrollToBottom();
        }, 50);
      } else {
        // User ist oben - Unread counter erhöhen
        console.log('📥 Received message - user scrolled up, showing counter');
        setUnreadCount(prev => prev + newMessageCount);
        setShowScrollButton(true);
      }
    }
  }, [messages.length, currentUserId, isLoading, userHasScrolledUp, scrollToBottom]);

  // Scroll button click
  const handleScrollButtonClick = useCallback(() => {
    console.log('🔘 Scroll button clicked');
    scrollToBottom();
    setUnreadCount(0);
    setShowScrollButton(false);
    setUserHasScrolledUp(false);
  }, [scrollToBottom]);

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
      {/* Scroll Button */}
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
      
      {/* Messages Container */}
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
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 text-xs rounded-full bg-[#DAE5E2] dark:bg-[#5E6664] text-[#7A9992] dark:text-[#CCCCCC]">
                    {formatDateHeader(message.created_at)}
                  </div>
                </div>
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