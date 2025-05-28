
import { useRef } from "react";
import { differenceInDays, format } from "date-fns";
import { de } from "date-fns/locale";
import { MessageBubble } from "./MessageBubble";

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
