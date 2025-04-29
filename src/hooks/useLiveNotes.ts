
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

export interface LiveNote {
  id: string;
  content: string;
  time_marker: number;
  created_at: string;
  updated_at: string;
}

export const useLiveNotes = (projectId: string) => {
  const [liveNotes, setLiveNotes] = useState<LiveNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchLiveNotes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('live_notes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live notes:', error);
        toast.error('Fehler beim Laden der Notizen');
        return;
      }

      setLiveNotes(data || []);
    } catch (err) {
      console.error('Exception fetching live notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createLiveNote = async (timeMarker: number) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('live_notes')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: '',
          time_marker: timeMarker
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating live note:', error);
        toast.error('Fehler beim Erstellen der Notiz');
        return null;
      }

      setLiveNotes(prev => [data, ...prev]);
      toast.success('Notiz erstellt');
      return data;
    } catch (err) {
      console.error('Exception creating live note:', err);
      return null;
    }
  };

  const updateLiveNote = async (id: string, content: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('live_notes')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating live note:', error);
        toast.error('Fehler beim Speichern der Notiz');
        return false;
      }

      setLiveNotes(prev => prev.map(note => 
        note.id === id ? { ...note, content, updated_at: new Date().toISOString() } : note
      ));
      toast.success('Notiz gespeichert');
      return true;
    } catch (err) {
      console.error('Exception updating live note:', err);
      return false;
    }
  };

  const deleteLiveNote = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('live_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting live note:', error);
        toast.error('Fehler beim Löschen der Notiz');
        return false;
      }

      setLiveNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Notiz gelöscht');
      return true;
    } catch (err) {
      console.error('Exception deleting live note:', err);
      return false;
    }
  };

  useEffect(() => {
    if (projectId && user) {
      fetchLiveNotes();
    }
    
    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_notes',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          // Type check the payload to ensure user_id exists before comparing
          // Only refresh if the change was for the current user
          const payloadData = payload.new as Record<string, any> | null;
          if (payloadData && typeof payloadData === 'object' && 'user_id' in payloadData && payloadData.user_id === user?.id) {
            fetchLiveNotes();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return {
    liveNotes,
    isLoading,
    createLiveNote,
    updateLiveNote,
    deleteLiveNote,
    refreshLiveNotes: fetchLiveNotes
  };
};
