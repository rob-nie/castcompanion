
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { LiveNoteItem } from './LiveNoteItem';
import { useLiveNotes } from '@/hooks/useLiveNotes';
import { useTimer } from '../watch/useTimer';
import { exportLiveNotesAsCSV } from '@/utils/exportUtils';

interface LiveNotesTabProps {
  projectId: string;
}

export const LiveNotesTab: React.FC<LiveNotesTabProps> = ({ projectId }) => {
  const { liveNotes, isLoading, createLiveNote, updateLiveNote, deleteLiveNote } = useLiveNotes(projectId);
  const { displayTime } = useTimer(projectId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const handleCreateNote = async () => {
    console.log("Creating live note with time marker:", displayTime);
    await createLiveNote(displayTime);
  };

  const handleExportCSV = () => {
    exportLiveNotesAsCSV(liveNotes);
  };

  // Check if we need to show bottom fade
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowBottomFade(!isNearBottom && scrollHeight > clientHeight);
    }
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
  }, [displayTime]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [liveNotes]);

  // Sortiere nach Erstellungsdatum (älteste zuerst)
  const sortedLiveNotes = [...liveNotes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Scrollbarer Bereich mit dynamischem Fade-Effekt */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        <div 
          ref={scrollContainerRef}
          className="h-full overflow-auto hide-scrollbar pr-2"
        >
          {isLoading ? (
            <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">Laden...</div>
          ) : liveNotes.length === 0 ? (
            <div className="text-center py-8 text-[#7A9992] dark:text-[#CCCCCC]">Noch keine Notizen vorhanden.</div>
          ) : (
            <div>
              {sortedLiveNotes.map(note => (
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
        </div>
        {/* Dynamic fade effect */}
        {showBottomFade && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)'
            }}
          />
        )}
      </div>

      {/* Immer sichtbare Button-Leiste unten */}
      <div className="mt-4 flex justify-between items-center shrink-0">
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
          className="text-[#7A9992] dark:text-[#CCCCCC] border-[#7A9992] dark:border-[#CCCCCC] w-10 h-10 rounded-[10px]"
          disabled={liveNotes.length === 0}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
