
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";
import { LiveNotesTab } from "./notes/LiveNotesTab";
import { InterviewNotesTab } from "./notes/InterviewNotesTab";
import { useTimer } from "./watch/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessengerTab } from "./messenger/MessengerTab";

interface NotesTileProps {
  project: Tables<"projects">;
}

const TABS_STORAGE_KEY = "cast-companion-last-notes-tab";

export const NotesTile = ({ project }: NotesTileProps) => {
  const { displayTime } = useTimer(project.id);
  const isMobile = useIsMobile();

  // Set default to "interview-notes"
  const [activeTab, setActiveTab] = useState("interview-notes");

  // On mount: read from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored === "live-notes" || stored === "interview-notes" || stored === "messenger") {
      setActiveTab(stored);
    }
  }, []);

  // On tab change: store new value
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem(TABS_STORAGE_KEY, value);
  };

  // Apply conditional classes for mobile view
  const tileClasses = isMobile
    ? "h-full bg-background flex flex-col overflow-hidden"
    : "h-full p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] shadow-[5px_10px_10px_rgba(0,0,0,0.05)] dark:shadow-[5px_10px_10px_rgba(255,255,255,0.05)] flex flex-col overflow-hidden";

  return (
    <div className={tileClasses}>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col h-full"
      >
        <TabsList className="flex w-full mb-4 bg-transparent p-0 justify-start items-start gap-6 !shadow-none shrink-0">
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
          {isMobile && (
            <TabsTrigger 
              value="messenger"
              className="text-[14px] py-0 px-0 pb-1 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
            >
              Messenger
            </TabsTrigger>
          )}
        </TabsList>
        <div className="flex-1 overflow-hidden min-h-0">
          <TabsContent value="live-notes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <LiveNotesTab projectId={project.id} displayTime={displayTime} />
          </TabsContent>
          <TabsContent value="interview-notes" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <InterviewNotesTab projectId={project.id} />
          </TabsContent>
          {isMobile && (
            <TabsContent value="messenger" className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
              <MessengerTab project={project} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};
