
import { differenceInMinutes } from "date-fns";
import { formatMessageTime } from "../utils/formatMessageTime";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_full_name: string | null;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isFirstInSequence: boolean;
  showTimestamp: boolean;
}

export const MessageBubble = ({ 
  message, 
  isCurrentUser,
  isFirstInSequence,
  showTimestamp 
}: MessageBubbleProps) => {
  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {/* Benutzername nur für die erste Nachricht in einer Sequenz anzeigen */}
      {!isCurrentUser && isFirstInSequence && (
        <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] mb-1">
          {message.sender_full_name || 'Unbekannt'}
        </span>
      )}
      
      <div className="flex flex-col items-start max-w-[80%]">
        {/* Message bubble */}
        <div 
          className={`p-3 ${
            isCurrentUser 
              ? 'bg-[#14A090] text-white rounded-tl-[10px] rounded-tr-[0px] rounded-bl-[10px] rounded-br-[10px]' 
              : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-tl-[0px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]'
          }`}
        >
          <p className="text-sm break-words">
            {message.content}
          </p>
        </div>
        
        {/* Timestamp outside the bubble */}
        {showTimestamp && (
          <div className={`text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-1 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
            {formatMessageTime(message.created_at)}
          </div>
        )}
      </div>
    </div>
  );
};
