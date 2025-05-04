
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

  return (
    <div className="h-full max-w-[851px] p-6 rounded-[20px] overflow-auto bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_20px_20px_rgba(0,0,0,0.1)] dark:shadow-[5px_20px_20px_rgba(255,255,255,0.05)] flex flex-col">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col h-full"
      >
        <TabsList className="flex w-full mb-4 bg-transparent p-0 justify-start items-start gap-6 !shadow-none">
          <TabsTrigger 
            value="interview-notes"
            className="text-[14px] py-0 px-0 pb-1 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
          >
            Interview Notes
          </TabsTrigger>
          <TabsTrigger 
            value="live-notes"
            className="text-[14px] py-0 px-0 pb-1 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
          >
            Live Notes
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-auto">
          <TabsContent value="live-notes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <LiveNotesTab projectId={project.id} displayTime={displayTime} />
          </TabsContent>
          <TabsContent value="interview-notes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <InterviewNotesTab projectId={project.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
