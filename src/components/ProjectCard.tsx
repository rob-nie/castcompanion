
import { useEffect, useState } from "react";
import type { Tables } from "@/integrations/supabase/types";

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

  // Mehrere Schatten mit unterschiedlichen Farben für einen Verlaufseffekt
  const boxShadow = isDarkMode
    ? '5px 5px 15px rgba(206, 159, 124, 0.5), -5px -5px 15px rgba(20, 160, 144, 0.5)'
    : '5px 5px 15px rgba(10, 37, 80, 0.5), -5px -5px 15px rgba(20, 160, 144, 0.5)';

  return (
    <div 
      className="h-[150px] max-w-[414px] p-6 rounded-[20px] border border-[#CCCCCC] dark:border-[#5C6664] overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
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
          <p className="text-sm opacity-90 line-clamp-3">{project.description}</p>
        )}
      </div>
    </div>
  );
};
