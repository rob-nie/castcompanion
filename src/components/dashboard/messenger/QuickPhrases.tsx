
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface QuickPhrasesProps {
  onSelect: (phrase: string) => void;
}

export const QuickPhrases = ({ onSelect }: QuickPhrasesProps) => {
  const [phrases, setPhrases] = useState<string[]>([
    "Bitte richte dein Mikrofon nochmal korrekt aus!",
    "Zum Schluss kommen",
    "Können wir mit dem Interview beginnen?",
    "Es kann losgehen!",
    "Vielen Dank für das Gespräch"
  ]);
  
  // TODO: In the future, fetch phrases from user profile
  
  return (
    <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between">
      </div>
      <div className="space-y-2">
        {phrases.map((phrase, index) => (
          <button
            key={index}
            className="w-full text-left py-2 px-4 bg-[#DAE5E2] dark:bg-[#5E6664] text-[#0A1915] dark:text-white rounded-[10px] text-sm hover:opacity-90 transition-opacity"
            onClick={() => onSelect(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
};
