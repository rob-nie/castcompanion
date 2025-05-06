
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
          const newMessage = payload.new as any;
          
          // Add sender name to the message
          if (newMessage.sender_id) {
            fetchSenderName(newMessage.sender_id).then(name => {
              setMessages(prevMessages => [
                ...prevMessages, 
                { ...newMessage, sender_name: name } as Message
              ]);
            });
          } else {
            setMessages(prevMessages => [...prevMessages, newMessage as Message]);
          }
        }
      )
      .subscribe((status) => {
        console.info("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.info("Erfolgreich mit Realtime verbunden");
        } else {
          console.warn("Nicht mit Echtzeit-Updates verbunden:", status);
        }
      });
    
    console.info("Setting up realtime listener for project:", projectId);
    
    return () => {
      console.info("Cleaning up realtime subscription");
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
        .order('created_at', { ascending: true }) as any;
      
      if (error) throw error;
      
      // Fetch sender names for each message
      const messagesWithNames = await Promise.all(
        (data || []).map(async (message: any) => {
          const senderName = await fetchSenderName(message.sender_id);
          return { ...message, sender_name: senderName } as Message;
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

  // Check if user is a project member - FIXED to handle 406 errors
  const checkProjectMembership = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // Instead of using single(), which can cause a 406 error if multiple records exist,
      // we use a more robust approach by counting matching records
      const { data, error, count } = await supabase
        .from('project_members')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking project membership:', error);
        return false;
      }
      
      // If count is greater than 0, user is a project member
      return (count !== null && count > 0);
    } catch (error) {
      console.error('Error checking project membership:', error);
      return false;
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
      
      // Check project membership first
      const isMember = await checkProjectMembership();
      if (!isMember) {
        toast.error('Du bist kein Mitglied dieses Projekts und kannst keine Nachrichten senden');
        return;
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          project_id: projectId
        }) as any;
      
      if (error) {
        console.error('Error sending message:', error);
        
        if (error.code === '42501') {
          toast.error('Du hast keine Berechtigung, Nachrichten zu senden');
        } else {
          toast.error('Fehler beim Senden der Nachricht');
        }
        
        return;
      }
      
      // No need to manually add the message to state since the realtime subscription will handle it
      
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
