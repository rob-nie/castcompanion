import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { Settings2, Pencil } from "lucide-react";
import { ProjectSettingsModal } from "./ProjectSettingsModal";

interface ProjectCardProps {
  project: Tables<"projects">;
  onUpdate: () => void;
  onDelete: () => void;
}

export const ProjectCard = ({ project, onUpdate, onDelete }: ProjectCardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

    return () => observer.disconnect();
  }, []);

  const boxShadow = isDarkMode
    ? '0 5px 15px rgba(206, 159, 124, 0.1), 0 5px 15px rgba(20, 160, 144, 0.1)'
    : '0 5px 15px rgba(20, 160, 130, 0.3)';

  const formattedDate = project.updated_at 
    ? format(new Date(project.updated_at), 'dd.MM.yyyy HH:mm')
    : null;

  return (
    <>
      <div 
        className="relative h-[150px] max-w-[414px] p-6 rounded-[20px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] group"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #14A090, #CE9F7C)' 
            : 'linear-gradient(135deg, #14A090, #0A2550)',
          boxShadow: boxShadow,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
        >
          <Settings2 className="w-4 h-4 text-white" />
        </button>
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
        </div>
      </div>

      {showSettings && (
        <ProjectSettingsModal
          project={project}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
