
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-medium mb-4">Messenger</h2>
      
      <div className="flex-1 flex flex-col">
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
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-t-[10px] ${
                    message.sender_id === user?.id 
                      ? 'bg-[#14A090] text-white rounded-bl-[10px] rounded-br-0' 
                      : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-br-[10px] rounded-bl-0'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className="text-[10px] opacity-75 mt-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: de })}
                  </p>
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
              className="w-full border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] resize-none h-[44px] min-h-[44px] py-2"
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
    </div>
  );
};
