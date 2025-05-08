
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const { messages, isLoading, error, sendMessage } = useMessages(project.id);
  const { isProjectMember } = useProjectMembership(project.id);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isProjectMember) return;
    
    try {
      setIsSending(true);
      const sent = await sendMessage(newMessage);
      if (sent) {
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Funktion zum Formatieren des Datums/Uhrzeit
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeString = format(date, 'HH:mm');
    
    if (isToday(date)) {
      return timeString;
    } else if (isYesterday(date)) {
      return `Gestern, ${timeString}`;
    } else {
      return `${format(date, 'dd.MM.yyyy', { locale: de })}, ${timeString}`;
    }
  };

  return (
    <div className="h-full p-6 rounded-[20px] overflow-hidden bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_10px_10px_rgba(0,0,0,0.05)] dark:shadow-[5px_10px_10px_rgba(255,255,255,0.05)] flex flex-col">
            
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Nachrichten werden geladen...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">Fehler: {error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
            >
              {/* Benutzername für empfangene Nachrichten */}
              {message.sender_id !== user?.id && (
                <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] mb-1 pl-2">
                  {message.sender_full_name || 'Unbekannt'}
                </span>
              )}
              
              {/* Message with timestamp inside the bubble */}
              <div 
                className={`max-w-[80%] p-3 rounded-t-[10px] ${
                  message.sender_id === user?.id 
                    ? 'bg-[#14A090] text-white rounded-bl-[10px] rounded-br-0' 
                    : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-br-[10px] rounded-bl-0'
                } relative`}
              >
                <div className="flex justify-between items-center gap-2">
                  {/* For sent messages, timestamp goes on the left */}
                  {message.sender_id === user?.id && (
                    <span className="text-[10px] text-white self-center min-w-[40px] mr-1">
                      {formatMessageTime(message.created_at)}
                    </span>
                  )}
                  
                  <p className="text-sm break-words flex-1">
                    {message.content}
                  </p>
                  
                  {/* For received messages, timestamp goes on the right */}
                  {message.sender_id !== user?.id && (
                    <span className="text-[10px] text-[#0A1915] dark:text-white self-center min-w-[40px] ml-1">
                      {formatMessageTime(message.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto">
        <div className="flex gap-2">
          <Textarea 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            className="w-full border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] resize-none h-[44px] min-h-[44px] py-2 px-4"
            style={{ display: 'flex', alignItems: 'center' }}
            maxLength={500}
            disabled={!isProjectMember || isSending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isProjectMember || isSending}
            className="bg-[#14A090] hover:bg-[#14A090]/80 h-[44px] w-[44px] min-w-[44px] rounded-[10px] px-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        {!isProjectMember && !isLoading && (
          <p className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-2">
            Du musst Mitglied dieses Projekts sein, um Nachrichten senden zu können.
          </p>
        )}
      </div>
    </div>
  );
};
