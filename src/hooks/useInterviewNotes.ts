
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

  useEffect(() => {
    if (projectId && user) {
      fetchInterviewNotes();
    }
  }, [projectId, user]);

  return {
    interviewNotes,
    isLoading,
    refreshInterviewNotes: fetchInterviewNotes
  };
};
