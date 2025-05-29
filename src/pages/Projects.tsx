
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectSearch } from "@/components/ProjectSearch";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectWithArchiveStatus extends Tables<"projects"> {
  is_archived?: boolean;
}

const Projects = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectWithArchiveStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Nicht authentifiziert. Bitte erneut anmelden.");
        navigate("/auth");
        return;
      }
      
      // Fetch ALL projects with archive status
      const { data: allProjects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          user_project_archives!left(is_archived)
        `);
        
      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setError(projectsError.message);
        toast.error(`Fehler beim Laden der Projekte: ${projectsError.message}`);
        return;
      }
      
      // Transform data to include archive status
      const projectsWithArchiveStatus: ProjectWithArchiveStatus[] = (allProjects || []).map(project => ({
        ...project,
        is_archived: project.user_project_archives?.[0]?.is_archived || false
      }));
      
      // Sort by updated_at date
      const sortedProjects = projectsWithArchiveStatus.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      
      setProjects(sortedProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError("Unerwarteter Fehler beim Laden der Projekte");
      toast.error("Fehler beim Laden der Projekte");
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsVisible(true), 300);
    }
  };

  useEffect(() => {
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

  // Filter projects based on search and archive status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArchiveFilter = showArchived ? project.is_archived : !project.is_archived;
    
    return matchesSearch && matchesArchiveFilter;
  });

  const archivedCount = projects.filter(p => p.is_archived).length;
  
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

          <ProjectSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived(!showArchived)}
            archivedCount={archivedCount}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-[10px] mb-6 animate-in fade-in duration-300">
              <p className="font-medium">Fehler beim Laden der Projekte</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[220px] rounded-[20px] overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12 animate-in fade-in duration-300">
                {searchTerm ? (
                  <>
                    <h2 className="text-xl font-normal mb-4">
                      Keine Projekte gefunden
                    </h2>
                    <p className="text-[#7A9992] dark:text-[#CCCCCC] mb-6">
                      Versuche einen anderen Suchbegriff oder überprüfe deine Filter
                    </p>
                  </>
                ) : showArchived ? (
                  <>
                    <h2 className="text-xl font-normal mb-4">
                      Keine archivierten Projekte
                    </h2>
                    <p className="text-[#7A9992] dark:text-[#CCCCCC] mb-6">
                      Du hast noch keine Projekte archiviert
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            ) : (
              filteredProjects.map((project, index) => (
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
                    isArchived={project.is_archived || false}
                  />
                </div>
              ))
            )}
          </div>
          
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
