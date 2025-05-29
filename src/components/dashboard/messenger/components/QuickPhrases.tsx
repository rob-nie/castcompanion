
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface QuickPhrase {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  order?: number | null;
}

interface QuickPhrasesProps {
  phrases: QuickPhrase[];
  onSelectPhrase: (phrase: string) => void;
}

export const QuickPhrases = ({ phrases, onSelectPhrase }: QuickPhrasesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Sort phrases by order if available
  const sortedPhrases = [...phrases].sort((a, b) => {
    if (a.order !== null && b.order !== null && a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Check if we need to show bottom fade
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowBottomFade(!isNearBottom && scrollHeight > clientHeight);
    }
  };

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, sortedPhrases]);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="overflow-hidden"
    >
      <CollapsibleTrigger className="w-full text-left flex items-center text-sm text-[#7A9992] dark:text-[#CCCCCC] py-0 border-none bg-transparent hover:bg-transparent cursor-pointer hover:text-[#14A090] transition-colors pr-1">
        <span className="font-medium">Schnellphrasen</span>
        {isOpen ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {sortedPhrases.length === 0 ? (
          <p className="text-xs text-[#7A9992] dark:text-[#CCCCCC] py-1">
            Keine Schnellphrasen vorhanden.
          </p>
        ) : (
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="space-y-1 max-h-[200px] overflow-y-auto pr-1 hide-scrollbar"
            >
              {sortedPhrases.map((phrase) => (
                <Button
                  key={phrase.id}
                  onClick={() => onSelectPhrase(phrase.content)}
                  variant="outline"
                  className="w-full h-[40px] text-[14px] px-4 text-left justify-start text-[#7A9992] dark:text-[#CCCCCC] border-[#7A9992] dark:border-[#CCCCCC] rounded-[10px] hover:bg-muted hover:text-[#0A1915] dark:hover:bg-accent dark:hover:text-white transition-colors duration-200"
                >
                  {phrase.content}
                </Button>
              ))}
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
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
