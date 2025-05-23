
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";
import { LiveNotesTab } from "./notes/LiveNotesTab";
import { InterviewNotesTab } from "./notes/InterviewNotesTab";
import { useTimer } from "./watch/useTimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessengerTab } from "./messenger/MessengerTab";
import { MessageNotificationProvider, useMessageNotification } from "@/context/MessageNotificationContext";

interface NotesTileProps {
  project: Tables<"projects">;
}

const NotesTabsContent = ({ project }: NotesTileProps) => {
  const { displayTime } = useTimer(project.id);
  const isMobile = useIsMobile();
  const { 
    activeTab, 
    setActiveTab, 
    unreadMessagesCount, 
    markMessagesAsRead 
  } = useMessageNotification();

  // On tab change: store new value and handle notifications
  const handleTabChange = (value: string) => {
    setActiveTab(value as "interview-notes" | "live-notes" | "messenger");
    localStorage.setItem("cast-companion-last-notes-tab", value);
    
    // If switching to messenger tab, mark messages as read
    if (value === "messenger") {
      markMessagesAsRead();
    }
  };

  // Apply conditional classes for mobile view
  const tileClasses = isMobile
    ? "h-full bg-background flex flex-col overflow-hidden"
    : "h-full p-6 rounded-[20px] bg-background border-[0.5px] border-[#CCCCCC] dark:border-[#5E6664] flex flex-col overflow-hidden";

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
            className="text-[14px] py-1 px-0 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-0 after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
          >
            Interview Notes
          </TabsTrigger>
          <TabsTrigger 
            value="live-notes"
            className="text-[14px] py-1 px-0 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-0 after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
          >
            Live Notes
          </TabsTrigger>
          {isMobile && (
            <TabsTrigger 
              value="messenger"
              className="text-[14px] py-1 px-0 bg-transparent rounded-none font-medium data-[state=active]:text-[#14A090] data-[state=active]:font-medium data-[state=inactive]:text-[#7A9992] dark:data-[state=inactive]:text-[#CCCCCC] relative after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-0 after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 w-auto shadow-none"
            >
              <div className="flex items-center">
                Messenger
                {unreadMessagesCount > 0 && activeTab !== "messenger" && (
                  <div className="relative ml-1.5">
                    <span className="flex h-2.5 w-2.5 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
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

export const NotesTile = ({ project }: NotesTileProps) => {
  return (
    <MessageNotificationProvider projectId={project.id}>
      <NotesTabsContent project={project} />
    </MessageNotificationProvider>
  );
};
