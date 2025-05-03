
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="projects" project={project} />
      
      <main className="flex-grow px-6 md:px-6 lg:px-6 xl:px-24 py-6 h-[calc(100vh-theme(spacing.32))] overflow-hidden">
        <div className="mx-auto max-w-[1288px] h-full">
          {isMobile ? (
            // Mobile layout - tiles stacked vertically in specific order
            <div className="flex flex-col gap-[23px] h-full overflow-auto">
              <div> {/* Removed extra margin since buttons are now inline */}
                <WatchTile project={project} />
              </div>
              <NotesTile project={project} />
              <MessengerTile project={project} />
            </div>
          ) : (
            // Desktop layout - grid layout with right column constraints
            <div className="grid grid-cols-[1fr_clamp(350px,35%,414px)] gap-[23px] h-full">
              {/* Notes Tile - Left Column */}
              <div className="h-full">
                <NotesTile project={project} />
              </div>
              
              {/* Right Column - Watch and Messenger with min-width 350px and max-width 414px */}
              <div className="flex flex-col gap-[23px]">
                <WatchTile project={project} />
                <MessengerTile project={project} />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDashboard;
