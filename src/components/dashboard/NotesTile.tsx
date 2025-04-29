
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";
import { LiveNotesTab } from "./notes/LiveNotesTab";
import { InterviewNotesTab } from "./notes/InterviewNotesTab";
import { useTimer } from "./watch/useTimer";

interface NotesTileProps {
  project: Tables<"projects">;
}

export const NotesTile = ({ project }: NotesTileProps) => {
  const [activeTab, setActiveTab] = useState("live-notes");
  const { displayTime } = useTimer(project.id);
  
  // Die Tile sollte die volle Höhe des Eltern-Containers einnehmen
  return (
    <div className="h-full max-w-[851px] p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_20px_rgba(0,0,0,0.1)] dark:shadow-[5px_20px_20px_rgba(255,255,255,0.05)] flex flex-col">
      <h2 className="text-xl font-medium mb-4">Notes</h2>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger 
            value="live-notes"
            className="text-[14px] data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC]"
          >
            Live Notes
          </TabsTrigger>
          <TabsTrigger 
            value="interview-notes"
            className="text-[14px] data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC]"
          >
            Interview Notes
          </TabsTrigger>
        </TabsList>
        
        {/* Wichtig: flex-1 sorgt dafür, dass der TabsContent die verbleibende Höhe einnimmt */}
        <TabsContent value="live-notes" className="flex-1 overflow-hidden">
          <LiveNotesTab projectId={project.id} displayTime={displayTime} />
        </TabsContent>
        
        <TabsContent value="interview-notes" className="flex-1 overflow-hidden">
          <InterviewNotesTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};