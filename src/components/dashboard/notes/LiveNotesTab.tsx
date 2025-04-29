
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { LiveNoteItem } from './LiveNoteItem';
import { useLiveNotes } from '@/hooks/useLiveNotes';
import { exportLiveNotesAsCSV } from '@/utils/exportUtils';

interface LiveNotesTabProps {
  projectId: string;
  displayTime: number;
}

export const LiveNotesTab: React.FC<LiveNotesTabProps> = ({ projectId, displayTime }) => {
  const { liveNotes, isLoading, createLiveNote, updateLiveNote, deleteLiveNote } = useLiveNotes(projectId);
  
  const handleCreateNote = async () => {
    const newNote = await createLiveNote(displayTime);
  };
  
  const handleExportCSV = () => {
    exportLiveNotesAsCSV(liveNotes);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Feste Höhe für die Button-Leiste */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleCreateNote}
          className="bg-[#14A090] text-white hover:bg-[#14A090]/90 h-[44px] rounded-[10px] px-[20px] py-[10px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Live Note
        </Button>
        
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="text-[#7A9992] dark:text-[#CCCCCC] border-[#7A9992] dark:border-[#CCCCCC] h-[44px] rounded-[10px] px-[20px] py-[10px]"
          disabled={liveNotes.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      {/* Scroll-Bereich mit nativen Overflow-Eigenschaften */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-4">
        {isLoading ? (
          <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">
            Laden...
          </div>
        ) : liveNotes.length === 0 ? (
          <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">
            Noch keine Notizen vorhanden.
          </div>
        ) : (
          <>
            {liveNotes.map(note => (
              <LiveNoteItem
                key={note.id}
                note={note}
                onUpdate={updateLiveNote}
                onDelete={deleteLiveNote}
                autoFocus={note.content === '' && note.created_at === note.updated_at}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};