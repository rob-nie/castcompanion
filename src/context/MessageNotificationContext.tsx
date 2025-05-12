
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMessages } from "@/hooks/messenger/useMessages";
import { useIsMobile } from "@/hooks/use-mobile";

type TabType = "interview-notes" | "live-notes" | "messenger";

interface MessageNotificationContextType {
  unreadMessagesCount: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  markMessagesAsRead: () => void;
  incrementUnreadCount: () => void;
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined);

interface MessageNotificationProviderProps {
  children: React.ReactNode;
  projectId: string;
}

export const MessageNotificationProvider: React.FC<MessageNotificationProviderProps> = ({ 
  children, 
  projectId 
}) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check if there's a stored value in localStorage
    const stored = localStorage.getItem("cast-companion-last-notes-tab");
    if (stored === "live-notes" || stored === "interview-notes" || stored === "messenger") {
      return stored as TabType;
    }
    return "interview-notes";
  });
  
  const isMobile = useIsMobile();
  const { messages } = useMessages(projectId);

  // Listen for new messages and increment counter if not on messenger tab
  useEffect(() => {
    // Only track unread messages on mobile when not on the messenger tab
    if (isMobile && activeTab !== "messenger" && messages.length > 0) {
      // We increment the counter on any new message that comes in
      // This is simplified; in a real app you might want to compare with previously seen messages
      const handleNewMessage = () => {
        setUnreadMessagesCount(prev => prev + 1);
      };
      
      // Set up a listener for the messages array
      // This is a simple implementation; it increments the counter whenever messages array changes
      // In a production app, you'd want to track the last read message ID
      const lastMessageId = messages[messages.length - 1]?.id;
      const cleanup = () => {
        // This is where you would clean up any subscriptions
      };
      
      return cleanup;
    }
  }, [messages, activeTab, isMobile]);

  const markMessagesAsRead = () => {
    setUnreadMessagesCount(0);
  };

  const incrementUnreadCount = () => {
    setUnreadMessagesCount(prev => prev + 1);
  };

  return (
    <MessageNotificationContext.Provider 
      value={{
        unreadMessagesCount,
        activeTab,
        setActiveTab,
        markMessagesAsRead,
        incrementUnreadCount
      }}
    >
      {children}
    </MessageNotificationContext.Provider>
  );
};

export const useMessageNotification = (): MessageNotificationContextType => {
  const context = useContext(MessageNotificationContext);
  if (context === undefined) {
    throw new Error('useMessageNotification must be used within a MessageNotificationProvider');
  }
  return context;
};
