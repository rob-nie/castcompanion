
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const lastMessageCountRef = useRef(messages.length);

  // Listen for new messages and increment counter if not on messenger tab
  useEffect(() => {
    if (isMobile && activeTab !== "messenger" && messages.length > 0) {
      // Compare with previous message count to detect new messages
      if (messages.length > lastMessageCountRef.current) {
        // A new message has arrived - increment the counter
        setUnreadMessagesCount(prev => prev + 1);
        console.log("New message detected in context - incrementing count", messages.length, lastMessageCountRef.current);
      }
      
      // Update the reference for next comparison
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, activeTab, isMobile]);

  const markMessagesAsRead = () => {
    setUnreadMessagesCount(0);
  };

  const incrementUnreadCount = () => {
    setUnreadMessagesCount(prev => prev + 1);
  };

  const value = {
    unreadMessagesCount,
    activeTab,
    setActiveTab,
    markMessagesAsRead,
    incrementUnreadCount
  };

  return (
    <MessageNotificationContext.Provider value={value}>
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
