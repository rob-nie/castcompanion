
import type { Tables } from "@/integrations/supabase/types";
import { useState, useRef } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { MessageList } from "./components/MessageList";
import { MessageInput } from "./components/MessageInput";

interface MessengerTabProps {
  project: Tables<"projects">;
}

export const MessengerTab = ({ project }: MessengerTabProps) => {
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage } = useMessages(project.id);
  const { isProjectMember } = useProjectMembership(project.id);
  const [isSending, setIsSending] = useState(false);
  const { phrases } = useQuickPhrases();

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isProjectMember) return;
    
    try {
      setIsSending(true);
      await sendMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F9F9F9] dark:bg-[#222625] rounded-[20px]">    
      {/* Scrollbarer Nachrichtenbereich */}
      <div className="flex-1 overflow-hidden min-h-0">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserId={user?.id}
        />
      </div>
      
      {/* Eingabebereich (fixiert am unteren Rand) */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isProjectMember={isProjectMember}
        isSending={isSending}
        phrases={phrases}
      />
    </div>
  );
};
