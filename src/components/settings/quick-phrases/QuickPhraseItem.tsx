
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, GripVertical } from "lucide-react";
import { DraggableProvided, DraggableStateSnapshot } from "react-beautiful-dnd";

interface QuickPhraseItemProps {
  id: string;
  content: string;
  editId: string | null;
  editContent: string;
  isDragging: boolean;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onStartEditing: (id: string, content: string) => void;
  onSaveEdit: () => void;
  onCancelEditing: () => void;
  onDelete: (id: string) => void;
  onEditContentChange: (content: string) => void;
}

export const QuickPhraseItem = ({
  id,
  content,
  editId,
  editContent,
  isDragging,
  provided,
  snapshot,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onDelete,
  onEditContentChange,
}: QuickPhraseItemProps) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex items-center gap-2 ${snapshot.isDragging ? 'opacity-80' : ''}`}
    >
      {editId === id ? (
        <>
          <Input 
            value={editContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="flex-1 h-[40px]"
            maxLength={100}
          />
          <Button 
            onClick={onSaveEdit}
            size="icon"
            className="bg-[#14A090] hover:bg-[#14A090]/80 h-[40px] w-[40px] rounded-[10px]"
          >
            <Check className="w-5 h-5" />
          </Button>
          <Button 
            onClick={onCancelEditing}
            size="icon"
            className="bg-transparent border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-transparent h-[40px] w-[40px] rounded-[10px]"
          >
            <X className="w-5 h-5" />
          </Button>
        </>
      ) : (
        <>
          <div
            {...provided.dragHandleProps}
            className={`flex items-center justify-center h-[40px] w-[40px] text-[#7A9992] dark:text-[#CCCCCC] cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <p className="flex-1 text-[14px] text-[#0A1915] dark:text-white border border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] p-2 h-[40px] flex items-center">
            {content}
          </p>
          <Button 
            onClick={() => onStartEditing(id, content)}
            size="icon"
            className="bg-transparent border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-transparent h-[40px] w-[40px] rounded-[10px]"
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => onDelete(id)}
            size="icon"
            variant="destructive"
            className="h-[40px] w-[40px] rounded-[10px]"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </div>
  );
};
