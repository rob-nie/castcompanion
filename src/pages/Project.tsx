
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Tables<"projects"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !id) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching project:", error);
          toast.error("Projekt konnte nicht geladen werden");
          navigate("/projects");
          return;
        }

        if (!data) {
          toast.error("Projekt nicht gefunden");
          navigate("/projects");
          return;
        }
        
        setProject(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header currentPage="projects" />
        <main className="flex-grow px-6 md:px-12 lg:px-24 py-16">
          <div className="mx-auto max-w-[1288px]">
            <p>Projekt wird geladen...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return null; // This should not happen as we redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="projects" />
      
      <main className="flex-grow px-6 md:px-12 lg:px-24 py-16">
        <div className="mx-auto max-w-[1288px]">
          <h1 className="text-2xl font-medium text-[#0A1915] dark:text-white mb-6">
            {project.name}
          </h1>
          
          <div className="bg-[#F9F9F9] dark:bg-[#222625] border border-[#CCCCCC] dark:border-[#5E6664] rounded-[20px] p-6 shadow-md">
            <p className="text-[#0A1915] dark:text-white">{project.description || "Keine Beschreibung vorhanden"}</p>
          </div>
          
          {/* Project content will be added here in future */}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Project;
