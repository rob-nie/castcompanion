
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export interface InterviewNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useInterviewNotes = (projectId: string) => {
  const [interviewNotes, setInterviewNotes] = useState<InterviewNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchInterviewNotes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching interview notes:', error);
        toast.error('Fehler beim Laden der Notizen');
        return;
      }

      setInterviewNotes(data || []);
    } catch (err) {
      console.error('Exception fetching interview notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createInterviewNote = async (content: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('interview_notes')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating interview note:', error);
        toast.error('Fehler beim Erstellen der Notiz');
        return null;
      }

      setInterviewNotes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Exception creating interview note:', err);
      return null;
    }
  };

  const updateInterviewNote = async (id: string, content: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('interview_notes')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating interview note:', error);
        toast.error('Fehler beim Speichern der Notiz');
        return false;
      }

      setInterviewNotes(prev => prev.map(note => 
        note.id === id ? { ...note, content, updated_at: new Date().toISOString() } : note
      ));
      return true;
    } catch (err) {
      console.error('Exception updating interview note:', err);
      return false;
    }
  };

  useEffect(() => {
    if (projectId && user) {
      fetchInterviewNotes();
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_notes',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          // Only refresh if the change was for the current user
          const payloadData = payload.new as Record<string, any> | null;
          if (payloadData && typeof payloadData === 'object' && 'user_id' in payloadData && payloadData.user_id === user?.id) {
            fetchInterviewNotes();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return {
    interviewNotes,
    isLoading,
    createInterviewNote,
    updateInterviewNote,
    refreshInterviewNotes: fetchInterviewNotes
  };
};
