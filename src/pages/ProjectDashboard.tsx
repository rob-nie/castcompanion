
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotesTile } from "@/components/dashboard/NotesTile";
import { WatchTile } from "@/components/dashboard/WatchTile";
import { MessengerTile } from "@/components/dashboard/MessengerTile";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Tables<"projects"> | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching project:", error);
        return;
      }

      setProject(data);
    };

    fetchProject();
  }, [projectId]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="projects" />
      
      <main className="flex-grow px-6 md:px-12 lg:px-24 py-16 h-[calc(100vh-theme(spacing.32))]">
        <div className="mx-auto max-w-[1288px] h-full">
          <h1 className="text-2xl font-medium text-[#0A1915] dark:text-white mb-6">
            {project.title}
          </h1>
          
          <div className="grid grid-cols-12 gap-6 h-[calc(100%-theme(spacing.16))]">
            {/* Notes Tile - Left Column */}
            <div className="col-span-5 h-full">
              <NotesTile project={project} />
            </div>
            
            {/* Right Column - Watch and Messenger */}
            <div className="col-span-7 flex flex-col gap-6 h-full">
              <WatchTile project={project} />
              <MessengerTile project={project} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDashboard;
