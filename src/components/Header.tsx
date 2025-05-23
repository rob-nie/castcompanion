
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, UserIcon } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProjectSettingsModal } from "./project-settings/ProjectSettingsModal";

interface HeaderProps {
  currentPage?: string;
  project?: Tables<"projects">;
}

export function Header({ currentPage, project }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleLogoClick = () => {
    if (user) {
      navigate("/projects");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSettingsModalOpen(true);
  };

  const handleProjectUpdate = () => {
    // Refresh der Seite oder State-Update könnte hier implementiert werden
    // Für einfache Lösung reicht momentan ein Seiten-Refresh
    window.location.reload();
  };

  return (
    <header className="w-full px-6 xl:px-24 py-3 sm:py-5">
      <div className="mx-auto max-w-[1288px] flex flex-col">
        {/* Desktop and Mobile First Row */}
        <div className="w-full flex items-center justify-between">
          {/* Logo */}
          <div 
            className="font-inter font-bold text-xl md:text-2xl cursor-pointer text-[#0A1915] dark:text-white"
            onClick={handleLogoClick}
          >
            <span className="font-bold">Cast</span>
            <span className="font-extralight">Companion</span>
          </div>

          {/* Center Navigation (only on desktop) */}
          {!isMobile && user && (
            <nav className="flex items-center justify-center">
              <a 
                href="/projects"
                className={`relative text-sm mr-3 py-0 pb-1 ${currentPage === "projects" && !project ? 
                  "text-[#14A090] font-medium" : 
                  "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} 
                  ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full" : ""}
                  shadow-none !shadow-none [--tw-shadow:none]
                `}
              >
                Meine Projekte
              </a>
              {project && (
                <div className="relative flex items-end">
                  <div className="flex items-center">
                    <a 
                      href={`/projects/${project.id}`}
                      className="text-sm text-[#14A090] font-medium max-w-[40ch] truncate pb-1 relative"
                      title={project.title}
                    >
                      {project.title.length > 40 ? `${project.title.substring(0, 35)}...` : project.title}
                      <div className="absolute h-[3px] bg-[#14A090] left-0 right-0 bottom-[-1px] rounded-full"></div>
                    </a>
                    <button
                      onClick={handleSettingsClick}
                      className="ml-2 p-1 rounded-full hover:bg-[#14A090]/10 transition-colors"
                      aria-label="Projekteinstellungen öffnen"
                    >
                      <Settings className="h-4 w-4 text-[#14A090]" />
                    </button>
                  </div>
                </div>
              )}
            </nav>
          )}

          {/* Right Side Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm cursor-pointer">
                  {isMobile ? (
                    <UserIcon className="h-6 w-6 text-[#0A1915] dark:text-white" />
                  ) : (
                    <span className="font-medium text-[#0A1915] dark:text-white">
                      {user.user_metadata.full_name || user.email}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Einstellungen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Abmelden
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <button 
                      onClick={() => navigate("/auth")} 
                      className="btn-secondary hidden sm:block"
                    >
                      Anmelden
                    </button>
                    <button 
                      onClick={() => navigate("/auth/register")}
                      className="btn-primary"
                    >
                      Registrieren
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation (second row, only if user is logged in) */}
        {user && isMobile && (
          <div className="w-full mt-2">
            <nav className="flex items-end">
              <a 
                href="/projects"
                className={`relative text-sm mr-3 py-0 pb-1 ${currentPage === "projects" && !project ? 
                  "text-[#14A090] font-medium" : 
                  "text-[#7A9992] dark:text-[#CCCCCC] font-normal"} 
                  ${currentPage === "projects" && !project ? "after:absolute after:h-[3px] after:bg-[#14A090] after:left-0 after:right-0 after:bottom-[-1px] after:rounded-full" : ""}
                shadow-none !shadow-none [--tw-shadow:none]
              `}
              >
                Meine Projekte
              </a>
              {project && (
                <div className="relative flex items-end">
                  <div className="flex items-center">
                    <a 
                      href={`/projects/${project.id}`}
                      className="text-sm text-[#14A090] font-medium max-w-[40ch] truncate pb-1 relative"
                      title={project.title}
                    >
                      {project.title.length > 40 ? `${project.title.substring(0, 40)}...` : project.title}
                      <div className="absolute h-[3px] bg-[#14A090] left-0 right-0 bottom-[-1px] rounded-full"></div>
                    </a>
                    <button
                      onClick={handleSettingsClick}
                      className="ml-2 p-1 rounded-full hover:bg-[#14A090]/10 transition-colors"
                      aria-label="Projekteinstellungen öffnen"
                    >
                      <Settings className="h-4 w-4 text-[#14A090]" />
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Project Settings Modal */}
      {project && (
        <ProjectSettingsModal 
          project={project} 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)}
          onSuccess={handleProjectUpdate}
          isOwner={true} // Hier müsste idealerweise die Owner-Information aus dem Projekt oder vom Server ermittelt werden
        />
      )}
    </header>
  );
}
