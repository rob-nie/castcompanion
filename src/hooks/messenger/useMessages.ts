
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
}

export const useMessages = (projectId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(error.message);
        return;
      }
      
      setMessages(data || []);
    } catch (err) {
      console.error("Exception in fetchMessages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!projectId || !user || !content.trim()) return;
    
    try {
      console.log(`Sending message as user ${user.id} to project ${projectId}`);
      
      const { error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          project_id: projectId,
          sender_id: user.id
        });
      
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Nachricht konnte nicht gesendet werden");
        throw error;
      }
      
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
