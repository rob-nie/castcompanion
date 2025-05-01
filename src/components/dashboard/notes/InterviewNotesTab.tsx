
import { useState, useEffect, useCallback } from 'react';
import { TiptapEditor } from './TiptapEditor';
import { supabase } from '../lib/supabase';
import useInterval from '../hooks/useInterval'; // Hilfs-Hook für Polling (optional)

interface InterviewNotesTabProps {
  interviewId: string;
  userId: string;
}

export const InterviewNotesTab = ({ interviewId, userId }: InterviewNotesTabProps) => {
  const [notes, setNotes] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lade die Notizen beim ersten Laden
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Supabase Abfrage zum Laden der Notizen
        const { data: notesData, error: fetchError } = await supabase
          .from('interview_notes')
          .select('content, updated_at')
          .eq('interview_id', interviewId)
          .eq('user_id', userId)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
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
  }, [interviewId, userId]);

  // Speichern der Notizen in der Datenbank
  const saveNotes = useCallback(async (content: string) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const now = new Date();
      
      // Definiere eine eindeutige ID für die Notizen
      const notesId = `${interviewId}_${userId}`;
      
      // Aktualisiere oder füge die Notizen in Supabase ein
      const { error: upsertError } = await supabase
        .from('interview_notes')
        .upsert({
          id: notesId,
          interview_id: interviewId,
          user_id: userId,
          content: content,
          updated_at: now.toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (upsertError) throw upsertError;
      
      setLastSavedAt(now);
      return true;
    } catch (err) {
      console.error('Fehler beim Speichern der Notizen:', err);
      setError('Die Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [interviewId, userId]);

  // Editor-Änderungen behandeln
  const handleEditorChange = (html: string) => {
    setNotes(html);
  };

  // Echtzeit-Updates über Supabase Realtime abonnieren
  useEffect(() => {
    // Definiere eine eindeutige ID für die Notizen
    const notesId = `${interviewId}_${userId}`;
    
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
  }, [interviewId, userId, notes, lastSavedAt]);

  // Optional: Polling als Fallback für Echtzeit-Updates
  useInterval(() => {
    // Notizen regelmäßig neu laden, falls Echtzeit-Updates fehlschlagen
    if (error) {
      // Definiere eine eindeutige ID für die Notizen
      const notesId = `${interviewId}_${userId}`;
      
      supabase
        .from('interview_notes')
        .select('content, updated_at')
        .eq('id', notesId)
        .single()
        .then(({ data, error: fetchError }) => {
          if (fetchError) {
            console.error('Fehler beim Polling:', fetchError);
            return;
          }
          
          if (data) {
            const remoteContent = data.content || '';
            const remoteUpdatedAt = data.updated_at ? new Date(data.updated_at) : null;
            
            if (
              remoteContent !== notes && 
              (!lastSavedAt || (remoteUpdatedAt && remoteUpdatedAt > lastSavedAt))
            ) {
              setNotes(remoteContent);
              setLastSavedAt(remoteUpdatedAt);
              setError(null); // Fehler zurücksetzen
            }
          }
        })
        .catch((err) => {
          console.error('Fehler beim Polling:', err);
        });
    }
  }, error ? 10000 : null); // Nur Polling aktivieren, wenn ein Fehler aufgetreten ist

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
        syncId={`interview-notes-${interviewId}-${userId}`}
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