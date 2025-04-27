
import type { Tables } from "@/integrations/supabase/types";

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  return (
    <div className="flex-1 max-w-[414px] p-6 rounded-[20px] overflow-hidden bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_20px_rgba(0,0,0,0.1)] dark:shadow-[5px_20px_20px_rgba(255,255,255,0.05)]">
      <h2 className="text-xl font-medium mb-4">Messenger</h2>
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Coming soon...</p>
    </div>
  );
};
