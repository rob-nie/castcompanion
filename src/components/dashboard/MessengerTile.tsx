
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";
import { de } from "date-fns/locale";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const { phrases } = useQuickPhrases();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleQuickPhraseSelect = (phrase: string) => {
    setNewMessage(phrase);
    setIsOpen(false);
  };

  // Funktion zum Formatieren des Datums/Uhrzeit
  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeString = format(date, 'HH:mm');
    
    if (isToday(date)) {
      return `Heute, ${timeString}`;
    } else {
      return `${format(date, 'dd.MM.yyyy', { locale: de })}, ${timeString}`;
    }
  };

  // Render Message Content
  const renderMessageContent = () => {
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
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Nachrichten.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {messages.map((message, index) => {
          // Check if this message is the first from this sender in a sequence
          const isFirstInSequence = index === 0 || 
            messages[index - 1].sender_id !== message.sender_id;
            
          // Check if we should show the timestamp
          let shouldShowTimestamp = true;
          if (index > 0) {
            const currentDate = new Date(message.created_at);
            const previousDate = new Date(messages[index - 1].created_at);
            const minuteDifference = differenceInMinutes(currentDate, previousDate);
            shouldShowTimestamp = minuteDifference > 2;
          }
          
          const isSentByMe = message.sender_id === user?.id;
          
          return (
            <div 
              key={message.id}
              className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
            >
              {/* Benutzername nur für die erste Nachricht in einer Sequenz anzeigen */}
              {!isSentByMe && isFirstInSequence && (
                <span className="text-xs text-[#7A9992] dark:text-[#CCCCCC] mb-1 mt-2 font-bold">
                  {message.sender_full_name || 'Unbekannt'}
                </span>
              )}
              
              <div className="flex flex-col items-start max-w-[80%]">
                {/* Message bubble */}
                <div 
                  className={`p-3 ${
                    isSentByMe 
                      ? 'bg-[#14A090] text-white rounded-tl-[10px] rounded-tr-[0px] rounded-bl-[10px] rounded-br-[10px]' 
                      : 'bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-tl-[0px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]'
                  }`}
                >
                  <p className="text-sm break-words">
                    {message.content}
                  </p>
                </div>
                
                {/* Timestamp outside the bubble */}
                {shouldShowTimestamp && (
                  <div className={`text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-1 ${isSentByMe ? 'self-end' : 'self-start'}`}>
                    {formatMessageTime(message.created_at)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Nachrichtenbereich mit ScrollArea */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-auto hide-scrollbar">
            {renderMessageContent()}
          </div>
        </div>
        
        {/* Eingabebereich */}
        <div className="mt-4 pt-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nachricht eingeben..."
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
            
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="border rounded-[10px] border-[#7A9992] dark:border-[#CCCCCC] overflow-hidden"
            >
              <CollapsibleTrigger className="w-full p-2 text-left flex items-center justify-between text-sm text-[#7A9992] dark:text-[#CCCCCC]">
                <span className="font-medium">Schnellphrasen</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-2 pb-2">
                {phrases.length === 0 ? (
                  <p className="text-xs text-[#7A9992] dark:text-[#CCCCCC] py-1">
                    Keine Schnellphrasen vorhanden.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {phrases.map((phrase) => (
                      <button 
                        key={phrase.id} 
                        onClick={() => handleQuickPhraseSelect(phrase.content)}
                        className="w-full text-sm p-2 text-left border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-[10px]"
                      >
                        {phrase.content}
                      </button>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            {!isProjectMember && !isLoading && (
              <p className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mt-2">
                Du musst Mitglied dieses Projekts sein, um Nachrichten senden zu können.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
