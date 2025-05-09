
import { useState } from "react";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";

export const QuickPhrasesSection = () => {
  const { phrases, isLoading, addPhrase, updatePhrase, deletePhrase } = useQuickPhrases();
  const [newPhrase, setNewPhrase] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-[#0A1915] dark:text-white">Schnellphrasen</h2>
      
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Laden...</p>
        ) : phrases.length === 0 && !isAdding ? (
          <p className="text-[#7A9992] dark:text-[#CCCCCC]">Keine Schnellphrasen vorhanden.</p>
        ) : null}

        {phrases.map((phrase) => (
          <div 
            key={phrase.id} 
            className="flex items-center gap-2"
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
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input 
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="Neue Schnellphrase eingeben..."
              className="flex-1 h-[40px]"
              maxLength={100}
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
            className="flex items-center gap-2 bg-[#14A090] hover:bg-[#14A090]/80 text-white h-[40px] rounded-[10px]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[14px]">Neue Schnellphrase</span>
          </Button>
        )}
      </div>
    </div>
  );
};
