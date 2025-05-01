
import { useState, useEffect, useCallback } from 'react';
import { TiptapEditor } from './TiptapEditor';
import { supabase } from '@/integrations/supabase/client';
import { useInterval } from '@/hooks/useInterval'; // Changed to named import
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";

interface InterviewNotesTabProps {
  projectId: string;
}

export const InterviewNotesTab = ({ projectId }: InterviewNotesTabProps) => {
  const [notes, setNotes] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  // Lade die Notizen beim ersten Laden
  useEffect(() => {
    if (!projectId || !userId) return;
    
    const loadNotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Supabase Abfrage zum Laden der Notizen - Geändert, um mit mehreren Notizen umzugehen
        const { data: notesData, error: fetchError } = await supabase
          .from('interview_notes')
          .select('content, updated_at')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (notesData && notesData.length > 0) {
          // Wir nehmen den neuesten Eintrag (basierend auf updated_at, absteigend sortiert)
          const latestNote = notesData[0];
          setNotes(latestNote.content || '');
          setLastSavedAt(latestNote.updated_at ? new Date(latestNote.updated_at) : null);
        } else {
          // Dokument existiert noch nicht
          setNotes('');
        }
      } catch (err) {
        console.error('Fehler beim Laden der Notizen:', err);
        setError('Die Notizen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [projectId, userId]);

  // Speichern der Notizen in der Datenbank
  const saveNotes = useCallback(async (content: string): Promise<void> => {
    if (!projectId || !userId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const now = new Date();
      
      // Aktualisiere oder füge die Notizen in Supabase ein
      const { error: upsertError } = await supabase
        .from('interview_notes')
        .upsert({
          project_id: projectId,
          user_id: userId,
          content: content,
          updated_at: now.toISOString()
        });
      
      if (upsertError) throw upsertError;
      
      setLastSavedAt(now);
    } catch (err) {
      console.error('Fehler beim Speichern der Notizen:', err);
      setError('Die Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, userId]);

  // Editor-Änderungen behandeln
  const handleEditorChange = (html: string) => {
    setNotes(html);
  };

  // Robust implementierte Echtzeit-Updates-Funktion
  useEffect(() => {
    if (!projectId || !userId) return;
    
    console.log('Setting up realtime listener for project:', projectId);
    
    // Supabase Realtime Kanal einrichten mit besserer Fehlerbehandlung
    const channel = supabase
      .channel(`interview-notes-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interview_notes',
        filter: `project_id=eq.${projectId} AND user_id=eq.${userId}`
      }, (payload) => {
        console.log('Realtime update received:', payload);
        if (payload.new && payload.eventType === 'UPDATE') {
          const remoteContent = payload.new.content || '';
          const remoteUpdatedAt = payload.new.updated_at ? new Date(payload.new.updated_at) : null;
          
          if (
            remoteContent !== notes && 
            (!lastSavedAt || (remoteUpdatedAt && remoteUpdatedAt > lastSavedAt))
          ) {
            console.log('Updating editor content from remote');
            setNotes(remoteContent);
            setLastSavedAt(remoteUpdatedAt);
          }
        }
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status !== 'SUBSCRIBED') {
          console.warn('Nicht mit Echtzeit-Updates verbunden:', status);
          // Wir setzen hier keinen Fehler mehr, da das Polling als Fallback dient
        }
      });
    
    // Abonnement beenden beim Unmount
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [projectId, userId, notes, lastSavedAt]);

  // Immer aktives Polling als Fallback für Echtzeit-Updates
  useInterval(() => {
    if (!projectId || !userId) return;
    
    // Periodische Abfrage als Fallback
    try {
      // Convert to a standard Promise using Promise.resolve to ensure .catch is available
      Promise.resolve(
        supabase
          .from('interview_notes')
          .select('content, updated_at')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
      )
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error('Fehler beim Polling:', fetchError);
          return;
        }
        
        if (data && data.length > 0) {
          const latestNote = data[0];
          const remoteContent = latestNote.content || '';
          const remoteUpdatedAt = latestNote.updated_at ? new Date(latestNote.updated_at) : null;
          
          if (
            remoteContent !== notes && 
            (!lastSavedAt || (remoteUpdatedAt && remoteUpdatedAt > lastSavedAt))
          ) {
            console.log('Updating content from polling');
            setNotes(remoteContent);
            setLastSavedAt(remoteUpdatedAt);
          }
        }
      })
      .catch(err => {
        console.error('Exception beim Polling:', err);
      });
    } catch (outerErr) {
      console.error('Outer exception in polling:', outerErr);
    }
  }, 10000); // Aktiviere Polling alle 10 Sekunden als Backup

  if (isLoading) {
    return <div className="flex justify-center p-8">Notizen werden geladen...</div>;
  }

  return (
    <div className="p-0">
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <TiptapEditor
        content={notes}
        onChange={handleEditorChange}
        onSave={saveNotes}
        syncId={`interview-notes-${projectId}-${userId}`}
        autofocus={false}
      />
    </div>
  );
};
