
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatTime } from '@/components/dashboard/watch/utils';
import { LiveNote } from '@/hooks/useLiveNotes';

interface LiveNoteItemProps {
  note: LiveNote;
  onUpdate: (id: string, content: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  autoFocus?: boolean;
}

export const LiveNoteItem: React.FC<LiveNoteItemProps> = ({ note, onUpdate, onDelete, autoFocus = false }) => {
  const [content, setContent] = useState(note.content);
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Format the time marker to display
  const formattedTime = formatTime(note.time_marker);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      
      // Auto-resize textarea when focused
      adjustTextareaHeight();
    }
  }, [isEditing]);
  
  // Function to adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to the scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate(note.id, content);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Bist du sicher, dass du diese Notiz löschen möchtest?')) {
      await onDelete(note.id);
    }
  };
  
  // Handle content change and resize textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    adjustTextareaHeight();
  };
  
  // Handle key press events for saving with Enter (Return)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift key saves the note
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="bg-background border border-[#CCCCCC] dark:border-[#5E6664] p-3 rounded-lg mb-3">
      <div className="text-[10px] text-[#7A9992] dark:text-[#CCCCCC] mb-1 flex justify-between">
        <div>
          {new Date(note.created_at).toLocaleString('de-DE')}
        </div>
        <div className="font-medium">
          @ {formattedTime}
        </div>
      </div>
      
      {isEditing ? (
        <div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] text-[14px] mb-2 border-[#7A9992]"
            placeholder="Notiz eingeben..."
            rows={1}
            autoFocus={autoFocus}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-[#7A9992] border-[#7A9992]"
              disabled={isSaving}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-[#14A090] text-white hover:bg-[#14A090]/90"
              disabled={isSaving}
            >
              Speichern
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div 
            className="text-[14px] whitespace-pre-wrap break-words min-h-[30px] cursor-pointer"
            onClick={handleEdit}
          >
            {content || <span className="text-[#7A9992] dark:text-[#CCCCCC] italic">Notiz eingeben...</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="absolute top-0 right-0 text-[#7A9992] hover:text-red-500 hover:bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
