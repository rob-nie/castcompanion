
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { useProjectMembership } from "./messenger/useProjectMembership";
import { fetchProjectMessages, sendNewMessage } from "./messenger/messageUtils";
import { useRealTimeMessages } from "./messenger/useRealTimeMessages";
import { Message } from "./messenger/types";

export type { Message } from "./messenger/types";

export const useMessenger = (projectId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { isProjectMember } = useProjectMembership(projectId, user);
  
  // Add new message to the list
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);
  
  // Set up real-time subscription
  useRealTimeMessages(projectId, isProjectMember, handleNewMessage);
  
  // Fetch messages
  useEffect(() => {
    if (isProjectMember === null) {
      // Wait until we know the membership status
      return;
    }
    
    if (!isProjectMember) {
      console.warn("User is not a project member. Cannot fetch messages.");
      return;
    }

    const loadMessages = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const messagesList = await fetchProjectMessages(projectId);
        setMessages(messagesList);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
        toast.error('Fehler beim Laden der Nachrichten');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [projectId, isProjectMember, user?.id]);

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user?.id) {
      toast.error('Du musst angemeldet sein, um Nachrichten zu senden');
      return;
    }
    
    if (!isProjectMember) {
      toast.error('Du bist kein Mitglied dieses Projekts und kannst keine Nachrichten senden');
      return;
    }
    
    try {
      setIsLoading(true);
      await sendNewMessage(content, user.id, projectId);
      // The message will be added through the realtime subscription
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    user,
    isProjectMember
  };
};
