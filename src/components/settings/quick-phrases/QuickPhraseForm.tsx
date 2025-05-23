
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Plus } from "lucide-react";

interface QuickPhraseFormProps {
  isAdding: boolean;
  newPhrase: string;
  onNewPhraseChange: (value: string) => void;
  onAdd: () => void;
  onCancel: () => void;
  onStartAdding: () => void;
}

export const QuickPhraseForm = ({
  isAdding,
  newPhrase,
  onNewPhraseChange,
  onAdd,
  onCancel,
  onStartAdding,
}: QuickPhraseFormProps) => {
  if (isAdding) {
    return (
      <div className="flex items-center gap-2 mt-4">
        <div className="w-[40px]"></div> {/* Spacer for alignment */}
        <Input 
          value={newPhrase}
          onChange={(e) => onNewPhraseChange(e.target.value)}
          placeholder="Neue Schnellphrase eingeben..."
          className="flex-1 h-[40px]"
          maxLength={100}
          autoFocus
        />
        <Button 
          onClick={onAdd}
          size="icon"
          className="bg-[#14A090] hover:bg-[#14A090]/80 h-[40px] w-[40px] rounded-[10px]"
        >
          <Check className="w-5 h-5" />
        </Button>
        <Button 
          onClick={onCancel}
          size="icon"
          className="bg-transparent border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-transparent h-[40px] w-[40px] rounded-[10px]"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      onClick={onStartAdding}
      className="flex items-center gap-2 bg-[#14A090] hover:bg-[#14A090]/80 text-white h-[40px] rounded-[10px] mt-4"
    >
      <Plus className="w-4 h-4" />
      <span className="text-[14px]">Neue Schnellphrase</span>
    </Button>
  );
};
