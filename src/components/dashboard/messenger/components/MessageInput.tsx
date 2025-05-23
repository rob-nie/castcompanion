
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { QuickPhrases } from "./QuickPhrases";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isProjectMember: boolean;
  isSending: boolean;
  phrases: Array<{ id: string; content: string; created_at: string; updated_at: string }>;
}

export const MessageInput = ({
  onSendMessage,
  isProjectMember,
  isSending,
  phrases
}: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isProjectMember || isSending) return;
    
    await onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPhraseSelect = (phrase: string) => {
    setNewMessage(phrase);
  };

  return (
    <div className="mt-2 pt-2 shrink-0 px-0">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben..."
              className="w-full border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] resize-none h-[40px] min-h-[40px] py-2 px-4"
              style={{ display: 'flex', alignItems: 'center' }}
              maxLength={500}
              disabled={!isProjectMember || isSending}
            />
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isProjectMember || isSending}
            className="bg-[#14A090] hover:bg-[#14A090]/80 h-[40px] w-[40px] min-w-[40px] rounded-[10px] px-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <QuickPhrases phrases={phrases} onSelectPhrase={handleQuickPhraseSelect} />
        
        {!isProjectMember && (
          <p className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-2">
            Du musst Mitglied dieses Projekts sein, um Nachrichten senden zu können.
          </p>
        )}
      </div>
    </div>
  );
};
