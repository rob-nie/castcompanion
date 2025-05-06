
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string | null;
  project_id: string;
  created_at: string;
}

export const useMessenger = (projectId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('project-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Add sender name to the message
          if (newMessage.sender_id) {
            fetchSenderName(newMessage.sender_id).then(name => {
              setMessages(prevMessages => [
                ...prevMessages, 
                { ...newMessage, sender_name: name }
              ]);
            });
          } else {
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // Fetch all messages for the project
  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Fetch sender names for each message
      const messagesWithNames = await Promise.all(
        (data || []).map(async (message) => {
          const senderName = await fetchSenderName(message.sender_id);
          return { ...message, sender_name: senderName };
        })
      );
      
      setMessages(messagesWithNames);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Fehler beim Laden der Nachrichten');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sender name from profiles table
  const fetchSenderName = async (senderId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', senderId)
        .single();
      
      if (error) throw error;
      
      // Extract username from email (everything before @)
      const email = data?.email || null;
      return email ? email.split('@')[0] : null;
    } catch (error) {
      console.error('Error fetching sender name:', error);
      return null;
    }
  };

  // Send a new message
  const sendMessage = async (content: string) => {
    if (!user?.id) {
      toast.error('Du musst angemeldet sein, um Nachrichten zu senden');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          project_id: projectId
        });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    user
  };
};
