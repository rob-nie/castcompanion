
import { Settings } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ProjectNavigationProps {
  currentPage?: string;
  project?: Tables<"projects">;
  onSettingsClick: (e: React.MouseEvent) => void;
}

export function ProjectNavigation({ 
  currentPage, 
  project,
  onSettingsClick
}: ProjectNavigationProps) {
  return (
    <nav className="flex items-center justify-center">
      <a 
        href="/projects"
        className={`relative text-sm mr-3 py-1 ${currentPage === "projects" && !project ? 
          "text-[#14A090] font-medium" : 
          "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} 
          ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-0 after:rounded-full" : ""}
          shadow-none !shadow-none [--tw-shadow:none]
        `}
      >
        Meine Projekte
      </a>
      {project && (
        <div className="relative flex items-end">
          <div className="flex items-center">
            <a 
              href={`/project/${project.id}`}
              className="text-sm text-[#14A090] font-medium max-w-[40ch] truncate py-1 relative"
              title={project.title}
            >
              {project.title.length > 40 ? `${project.title.substring(0, 35)}...` : project.title}
              <span className="absolute h-[3px] bg-[#14A090] left-0 right-0 bottom-0 rounded-full"></span>
            </a>
            <button
              onClick={onSettingsClick}
              className="ml-2 p-1 rounded-full hover:bg-[#14A090]/10 transition-colors"
              aria-label="Projekteinstellungen öffnen"
            >
              <Settings className="h-4 w-4 text-[#14A090]" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
