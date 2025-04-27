
import type { Tables } from "@/integrations/supabase/types";

interface NotesTileProps {
  project: Tables<"projects">;
}

export const NotesTile = ({ project }: NotesTileProps) => {
  return (
    <div className="h-full max-w-[851px] p-6 rounded-[20px] overflow-hidden bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_20px_rgba(0,0,0,0.1)] dark:shadow-[5px_20px_20px_rgba(255,255,255,0.05)]">
      <h2 className="text-xl font-medium mb-4">Notes</h2>
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Coming soon...</p>
    </div>
  );
};
