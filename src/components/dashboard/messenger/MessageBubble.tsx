
import type { Message } from "@/hooks/useMessenger";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isLastInGroup: boolean;
}

export const MessageBubble = ({ message, isCurrentUser, isLastInGroup }: MessageBubbleProps) => {
  // Format time to HH:MM
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-[75%] items-end">
        {/* Message Bubble */}
        <div 
          className={`
            relative py-2 px-3 rounded-[10px] 
            ${isCurrentUser 
              ? 'bg-[#14A090] text-white rounded-tr-[0px]' 
              : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-tl-[0px]'
            }
          `}
        >
          <div className="text-[14px] font-normal whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        {/* Timestamp - Only show for last message in a group */}
        {isLastInGroup && (
          <div className={`text-[10px] text-[#7A9992] dark:text-[#CCCCCC] ${isCurrentUser ? 'ml-2' : 'mr-2'}`}>
            {formatTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};
