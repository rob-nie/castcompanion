
import { useRef, useState, useEffect, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { EmptyStates } from "./EmptyStates";
import { useMessageGrouping } from "../hooks/useMessageGrouping";

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
  const outerDiv = useRef<HTMLDivElement>(null);
  const innerDiv = useRef<HTMLDivElement>(null);
  const prevInnerDivHeight = useRef<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const { groupedMessages } = useMessageGrouping(messages);

  // Auto-scroll logic based on the provided pattern
  useEffect(() => {
    if (!outerDiv.current || !innerDiv.current) return;
    
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;
    const outerDivScrollTop = outerDiv.current.scrollTop;

    if (
      !prevInnerDivHeight.current ||
      outerDivScrollTop === prevInnerDivHeight.current - outerDivHeight
    ) {
      outerDiv.current.scrollTo({
        top: innerDivHeight - outerDivHeight,
        left: 0,
        behavior: prevInnerDivHeight.current ? "smooth" : "auto"
      });
    } else {
      setShowScrollButton(true);
    }

    prevInnerDivHeight.current = innerDivHeight;
  }, [groupedMessages]);

  const handleScrollButtonClick = useCallback(() => {
    if (!outerDiv.current || !innerDiv.current) return;
    
    const outerDivHeight = outerDiv.current.clientHeight;
    const innerDivHeight = innerDiv.current.clientHeight;

    outerDiv.current.scrollTo({
      top: innerDivHeight - outerDivHeight,
      left: 0,
      behavior: "smooth"
    });

    setShowScrollButton(false);
  }, []);

  // Show empty states if needed
  if (isLoading || error || messages.length === 0) {
    return (
      <EmptyStates 
        isLoading={isLoading}
        error={error}
        hasMessages={messages.length > 0}
      />
    );
  }

  return (
    <div className="relative h-full">
      <div 
        ref={outerDiv}
        className="h-full overflow-y-auto hide-scrollbar"
      >
        <div 
          ref={innerDiv}
          className="space-y-3 p-4"
        >
          {groupedMessages.map(({ message, isFirstInSequence, showDateSeparator }) => {
            const isSentByMe = message.sender_id === currentUserId;
            
            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <DateSeparator date={message.created_at} />
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
      
      {/* Scroll Button for new messages */}
      <button
        onClick={handleScrollButtonClick}
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 
                   bg-[#14A090] text-white px-4 py-2 rounded-full shadow-lg
                   transition-all duration-200 ease-in-out
                   ${showScrollButton ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'}`}
      >
        Neue Nachricht!
      </button>
    </div>
  );
};
