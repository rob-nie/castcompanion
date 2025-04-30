
import React, { useState, useEffect } from 'react';
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
  
  // Load existing note when data is available
  useEffect(() => {
    if (!isLoading && interviewNotes.length > 0) {
      setContent(interviewNotes[0].content);
      setNoteId(interviewNotes[0].id);
    }
  }, [isLoading, interviewNotes]);

  // Create or update note
  const handleSave = async () => {
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
        toast.success('Notizen gespeichert');
      } else {
        toast.error('Fehler beim Speichern');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when content changes (debounced)
  useEffect(() => {
    if (!content || !noteId) return;
    
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [content]);

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
            onChange={setContent}
            autofocus={false}
          />
        </div>
      </ScrollArea>
      
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#14A090] text-white hover:bg-[#14A090]/90"
        >
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
};
