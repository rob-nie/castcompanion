
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  project_id: string;
  sender_id: string;
  created_at: string;
  sender_full_name: string | null;
}

export const useMessages = (projectId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!projectId || !user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        setError(new Error(error.message));
        return;
      }
      
      setMessages(data || []);
    } catch (err) {
      console.error("Exception in fetchMessages:", err);
      setError(new Error("Failed to load messages"));
    } finally {
      setIsLoading(false);
    }
  };

  // Send push notification
  const sendPushNotification = async (messageContent: string, senderName: string | null) => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          projectId,
          senderId: user?.id,
          messageContent,
          senderName
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
      }
    } catch (error) {
      console.error('Exception sending push notification:', error);
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!projectId || !user || !content.trim()) return;
    
    try {
      console.log(`Sending message as user ${user.id} to project ${projectId}`);
      
      // Get user's full name from profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      const { error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          project_id: projectId,
          sender_id: user.id,
          sender_full_name: profileData?.full_name || null
        });
      
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Nachricht konnte nicht gesendet werden");
        throw error;
      }
      
      // Send push notification to other project members
      await sendPushNotification(content.trim(), profileData?.full_name || null);
      
      await fetchMessages();
      return true;
    } catch (err) {
      console.error("Exception in sendMessage:", err);
      return false;
    }
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!projectId || !user) return;
    
    fetchMessages();
    
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
