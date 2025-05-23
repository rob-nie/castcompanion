
import { useState } from "react";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { QuickPhraseList } from "./quick-phrases/QuickPhraseList";
import { QuickPhraseForm } from "./quick-phrases/QuickPhraseForm";
import { LoadingState } from "./quick-phrases/LoadingState";

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Schnellphrasen</h2>
      
      <div className="space-y-4">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {phrases.length === 0 && !isAdding ? (
              <p className="text-[#7A9992] dark:text-[#CCCCCC]">Keine Schnellphrasen vorhanden.</p>
            ) : null}

            <QuickPhraseList
              phrases={phrases}
              editId={editId}
              editContent={editContent}
              isDragging={isDragging}
              onEditContentChange={setEditContent}
              onStartEditing={startEditing}
              onSaveEdit={saveEdit}
              onCancelEditing={cancelEditing}
              onDelete={deletePhrase}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />

            <QuickPhraseForm
              isAdding={isAdding}
              newPhrase={newPhrase}
              onNewPhraseChange={setNewPhrase}
              onAdd={handleAdd}
              onCancel={() => setIsAdding(false)}
              onStartAdding={() => setIsAdding(true)}
            />
          </>
        )}
      </div>
    </div>
  );
};
