
import { useState, useEffect, useCallback } from 'react';
import { TiptapEditor } from './TiptapEditor';
import { supabase } from '@/integrations/supabase/client';
import { useInterval } from '@/hooks/useInterval'; // Changed to named import
import { useAuth } from "@/context/AuthProvider";

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
        // Supabase Abfrage zum Laden der Notizen
        const { data: notesData, error: fetchError } = await supabase
          .from('interview_notes')
          .select('content, updated_at')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (notesData) {
          setNotes(notesData.content || '');
          setLastSavedAt(notesData.updated_at ? new Date(notesData.updated_at) : null);
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

  // Speichern der Notizen in der Datenbank - Fix the return type to be Promise<void> instead of Promise<boolean>
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
          id: `${projectId}_${userId}`,
          project_id: projectId,
          user_id: userId,
          content: content,
          updated_at: now.toISOString()
        }, {
          onConflict: 'id'
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

  // Echtzeit-Updates über Supabase Realtime abonnieren
  useEffect(() => {
    if (!projectId || !userId) return;
    
    // Definiere eine eindeutige ID für die Notizen
    const notesId = `${projectId}_${userId}`;
    
    // Supabase Realtime Kanal einrichten
    const channel = supabase
      .channel(`interview_notes_${notesId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'interview_notes',
        filter: `id=eq.${notesId}`
      }, (payload) => {
        if (payload.new) {
          // Nur aktualisieren, wenn die Daten von einem anderen Client stammen
          // und sich unterscheiden (um Zyklen zu vermeiden)
          const remoteContent = payload.new.content || '';
          const remoteUpdatedAt = payload.new.updated_at ? new Date(payload.new.updated_at) : null;
          
          if (
            remoteContent !== notes && 
            (!lastSavedAt || (remoteUpdatedAt && remoteUpdatedAt > lastSavedAt))
          ) {
            setNotes(remoteContent);
            setLastSavedAt(remoteUpdatedAt);
          }
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Fehler bei Echtzeit-Updates:', status);
          setError('Die Live-Synchronisation ist derzeit nicht verfügbar.');
        }
      });
    
    // Abonnement beenden beim Unmount
    return () => {
      channel.unsubscribe();
    };
  }, [projectId, userId, notes, lastSavedAt]);

  if (isLoading) {
    return <div className="flex justify-center p-8">Notizen werden geladen...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Interview-Notizen</h2>
      
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
      
      {lastSavedAt && (
        <div className="text-sm text-gray-500 mt-2">
          Zuletzt gespeichert: {lastSavedAt.toLocaleString('de-DE')}
        </div>
      )}
    </div>
  );
};
