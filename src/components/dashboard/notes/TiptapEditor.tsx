
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useState, useEffect, useRef, useCallback } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { injectEditorStyles } from './editorStyles';
import { handleAddLink } from './editorUtils';
import { supabase } from '@/integrations/supabase/client'; // Correct import path

// Zeit in Millisekunden, nach der eine Änderung gespeichert wird
const AUTOSAVE_DELAY = 500;

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  autofocus?: boolean;
  // Neue Props für Echtzeit-Synchronisation
  onSave?: (html: string) => Promise<void>;
  syncId?: string; // Eindeutige ID für diesen Editor (z.B. Dokument-ID)
}

export const TiptapEditor = ({ 
  content, 
  onChange, 
  autofocus = false,
  onSave, 
  syncId 
}: TiptapEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Timer für Autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Definieren Sie den Editor mit den benötigten Erweiterungen
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-[#14A090] underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full px-4 py-2 editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Markieren, dass ungespeicherte Änderungen vorhanden sind
      if (html !== lastSavedContent) {
        setHasUnsavedChanges(true);
      }
      
      // Autosave mit Debouncing starten
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveContent(html);
      }, AUTOSAVE_DELAY);
    },
    autofocus: autofocus ? 'end' : false,
  });

  // Funktion zum Speichern des Inhalts
  const saveContent = useCallback(async (html: string) => {
    if (!onSave || isSaving || html === lastSavedContent) return;
    
    try {
      setIsSaving(true);
      await onSave(html);
      setLastSavedContent(html);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      // Hier könnten Sie eine Benutzerbenachrichtigung über fehlgeschlagene Speicherung anzeigen
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, lastSavedContent]);

  // Funktion, um Content manuell zu speichern
  const forceSave = useCallback(() => {
    if (editor) {
      saveContent(editor.getHTML());
    }
  }, [editor, saveContent]);

  // Hilfsfunktion für die Synchronisation mit Supabase
  const setupSyncListener = useCallback((syncId: string | undefined, onUpdate: (content: string) => void) => {
    if (!syncId) return () => {};
    
    // Supabase Realtime Kanal für Dokumentänderungen einrichten
    const channel = supabase
      .channel(`document-${syncId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'interview_notes', 
        filter: `project_id=eq.${syncId.split('-')[2]}` // Extrahiere project_id aus syncId
      }, payload => {
        // Nur aktualisieren, wenn die Änderung von einem anderen Client stammt
        if (payload.new && payload.new.content) {
          onUpdate(payload.new.content);
        }
      })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Fehler bei der Kanal-Verbindung:', status);
        } else if (status === 'SUBSCRIBED') {
          console.log('Erfolgreich mit Realtime verbunden');
        }
      });
      
    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Einrichten einer Echtzeit-Synchronisation für Updates von anderen Clients
  useEffect(() => {
    setIsMounted(true);

    // Inject editor styles and get cleanup function
    const cleanup = injectEditorStyles();
    
    let syncCleanup: (() => void) | undefined;
    
    // Implementiere die Echtzeit-Synchronisation nur wenn syncId vorhanden ist
    if (syncId) {
      syncCleanup = setupSyncListener(syncId, (newContent) => {
        // Nur aktualisieren, wenn der Editor nicht aktiv bearbeitet wird
        if (editor && !editor.isFocused && newContent !== editor.getHTML()) {
          console.log('Editor content updated from database:', newContent);
          editor.commands.setContent(newContent);
          setLastSavedContent(newContent);
        }
      });
    }

    // Auto-Speichern, wenn der Benutzer die Seite verlässt
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        forceSave();
        // Standard-Dialogfenster mit "Ungespeicherte Änderungen" anzeigen
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Aufräumen beim Unmount
    return () => {
      cleanup();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (syncCleanup) syncCleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Letzte Änderungen speichern, bevor die Komponente unmountet
      if (editor && hasUnsavedChanges) {
        saveContent(editor.getHTML());
      }
    };
  }, [editor, hasUnsavedChanges, syncId, forceSave, saveContent, setupSyncListener]);

  // Wenn sich der Inhalt von außen ändert, aktualisieren Sie den Editor
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content);
      setLastSavedContent(content);
      setHasUnsavedChanges(false);
    }
  }, [content, editor]);

  // Handle link adding using the utility function
  const addLink = () => handleAddLink(editor);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="rounded-[10px] overflow-hidden h-full flex flex-col">
      <EditorToolbar 
        editor={editor} 
        addLink={addLink} 
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={forceSave}
      />
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
};

// Einfaches Speicher-Icon
const SavingIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
  </svg>
);
