
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CornerDownLeft } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

interface MessengerTabProps {
  project: Tables<"projects">;
}

export const MessengerTab = ({ project }: MessengerTabProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const { messages, isLoading, error, sendMessage } = useMessages(project.id);
  const { isProjectMember } = useProjectMembership(project.id);
  const [isSending, setIsSending] = useState(false);
  const [quickPhrases, setQuickPhrases] = useState<string[]>([
    "Bitte richte dein Mikrofon nochmal korrekt aus!", 
    "Zum Schluss kommen"
  ]);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);

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

  const handleQuickPhrase = (phrase: string) => {
    setNewMessage(phrase);
    setShowQuickPhrases(false);
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
    <div className="h-full flex flex-col bg-[#F9F9F9] dark:bg-[#222625] rounded-[20px]">
      <h2 className="text-xl font-medium p-4">Messenger</h2>
      
      <div className="flex-1 flex flex-col p-4">
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
            <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten. Sende die erste!</p>
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
          <div className="flex gap-2 mb-2">
            <Textarea 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben..."
              className="w-full border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] resize-none h-[44px] min-h-[44px] py-2 px-4"
              style={{ display: 'flex', alignItems: 'center' }}
              maxLength={500}
              disabled={!isProjectMember || isSending}
            />
            <Button 
              onClick={() => setShowQuickPhrases(!showQuickPhrases)}
              className="bg-white dark:bg-[#222625] hover:bg-gray-100 dark:hover:bg-gray-800 border border-[#7A9992] dark:border-[#CCCCCC] h-[44px] w-[44px] min-w-[44px] rounded-[10px] px-0 text-[#7A9992] dark:text-[#CCCCCC]"
            >
              <CornerDownLeft className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isProjectMember || isSending}
              className="bg-[#14A090] hover:bg-[#14A090]/80 h-[44px] w-[44px] min-w-[44px] rounded-[10px] px-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick phrases section */}
          {showQuickPhrases && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] cursor-pointer" onClick={() => setShowQuickPhrases(false)}>
                  Quick Phrases ausblenden ▼
                </span>
              </div>
              <div className="space-y-2">
                {quickPhrases.map((phrase, index) => (
                  <div 
                    key={index}
                    className="bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white p-2 rounded-[10px] text-sm cursor-pointer"
                    onClick={() => handleQuickPhrase(phrase)}
                  >
                    {phrase}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isProjectMember && !isLoading && (
            <p className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-2">
              Du musst Mitglied dieses Projekts sein, um Nachrichten senden zu können.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
