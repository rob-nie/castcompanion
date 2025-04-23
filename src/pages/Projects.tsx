
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

const Projects = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Nicht authentifiziert. Bitte erneut anmelden.");
        navigate("/auth");
        return;
      }
      
      // With our new RLS policies in place, we can simply fetch all projects
      // The RLS will automatically filter projects based on ownership and membership
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        setError(error.message);
        toast.error(`Fehler beim Laden der Projekte: ${error.message}`);
        return;
      }

      setProjects(data || []);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError(error.message);
      toast.error("Fehler beim Laden der Projekte");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only redirect if we're sure the session has been checked
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProjects();
    }
  }, [user, navigate, authLoading]); 

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="projects" />
      
      <main className="flex-grow px-6 md:px-12 lg:px-24 py-16">
        <div className="mx-auto max-w-[1288px]">
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-medium text-[#0A1915] dark:text-white">Meine Projekte</h1>
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#14A090] hover:bg-[#14A090]/90">
              <Plus className="mr-2 h-4 w-4" />
              Neues Projekt
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[10px] mb-6">
              <p className="font-medium">Fehler beim Laden der Projekte</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <p>Projekte werden geladen...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h2 className="text-xl font-normal mb-4">
                  Erstelle dein erstes Projekt
                </h2>
                <p className="text-[#7A9992] dark:text-[#CCCCCC] mb-6">
                  Füge ein neues Projekt hinzu, um mit der Zusammenarbeit zu beginnen
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#14A090] hover:bg-[#14A090]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Projekt
                </Button>
              </div>
            ) : (
              projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onUpdate={fetchProjects}
                />
              ))
            )}
          </div>
        </div>
      </main>

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />

      <Footer />
    </div>
  );
};

export default Projects;
