
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-full p-6 rounded-[20px] overflow-hidden bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_10px_rgba(0,0,0,0.05)] dark:shadow-[5px_20px_10px_rgba(255,255,255,0.05)] flex flex-col">
      <h2 className="text-xl font-medium mb-4">Messenger</h2>
      <p className="text-[#7A9992] dark:text-[#CCCCCC]">Coming soon...</p>
    </div>
  );
};
