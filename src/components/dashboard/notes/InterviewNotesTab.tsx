
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TiptapEditor } from './TiptapEditor';
import { useInterviewNotes } from '@/hooks/useInterviewNotes';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InterviewNotesTabProps {
  projectId: string;
}

export const InterviewNotesTab: React.FC<InterviewNotesTabProps> = ({ projectId }) => {
  const { interviewNotes, isLoading, createInterviewNote, updateInterviewNote } = useInterviewNotes(projectId);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(content);
  const lastSavedContentRef = useRef('');
  const lastTypingTimeRef = useRef(0);
  const initialLoadCompleted = useRef(false);
  
  // Load existing note when data is available
  useEffect(() => {
    if (!isLoading && interviewNotes.length > 0) {
      // Only update content from database if it hasn't been modified locally
      // or during initial load
      if (!initialLoadCompleted.current || content === lastSavedContentRef.current) {
        setContent(interviewNotes[0].content);
        setNoteId(interviewNotes[0].id);
        lastSavedContentRef.current = interviewNotes[0].content;
        initialLoadCompleted.current = true;
        console.log('Editor content updated from database:', interviewNotes[0].content);
      }
    }
  }, [isLoading, interviewNotes]);

  // Create or update note
  const handleSave = async () => {
    // Skip save if content hasn't changed
    if (content === lastSavedContentRef.current) {
      return;
    }
    
    setIsSaving(true);
    try {
      let success;
      
      if (noteId) {
        // Update existing note
        success = await updateInterviewNote(noteId, content);
      } else {
        // Create new note
        const newNote = await createInterviewNote(content);
        if (newNote) {
          setNoteId(newNote.id);
          success = true;
        } else {
          success = false;
        }
      }
      
      if (success) {
        lastSavedContentRef.current = content;
        toast.success('Notizen gespeichert');
      } else {
        toast.error('Fehler beim Speichern');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Keep contentRef in sync with state for use in setTimeout functions
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Intelligent auto-save handler
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    lastTypingTimeRef.current = Date.now();

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set a new timeout - only save after the user has stopped typing for 2 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
      // Only auto-save if:
      // 1. The content has changed since the last save
      // 2. The user hasn't typed for at least 2 seconds
      if (
        contentRef.current !== lastSavedContentRef.current && 
        Date.now() - lastTypingTimeRef.current >= 1900 // slightly less than timeout to ensure timing is correct
      ) {
        handleSave();
      }
    }, 2000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#7A9992] dark:text-[#CCCCCC]">Laden...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="h-full">
          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            autofocus={false}
          />
        </div>
      </ScrollArea>
      
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || content === lastSavedContentRef.current}
          className="bg-[#14A090] text-white hover:bg-[#14A090]/90"
        >
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
};
