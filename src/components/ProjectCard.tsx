
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

interface ProjectCardProps {
  project: Tables<"projects">;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Format the last updated date if available
  const formattedDate = project.updated_at 
    ? format(new Date(project.updated_at), 'dd.MM.yyyy HH:mm')
    : null;

  return (
    <div 
      className="h-[150px] max-w-[414px] p-6 rounded-[20px] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
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
      </div>
    </div>
  );
};
