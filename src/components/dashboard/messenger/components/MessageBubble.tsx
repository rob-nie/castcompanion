
import { format } from "date-fns";

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
  // Funktion zur Formatierung des Zeitstempels im Format HH:MM
  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm');
  };

  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} w-full`}>
      {/* Benutzername nur für die erste Nachricht in einer Sequenz anzeigen */}
      {!isCurrentUser && isFirstInSequence && (
        <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] mb-1 ml-1">
          {message.sender_full_name || 'Unbekannt'}
        </span>
      )}
      
      {/* Nachrichtencontainer mit Timestamp */}
      <div className={`flex items-center ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
        {/* Nachricht */}
        <div 
          className={`p-3 ${
            isCurrentUser 
              ? 'bg-[#14A090] text-white rounded-tl-[10px] rounded-tr-[0px] rounded-bl-[10px] rounded-br-[10px]' 
              : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-tl-[0px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]'
          } break-words`}
        >
          <p className="text-sm">
            {message.content}
          </p>
        </div>
        
        {/* Zeitstempel mit 10px Abstand zur Bubble */}
        {showTimestamp && (
          <span className={`text-[10px] text-[#7A9992] dark:text-[#CCCCCC] ${isCurrentUser ? 'mr-[10px]' : 'ml-[10px]'}`}>
            {formatTime(message.created_at)}
          </span>
        )}
      </div>
    </div>
  );
};
