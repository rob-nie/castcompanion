
import { KeyboardEvent } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onToggleQuickPhrases: () => void;
  showQuickPhrases: boolean;
  isLoading: boolean;
}

export const MessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  onToggleQuickPhrases,
  showQuickPhrases,
  isLoading 
}: MessageInputProps) => {
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full h-10 rounded-[10px] border border-[#7A9992] dark:border-[#CCCCCC] bg-transparent px-4 py-2 text-sm text-[#0A1915] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#14A090]"
          placeholder="Nachricht schreiben..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
      
      <button 
        // className="h-10 w-10 flex items-center justify-center rounded-[10px] border border-[#7A9992] dark:border-[#CCCCCC] text-[#7A9992] dark:text-[#CCCCCC] hover:bg-[#F9F9F9] dark:hover:bg-[#2A2E2D] transition-colors"
        className="text-[#7A9992] dark:text-[#CCCCCC] border-[#7A9992] dark:border-[#CCCCCC] w-10 h-10 rounded-[10px]"
        onClick={onToggleQuickPhrases}
        aria-label={showQuickPhrases ? "Quick Phrases ausblenden" : "Quick Phrases einblenden"}
      >
        {showQuickPhrases ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      
      <button 
        className={`h-10 w-10 flex items-center justify-center rounded-[10px] ${isLoading || !value.trim() ? 'bg-[#14A090]/70 cursor-not-allowed' : 'bg-[#14A090] hover:bg-[#118174] cursor-pointer'} text-white transition-colors`}
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        aria-label="Nachricht senden"
      >
        <Send size={18} />
      </button>
    </div>
  );
};
