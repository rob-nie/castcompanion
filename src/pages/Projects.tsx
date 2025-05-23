
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Projects = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Tables<"projects">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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
      
      // Fetch ALL projects - we'll let RLS handle the filtering
      const { data: allProjects, error: projectsError } = await supabase
        .from("projects")
        .select("*");
        
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setError(projectsError.message);
        toast.error(`Fehler beim Laden der Projekte: ${projectsError.message}`);
        return;
      }
      
      // Sort by updated_at date
      const sortedProjects = [...(allProjects || [])].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      setProjects(sortedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError("Unerwarteter Fehler beim Laden der Projekte");
      toast.error("Fehler beim Laden der Projekte");
    } finally {
      setIsLoading(false);
      // Add a slight delay before showing content for smooth transition
      setTimeout(() => setIsVisible(true), 300);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#14A090] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#7A9992] dark:text-[#CCCCCC] text-lg">Authentifizierung wird überprüft...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;
  
  const contentClassNames = isVisible 
    ? "opacity-100 translate-y-0 transition-all duration-500 ease-out" 
    : "opacity-0 translate-y-4 transition-all duration-500 ease-out";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage="projects" />
      
      <main className={`flex-grow px-6 md:px-12 lg:px-24 py-16 ${contentClassNames}`}>
        <div className="mx-auto max-w-[1288px]">
          <div className="flex justify-between mb-6">
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#14A090] hover:bg-[#14A090]/90">
              <Plus className="mr-2 h-4 w-4" />
              Neues Projekt
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[10px] mb-6 animate-in fade-in duration-300">
              <p className="font-medium">Fehler beim Laden der Projekte</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons for projects
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[220px] rounded-[20px] overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-full text-center py-12 animate-in fade-in duration-300">
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
              projects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={`transition-all duration-500 ease-out opacity-0`}
                  style={{ 
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards` 
                  }}
                >
                  <ProjectCard 
                    project={project} 
                    onUpdate={fetchProjects}
                  />
                </div>
              ))
            )}
          </div>
          
          {/* Add animation keyframes in a standard style tag */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `
          }} />
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
