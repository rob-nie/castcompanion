
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
  const [isProjectMember, setIsProjectMember] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Check if user is a project member
  useEffect(() => {
    const checkMembership = async () => {
      if (!user?.id || !projectId) {
        setIsProjectMember(false);
        return;
      }

      try {
        console.log(`Checking membership for user ${user.id} in project ${projectId}`);
        
        // Fixed query - using two separate parameters for project_id and user_id
        const { data, error, count } = await supabase
          .from('project_members')
          .select('*', { count: 'exact' })
          .eq('project_id', projectId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error checking project membership:', error);
          setIsProjectMember(false);
          return;
        }
        
        const isMember = (data && data.length > 0);
        console.log(`User membership check result: ${isMember} (found ${data?.length} matching records)`);
        setIsProjectMember(isMember);
      } catch (error) {
        console.error('Exception in membership check:', error);
        setIsProjectMember(false);
      }
    };

    checkMembership();
  }, [projectId, user?.id]);

  // Fetch messages and set up real-time subscription
  useEffect(() => {
    if (isProjectMember === null) {
      // Wait until we know the membership status
      return;
    }
    
    if (!isProjectMember) {
      console.warn("User is not a project member. Cannot fetch messages.");
      return;
    }

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
        } else if (status === "CHANNEL_ERROR") {
          console.error("Fehler bei der Kanal-Verbindung:", status);
        } else {
          console.warn("Nicht mit Echtzeit-Updates verbunden:", status);
        }
      });
    
    console.info("Setting up realtime listener for project:", projectId);
    
    return () => {
      console.info("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [projectId, isProjectMember]);

  // Fetch all messages for the project
  const fetchMessages = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching messages for project:", projectId);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Fehler beim Laden der Nachrichten');
        return;
      }
      
      // Fetch sender names for each message
      const messagesWithNames = await Promise.all(
        (data || []).map(async (message: any) => {
          const senderName = await fetchSenderName(message.sender_id);
          return { ...message, sender_name: senderName } as Message;
        })
      );
      
      console.log(`Fetched ${messagesWithNames.length} messages`);
      setMessages(messagesWithNames);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
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
      
      if (error) {
        console.error('Error fetching sender name:', error);
        return null;
      }
      
      // Extract username from email (everything before @)
      const email = data?.email || null;
      return email ? email.split('@')[0] : null;
    } catch (error) {
      console.error('Error in fetchSenderName:', error);
      return null;
    }
  };

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
      console.log(`Sending message as user ${user.id} to project ${projectId}`);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: user.id,
          project_id: projectId
        });
      
      if (error) {
        console.error('Error sending message:', error);
        toast.error('Fehler beim Senden der Nachricht');
        return;
      }
      
      // The message will be added through the realtime subscription
    } catch (error) {
      console.error('Exception in sendMessage:', error);
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
