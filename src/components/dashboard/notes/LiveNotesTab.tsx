
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { LiveNoteItem } from './LiveNoteItem';
import { useLiveNotes } from '@/hooks/useLiveNotes';
import { exportLiveNotesAsCSV } from '@/utils/exportUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LiveNotesTabProps {
  projectId: string;
  displayTime: number;
}

export const LiveNotesTab: React.FC<LiveNotesTabProps> = ({ projectId, displayTime }) => {
  const { liveNotes, isLoading, createLiveNote, updateLiveNote, deleteLiveNote } = useLiveNotes(projectId);

  const handleCreateNote = async () => {
    await createLiveNote(displayTime);
  };

  const handleExportCSV = () => {
    exportLiveNotesAsCSV(liveNotes);
  };

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Nur auslösen, wenn kein Input- oder Textfeld aktiv ist
    const tag = (e.target as HTMLElement)?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;

    if (!isTyping && e.key === 'n') {
      e.preventDefault();
      handleCreateNote();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleCreateNote]);

    // Sortiere nach Erstellungsdatum (älteste zuerst)
  const sortedLiveNotes = [...liveNotes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="h-full flex flex-col">
      {/* Scrollbarer Bereich */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">Laden...</div>
        ) : liveNotes.length === 0 ? (
          <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Notizen vorhanden.</div>
        ) : (
          <div className="mr-0">
            {liveNotes.map(note => (
              <LiveNoteItem
                key={note.id}
                note={note}
                onUpdate={updateLiveNote}
                onDelete={deleteLiveNote}
                autoFocus={note.content === '' && note.created_at === note.updated_at}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Immer sichtbare Button-Leiste unten */}
      <div className="mt-4 flex justify-between items-center">
        <Button
          onClick={handleCreateNote}
          className="bg-[#14A090] text-white hover:bg-[#14A090]/90 h-10 rounded-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Live Note
        </Button>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="text-[#7A9992] dark:text-[#CCCCCC] border-[#7A9992] dark:border-[#CCCCCC] h-10 rounded-[10px]"
          disabled={liveNotes.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};