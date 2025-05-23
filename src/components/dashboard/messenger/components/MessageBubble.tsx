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
  showTimestamp,
}: MessageBubbleProps) => {
  // Funktion zur Formatierung des Zeitstempels im Format HH:MM
  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm');
  };

  return (
    <div className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
      {/* Benutzername nur für die erste Nachricht in einer Sequenz anzeigen */}
      {!isCurrentUser && isFirstInSequence && (
        <span className="text-sm text-gray-600 mb-1">
          {message.sender_full_name || 'Unbekannt'}
        </span>
      )}

      {/* Message with timestamp */}
      <div className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {/* Zeitstempel nur anzeigen wenn showTimestamp true ist */}
        {showTimestamp && (
          <span className={`text-xs text-gray-500 ${isCurrentUser ? 'mr-1' : 'ml-1'}`}>
            {formatTime(message.created_at)}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`relative p-2 rounded-lg shadow-md ${
            isCurrentUser
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-300 text-gray-800 mr-auto'
          } max-w-[75%]`} {/* Hier wurde max-w-[75%] hinzugefügt */}
        >
          {/* Sicherstellen, dass der Inhalt umbricht */}
          <p className="break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};