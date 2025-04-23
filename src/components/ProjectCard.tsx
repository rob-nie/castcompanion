
import { useState, useEffect } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Settings } from "lucide-react";
import { ProjectSettingsModal } from "./project-settings/ProjectSettingsModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProjectCardProps {
  project: Tables<"projects">;
  onUpdate: () => void;
}

export const ProjectCard = ({ project, onUpdate }: ProjectCardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Check if current user is owner
    const checkOwnership = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Direct match with project creator
        if (project.user_id === user.id) {
          setIsOwner(true);
          setIsLoading(false);
          return;
        }

        // Check project_members table
        const { data, error } = await supabase
          .from("project_members")
          .select("role")
          .eq("project_id", project.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking ownership:", error);
          // Don't show error toast here as it might be too noisy
          if (error.code !== 'PGRST116') { // Not found
            console.error(error);
          }
        }

        setIsOwner(data?.role === "owner");
      } catch (error) {
        console.error("Error checking ownership:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOwnership();

    return () => observer.disconnect();
  }, [project.id, project.user_id]);

  const boxShadow = isDarkMode
    ? '0 5px 15px rgba(206, 159, 124, 0.1), 0 5px 15px rgba(20, 160, 144, 0.1)'
    : '0 5px 15px rgba(20, 160, 130, 0.3)';

  const formattedDate = project.updated_at 
    ? format(new Date(project.updated_at), 'dd.MM.yyyy HH:mm')
    : null;

  const handleCardClick = () => {
    // In the future this could navigate to the project detail page
    // navigate(`/projects/${project.id}`);
    setIsSettingsModalOpen(true);
  };

  return (
    <>
      <div 
        className="h-[150px] max-w-[414px] p-6 rounded-[20px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] relative"
        onClick={handleCardClick}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
            : 'linear-gradient(135deg, #14A090, #0A2550)',
          boxShadow: boxShadow,
        }}
      >
        <div className="text-white h-full flex flex-col">
          <h3 className="text-xl font-medium mb-2">{project.title}</h3>
          {project.description && (
            <p className="text-sm opacity-90 line-clamp-2">{project.description}</p>
          )}
          {formattedDate && (
            <p className="text-xs mt-auto pt-2 opacity-80">
              Zuletzt bearbeitet: {formattedDate}
            </p>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsModalOpen(true);
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <ProjectSettingsModal
        project={project}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSuccess={onUpdate}
        isOwner={isOwner}
      />
    </>
  );
};
