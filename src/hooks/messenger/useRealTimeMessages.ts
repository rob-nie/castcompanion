
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSenderName } from "./messageUtils";
import { Message } from "./types";

export const useRealTimeMessages = (
  projectId: string, 
  isProjectMember: boolean | null,
  onNewMessage: (message: Message) => void
) => {
  useEffect(() => {
    if (isProjectMember !== true) {
      return;
    }
    
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
              onNewMessage({ ...newMessage, sender_name: name } as Message);
            });
          } else {
            onNewMessage(newMessage as Message);
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
  }, [projectId, isProjectMember, onNewMessage]);
};
