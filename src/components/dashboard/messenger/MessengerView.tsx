
import { useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { QuickPhrases } from "./QuickPhrases";
import { useMessenger } from "@/hooks/useMessenger";

interface MessengerViewProps {
  project: Tables<"projects">;
}

export const MessengerView = ({ project }: MessengerViewProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    user, 
    isProjectMember 
  } = useMessenger(project.id);
  
  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleQuickPhraseSelect = (phrase: string) => {
    setInputValue(phrase);
    setShowQuickPhrases(false);
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={messages} 
        currentUserId={user?.id} 
        isProjectMember={isProjectMember} 
      />
      
      <div className="mt-4">
        <MessageInput 
          value={inputValue} 
          onChange={setInputValue} 
          onSend={handleSendMessage}
          onToggleQuickPhrases={() => setShowQuickPhrases(!showQuickPhrases)}
          showQuickPhrases={showQuickPhrases}
          isLoading={isLoading}
          isProjectMember={isProjectMember}
        />
        
        {showQuickPhrases && isProjectMember && (
          <QuickPhrases onSelect={handleQuickPhraseSelect} />
        )}
      </div>
    </div>
  );
};
