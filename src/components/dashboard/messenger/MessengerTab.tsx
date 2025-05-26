
import type { Tables } from "@/integrations/supabase/types";
import { useState, useRef, useEffect } from "react";
import { useMessages } from "@/hooks/messenger/useMessages";
import { useProjectMembership } from "@/hooks/messenger/useProjectMembership";
import { useAuth } from "@/context/AuthProvider";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { MessageList } from "./components/MessageList";
import { MessageInput } from "./components/MessageInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMessageNotification } from "@/context/MessageNotificationContext";

interface MessengerTabProps {
  project: Tables<"projects">;
}

export const MessengerTab = ({ project }: MessengerTabProps) => {
  const { user } = useAuth();
  const { messages, isLoading, error, sendMessage } = useMessages(project.id);
  const { isProjectMember } = useProjectMembership(project.id);
  const [isSending, setIsSending] = useState(false);
  const { phrases } = useQuickPhrases();
  const isMobile = useIsMobile();
  const { activeTab, markMessagesAsRead } = useMessageNotification();
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  // Mark messages as read when the tab becomes active and messages are loaded
  useEffect(() => {
    if (isMobile && activeTab === "messenger" && messages.length > 0 && !isLoading && !hasMarkedAsRead) {
      console.log("MessengerTab is active and messages are loaded - marking as read");
      markMessagesAsRead();
      setHasMarkedAsRead(true);
    }
  }, [isMobile, activeTab, messages.length, isLoading, markMessagesAsRead, hasMarkedAsRead]);

  // Reset the "hasMarkedAsRead" flag when switching away from messenger tab
  useEffect(() => {
    if (activeTab !== "messenger") {
      setHasMarkedAsRead(false);
    }
  }, [activeTab]);

  // Mark new messages as read when they arrive and tab is active
  useEffect(() => {
    if (isMobile && activeTab === "messenger" && messages.length > 0 && !isLoading) {
      console.log("New messages detected while MessengerTab is active - marking as read");
      markMessagesAsRead();
    }
  }, [messages.length, isMobile, activeTab, isLoading, markMessagesAsRead]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isProjectMember) return;
    
    try {
      setIsSending(true);
      await sendMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  // Apply conditional classes for mobile view
  const containerClasses = isMobile
    ? "h-full flex flex-col overflow-hidden"
    : "h-full flex flex-col overflow-hidden tile-backdrop rounded-[20px]";

  return (
    <div className={containerClasses}>    
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
  );
};
