
import { useState, useEffect, useRef } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessengerView } from "./messenger/MessengerView";

interface MessengerTileProps {
  project: Tables<"projects">;
}

export const MessengerTile = ({ project }: MessengerTileProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-full p-6 rounded-[20px] overflow-hidden bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_10px_10px_rgba(0,0,0,0.05)] dark:shadow-[5px_10px_10px_rgba(255,255,255,0.05)] flex flex-col">
      <h2 className="text-xl font-medium mb-4">Messenger</h2>
      <div className="flex-1 overflow-hidden">
        <MessengerView project={project} />
      </div>
    </div>
  );
};
