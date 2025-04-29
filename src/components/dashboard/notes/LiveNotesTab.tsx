
import React from 'react';
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
    const newNote = await createLiveNote(displayTime);
  };
  
  const handleExportCSV = () => {
    exportLiveNotesAsCSV(liveNotes);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Buttons-Container mit fester Höhe */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
      
      {/* Container mit fester Größe für die ScrollArea */}
      <div className="flex-1 min-h-0">
        {/* ScrollArea nimmt die volle Höhe des Containers ein */}
        <ScrollArea className="h-full w-full" style={{ border: '2px solid green' }}>
          <div className="pr-4">
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
                {/* Testinhalte, um Scrolling zu erzwingen */}
                {[...Array(20)].map((_, index) => (
                  <div 
                    key={`test-${index}`}
                    className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md"
                  >
                    Test-Notiz {index + 1} (um Scrolling zu demonstrieren)
                  </div>
                ))}
                
                {/* Echte Notizen */}
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
        </ScrollArea>
      </div>
    </div>
  );
};