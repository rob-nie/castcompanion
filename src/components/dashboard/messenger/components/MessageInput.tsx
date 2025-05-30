
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { QuickPhrases } from "./QuickPhrases";

interface QuickPhrase {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  order?: number | null;
}

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isProjectMember: boolean;
  isSending: boolean;
  phrases: QuickPhrase[];
}

export const MessageInput = ({ 
  onSendMessage, 
  isProjectMember, 
  isSending, 
  phrases 
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && isProjectMember && !isSending) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectPhrase = (phrase: string) => {
    setMessage(phrase);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  if (!isProjectMember) {
    return (
      <div className="p-4 text-center text-[#7A9992] dark:text-[#CCCCCC] text-sm border-t border-[#CCCCCC] dark:border-[#5E6664]">
        Sie sind kein Mitglied dieses Projekts und können keine Nachrichten senden.
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Quick Phrases */}
      <div className="px-4 py-2">
        <QuickPhrases phrases={phrases} onSelectPhrase={handleSelectPhrase} />
      </div>
      
      {/* Message Input */}
      <div className="p-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht eingeben..."
              className="min-h-[44px] max-h-[120px] resize-none border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] text-[14px] leading-5"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="h-[44px] px-4 bg-[#14A090] hover:bg-[#14A090] text-white rounded-[10px] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
