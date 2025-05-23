
import { useState } from "react";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Skeleton } from "@/components/ui/skeleton";

export const QuickPhrasesSection = () => {
  const { phrases, isLoading, addPhrase, updatePhrase, deletePhrase, reorderPhrases } = useQuickPhrases();
  const [newPhrase, setNewPhrase] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleAdd = async () => {
    if (newPhrase.trim()) {
      const result = await addPhrase(newPhrase);
      if (result) {
        setNewPhrase("");
        setIsAdding(false);
      }
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditId(id);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (editId && editContent.trim()) {
      const success = await updatePhrase(editId, editContent);
      if (success) {
        cancelEditing();
      }
    }
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    
    // Dropped outside the list
    if (!result.destination) {
      return;
    }
    
    // Position didn't change
    if (result.destination.index === result.source.index) {
      return;
    }
    
    reorderPhrases(result.source.index, result.destination.index);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Schnellphrasen</h2>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-[40px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Schnellphrasen</h2>
      
      <div className="space-y-4">
        {phrases.length === 0 && !isAdding ? (
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Keine Schnellphrasen vorhanden.</p>
        ) : null}

        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
          <Droppable droppableId="quick-phrases">
            {(provided) => (
              <div
                className="space-y-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {phrases.map((phrase, index) => (
                  <Draggable
                    key={phrase.id}
                    draggableId={phrase.id}
                    index={index}
                    isDragDisabled={!!editId}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-2 ${snapshot.isDragging ? 'opacity-80' : ''}`}
                      >
                        {editId === phrase.id ? (
                          <>
                            <Input 
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="flex-1 h-[40px]"
                              maxLength={100}
                            />
                            <Button 
                              onClick={saveEdit}
                              size="icon"
                              className="bg-[#14A090] hover:bg-[#14A090]/80 h-[40px] w-[40px] rounded-[10px]"
                            >
                              <Check className="w-5 h-5" />
                            </Button>
                            <Button 
                              onClick={cancelEditing}
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
                              {phrase.content}
                            </p>
                            <Button 
                              onClick={() => startEditing(phrase.id, phrase.content)}
                              size="icon"
                              className="bg-transparent border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-transparent h-[40px] w-[40px] rounded-[10px]"
                            >
                              <Pencil className="w-5 h-5" />
                            </Button>
                            <Button 
                              onClick={() => deletePhrase(phrase.id)}
                              size="icon"
                              variant="destructive"
                              className="h-[40px] w-[40px] rounded-[10px]"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isAdding ? (
          <div className="flex items-center gap-2 mt-4">
            <div className="w-[40px]"></div> {/* Spacer for alignment */}
            <Input 
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="Neue Schnellphrase eingeben..."
              className="flex-1 h-[40px]"
              maxLength={100}
              autoFocus
            />
            <Button 
              onClick={handleAdd}
              size="icon"
              className="bg-[#14A090] hover:bg-[#14A090]/80 h-[40px] w-[40px] rounded-[10px]"
            >
              <Check className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => setIsAdding(false)}
              size="icon"
              className="bg-transparent border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-transparent h-[40px] w-[40px] rounded-[10px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-[#14A090] hover:bg-[#14A090]/80 text-white h-[40px] rounded-[10px] mt-4"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[14px]">Neue Schnellphrase</span>
          </Button>
        )}
      </div>
    </div>
  );
};
