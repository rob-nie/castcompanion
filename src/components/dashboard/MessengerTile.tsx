
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { MessageList } from "./messenger/components/MessageList";
import { MessageInput } from "./messenger/components/MessageInput";

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  const isMobile = useIsMobile();
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
    <div className="h-full p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Scrollbarer Nachrichtenbereich mit versteckter Scrollbar */}
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
    </div>
  );
};

