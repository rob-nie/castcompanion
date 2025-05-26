
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUnreadMessages } from "@/hooks/messenger/useUnreadMessages";
import { useIsMobile } from "@/hooks/use-mobile";

type TabType = "interview-notes" | "live-notes" | "messenger";

interface MessageNotificationContextType {
  unreadMessagesCount: number;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  markMessagesAsRead: () => void;
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
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check if there's a stored value in localStorage
    const stored = localStorage.getItem("cast-companion-last-notes-tab");
    if (stored === "live-notes" || stored === "interview-notes" || stored === "messenger") {
      return stored as TabType;
    }
    return "interview-notes";
  });
  
  const isMobile = useIsMobile();
  const { unreadCount, markAllMessagesAsRead } = useUnreadMessages(projectId);

  // Nur in der mobilen Ansicht Unread-Nachrichten anzeigen
  const unreadMessagesCount = isMobile ? unreadCount : 0;

  const handleMarkMessagesAsRead = async () => {
    await markAllMessagesAsRead();
  };

  return (
    <MessageNotificationContext.Provider 
      value={{
        unreadMessagesCount,
        activeTab,
        setActiveTab,
        markMessagesAsRead: handleMarkMessagesAsRead
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
