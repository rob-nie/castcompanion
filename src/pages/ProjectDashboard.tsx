
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { NotesTile } from "@/components/dashboard/NotesTile";
import { WatchTile } from "@/components/dashboard/WatchTile";
import { MessengerTile } from "@/components/dashboard/MessengerTile";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Tables<"projects"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project:", error);
        setIsLoading(false);
        return;
      }

      setProject(data);

      // Check if current user is owner
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Direct match with project creator
        if (data?.user_id === user.id) {
          setIsOwner(true);
          setIsLoading(false);
          return;
        }

        // Check if user is a member with owner role
        const { data: memberData, error: memberError } = await supabase
          .from("project_members")
          .select("role")
          .eq("project_id", projectId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (memberError) {
          console.error("Error checking ownership:", memberError);
        }

        setIsOwner(memberData?.role === "owner");
      } catch (error) {
        console.error("Error checking ownership:", error);
      }

      setIsLoading(false);
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-[#7A9992] dark:text-[#CCCCCC]">Laden...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-[#7A9992] dark:text-[#CCCCCC]">Projekt nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header currentPage="projects" project={project} />
      
      <main className="flex-1 px-6 md:px-6 lg:px-6 xl:px-24 py-6 overflow-hidden mb-[48px]">
        <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-[1288px]'} h-full`}>
          {isMobile ? (
            // Mobile layout - tiles stacked vertically without Messenger (now a tab in NotesTile)
            <div className="flex flex-col gap-[23px] h-full overflow-hidden">
              <div> 
                <WatchTile project={project} />
              </div>
              <div className="flex-1 min-h-0">
                <NotesTile project={project} />
              </div>
            </div>
          ) : (
            // Desktop layout - grid layout with right column constraints (unchanged)
            <div className="grid grid-cols-[1fr_clamp(350px,35%,414px)] gap-[23px] h-full">
              {/* Notes Tile - Left Column - Set to full height of available space */}
              <div className="h-full min-h-0">
                <NotesTile project={project} />
              </div>
              
              {/* Right Column - Watch and Messenger with min-width 350px and max-width 414px */}
              <div className="flex flex-col gap-[23px] h-full overflow-hidden">
                <div>
                  <WatchTile project={project} />
                </div>
                <div className="flex-1 min-h-0">
                  <MessengerTile project={project} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;
