
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { MessageSquareDashed } from "lucide-react";
import { useQuickPhrases } from "@/hooks/useQuickPhrases";

export interface QuickPhrasesDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectPhrase: (phrase: string) => void;
}

export const QuickPhrasesDropdown = forwardRef<HTMLDivElement, QuickPhrasesDropdownProps>(
  ({ onSelectPhrase, className, ...props }, ref) => {
    const { phrases, isLoading } = useQuickPhrases();

    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <DropdownMenuPrimitive.Root>
          <DropdownMenuPrimitive.Trigger asChild>
            <button
              className="flex items-center justify-center w-[28px] h-[28px] rounded-full bg-transparent hover:bg-background-hover"
              aria-label="Schnellphrasen"
            >
              <MessageSquareDashed className="h-5 w-5 text-[#7A9992] dark:text-[#CCCCCC]" />
            </button>
          </DropdownMenuPrimitive.Trigger>

          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
              sideOffset={5}
              align="start"
              className="z-50 min-w-[220px] overflow-hidden rounded-[10px] border border-[#CCCCCC] dark:border-[#5E6664] bg-background p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            >
              {isLoading ? (
                <div className="py-2 px-2 text-sm text-muted-foreground">Laden...</div>
              ) : phrases.length === 0 ? (
                <div className="py-2 px-2 text-sm text-muted-foreground">
                  Keine Schnellphrasen vorhanden. Erstelle welche in den Einstellungen.
                </div>
              ) : (
                phrases.map((phrase) => (
                  <DropdownMenuPrimitive.Item
                    key={phrase.id}
                    onClick={() => onSelectPhrase(phrase.content)}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="line-clamp-1">{phrase.content}</span>
                  </DropdownMenuPrimitive.Item>
                ))
              )}
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </div>
    );
  }
);

QuickPhrasesDropdown.displayName = "QuickPhrasesDropdown";
