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
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  // Refs für Tracking
  const lastMessageCount = useRef(0);
  const userScrollTimer = useRef<NodeJS.Timeout>();
  const isScrollingProgrammatically = useRef(false);
  const lastKnownScrollHeight = useRef(0);

  // Robuste Scroll-to-Bottom Funktion
  const scrollToBottom = useCallback((smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    console.log('🔄 ScrollToBottom called, smooth:', smooth);
    
    // Flag setzen um programmatisches Scrollen zu markieren
    isScrollingProgrammatically.current = true;
    
    // Mehrere Versuche für robustes Scrollen
    const performScroll = () => {
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      console.log(`📍 Scrolling to: ${maxScrollTop} (height: ${container.scrollHeight})`);
      
      if (smooth) {
        container.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = maxScrollTop;
      }
      
      lastKnownScrollHeight.current = container.scrollHeight;
    };
    
    // Sofort ausführen
    performScroll();
    
    // Nach kurzer Zeit nochmal prüfen (für Layout-Shifts)
    setTimeout(() => {
      if (container.scrollHeight !== lastKnownScrollHeight.current) {
        console.log('📐 Layout changed, adjusting scroll');
        performScroll();
      }
      isScrollingProgrammatically.current = false;
    }, 100);
    
  }, []);

  // Prüfung ob am Ende
  const isAtBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScrollTop = scrollHeight - clientHeight;
    const distanceFromBottom = maxScrollTop - scrollTop;
    
    return distanceFromBottom <= 50; // Nur 50px Toleranz
  }, []);

  // Scroll Event Handler
  const handleScroll = useCallback(() => {
    // Ignoriere programmatisches Scrollen 
    if (isScrollingProgrammatically.current) {
      console.log('⏭️ Ignoring programmatic scroll');
      return;
    }
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScrollTop = scrollHeight - clientHeight;
    const distanceFromBottom = maxScrollTop - scrollTop;

    console.log(`📊 Scroll: ${scrollTop}, Max: ${maxScrollTop}, Distance: ${distanceFromBottom}`);

    // User-Scroll nur erkennen wenn wirklich vom Ende weg gescrollt wird
    if (distanceFromBottom > 100 && !isUserScrolling) {
      console.log('👆 User scroll detected');
      setIsUserScrolling(true);
      
      if (userScrollTimer.current) {
        clearTimeout(userScrollTimer.current);
      }
      
      userScrollTimer.current = setTimeout(() => {
        console.log('⏰ User scroll timeout - resuming autoscroll');
        setIsUserScrolling(false);
      }, 3000);
    }

    // Button und Counter Management
    if (distanceFromBottom <= 50) {
      setShowScrollButton(false);
      setUnreadCount(0);
    } else if (unreadCount > 0) {
      setShowScrollButton(true);
    }
  }, [isUserScrolling, unreadCount]);

  // Throttled Scroll Listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isThrottled = false;
    const throttledHandler = () => {
      if (!isThrottled) {
        isThrottled = true;
        requestAnimationFrame(() => {
          handleScroll();
          isThrottled = false;
        });
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

  // Initialer Scroll - sehr robust
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    
    if (!hasInitiallyScrolled) {
      console.log('🚀 Initial scroll setup');
      
      // Mehrere Versuche mit steigenden Delays
      const attempts = [50, 150, 300];
      
      attempts.forEach((delay, index) => {
        setTimeout(() => {
          const container = scrollContainerRef.current;
          if (container && !hasInitiallyScrolled) {
            console.log(`🎯 Initial scroll attempt ${index + 1}`);
            scrollToBottom(false);
            
            if (index === attempts.length - 1) {
              setHasInitiallyScrolled(true);
              lastMessageCount.current = messages.length;
            }
          }
        }, delay);
      });
    }
  }, [messages.length, isLoading, hasInitiallyScrolled, scrollToBottom]);

  // Neue Nachrichten Handler
  useEffect(() => {
    if (!hasInitiallyScrolled || isLoading) return;
    
    const newMessageCount = messages.length - lastMessageCount.current;
    if (newMessageCount <= 0) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.sender_id === currentUserId;

    console.log(`📨 New messages: ${newMessageCount}, Mine: ${isMyMessage}, UserScrolling: ${isUserScrolling}`);

    // Update count first
    lastMessageCount.current = messages.length;

    if (isMyMessage) {
      // Eigene Nachricht - IMMER scrollen
      console.log('📤 Own message - force scroll');
      setTimeout(() => {
        scrollToBottom(true);
        setUnreadCount(0);
        setShowScrollButton(false);
      }, 50);
    } else if (isAtBottom() && !isUserScrolling) {
      // Am Ende und User scrollt nicht - autoscroll
      console.log('📥 Auto-scroll to new message');
      setTimeout(() => {
        scrollToBottom(true);
      }, 50);
    } else {
      // Unread indicator zeigen
      console.log('🔔 Show unread indicator');
      setUnreadCount(prev => prev + newMessageCount);
      setShowScrollButton(true);
    }
  }, [messages.length, currentUserId, hasInitiallyScrolled, isLoading, isAtBottom, scrollToBottom, isUserScrolling]);

  // Button Click Handler
  const handleScrollButtonClick = useCallback(() => {
    console.log('🔘 Scroll button clicked');
    scrollToBottom(true);
    setUnreadCount(0);
    setShowScrollButton(false);
  }, [scrollToBottom]);

  // Debug: Scroll Position Monitoring
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const logPosition = () => {
      console.log(`📍 Position: ${container.scrollTop}/${container.scrollHeight - container.clientHeight}`);
    };

    // Log position changes
    const observer = new MutationObserver(() => {
      if (container.scrollHeight !== lastKnownScrollHeight.current) {
        console.log(`📐 Height changed: ${lastKnownScrollHeight.current} → ${container.scrollHeight}`);
        lastKnownScrollHeight.current = container.scrollHeight;
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => observer.disconnect();
  }, []);

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
        style={{
          // Verhindert Layout-Shifts
          scrollBehavior: 'auto',
          overflowAnchor: 'none'
        }}
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
              
              <div className="space-y-3">
                <MessageBubble
                  message={message}
                  isCurrentUser={isSentByMe}
                  isFirstInSequence={isFirstInSequence}
                  showTimestamp={true}
                />
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};