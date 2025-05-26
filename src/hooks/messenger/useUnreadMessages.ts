
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";

export const useUnreadMessages = (projectId: string) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Funktion zum Laden der ungelesenen Nachrichten
  const fetchUnreadCount = async () => {
    if (!user || !projectId) return;

    try {
      // Alle Nachrichten des Projekts abrufen
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      if (!messages || messages.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Gelesene Nachrichten des Users abrufen
      const { data: readMessages, error: readError } = await supabase
        .from("message_read_status")
        .select("message_id")
        .eq("user_id", user.id)
        .in("message_id", messages.map(m => m.id));

      if (readError) {
        console.error("Error fetching read status:", readError);
        return;
      }

      const readMessageIds = new Set(readMessages?.map(r => r.message_id) || []);
      const unreadMessages = messages.filter(m => !readMessageIds.has(m.id));
      
      setUnreadCount(unreadMessages.length);
    } catch (error) {
      console.error("Error in fetchUnreadCount:", error);
    }
  };

  // Funktion zum Markieren aller Nachrichten als gelesen
  const markAllMessagesAsRead = async () => {
    if (!user || !projectId) return;

    try {
      // Alle Nachrichten des Projekts abrufen
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select("id")
        .eq("project_id", projectId);

      if (messagesError || !messages) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      // Bereits gelesene Nachrichten abrufen
      const { data: existingReadStatus, error: readError } = await supabase
        .from("message_read_status")
        .select("message_id")
        .eq("user_id", user.id)
        .in("message_id", messages.map(m => m.id));

      if (readError) {
        console.error("Error fetching existing read status:", readError);
        return;
      }

      const alreadyReadIds = new Set(existingReadStatus?.map(r => r.message_id) || []);
      const unreadMessages = messages.filter(m => !alreadyReadIds.has(m.id));

      if (unreadMessages.length > 0) {
        // Neue Read-Status-Einträge erstellen
        const newReadStatuses = unreadMessages.map(message => ({
          message_id: message.id,
          user_id: user.id
        }));

        const { error: insertError } = await supabase
          .from("message_read_status")
          .insert(newReadStatuses);

        if (insertError) {
          console.error("Error marking messages as read:", insertError);
          return;
        }
      }

      setUnreadCount(0);
    } catch (error) {
      console.error("Error in markAllMessagesAsRead:", error);
    }
  };

  // Initial laden und bei Änderungen des Projekts
  useEffect(() => {
    fetchUnreadCount();
  }, [projectId, user]);

  // Realtime-Updates für neue Nachrichten
  useEffect(() => {
    if (!projectId || !user) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_status',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return {
    unreadCount,
    markAllMessagesAsRead,
    refreshUnreadCount: fetchUnreadCount
  };
};
